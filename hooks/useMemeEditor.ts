import { useState, useRef, useCallback } from 'react';
import { TextBox } from '@/types/meme';

const TEXT_BOX_PADDING = 20;
const DELETE_BUTTON_SIZE = 18;
const RESIZE_HANDLE_SIZE = 14;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 120;

const FONT_FAMILIES = [
  'Impact',
  'Arial',
  'Comic Sans MS',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Helvetica'
];

const POSITION_PRESETS = ['top', 'middle', 'bottom'];

export function useMemeEditor() {
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [selectedTextBox, setSelectedTextBox] = useState<TextBox | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const draggedTextBoxRef = useRef<TextBox | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ distance: 0, fontSize: 0 });
  const textBoxCounterRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getCanvas = useCallback(() => {
    return canvasRef.current;
  }, []);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext('2d') : null;
  }, []);

  const loadImageFromSource = useCallback((source: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setCurrentImage(img);
    };
    img.onerror = () => {
      alert('Failed to load image. Please check the file path: ' + source);
      console.error('Failed to load image:', source);
    };
    img.src = source;
  }, []);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) return;

    const maxWidth = 800;
    const maxHeight = 600;

    let width = currentImage.width;
    let height = currentImage.height;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;
  }, [currentImage]);

  const getTextBoxBounds = useCallback((textBox: TextBox, ctx: CanvasRenderingContext2D) => {
    const textForBounds = textBox.text && textBox.text.trim().length > 0 ? textBox.text : 'Text';

    ctx.font = `${textBox.fontSize}px ${textBox.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lines = textForBounds.split('\n');
    const lineHeight = textBox.fontSize * 1.2;
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = textBox.y - (totalHeight / 2);
    const endY = startY + (lines.length * lineHeight);

    let maxWidth = 0;
    lines.forEach(line => {
      const metrics = ctx.measureText(line);
      maxWidth = Math.max(maxWidth, metrics.width);
    });

    const halfWidth = (maxWidth / 2) + TEXT_BOX_PADDING;
    const topY = startY - (textBox.fontSize / 2) - TEXT_BOX_PADDING;
    const bottomY = endY + (textBox.fontSize / 2) + TEXT_BOX_PADDING;

    return {
      left: textBox.x - halfWidth,
      right: textBox.x + halfWidth,
      top: topY,
      bottom: bottomY,
      width: halfWidth * 2,
      height: bottomY - topY
    };
  }, []);

  const isPointInRect = useCallback((x: number, y: number, rect: { left: number; right: number; top: number; bottom: number }) => {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }, []);

  const getDeleteButtonRect = useCallback((bounds: { right: number; top: number }) => {
    return {
      left: bounds.right - DELETE_BUTTON_SIZE,
      right: bounds.right,
      top: bounds.top,
      bottom: bounds.top + DELETE_BUTTON_SIZE
    };
  }, []);

  const getResizeHandleRect = useCallback((bounds: { right: number; bottom: number }) => {
    return {
      left: bounds.right - RESIZE_HANDLE_SIZE,
      right: bounds.right,
      top: bounds.bottom - RESIZE_HANDLE_SIZE,
      bottom: bounds.bottom
    };
  }, []);

  const getTextBoxAtPosition = useCallback((x: number, y: number) => {
    const ctx = getContext();
    if (!ctx) return null;

    for (let i = textBoxes.length - 1; i >= 0; i--) {
      const textBox = textBoxes[i];
      const bounds = getTextBoxBounds(textBox, ctx);
      if (isPointInRect(x, y, bounds)) {
        return textBox;
      }
    }
    return null;
  }, [textBoxes, getContext, getTextBoxBounds, isPointInRect]);

  const addTextBox = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) {
      alert('Please upload an image first!');
      return;
    }

    textBoxCounterRef.current++;
    const id = `textbox-${textBoxCounterRef.current}`;

    const positionIndex = textBoxes.length % POSITION_PRESETS.length;
    const position = POSITION_PRESETS[positionIndex];

    let y: number;
    switch (position) {
      case 'top':
        y = canvas.height * 0.15;
        break;
      case 'middle':
        y = canvas.height * 0.5;
        break;
      case 'bottom':
        y = canvas.height * 0.85;
        break;
      default:
        y = canvas.height * 0.5;
    }

    const newTextBox: TextBox = {
      id,
      text: '',
      fontSize: 40,
      fontFamily: 'Impact',
      color: '#ffffff',
      x: canvas.width / 2,
      y
    };

    setTextBoxes(prev => [...prev, newTextBox]);
  }, [currentImage, textBoxes.length]);

  const deleteTextBox = useCallback((id: string) => {
    setTextBoxes(prev => prev.filter(tb => tb.id !== id));
    if (selectedTextBox?.id === id) {
      setSelectedTextBox(null);
    }
  }, [selectedTextBox]);

  const updateTextBox = useCallback((id: string, updates: Partial<TextBox>) => {
    setTextBoxes(prev => prev.map(tb => tb.id === id ? { ...tb, ...updates } : tb));
    if (selectedTextBox?.id === id) {
      setSelectedTextBox(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedTextBox]);

  const drawMeme = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx || !currentImage) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

    textBoxes.forEach(textBox => {
      if (!textBox.text) return;

      ctx.font = `${textBox.fontSize}px ${textBox.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lines = textBox.text.split('\n');
      const lineHeight = textBox.fontSize * 1.2;
      const totalHeight = (lines.length - 1) * lineHeight;
      const startY = textBox.y - (totalHeight / 2);

      const isBeingDragged = isDragging && draggedTextBoxRef.current === textBox;
      const opacity = isBeingDragged ? 0.8 : 1.0;

      lines.forEach((line, index) => {
        if (line.trim() === '') return;

        const y = startY + (index * lineHeight);

        ctx.strokeStyle = 'black';
        ctx.lineWidth = Math.max(5, textBox.fontSize / 8);
        ctx.strokeText(line, textBox.x, y);

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = textBox.color || '#ffffff';
        ctx.fillText(line, textBox.x, y);
        ctx.restore();
      });
    });

    if (selectedTextBox) {
      const bounds = getTextBoxBounds(selectedTextBox, ctx);

      ctx.save();
      ctx.strokeStyle = 'rgba(245, 87, 108, 0.9)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(bounds.left, bounds.top, bounds.width, bounds.height);
      ctx.setLineDash([]);

      const deleteRect = getDeleteButtonRect(bounds);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
      ctx.fillRect(deleteRect.left, deleteRect.top, DELETE_BUTTON_SIZE, DELETE_BUTTON_SIZE);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(deleteRect.left + 4, deleteRect.top + 4);
      ctx.lineTo(deleteRect.right - 4, deleteRect.bottom - 4);
      ctx.moveTo(deleteRect.right - 4, deleteRect.top + 4);
      ctx.lineTo(deleteRect.left + 4, deleteRect.bottom - 4);
      ctx.stroke();

      const resizeRect = getResizeHandleRect(bounds);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(resizeRect.left, resizeRect.top, RESIZE_HANDLE_SIZE, RESIZE_HANDLE_SIZE);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(resizeRect.left + 3, resizeRect.bottom - 3);
      ctx.lineTo(resizeRect.right - 3, resizeRect.top + 3);
      ctx.stroke();

      ctx.restore();
    }
  }, [currentImage, textBoxes, selectedTextBox, isDragging, getContext, getTextBoxBounds, getDeleteButtonRect, getResizeHandleRect]);

  const downloadMeme = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage || textBoxes.length === 0) {
      alert('Please upload an image and add at least one text box!');
      return;
    }

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    const maxExportWidth = 1200;
    const maxExportHeight = 1200;

    let exportWidth = currentImage.width;
    let exportHeight = currentImage.height;

    if (exportWidth > maxExportWidth) {
      exportHeight = (exportHeight * maxExportWidth) / exportWidth;
      exportWidth = maxExportWidth;
    }
    if (exportHeight > maxExportHeight) {
      exportWidth = (exportWidth * maxExportHeight) / exportHeight;
      exportHeight = maxExportHeight;
    }

    tempCanvas.width = exportWidth;
    tempCanvas.height = exportHeight;

    tempCtx.drawImage(currentImage, 0, 0, exportWidth, exportHeight);

    const scaleX = exportWidth / canvas.width;
    const scaleY = exportHeight / canvas.height;

    textBoxes.forEach(textBox => {
      if (!textBox.text) return;

      const scaledFontSize = textBox.fontSize * scaleX;
      const scaledX = textBox.x * scaleX;
      const scaledY = textBox.y * scaleY;

      tempCtx.font = `${scaledFontSize}px ${textBox.fontFamily}`;
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';

      const lines = textBox.text.split('\n');
      const lineHeight = scaledFontSize * 1.2;
      const totalHeight = (lines.length - 1) * lineHeight;
      const startY = scaledY - (totalHeight / 2);

      lines.forEach((line, index) => {
        if (line.trim() === '') return;

        const y = startY + (index * lineHeight);

        tempCtx.strokeStyle = 'black';
        tempCtx.lineWidth = Math.max(5, scaledFontSize / 8);
        tempCtx.strokeText(line, scaledX, y);

        tempCtx.fillStyle = textBox.color || '#ffffff';
        tempCtx.fillText(line, scaledX, y);
      });
    });

    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  }, [currentImage, textBoxes]);

  const exportCanvasAsDataURL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage || textBoxes.length === 0) {
      return null;
    }

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return null;

    const maxExportWidth = 1200;
    const maxExportHeight = 1200;

    let exportWidth = currentImage.width;
    let exportHeight = currentImage.height;

    if (exportWidth > maxExportWidth) {
      exportHeight = (exportHeight * maxExportWidth) / exportWidth;
      exportWidth = maxExportWidth;
    }
    if (exportHeight > maxExportHeight) {
      exportWidth = (exportWidth * maxExportHeight) / exportHeight;
      exportHeight = maxExportHeight;
    }

    tempCanvas.width = exportWidth;
    tempCanvas.height = exportHeight;

    tempCtx.drawImage(currentImage, 0, 0, exportWidth, exportHeight);

    const scaleX = exportWidth / canvas.width;
    const scaleY = exportHeight / canvas.height;

    textBoxes.forEach(textBox => {
      if (!textBox.text) return;

      const scaledFontSize = textBox.fontSize * scaleX;
      const scaledX = textBox.x * scaleX;
      const scaledY = textBox.y * scaleY;

      tempCtx.font = `${scaledFontSize}px ${textBox.fontFamily}`;
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';

      const lines = textBox.text.split('\n');
      const lineHeight = scaledFontSize * 1.2;
      const totalHeight = (lines.length - 1) * lineHeight;
      const startY = scaledY - (totalHeight / 2);

      lines.forEach((line, index) => {
        if (line.trim() === '') return;

        const y = startY + (index * lineHeight);

        tempCtx.strokeStyle = 'black';
        tempCtx.lineWidth = Math.max(5, scaledFontSize / 8);
        tempCtx.strokeText(line, scaledX, y);

        tempCtx.fillStyle = textBox.color || '#ffffff';
        tempCtx.fillText(line, scaledX, y);
      });
    });

    return tempCanvas.toDataURL('image/png');
  }, [currentImage, textBoxes]);

  return {
    canvasRef,
    currentImage,
    textBoxes,
    selectedTextBox,
    isDragging,
    isResizing,
    draggedTextBoxRef,
    dragOffsetRef,
    resizeStartRef,
    FONT_FAMILIES,
    loadImageFromSource,
    setupCanvas,
    addTextBox,
    deleteTextBox,
    updateTextBox,
    setSelectedTextBox,
    setIsDragging,
    setIsResizing,
    drawMeme,
    downloadMeme,
    exportCanvasAsDataURL,
    getTextBoxAtPosition,
    getTextBoxBounds,
    isPointInRect,
    getDeleteButtonRect,
    getResizeHandleRect,
    getContext,
  };
}
