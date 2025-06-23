import React from 'react';
import { PlayIcon, StopIcon, TrashIcon, DownloadIcon, MicrophoneOffIcon, BugIcon, ConnectingIcon } from './Icons'; // Assuming ConnectingIcon exists or will be added
import { DeepgramConnectionState } from '../types';

interface HeaderProps {
  isListening: boolean; // True if Deepgram is actively listening (OPEN state)
  onStartStop: () => void;
  onClear: () => void;
  onDownload: () => void;
  microphoneAllowed: boolean | null;
  speechApiSupported: boolean; // Renamed to represent general readiness (e.g. Deepgram API key ok)
  onToggleDebug: () => void;
  dgConnectionState: DeepgramConnectionState;
}

export const Header: React.FC<HeaderProps> = ({ 
  isListening, 
  onStartStop, 
  onClear, 
  onDownload, 
  microphoneAllowed, 
  speechApiSupported, // This now means "Deepgram ready to be used (API key OK, etc)"
  onToggleDebug,
  dgConnectionState
}) => {
  
  let startStopText = 'Start Listening';
  let StartStopIcon = PlayIcon;

  if (dgConnectionState === DeepgramConnectionState.CONNECTING) {
    startStopText = 'Connecting...';
    StartStopIcon = ConnectingIcon; // Or use a spinner/loading icon
  } else if (isListening) { // isListening is true when dgConnectionState is OPEN
    startStopText = 'Stop Listening';
    StartStopIcon = StopIcon;
  }

  const isButtonDisabled = !speechApiSupported || microphoneAllowed === false || dgConnectionState === DeepgramConnectionState.CLOSING;
  
  let buttonTitle = startStopText;
  if (!speechApiSupported) {
    buttonTitle = "Transcription service not available (e.g., API key issue)";
  } else if (microphoneAllowed === false) {
    buttonTitle = "Microphone access required to start";
  } else if (dgConnectionState === DeepgramConnectionState.CLOSING) {
    buttonTitle = "Closing connection...";
  }


  return (
    <header className="bg-slate-900/80 backdrop-blur-md shadow-lg p-4 flex justify-between items-center z-50 sticky top-0">
      <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 text-transparent bg-clip-text">
        InspiraNote
      </h1>
      <div className="flex items-center space-x-3">
        {microphoneAllowed === false && speechApiSupported && (
            <div className="flex items-center text-rose-400" title="Microphone access denied. Please enable in browser settings.">
                <MicrophoneOffIcon className="w-6 h-6 mr-1" />
                <span className="text-sm font-medium">Mic Denied</span>
            </div>
        )}
         {!speechApiSupported && ( // API Key missing or other fundamental issue
            <div className="flex items-center text-orange-400" title="Transcription service not configured or available. Check API Key.">
                <MicrophoneOffIcon className="w-6 h-6 mr-1" />
                <span className="text-sm font-medium">Service N/A</span>
            </div>
        )}
        <button
          onClick={onStartStop}
          disabled={isButtonDisabled}
          className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-all duration-150 ease-in-out text-white
                      ${isListening 
                        ? 'bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg' 
                        : (dgConnectionState === DeepgramConnectionState.CONNECTING 
                            ? 'bg-yellow-500 hover:bg-yellow-600 shadow-md animate-pulse'
                            : 'bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg')}
                      disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none`}
          title={buttonTitle}
        >
          <StartStopIcon className="w-5 h-5" />
          <span>{startStopText}</span>
        </button>
        <button
          onClick={onClear}
          className="px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg transition-all duration-150 ease-in-out"
          title="Clear unpinned tiles"
        >
          <TrashIcon className="w-5 h-5" />
          <span>Clear</span>
        </button>
        <button
          onClick={onDownload}
          className="px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white shadow-md hover:shadow-lg transition-all duration-150 ease-in-out"
          title="Download pinned ideas"
        >
          <DownloadIcon className="w-5 h-5" />
          <span>Download</span>
        </button>
        <button
          onClick={onToggleDebug}
          className="p-2.5 rounded-lg font-semibold flex items-center bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-150 ease-in-out"
          title="Toggle Debug Log"
        >
          <BugIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};