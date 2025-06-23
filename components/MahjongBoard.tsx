
import React from 'react';
import { Tile } from './Tile';
import { TileData } from '../types';

interface MahjongBoardProps {
  tiles: TileData[];
  onPinTile: (tileId: string) => void;
  onDismissTile: (tileId: string) => void;
  onBringToFront: (tileId: string) => void;
  onMoveTile: (tileId: string, x: number, y: number) => void;
  boardSize: { width: number; height: number };
}

export const MahjongBoard: React.FC<MahjongBoardProps> = ({ tiles, onPinTile, onDismissTile, onBringToFront, onMoveTile, boardSize }) => {
  if (!tiles.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6 bg-slate-700/30 rounded-lg shadow-xl">
            <svg className="mx-auto h-16 w-16 text-sky-500 opacity-70 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 className="text-2xl font-semibold text-slate-300 mb-2">Board is Clear</h2>
            <p className="text-slate-400">Click "Start Listening" in the header to begin generating ideas!</p>
            <p className="text-slate-500 text-sm mt-1">Your thoughts will appear here as interactive tiles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {tiles.map(tile => (
        <Tile
          key={tile.id}
          data={tile}
          onPin={() => onPinTile(tile.id)}
          onDismiss={() => onDismissTile(tile.id)}
          onBringToFront={() => onBringToFront(tile.id)}
          onMove={onMoveTile}
          boardSize={boardSize}
        />
      ))}
    </div>
  );
};
    