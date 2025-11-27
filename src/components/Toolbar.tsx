
import React, { useRef } from 'react';
import { Type, Image as ImageIcon, Download, Trash2, Grid3X3, Save, FolderOpen } from 'lucide-react';

interface ToolbarProps {
  onAddText: () => void;
  onAddImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onClear: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onSaveProject: () => void;
  onLoadProject: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onAddText, 
  onAddImage, 
  onExport, 
  onClear,
  showGrid,
  onToggleGrid,
  onSaveProject,
  onLoadProject
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-4 z-10 shadow-sm overflow-y-auto">
      <div className="font-bold text-xl text-blue-600 mb-2 tracking-tighter">PDF</div>
      
      <div className="flex flex-col gap-3 w-full px-2">
        {/* Element Tools */}
        <button 
          onClick={onAddText}
          className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors gap-1 group"
          title="添加文本"
        >
          <Type size={20} />
          <span className="text-[10px] font-medium">文本</span>
        </button>

        <button 
          onClick={() => imageInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors gap-1 group"
          title="添加图片"
        >
          <ImageIcon size={20} />
          <span className="text-[10px] font-medium">图片</span>
          <input 
            type="file" 
            ref={imageInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={onAddImage}
          />
        </button>

        <div className="h-px bg-slate-200 w-full my-1"></div>

        {/* View Tools */}
        <button 
          onClick={onToggleGrid}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors gap-1 group ${
            showGrid ? 'bg-blue-100 text-blue-700' : 'hover:bg-blue-50 text-slate-600 hover:text-blue-600'
          }`}
          title="显示/隐藏网格"
        >
          <Grid3X3 size={20} />
          <span className="text-[10px] font-medium">网格</span>
        </button>

        <div className="h-px bg-slate-200 w-full my-1"></div>

        {/* Project Tools */}
        <button 
          onClick={onSaveProject}
          className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors gap-1 group"
          title="保存配置"
        >
          <Save size={20} />
          <span className="text-[10px] font-medium">保存</span>
        </button>

        <button 
          onClick={() => projectInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors gap-1 group"
          title="导入配置"
        >
          <FolderOpen size={20} />
          <span className="text-[10px] font-medium">导入</span>
          <input 
            type="file" 
            ref={projectInputRef} 
            className="hidden" 
            accept=".json"
            onChange={onLoadProject}
          />
        </button>

        <div className="h-px bg-slate-200 w-full my-1"></div>

        <button 
          onClick={onClear}
          className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors gap-1 group"
          title="清空画布"
        >
          <Trash2 size={20} />
          <span className="text-[10px] font-medium">清空</span>
        </button>
      </div>

      <div className="mt-auto mb-2 px-2 w-full pt-4">
         <button 
          onClick={onExport}
          className="flex flex-col items-center justify-center w-full p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all gap-1"
          title="导出 PDF"
        >
          <Download size={20} />
          <span className="text-[10px] font-bold">导出 PDF</span>
        </button>
      </div>
    </div>
  );
};
