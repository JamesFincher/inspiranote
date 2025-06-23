import React from 'react';
import { DebugLogEntry, DebugLogEntryType } from '../types';
import { CloseIcon, TrashIcon } from './Icons';

interface DebugMenuProps {
  log: DebugLogEntry[];
  onClose: () => void;
  onClearLog: () => void;
}

const getEntryStyle = (type: DebugLogEntryType) => {
  switch (type) {
    case DebugLogEntryType.TRANSCRIPT: // Final transcript used for Gemini
      return 'border-cyan-500 bg-cyan-900/30';
    case DebugLogEntryType.GEMINI_PROMPT:
      return 'border-purple-500 bg-purple-900/30';
    case DebugLogEntryType.GEMINI_RAW_RESPONSE:
      return 'border-indigo-500 bg-indigo-900/30';
    case DebugLogEntryType.GEMINI_PARSED_RESPONSE:
      return 'border-teal-500 bg-teal-900/30';
    case DebugLogEntryType.GEMINI_FINAL_TILE:
      return 'border-green-500 bg-green-900/30';
    case DebugLogEntryType.GEMINI_ERROR:
      return 'border-red-600 bg-red-900/40';
    case DebugLogEntryType.INFO:
      return 'border-slate-600 bg-slate-800/30';
    case DebugLogEntryType.DEEPGRAM_EVENT:
      return 'border-yellow-500 bg-yellow-900/30';
    case DebugLogEntryType.DEEPGRAM_TRANSCRIPT: // Raw/interim from DG
      return 'border-sky-600 bg-sky-900/40';
    case DebugLogEntryType.DEEPGRAM_METADATA:
      return 'border-lime-500 bg-lime-900/30';
    case DebugLogEntryType.DEEPGRAM_ERROR:
      return 'border-orange-500 bg-orange-900/40';
    default:
      return 'border-slate-700 bg-slate-800/50';
  }
};

const formatTimestamp = (isoString: string) => {
  const date = new Date(isoString);
  const timePart = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  return `${timePart}.${milliseconds}`;
};


export const DebugMenu: React.FC<DebugMenuProps> = ({ log, onClose, onClearLog }) => {
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const renderData = (data: any, type: DebugLogEntryType) => {
    if (typeof data === 'string') {
      // For prompts or if it looks like JSON, try to pretty print
      if (type === DebugLogEntryType.GEMINI_PROMPT || data.trim().startsWith('{') || data.trim().startsWith('[')) {
        try {
           const parsedJson = JSON.parse(data);
           return <pre className="whitespace-pre-wrap break-all text-xs">{JSON.stringify(parsedJson, null, 2)}</pre>;
        } catch (e) {
           return <pre className="whitespace-pre-wrap break-all text-xs">{data}</pre>;
        }
      }
      return <p className="text-xs text-slate-300 whitespace-pre-wrap break-words">{data}</p>;
    }
    if (typeof data === 'object' && data !== null) {
      return <pre className="whitespace-pre-wrap break-all text-xs">{JSON.stringify(data, null, 2)}</pre>;
    }
    return <p className="text-xs text-slate-300">{String(data)}</p>;
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[2000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col text-slate-200"
        onClick={handleContentClick}
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <h2 className="text-xl font-semibold text-sky-400">Debug Log</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClearLog}
              title="Clear Log"
              className="p-2 rounded-md hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              title="Close Debug Menu"
              className="p-2 rounded-md hover:bg-slate-700 text-slate-400 hover:text-sky-300 transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </header>
        <div className="flex-grow overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50">
          {log.length === 0 && (
            <p className="text-slate-400 text-center py-8">Log is empty. Start interacting with the app.</p>
          )}
          {log.map((entry) => (
            <div key={entry.id} className={`p-3 rounded-md border ${getEntryStyle(entry.type)} shadow-md`}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-semibold text-xs text-slate-400">{entry.type.toUpperCase().replace(/_/g, ' ')}</span>
                <span className="text-xs text-slate-500">{formatTimestamp(entry.timestamp)}</span>
              </div>
              <h4 className="font-medium text-sm text-slate-300 mb-1 break-words max-w-full truncate" title={entry.title}>{entry.title}</h4>
              <div className="bg-slate-900/50 p-2 rounded max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
                {renderData(entry.data, entry.type)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};