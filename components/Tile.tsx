
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TileData, TileCategory, TileStyleHints } from '../types';
import { 
    PinIcon, CloseIcon, CheckCircleIcon, LightBulbIcon, DocumentTextIcon, 
    ChatBubbleBottomCenterTextIcon, PinnedIcon, ActionItemIcon, QuestionIcon, ObservationIcon 
} from './Icons';
import { DEFAULT_TILE_HEIGHT, DEFAULT_TILE_WIDTH } from '../constants';


interface TileProps {
  data: TileData;
  onPin: () => void;
  onDismiss: () => void;
  onBringToFront: () => void;
  onMove: (tileId: string, x: number, y: number) => void;
  boardSize: { width: number; height: number };
}

const categoryStyles: Record<TileCategory, { icon: React.FC<React.SVGProps<SVGSVGElement>>; bgColor: string; borderColor: string; textColor: string; titleColor: string }> = {
  [TileCategory.FactCheck]: { icon: CheckCircleIcon, bgColor: 'bg-emerald-700/80', borderColor: 'border-emerald-500', textColor: 'text-emerald-100', titleColor: 'text-emerald-300' },
  [TileCategory.Resource]: { icon: DocumentTextIcon, bgColor: 'bg-sky-700/80', borderColor: 'border-sky-500', textColor: 'text-sky-100', titleColor: 'text-sky-300' },
  [TileCategory.Creative]: { icon: LightBulbIcon, bgColor: 'bg-purple-700/80', borderColor: 'border-purple-500', textColor: 'text-purple-100', titleColor: 'text-purple-300' },
  [TileCategory.Summary]: { icon: ChatBubbleBottomCenterTextIcon, bgColor: 'bg-amber-700/80', borderColor: 'border-amber-500', textColor: 'text-amber-100', titleColor: 'text-amber-300' },
  [TileCategory.ActionItem]: { icon: ActionItemIcon, bgColor: 'bg-blue-700/80', borderColor: 'border-blue-500', textColor: 'text-blue-100', titleColor: 'text-blue-300' },
  [TileCategory.Question]: { icon: QuestionIcon, bgColor: 'bg-indigo-700/80', borderColor: 'border-indigo-500', textColor: 'text-indigo-100', titleColor: 'text-indigo-300' },
  [TileCategory.Observation]: { icon: ObservationIcon, bgColor: 'bg-slate-600/80', borderColor: 'border-slate-400', textColor: 'text-slate-100', titleColor: 'text-slate-300' },
};

const paletteBgColors: Record<TileStyleHints['palette'], string> = {
    primary: 'bg-sky-700/80',
    secondary: 'bg-indigo-700/80',
    accent: 'bg-teal-700/80',
    neutral: 'bg-slate-700/80',
    warning: 'bg-rose-700/80',
};

const paletteBorderColors: Record<TileStyleHints['palette'], string> = {
    primary: 'border-sky-500',
    secondary: 'border-indigo-500',
    accent: 'border-teal-500',
    neutral: 'border-slate-500',
    warning: 'border-rose-500',
};
const paletteTextColors: Record<TileStyleHints['palette'], string> = {
    primary: 'text-sky-100',
    secondary: 'text-indigo-100',
    accent: 'text-teal-100',
    neutral: 'text-slate-100',
    warning: 'text-rose-100',
};
const paletteTitleColors: Record<TileStyleHints['palette'], string> = {
    primary: 'text-sky-300',
    secondary: 'text-indigo-300',
    accent: 'text-teal-300',
    neutral: 'text-slate-300',
    warning: 'text-rose-300',
};


export const Tile: React.FC<TileProps> = ({ data, onPin, onDismiss, onBringToFront, onMove, boardSize }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false); 
  const dismissTimerRef = useRef<number | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const tileRef = useRef<HTMLDivElement>(null);

  const categorySpecificStyle = categoryStyles[data.category] || categoryStyles[TileCategory.Observation]; // Fallback
  const { icon: CategoryIcon } = categorySpecificStyle;
  
  // Use palette for main colors, category icon remains specific
  const bgColor = paletteBgColors[data.styleHints.palette] || paletteBgColors.neutral;
  const borderColor = paletteBorderColors[data.styleHints.palette] || paletteBorderColors.neutral;
  const textColor = paletteTextColors[data.styleHints.palette] || paletteTextColors.neutral;
  const titleColor = paletteTitleColors[data.styleHints.palette] || paletteTitleColors.neutral;


  useEffect(() => {
    setIsVisible(true); 

    if (!data.isPinned && data.lifecycle.durationMs !== Infinity) {
      dismissTimerRef.current = window.setTimeout(() => {
        if (!data.isPinned) { 
          onDismiss();
        }
      }, data.lifecycle.durationMs);
    }

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [data.id, data.isPinned, data.lifecycle.durationMs, onDismiss]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (data.lifecycle.pauseOnHover && dismissTimerRef.current && !data.isPinned) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (data.lifecycle.pauseOnHover && !dismissTimerRef.current && !data.isPinned && data.lifecycle.durationMs !== Infinity) {
       dismissTimerRef.current = window.setTimeout(() => {
        if (!data.isPinned) {
          onDismiss();
        }
      }, data.lifecycle.durationMs / 2); 
    }
  };
  
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!tileRef.current) return;
    if ((e.target as HTMLElement).closest('button')) {
        return;
    }

    onBringToFront();
    setIsDragging(true);
    dragStartOffset.current = {
      x: e.clientX - data.x,
      y: e.clientY - data.y,
    };
    
    document.body.style.cursor = 'grabbing';
    e.preventDefault();
  }, [data.x, data.y, onBringToFront]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    let newX = e.clientX - dragStartOffset.current.x;
    let newY = e.clientY - dragStartOffset.current.y;

    const padding = 10;
    newX = Math.max(padding, Math.min(newX, boardSize.width - DEFAULT_TILE_WIDTH - padding));
    newY = Math.max(padding, Math.min(newY, boardSize.height - DEFAULT_TILE_HEIGHT - padding));
    
    onMove(data.id, newX, newY);
  }, [isDragging, onMove, data.id, boardSize]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    document.body.style.cursor = 'default';
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
      if (isDragging) { 
        document.body.style.cursor = 'default';
      }
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);


  const tileDynamicStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${data.y}px`,
    left: `${data.x}px`,
    width: `${DEFAULT_TILE_WIDTH}px`,
    height: `${DEFAULT_TILE_HEIGHT}px`,
    transform: `rotate(${data.rotation}deg) scale(${isVisible ? (isHovered || data.isPinned || isDragging ? 1.05 : 1) : 0.9})`,
    zIndex: isDragging ? 10000 : data.zIndex,
    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease-out, box-shadow 0.2s ease-in-out',
    opacity: isVisible ? 1 : 0,
    transformOrigin: 'center center',
    WebkitBackdropFilter: 'blur(8px)',
    backdropFilter: 'blur(8px)', 
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={tileRef}
      style={tileDynamicStyle}
      className={`rounded-xl shadow-2xl overflow-hidden border-2 flex flex-col 
                  ${borderColor} ${bgColor} ${textColor} 
                  ${data.isPinned ? 'ring-4 ring-yellow-400 shadow-yellow-500/60' : 'shadow-slate-900/50'}
                  ${isDragging ? 'shadow-xl scale-105' : 'hover:shadow-lg hover:border-opacity-100'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onFocus={onBringToFront} 
      tabIndex={0} 
    >
      <div className={`p-3 flex-grow overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-slate-700/50`}>
        <div className="flex justify-between items-center mb-1">
          <div className={`flex items-center space-x-2 ${titleColor}`}>
            <CategoryIcon className={`w-5 h-5`} />
            <h3 className="font-semibold text-sm capitalize">{data.category.replace('-', ' ')}</h3>
          </div>
          {data.isPinned && <PinnedIcon className="w-5 h-5 text-yellow-400" title="Pinned"/>}
          {!data.isPinned && <span className={`text-xs ${textColor}/70`}>Prio: {data.styleHints.priority}</span>}
        </div>
        <h2 className={`text-md font-bold leading-tight ${titleColor}`}>{data.content.title}</h2>
        <p className="text-xs leading-snug max-h-16 overflow-hidden text-slate-200">{data.content.text}</p>
        {data.content.links && data.content.links.length > 0 && (
          <div className="mt-1.5 space-y-0.5">
             <span className={`text-xs ${textColor}/80 font-medium`}>Links:</span>
            {data.content.links.slice(0,2).map((link, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()} 
                className={`text-xs ${textColor}/90 hover:underline hover:text-white truncate block ml-2`}
              >
                {link.length > 30 ? link.substring(0, 27) + '...' : link}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className={`p-1.5 ${bgColor} border-t ${borderColor}/50 flex justify-end space-x-1.5`}>
        {!data.isPinned && data.lifecycle.allowPin && (
          <button
            onClick={(e) => { e.stopPropagation(); onPin(); }}
            title="Pin Tile"
            className={`p-1.5 rounded-md hover:bg-black/30 transition-colors ${textColor}`}
          >
            <PinIcon className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss();}}
          title="Dismiss Tile"
          className={`p-1.5 rounded-md hover:bg-black/30 transition-colors ${textColor}`}
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
