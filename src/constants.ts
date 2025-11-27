
// A4 Dimensions in Pixels (approx 96 DPI)
// A4 is 210mm x 297mm
// We use a scale factor to make it look good on screen
export const A4_WIDTH_PX = 794; 
export const A4_HEIGHT_PX = 1123; 

export const DEFAULT_FONT_SIZE = 16;
export const DEFAULT_TEXT_COLOR = '#000000';
export const ROTATION_STEPS = [0, 90, 180, 270];

export const INITIAL_TEXT_CONTENT = "点击编辑文本";

export const AVAILABLE_FONTS = [
  { label: '默认字体 (Sans)', value: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
  { label: '微软雅黑 (YaHei)', value: '"Microsoft YaHei", "PingFang SC", sans-serif' },
  { label: '宋体 (SimSun)', value: 'SimSun, "Songti SC", serif' },
  { label: '黑体 (SimHei)', value: 'SimHei, "Heiti SC", sans-serif' },
  { label: '楷体 (KaiTi)', value: 'KaiTi, "Kaiti SC", serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
];

export const DEFAULT_FONT_FAMILY = AVAILABLE_FONTS[0].value;
