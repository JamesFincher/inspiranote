
import React from 'react';
import { TileData } from '../types';
import { CloseIcon, DownloadIcon as DownloadFileIcon } from './Icons'; // Renamed to avoid conflict

interface DownloadModalProps {
  pinnedTiles: TileData[];
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ pinnedTiles, onClose }) => {
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
  };

  const generateTextContent = () => {
    if (pinnedTiles.length === 0) {
      return "No ideas pinned yet. Pin some tiles to include them in your download!";
    }

    let content = `InspiraNote - Pinned Ideas\n`;
    content += `Session Date: ${new Date().toLocaleString()}\n\n`;
    content += `Total Pinned Ideas: ${pinnedTiles.length}\n\n`;
    
    // Simulate a brief AI summary - in a real app, this would be another Gemini call
    if (pinnedTiles.length > 2) {
        content += "AI-Generated Summary (Simulated):\n";
        content += "Key themes emerging from your pinned ideas include strategic planning, creative brainstorming, and resource allocation. Consider focusing on cross-functional collaboration to action these points.\n\n";
    }

    pinnedTiles.forEach((tile, index) => {
      content += `-------------------------------------\n`;
      content += `IDEA ${index + 1}: [${tile.category.toUpperCase()}] ${tile.content.title}\n`;
      content += `-------------------------------------\n`;
      content += `DETAILS: ${tile.content.text}\n`;
      if (tile.content.links && tile.content.links.length > 0) {
        content += `LINKS:\n${tile.content.links.map(link => `  - ${link}`).join('\n')}\n`;
      }
      content += `PRIORITY: ${tile.styleHints.priority}\n`;
      content += `\n`;
    });
    return content;
  };

  const textContent = generateTextContent();

  const handleDownloadTxt = () => {
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `InspiraNote_Ideas_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // Clean up
  };


  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose} 
    >
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col text-slate-200 border border-slate-700"
        onClick={handleContentClick}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-700">
          <h2 className="text-2xl font-semibold text-sky-400">Download Pinned Ideas</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-700/70 transition-colors text-slate-400 hover:text-sky-300"
            title="Close"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 space-y-4 bg-slate-800/60 p-4 rounded-md border border-slate-700/80 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50">
          {pinnedTiles.length === 0 ? (
            <div className="text-center py-10">
                <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-slate-300">No Ideas Pinned</h3>
                <p className="mt-1 text-sm text-slate-400">Start pinning tiles on the board to see them here and download.</p>
            </div>
          ) : (
            pinnedTiles.map(tile => (
              <div key={tile.id} className="p-4 bg-slate-700/60 rounded-lg shadow-md border border-slate-600/50">
                <h3 className="text-lg font-semibold text-cyan-400">{tile.content.title} <span className="text-xs text-slate-400 font-normal">({tile.category.replace('-', ' ')})</span></h3>
                <p className="text-sm text-slate-300 mt-1.5 whitespace-pre-wrap">{tile.content.text}</p>
                {tile.content.links && tile.content.links.length > 0 && (
                  <div className="mt-2.5">
                    <p className="text-xs text-slate-400 font-medium mb-0.5">Relevant Links:</p>
                    <ul className="list-disc list-inside ml-2 space-y-0.5">
                      {tile.content.links.map((link, i) => (
                        <li key={i}><a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-400 hover:text-sky-300 hover:underline transition-colors">{link}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
                 <p className="text-xs text-slate-500 mt-2">Priority: {tile.styleHints.priority}</p>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-medium bg-slate-600 hover:bg-slate-500 text-slate-100 transition-colors shadow-sm hover:shadow-md"
          >
            Close
          </button>
          <button
            onClick={handleDownloadTxt}
            disabled={pinnedTiles.length === 0}
            className="px-5 py-2.5 rounded-lg font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors shadow-md hover:shadow-lg disabled:bg-slate-500 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center space-x-2"
          >
            <DownloadFileIcon className="w-5 h-5"/>
            <span>Download as .txt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
