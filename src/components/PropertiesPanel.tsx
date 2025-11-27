
import React, { useState } from 'react';
import type { EditorElement } from '../types';
import { ROTATION_STEPS, AVAILABLE_FONTS } from '../constants';
import { RotateCw, Type as TypeIcon, Trash2, Layers, Play, Info, Type } from 'lucide-react';

interface PropertiesPanelProps {
  element: EditorElement | null;
  onUpdate: (id: string, updates: Partial<EditorElement>) => void;
  onDelete: (id: string) => void;
  onBatchExport: (id: string, pattern: string) => void;
  isExporting: boolean;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  element, 
  onUpdate, 
  onDelete, 
  onBatchExport,
  isExporting
}) => {
  const [batchPattern, setBatchPattern] = useState('');
  const [showBatchHelp, setShowBatchHelp] = useState(false);

  if (!element) {
    return (
      <div className="w-72 bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center text-slate-400">
        <div className="text-center">
          <p className="mb-2 font-medium">未选中任何元素</p>
          <p className="text-sm">点击画布中的元素进行编辑</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-l border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto z-10 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">属性编辑</h2>
        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
          {element.type === 'text' ? '文本对象' : '图片对象'}
        </p>
      </div>

      {/* Common Controls: Rotation */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <RotateCw size={16} /> 旋转角度
        </label>
        <div className="grid grid-cols-4 gap-2">
          {ROTATION_STEPS.map((deg) => (
            <button
              key={deg}
              onClick={() => onUpdate(element.id, { rotation: deg })}
              className={`px-2 py-2 text-xs rounded border transition-colors ${
                element.rotation === deg 
                  ? 'bg-blue-100 border-blue-500 text-blue-700 font-bold' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {deg}°
            </button>
          ))}
        </div>
      </div>

      {/* Text Specific Controls */}
      {element.type === 'text' && (
        <>
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
               文本内容
            </label>
            <textarea
              value={element.content}
              onChange={(e) => onUpdate(element.id, { content: e.target.value })}
              className="w-full h-24 p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Type size={16} /> 字体选择
            </label>
            <select
              value={element.fontFamily || AVAILABLE_FONTS[0].value}
              onChange={(e) => onUpdate(element.id, { fontFamily: e.target.value })}
              className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {AVAILABLE_FONTS.map((font) => (
                <option key={font.label} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <TypeIcon size={16} /> 字体大小
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="8"
                max="400"
                value={element.fontSize || 16}
                onChange={(e) => onUpdate(element.id, { fontSize: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <input 
                type="number"
                min="8"
                max="400"
                value={element.fontSize || 16}
                onChange={(e) => onUpdate(element.id, { fontSize: parseInt(e.target.value) })}
                className="w-16 p-1 text-sm border border-slate-300 rounded text-center"
              />
            </div>
             <div className="flex justify-between text-xs text-slate-400">
                <span>8px</span>
                <span>400px</span>
            </div>
          </div>

          {/* Batch Generation Section */}
          <div className="pt-4 border-t border-slate-100">
             <div className="mb-3 flex items-center justify-between">
               <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                 <Layers size={16} /> 批量生成 PDF
               </label>
               <button 
                onClick={() => setShowBatchHelp(!showBatchHelp)}
                className="text-blue-600 hover:text-blue-800"
               >
                 <Info size={16} />
               </button>
             </div>
             
             {showBatchHelp && (
               <div className="mb-3 p-3 bg-blue-50 text-xs text-blue-800 rounded border border-blue-100 leading-relaxed">
                 <p className="font-bold mb-1">操作指引：</p>
                 <p className="mb-1">1. 输入范围格式：<br/><code>起始文本~结束文本</code></p>
                 <p className="mb-1">2. 示例：输入 <code>2-071~2-171</code></p>
                 <p className="mb-1">3. 系统将识别数字 <code>071</code> 到 <code>171</code>，自动生成 101 页连续编号的 PDF。</p>
                 <p>4. 注意：前后缀必须一致，只有数字部分可以变化。</p>
               </div>
             )}

             <div className="space-y-2">
               <label className="text-xs font-medium text-slate-700">编号范围 (如: 2-071~2-171)</label>
               <input 
                  type="text" 
                  placeholder="2-071~2-171"
                  value={batchPattern}
                  onChange={(e) => setBatchPattern(e.target.value)}
                  className="w-full p-2 text-sm border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
               />
               <button
                  onClick={() => onBatchExport(element.id, batchPattern)}
                  disabled={isExporting || !batchPattern}
                  className="w-full py-2 bg-slate-800 text-white text-xs font-medium rounded hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                 {isExporting ? (
                   <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>
                 ) : (
                   <Play size={14} />
                 )}
                 {isExporting ? '生成中...' : '开始批量生成'}
               </button>
             </div>
          </div>
        </>
      )}
      
      {/* Image Specific Controls */}
      {element.type === 'image' && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
           <p><strong>提示:</strong> 拖动画布中图片的右下角可以调整图片大小。</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto pt-6 border-t border-slate-100">
        <button
          onClick={() => onDelete(element.id)}
          className="w-full py-2.5 px-4 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 size={18} /> 删除对象
        </button>
      </div>
    </div>
  );
};
