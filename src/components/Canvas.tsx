
import React, { useRef, useState, useEffect } from 'react';
import { EditorElement } from '../types';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '../constants';
import { Maximize } from 'lucide-react';

interface CanvasProps {
  elements: EditorElement[];
  selectedId: string | null;
  showGrid: boolean;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<EditorElement>) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ elements, selectedId, showGrid, onSelect, onUpdate }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{ w: number; h: number; x: number; y: number } | null>(null);
  const [initialPos, setInitialPos] = useState<{ x: number; y: number } | null>(null);
  const [interactionMode, setInteractionMode] = useState<'none' | 'dragging' | 'resizing'>('none');

  // Handle global mouse up to stop dragging/resizing even if mouse leaves element
  useEffect(() => {
    const handleMouseUp = () => {
      setInteractionMode('none');
      setDragStart(null);
      setResizeStart(null);
      setInitialPos(null);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current || !selectedId) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = A4_WIDTH_PX / rect.width;
      const scaleY = A4_HEIGHT_PX / rect.height;

      // Current mouse position in canvas coordinates
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      if (interactionMode === 'dragging' && dragStart && initialPos) {
        const deltaX = mouseX - dragStart.x;
        const deltaY = mouseY - dragStart.y;
        
        onUpdate(selectedId, {
          x: initialPos.x + deltaX,
          y: initialPos.y + deltaY
        });
      } else if (interactionMode === 'resizing' && resizeStart) {
        const deltaX = (e.clientX - resizeStart.x) * scaleX;
        // const deltaY = (e.clientY - resizeStart.y) * scaleY; // Preserve aspect ratio? 
        
        const newWidth = Math.max(20, resizeStart.w + deltaX);
        const element = elements.find(el => el.id === selectedId);
        
        if (element && element.width && element.height) {
             const aspectRatio = element.height / element.width;
             onUpdate(selectedId, {
                width: newWidth,
                height: newWidth * aspectRatio
             });
        }
      }
    };

    if (interactionMode !== 'none') {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [interactionMode, selectedId, dragStart, initialPos, resizeStart, onUpdate, elements]);

  const handleMouseDownElement = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelect(id);
    
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = A4_WIDTH_PX / rect.width;
    const scaleY = A4_HEIGHT_PX / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const el = elements.find(e => e.id === id);
    if (el) {
        setInitialPos({ x: el.x, y: el.y });
        setDragStart({ x: mouseX, y: mouseY });
        setInteractionMode('dragging');
    }
  };

  const handleResizeStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Only resize if selected
    if (selectedId !== id) {
        onSelect(id);
    }
    
    const el = elements.find(e => e.id === id);
    if (!el || !el.width || !el.height) return;

    setResizeStart({ 
        w: el.width, 
        h: el.height, 
        x: e.clientX, 
        y: e.clientY 
    });
    setInteractionMode('resizing');
  };

  const gridStyle = showGrid ? {
    backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
    backgroundSize: '20px 20px'
  } : {};

  return (
    <div className="flex-1 bg-slate-100 overflow-auto flex justify-center py-10 px-4 relative">
      <div 
        ref={canvasRef}
        id="pdf-canvas"
        className="bg-white relative a4-shadow cursor-default"
        style={{
          width: `${A4_WIDTH_PX}px`,
          height: `${A4_HEIGHT_PX}px`,
          minWidth: `${A4_WIDTH_PX}px`,
          minHeight: `${A4_HEIGHT_PX}px`,
          ...gridStyle
        }}
        onClick={() => onSelect(null)}
      >
        {/* Center Guide Lines */}
        {showGrid && (
          <>
            {/* Vertical Center Line */}
            <div 
                className="absolute top-0 bottom-0 left-1/2 w-px bg-red-400 z-0 pointer-events-none opacity-60" 
                style={{ transform: 'translateX(-0.5px)' }} 
            />
            {/* Horizontal Center Line */}
            <div 
                className="absolute left-0 right-0 top-1/2 h-px bg-red-400 z-0 pointer-events-none opacity-60" 
                style={{ transform: 'translateY(-0.5px)' }} 
            />
          </>
        )}

        {/* Render Elements */}
        {elements.map((el) => {
          const isSelected = selectedId === el.id;
          const style: React.CSSProperties = {
            position: 'absolute',
            left: `${el.x}px`,
            top: `${el.y}px`,
            transform: `rotate(${el.rotation}deg)`,
            cursor: interactionMode === 'none' ? 'move' : (interactionMode === 'dragging' ? 'grabbing' : 'default'),
            border: isSelected ? '2px dashed #3b82f6' : '1px solid transparent',
            zIndex: isSelected ? 100 : 1,
            userSelect: 'none',
          };

          if (el.type === 'text') {
            style.fontSize = `${el.fontSize || 16}px`;
            style.fontFamily = el.fontFamily;
            style.whiteSpace = 'pre-wrap';
            style.maxWidth = '100%';
            style.lineHeight = '1.1'; // Tighter line height for large text
          } else {
             style.width = `${el.width}px`;
             style.height = `${el.height}px`;
          }

          return (
            <div
              key={el.id}
              style={style}
              onMouseDown={(e) => handleMouseDownElement(e, el.id)}
              onClick={(e) => e.stopPropagation()} 
              className="group hover:border-blue-200"
            >
              {el.type === 'text' ? (
                <div className="p-2">{el.content}</div>
              ) : (
                <div className="relative w-full h-full">
                    <img 
                        src={el.content} 
                        alt="User Element" 
                        className="w-full h-full object-contain pointer-events-none" 
                    />
                    {/* Resize Handle for Images */}
                    {isSelected && (
                        <div 
                            className="absolute -bottom-3 -right-3 w-6 h-6 bg-blue-500 rounded-full border-2 border-white cursor-se-resize shadow-md flex items-center justify-center z-50 hover:scale-110 transition-transform"
                            onMouseDown={(e) => handleResizeStart(e, el.id)}
                            onClick={(e) => e.stopPropagation()} 
                        >
                            <Maximize size={12} className="text-white transform rotate-90" />
                        </div>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
