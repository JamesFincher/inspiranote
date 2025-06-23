import { createClient, LiveTranscriptionEvents, LiveClient } from "@deepgram/sdk";
import { DEEPGRAM_API_KEY, DEEPGRAM_MODEL } from '../constants';
import { DeepgramTranscriptionResponse, DebugLogEntryType, DeepgramMetadata, DeepgramConnectionState, DeepgramUtteranceEnd } from "../types";

let client: ReturnType<typeof createClient> | null = null;
let connection: LiveClient | null = null;
let mediaRecorder: MediaRecorder | null = null;
let microphone: MediaStream | null = null;

let currentConnectionState: DeepgramConnectionState = DeepgramConnectionState.IDLE;

const getClient = () => {
  if (!DEEPGRAM_API_KEY) {
    console.error("DEEPGRAM_API_KEY is not set.");
    throw new Error("DEEPGRAM_API_KEY is not set.");
  }
  if (!client) {
    client = createClient(DEEPGRAM_API_KEY);
  }
  return client;
};

interface DeepgramServiceHandlers {
  onOpen: () => void;
  onClose: (event?: CloseEvent) => void;
  onTranscript: (data: DeepgramTranscriptionResponse) => void;
  onMetadata: (data: DeepgramMetadata) => void;
  onError: (error: Event | Error) => void;
  onUtteranceEnd?: (data: DeepgramUtteranceEnd) => void;
  onStateChange: (newState: DeepgramConnectionState) => void;
}

const setState = (newState: DeepgramConnectionState, handlers: DeepgramServiceHandlers) => {
    if (currentConnectionState !== newState) {
        currentConnectionState = newState;
        handlers.onStateChange(newState);
    }
};

export const startDeepgramConnection = async (handlers: DeepgramServiceHandlers) => {
  if (!DEEPGRAM_API_KEY || DEEPGRAM_API_KEY === "YOUR_DEEPGRAM_API_KEY") {
    const errorMsg = "Deepgram API Key is not set or is invalid. Please check your constants.ts file.";
    setState(DeepgramConnectionState.ERROR, handlers);
    handlers.onError(new Error(errorMsg));
    console.error(errorMsg);
    alert(errorMsg); // Also alert the user directly for immediate feedback
    return;
  }

  try {
    const dgClient = getClient();
    setState(DeepgramConnectionState.CONNECTING, handlers);

    microphone = await navigator.mediaDevices.getUserMedia({ audio: true });

    if (connection) {
      connection.removeAllListeners();
      connection.finish(); // Ensure any existing connection is properly closed
    }
    
    connection = dgClient.listen.live({
      model: DEEPGRAM_MODEL,
      language: 'en-US',
      punctuate: true,
      smart_format: true,
      interim_results: true,
      utterance_end_ms: "1000", // For utterance end events
      summarize: 'v2',
      detect_topics: 'v2',
      // intents: true, // Consider adding later
      // sentiment: true, // Consider adding later
    });

    connection.on(LiveTranscriptionEvents.Open, () => {
      setState(DeepgramConnectionState.OPEN, handlers);
      handlers.onOpen();
      
      if (microphone) {
        mediaRecorder = new MediaRecorder(microphone, { mimeType: 'audio/webm' }); // Deepgram works well with webm
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && connection && connection.getReadyState() === 1) { // WebSocket.OPEN = 1
            connection.send(event.data);
          }
        };
        mediaRecorder.start(250); // Send data every 250ms
      }
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data: DeepgramTranscriptionResponse) => {
      handlers.onTranscript(data);
    });
    
    connection.on(LiveTranscriptionEvents.UtteranceEnd, (data: DeepgramUtteranceEnd) => {
        if(handlers.onUtteranceEnd) handlers.onUtteranceEnd(data);
    });

    connection.on(LiveTranscriptionEvents.Metadata, (data: DeepgramMetadata) => {
      handlers.onMetadata(data);
    });

    connection.on(LiveTranscriptionEvents.Error, (error) => {
      setState(DeepgramConnectionState.ERROR, handlers);
      handlers.onError(error);
      console.error("Deepgram Error:", error);
    });

    connection.on(LiveTranscriptionEvents.Close, (event) => {
      setState(DeepgramConnectionState.CLOSED, handlers);
      handlers.onClose(event);
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      mediaRecorder = null;
      if (microphone) {
        microphone.getTracks().forEach(track => track.stop());
      }
      microphone = null;
      connection = null; // Clean up connection reference
    });

  } catch (error) {
    setState(DeepgramConnectionState.ERROR, handlers);
    handlers.onError(error as Error);
    console.error("Failed to start Deepgram connection:", error);
  }
};

export const stopDeepgramConnection = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  if (connection) {
    if (connection.getReadyState() === 1) { // OPEN
        connection.finish();
    }
    connection.removeAllListeners(); // Clean up listeners to prevent memory leaks
  }
  // Microphone and connection nullification will be handled by the 'Close' event listener
  // Setting state to CLOSING is implicit by calling finish()
  if (currentConnectionState !== DeepgramConnectionState.CLOSED && currentConnectionState !== DeepgramConnectionState.IDLE) {
    // If not already closed or idle, this indicates we are actively trying to close.
    // The actual state change to CLOSED will be handled by the 'onClose' event.
  }
};

export const getDeepgramConnectionState = (): DeepgramConnectionState => {
    return currentConnectionState;
};
