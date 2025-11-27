
import React, { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { EditorElement } from './types';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { Canvas } from './components/Canvas';
import { A4_WIDTH_PX, A4_HEIGHT_PX, INITIAL_TEXT_CONTENT, DEFAULT_FONT_SIZE, DEFAULT_FONT_FAMILY } from './constants';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [showGrid, setShowGrid] = useState(false);

  const handleAddText = () => {
    const newElement: EditorElement = {
      id: generateId(),
      type: 'text',
      x: A4_WIDTH_PX / 2 - 100,
      y: A4_HEIGHT_PX / 2 - 20,
      content: INITIAL_TEXT_CONTENT,
      rotation: 0,
      fontSize: DEFAULT_FONT_SIZE,
      fontFamily: DEFAULT_FONT_FAMILY,
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedId(newElement.id);
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
            // Load image to get dimensions first
            const img = new Image();
            img.src = event.target.result as string;
            img.onload = () => {
                 // Calculate initial size (fit within 200px width max initially)
                 const aspectRatio = img.height / img.width;
                 const initialWidth = 200;
                 const initialHeight = initialWidth * aspectRatio;

                 const newElement: EditorElement = {
                    id: generateId(),
                    type: 'image',
                    x: A4_WIDTH_PX / 2 - 100,
                    y: A4_HEIGHT_PX / 2 - 100,
                    content: event.target!.result as string,
                    rotation: 0,
                    width: initialWidth,
                    height: initialHeight
                  };
                  setElements((prev) => [...prev, newElement]);
                  setSelectedId(newElement.id);
            };
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleUpdateElement = useCallback((id: string, updates: Partial<EditorElement>) => {
    setElements((prev) => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  }, []);

  const handleDeleteElement = (id: string) => {
    setElements((prev) => prev.filter(el => el.id !== id));
    setSelectedId(null);
  };

  const handleClear = () => {
    if (window.confirm("确定要清空画布吗？此操作无法撤销。")) {
        setElements([]);
        setSelectedId(null);
    }
  };

  // Import/Export Configuration
  const handleSaveProject = () => {
    const data = JSON.stringify(elements);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pdf-project-config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loaded = JSON.parse(event.target?.result as string);
        if (Array.isArray(loaded)) {
          setElements(loaded);
          setSelectedId(null);
          alert("配置导入成功！");
        } else {
          alert("文件格式不正确，请选择有效的配置文件。");
        }
      } catch (err) {
        console.error(err);
        alert("无法解析文件，请重试。");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportPDF = async () => {
    const input = document.getElementById('pdf-canvas');
    if (!input) return;
    
    setIsExporting(true);
    // Deselect to remove borders and hide grid
    const currentSelection = selectedId;
    const wasGridVisible = showGrid;

    setSelectedId(null);
    if (wasGridVisible) setShowGrid(false);
    
    // Wait for render cycle
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(input, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('edited-document.pdf');
    } catch (err) {
      console.error("Export failed", err);
      alert("PDF 导出失败，请重试。");
    } finally {
        setIsExporting(false);
        setSelectedId(currentSelection);
        if (wasGridVisible) setShowGrid(true);
    }
  };

  const handleBatchExport = async (id: string, rangePattern: string) => {
    // 1. Parse Range
    const parts = rangePattern.split('~');
    if (parts.length !== 2) {
      alert("格式无效。请使用如：2-071~2-171 的格式");
      return;
    }

    const [startStr, endStr] = parts.map(s => s.trim());
    
    const regex = /^(.*?)(\d+)$/;
    const startMatch = startStr.match(regex);
    const endMatch = endStr.match(regex);

    if (!startMatch || !endMatch) {
       alert("无法识别起始或结束编号。请确保内容以数字结尾。");
       return;
    }

    const [, startPrefix, startNumStr] = startMatch;
    const [, endPrefix, endNumStr] = endMatch;

    if (startPrefix !== endPrefix) {
        alert(`前缀不匹配：'${startPrefix}' vs '${endPrefix}'。前缀必须相同。`);
        return;
    }

    const startNum = parseInt(startNumStr, 10);
    const endNum = parseInt(endNumStr, 10);
    const padding = startNumStr.length;

    if (startNum > endNum) {
        alert("起始编号必须小于或等于结束编号。");
        return;
    }

    const total = endNum - startNum + 1;
    if (total > 500) {
        if (!window.confirm(`即将生成 ${total} 页 PDF，这可能需要一些时间。是否继续？`)) return;
    }
    
    // 2. Setup Export
    setIsExporting(true);
    const originalSelection = selectedId;
    const wasGridVisible = showGrid;

    setSelectedId(null);
    if (wasGridVisible) setShowGrid(false);

    const elementToRestore = elements.find(el => el.id === id);
    if (!elementToRestore) return;

    try {
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const input = document.getElementById('pdf-canvas');
        
        if (!input) throw new Error("Canvas not found");

        for (let i = 0; i < total; i++) {
            const currentNum = startNum + i;
            const currentNumStr = String(currentNum).padStart(padding, '0');
            const currentContent = startPrefix + currentNumStr;
            
            setExportProgress(`正在生成第 ${i + 1} / ${total} 页`);

            setElements(prev => prev.map(el => el.id === id ? { ...el, content: currentContent } : el));
            
            await new Promise(resolve => setTimeout(resolve, 50)); 
            
            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');
            
            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }

        pdf.save('batch-document.pdf');
    } catch (e) {
        console.error(e);
        alert("批量生成过程中出现错误。");
    } finally {
        if (elementToRestore) {
            setElements(prev => prev.map(el => el.id === id ? elementToRestore : el));
        }
        setIsExporting(false);
        setExportProgress('');
        setSelectedId(originalSelection);
        if (wasGridVisible) setShowGrid(true);
    }
  };

  const selectedElement = elements.find(el => el.id === selectedId) || null;

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <Toolbar 
        onAddText={handleAddText} 
        onAddImage={handleAddImage}
        onExport={handleExportPDF}
        onClear={handleClear}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
      />
      
      <main className="flex-1 flex flex-col h-full relative">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
             <h1 className="text-xl font-bold text-slate-700">PDF 编辑器</h1>
             <div className="flex items-center gap-4">
                {exportProgress && (
                    <span className="text-sm font-bold text-blue-600 animate-pulse">{exportProgress}</span>
                )}
                {isExporting && !exportProgress && (
                    <span className="text-sm font-medium text-slate-400">处理中...</span>
                )}
             </div>
        </header>

        <Canvas 
            elements={elements} 
            selectedId={selectedId} 
            showGrid={showGrid}
            onSelect={!isExporting ? setSelectedId : () => {}} 
            onUpdate={handleUpdateElement}
        />
      </main>

      <PropertiesPanel 
        element={selectedElement}
        onUpdate={handleUpdateElement}
        onDelete={handleDeleteElement}
        onBatchExport={handleBatchExport}
        isExporting={isExporting}
      />
    </div>
  );
}

export default App;
