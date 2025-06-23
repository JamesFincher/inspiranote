import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { MahjongBoard } from './components/MahjongBoard';
import { TileData, DebugLogEntry, DebugLogEntryType, DeepgramTranscriptionResponse, DeepgramMetadata, DeepgramConnectionState, GeminiRequestInput, DeepgramUtteranceEnd } from './types';
import { generateTileIdea, generateId } from './services/geminiService';
import { startDeepgramConnection, stopDeepgramConnection, getDeepgramConnectionState } from './services/deepgramService';
import { DownloadModal } from './components/DownloadModal';
import { DebugMenu } from './components/DebugMenu';
import { DEFAULT_TILE_HEIGHT, DEFAULT_TILE_WIDTH, MIN_TILE_SEPARATION_X, MIN_TILE_SEPARATION_Y, DEEPGRAM_INTERIM_RESULT_TIMEOUT, DEEPGRAM_API_KEY, IS_GEMINI_API_KEY_PLACEHOLDER, API_KEY } from './constants';

const App: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [pinnedTiles, setPinnedTiles] = useState<TileData[]>([]);
  const [microphoneAllowed, setMicrophoneAllowed] = useState<boolean | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  
  const [deepgramReady, setDeepgramReady] = useState<boolean>(!!DEEPGRAM_API_KEY); 
  const [geminiReady, setGeminiReady] = useState<boolean>(!!API_KEY && !IS_GEMINI_API_KEY_PLACEHOLDER);
  
  const [dgConnectionState, setDgConnectionState] = useState<DeepgramConnectionState>(DeepgramConnectionState.IDLE);

  const [showDebugMenu, setShowDebugMenu] = useState<boolean>(false);
  const [debugLog, setDebugLog] = useState<DebugLogEntry[]>([]);

  const boardSizeRef = useRef<{ width: number; height: number }>({ width: 800, height: 600 });
  const boardElementRef = useRef<HTMLDivElement | null>(null);

  const currentUtteranceTranscriptRef = useRef<string>("");
  const currentUtteranceSummaryRef = useRef<string | undefined>(undefined);
  const currentUtteranceTopicsRef = useRef<string[] | undefined>(undefined);
  const utteranceProcessingTimeoutRef = useRef<number | null>(null);

  const boardRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      boardElementRef.current = node;
      boardSizeRef.current = { width: node.offsetWidth, height: node.offsetHeight };
    }
  }, []);

  const addDebugLogEntry = useCallback((type: DebugLogEntryType, title: string, data: any) => {
    setDebugLog(prevLog => {
      const newEntry: DebugLogEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        type,
        title,
        data,
      };
      return [newEntry, ...prevLog.slice(0, 199)];
    });
  }, []);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      addDebugLogEntry(DebugLogEntryType.INFO, "Microphone Permission", "Permission granted by user.");
      setMicrophoneAllowed(true);
      return true;
    } catch (err) {
      console.error("Microphone access denied:", err);
      addDebugLogEntry(DebugLogEntryType.INFO, "Microphone Permission", { status: "Denied", error: (err as Error).message });
      setMicrophoneAllowed(false);
      setIsListening(false);
      setDgConnectionState(DeepgramConnectionState.IDLE);
      return false;
    }
  }, [addDebugLogEntry]);

  const getNewTilePosition = useCallback((existingTiles: TileData[]): { x: number; y: number } => {
    const boardWidth = boardSizeRef.current.width;
    const boardHeight = boardSizeRef.current.height;
    const maxX = Math.max(0, boardWidth - DEFAULT_TILE_WIDTH - 20);
    const maxY = Math.max(0, boardHeight - DEFAULT_TILE_HEIGHT - 20);
    
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
        const newX = Math.random() * maxX;
        const newY = Math.random() * maxY;
        let isOverlapping = false;
        for (const tile of existingTiles) {
            const dx = Math.abs(newX - tile.x);
            const dy = Math.abs(newY - tile.y);
            if (dx < MIN_TILE_SEPARATION_X && dy < MIN_TILE_SEPARATION_Y) {
                isOverlapping = true;
                break;
            }
        }
        if (!isOverlapping) return { x: newX, y: newY };
        attempts++;
    }
    if (existingTiles.length > 0) {
      const lastTile = existingTiles[existingTiles.length - 1];
      return { 
        x: (lastTile.x + MIN_TILE_SEPARATION_X + Math.random() * 50 - 25) % maxX,
        y: (lastTile.y + MIN_TILE_SEPARATION_Y + Math.random() * 50 - 25) % maxY,
      };
    }
    return { x: Math.random() * maxX, y: Math.random() * maxY };
  }, []);

  const processAndAddNewTile = useCallback(async () => {
    if (utteranceProcessingTimeoutRef.current) {
        clearTimeout(utteranceProcessingTimeoutRef.current);
        utteranceProcessingTimeoutRef.current = null;
    }

    const transcript = currentUtteranceTranscriptRef.current;
    const summary = currentUtteranceSummaryRef.current;
    const topics = currentUtteranceTopicsRef.current;

    if (!geminiReady) {
        addDebugLogEntry(DebugLogEntryType.GEMINI_ERROR, "Tile Generation Skipped", "Gemini API key not configured. Cannot generate tile.");
        currentUtteranceTranscriptRef.current = "";
        currentUtteranceSummaryRef.current = undefined;
        currentUtteranceTopicsRef.current = undefined;
        return;
    }

    if (!transcript || transcript.length < 3) {
      addDebugLogEntry(DebugLogEntryType.INFO, "Transcript Skipped (Too Short)", transcript);
      currentUtteranceTranscriptRef.current = "";
      currentUtteranceSummaryRef.current = undefined;
      currentUtteranceTopicsRef.current = undefined;
      return;
    }

    addDebugLogEntry(DebugLogEntryType.TRANSCRIPT, `Final Transcript for Tile Gen: "${transcript.substring(0, 70)}${transcript.length > 70 ? "..." : ""}"`, {transcript, summary, topics});
    
    const geminiInput: GeminiRequestInput = { transcript, summary, topics };
    const { x, y } = getNewTilePosition(tiles);
    const newTileData = await generateTileIdea(geminiInput, x, y, addDebugLogEntry);
    
    setTiles(prevTiles => {
      const maxZ = prevTiles.reduce((max, t) => Math.max(max, t.zIndex), 0);
      return [...prevTiles, { ...newTileData, zIndex: maxZ + 1 }];
    });

    currentUtteranceTranscriptRef.current = "";
    currentUtteranceSummaryRef.current = undefined;
    currentUtteranceTopicsRef.current = undefined;

  }, [getNewTilePosition, tiles, addDebugLogEntry, geminiReady]);


  useEffect(() => {
    const updateBoardSize = () => {
      if (boardElementRef.current) {
        boardSizeRef.current = { width: boardElementRef.current.offsetWidth, height: boardElementRef.current.offsetHeight };
      }
    };
    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    
    if (!DEEPGRAM_API_KEY) {
        addDebugLogEntry(DebugLogEntryType.DEEPGRAM_ERROR, "Deepgram Configuration Error", "DEEPGRAM_API_KEY is not set. Real-time transcription may be disabled.");
        setDeepgramReady(false);
    } else {
        setDeepgramReady(true);
    }

    if (IS_GEMINI_API_KEY_PLACEHOLDER || !API_KEY) {
        addDebugLogEntry(DebugLogEntryType.GEMINI_ERROR, "Gemini Configuration Error", "Google Gemini API_KEY is a placeholder or not set in constants.ts. Tile generation will be disabled.");
        setGeminiReady(false);
    } else {
        setGeminiReady(true);
    }


    return () => {
        window.removeEventListener('resize', updateBoardSize);
        if (getDeepgramConnectionState() !== DeepgramConnectionState.CLOSED && getDeepgramConnectionState() !== DeepgramConnectionState.IDLE) {
          stopDeepgramConnection();
        }
        if (utteranceProcessingTimeoutRef.current) {
            clearTimeout(utteranceProcessingTimeoutRef.current);
        }
    };
  }, [addDebugLogEntry]); // API_KEY, DEEPGRAM_API_KEY, IS_GEMINI_API_KEY_PLACEHOLDER removed from deps as they are constants

  const handleDeepgramEvents = useCallback(() => {
    return {
      onOpen: () => {
        addDebugLogEntry(DebugLogEntryType.DEEPGRAM_EVENT, "Deepgram Connection Opened", "Successfully connected to Deepgram.");
        setIsListening(true);
      },
      onClose: (event?: CloseEvent) => {
        addDebugLogEntry(DebugLogEntryType.DEEPGRAM_EVENT, "Deepgram Connection Closed", event || "Connection closed.");
        setIsListening(false);
        if (currentUtteranceTranscriptRef.current) {
            processAndAddNewTile();
        }
      },
      onTranscript: (data: DeepgramTranscriptionResponse) => {
        const transcriptText = data.channel.alternatives[0].transcript;
        if (!transcriptText) return;

        addDebugLogEntry(DebugLogEntryType.DEEPGRAM_TRANSCRIPT, data.is_final ? "Deepgram Final Transcript" : "Deepgram Interim Transcript", data);

        if (data.is_final && transcriptText.trim()) {
            currentUtteranceTranscriptRef.current += transcriptText.trim() + " ";
        }
      },
      onMetadata: (data: DeepgramMetadata) => {
        addDebugLogEntry(DebugLogEntryType.DEEPGRAM_METADATA, "Deepgram Intelligence Metadata", data);
        if (data.summary) {
          currentUtteranceSummaryRef.current = data.summary.summary;
        }
        if (data.topics && data.topics.length > 0) {
          currentUtteranceTopicsRef.current = data.topics.map(t => t.topic);
        }
      },
      onUtteranceEnd: (data: DeepgramUtteranceEnd) => {
        addDebugLogEntry(DebugLogEntryType.DEEPGRAM_EVENT, "Deepgram Utterance Ended", data);
        if (currentUtteranceTranscriptRef.current.trim()) {
            if (utteranceProcessingTimeoutRef.current) clearTimeout(utteranceProcessingTimeoutRef.current);
            utteranceProcessingTimeoutRef.current = window.setTimeout(() => {
                processAndAddNewTile();
            }, 300); 
        }
      },
      onError: (error: Event | Error) => {
        addDebugLogEntry(DebugLogEntryType.DEEPGRAM_ERROR, "Deepgram Error", error instanceof Error ? { message: error.message, stack: error.stack } : error);
        setIsListening(false);
        if (error instanceof Error && (error.message.includes("401") || error.message.includes("Unauthorized") || error.message.includes("auth"))) {
            setDeepgramReady(false);
            setMicrophoneAllowed(false); // Can't use mic if DG auth fails
            addDebugLogEntry(DebugLogEntryType.DEEPGRAM_ERROR, "Deepgram Auth Failed", "Marking Deepgram as not ready.");
        }
      },
      onStateChange: (newState: DeepgramConnectionState) => {
        setDgConnectionState(newState);
        addDebugLogEntry(DebugLogEntryType.DEEPGRAM_EVENT, "Deepgram State Change", newState);
      }
    };
  }, [addDebugLogEntry, processAndAddNewTile]);


  const handleStartStop = useCallback(async () => {
    if (!deepgramReady) {
        addDebugLogEntry(DebugLogEntryType.DEEPGRAM_ERROR, "Start Listening Attempt Failed", "Deepgram is not ready (API key issue).");
        return;
    }
     if (!geminiReady) {
        addDebugLogEntry(DebugLogEntryType.GEMINI_ERROR, "Start Listening Attempt Blocked", "Gemini API key is not configured. Tile generation disabled.");
        // Optionally show a more prominent user message here
        return;
    }


    const currentDgState = getDeepgramConnectionState();

    if (currentDgState === DeepgramConnectionState.OPEN || currentDgState === DeepgramConnectionState.CONNECTING) {
      addDebugLogEntry(DebugLogEntryType.DEEPGRAM_EVENT, "Stop Listening Initiated", "User requested to stop.");
      stopDeepgramConnection();
    } else {
      let permitted = microphoneAllowed;
      if (permitted === null) {
        permitted = await requestMicrophonePermission();
      }

      if (permitted) {
        addDebugLogEntry(DebugLogEntryType.DEEPGRAM_EVENT, "Start Listening Initiated", "User requested to start.");
        currentUtteranceTranscriptRef.current = "";
        currentUtteranceSummaryRef.current = undefined;
        currentUtteranceTopicsRef.current = undefined;
        if (utteranceProcessingTimeoutRef.current) clearTimeout(utteranceProcessingTimeoutRef.current);
        
        startDeepgramConnection(handleDeepgramEvents());
      }
    }
  }, [deepgramReady, geminiReady, microphoneAllowed, requestMicrophonePermission, handleDeepgramEvents, addDebugLogEntry]);

  const handleClear = useCallback(() => {
    addDebugLogEntry(DebugLogEntryType.INFO, "Board Action", "Cleared unpinned tiles.");
    setTiles(prevTiles => prevTiles.filter(tile => pinnedTiles.some(pt => pt.id === tile.id)));
  }, [pinnedTiles, addDebugLogEntry]);

  const handleDownload = useCallback(() => {
    addDebugLogEntry(DebugLogEntryType.INFO, "Download Action", "Opened download modal.");
    setShowDownloadModal(true);
  }, [addDebugLogEntry]);

  const handlePinTile = useCallback((tileId: string) => {
    setTiles(prevTiles =>
      prevTiles.map(tile =>
        tile.id === tileId ? { ...tile, isPinned: true, lifecycle: { ...tile.lifecycle, durationMs: Infinity } } : tile
      )
    );
    const tileToPin = tiles.find(t => t.id === tileId);
    if (tileToPin) {
      addDebugLogEntry(DebugLogEntryType.INFO, "Tile Pinned", { tileId, title: tileToPin.content.title });
      if (!pinnedTiles.some(pt => pt.id === tileId)) {
        setPinnedTiles(prevPinned => [...prevPinned, { ...tileToPin, isPinned: true, lifecycle: { ...tileToPin.lifecycle, durationMs: Infinity } }]);
      }
    }
  }, [tiles, pinnedTiles, addDebugLogEntry]);
  
  const handleDismissTile = useCallback((tileId: string) => {
    const dismissedTile = tiles.find(t => t.id === tileId);
    if(dismissedTile) {
        addDebugLogEntry(DebugLogEntryType.INFO, "Tile Dismissed", { tileId, title: dismissedTile.content.title });
    }
    setTiles(prevTiles => prevTiles.filter(tile => tile.id !== tileId));
    setPinnedTiles(prevPinned => prevPinned.filter(tile => tile.id !== tileId));
  }, [tiles, addDebugLogEntry]);
  
  const bringToFront = useCallback((tileId: string) => {
    setTiles(prevTiles => {
      const tileToBring = prevTiles.find(t => t.id === tileId);
      const maxZ = prevTiles.reduce((max, t) => Math.max(max, t.zIndex), 0);
      if (tileToBring && tileToBring.zIndex === maxZ && prevTiles.length > 1 && !tileToBring.isPinned) return prevTiles; 

      return prevTiles.map(tile => 
        tile.id === tileId ? { ...tile, zIndex: maxZ + 1 } : tile
      );
    });
  }, []);

  const handleMoveTile = useCallback((tileId: string, newX: number, newY: number) => {
    setTiles(prevTiles =>
      prevTiles.map(tile =>
        tile.id === tileId ? { ...tile, x: newX, y: newY } : tile
      )
    );
  }, []);

  const toggleDebugMenu = useCallback(() => {
    setShowDebugMenu(prev => !prev);
  }, []);

  const clearDebugLog = useCallback(() => {
    setDebugLog([]);
  }, []);

  return (
    <div className="flex flex-col h-screen antialiased bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-100">
      <Header
        isListening={isListening}
        onStartStop={handleStartStop}
        onClear={handleClear}
        onDownload={handleDownload}
        microphoneAllowed={microphoneAllowed}
        speechApiSupported={deepgramReady && geminiReady} // Both must be ready
        onToggleDebug={toggleDebugMenu}
        dgConnectionState={dgConnectionState}
      />
      <main ref={boardRef} className="flex-grow relative overflow-hidden p-4 bg-slate-800/30 shadow-inner">
        {!deepgramReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-[101] backdrop-blur-sm">
                <div className="p-8 bg-orange-700 rounded-lg shadow-xl text-center text-white max-w-md">
                    <h3 className="text-2xl font-semibold mb-3">Deepgram Service Not Ready</h3>
                    <p className="text-orange-100">The Deepgram real-time transcription service could not be initialized.</p>
                    <p className="text-orange-100 mt-1">Please ensure the <code className="bg-orange-900 px-1 rounded text-sm">DEEPGRAM_API_KEY</code> is correctly set in <code className="bg-orange-900 px-1 rounded text-sm">constants.ts</code> (or as an env var) and refresh.</p>
                    <p className="text-orange-200 mt-2 text-xs">If the issue persists, check the console for specific errors from Deepgram.</p>
                </div>
            </div>
        )}
        {deepgramReady && !geminiReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-[101] backdrop-blur-sm">
                <div className="p-8 bg-red-700 rounded-lg shadow-xl text-center text-white max-w-md">
                    <h3 className="text-2xl font-semibold mb-3">Google Gemini Service Not Ready</h3>
                    <p className="text-red-100">The Google Gemini AI service could not be initialized for tile generation.</p>
                    <p className="text-red-100 mt-1">Please ensure your <code className="bg-red-900 px-1 rounded text-sm">API_KEY</code> for Gemini is correctly set in <code className="bg-red-900 px-1 rounded text-sm">constants.ts</code> (replacing the placeholder) and refresh.</p>
                    <p className="text-red-200 mt-2 text-xs">If the issue persists, check the console for specific errors.</p>
                </div>
            </div>
        )}

        {microphoneAllowed === false && deepgramReady && geminiReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-[100] backdrop-blur-sm">
            <div className="p-8 bg-rose-700 rounded-lg shadow-xl text-center text-white">
              <h3 className="text-2xl font-semibold mb-3">Microphone Access Denied</h3>
              <p className="text-rose-100">InspiraNote needs microphone access to capture your ideas.</p>
              <p className="text-rose-100 mt-1">Please enable it in your browser settings and refresh the page.</p>
            </div>
          </div>
        )}
         {microphoneAllowed === null && !isListening && deepgramReady && geminiReady && dgConnectionState === DeepgramConnectionState.IDLE && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-[99] backdrop-blur-sm">
            <div className="p-8 bg-sky-700 rounded-lg shadow-xl text-center text-white">
              <h3 className="text-2xl font-semibold mb-3">Welcome to InspiraNote!</h3>
              <p className="text-sky-100">Click "Start Listening" to begin capturing your thoughts.</p>
              <p className="text-sky-100 mt-1">You will be prompted for microphone access if not already granted.</p>
            </div>
          </div>
        )}
        <MahjongBoard
          tiles={tiles}
          onPinTile={handlePinTile}
          onDismissTile={handleDismissTile}
          onBringToFront={bringToFront}
          onMoveTile={handleMoveTile}
          boardSize={boardSizeRef.current}
        />
      </main>
      {(isListening || dgConnectionState === DeepgramConnectionState.CONNECTING) && (
        <div className={`fixed bottom-4 right-4 text-white text-sm px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 z-[102]
                        ${dgConnectionState === DeepgramConnectionState.CONNECTING ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3"/>
          </svg>
          <span>{dgConnectionState === DeepgramConnectionState.CONNECTING ? 'Connecting...' : 'Listening...'}</span>
        </div>
      )}
      {showDownloadModal && (
        <DownloadModal pinnedTiles={pinnedTiles} onClose={() => setShowDownloadModal(false)} />
      )}
      {showDebugMenu && (
        <DebugMenu 
            log={debugLog} 
            onClose={toggleDebugMenu} 
            onClearLog={clearDebugLog}
        />
      )}
    </div>
  );
};

export default App;