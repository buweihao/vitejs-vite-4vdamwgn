export type ElementType = 'text' | 'image';

export interface EditorElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number; // In degrees
  content: string; // Text content or Image Data URL
  
  // Text specific
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  
  // Image specific
  width?: number;
  height?: number;
}

export interface CanvasState {
  elements: EditorElement[];
  selectedId: string | null;
  isDragging: boolean;
  isResizing: boolean;
}