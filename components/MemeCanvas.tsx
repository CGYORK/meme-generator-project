'use client';

import { useEffect, useRef } from 'react';
import { useMemeEditor } from '@/hooks/useMemeEditor';

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 120;

interface MemeCanvasProps {
  editor: ReturnType<typeof useMemeEditor>;
}

export default function MemeCanvas({ editor }: MemeCanvasProps) {
  const {
    canvasRef,
    currentImage,
    selectedTextBox,
    isDragging,
    isResizing,
    draggedTextBoxRef,
    dragOffsetRef,
    resizeStartRef,
    setupCanvas,
    drawMeme,
    getTextBoxAtPosition,
    getTextBoxBounds,
    isPointInRect,
    getDeleteButtonRect,
    getResizeHandleRect,
    getContext,
  } = editor;

  const hasImageRef = useRef(false);

  useEffect(() => {
    if (currentImage && !hasImageRef.current) {
      setupCanvas();
      hasImageRef.current = true;
    }
  }, [currentImage, setupCanvas]);

  useEffect(() => {
    if (currentImage) {
      drawMeme();
    }
  }, [currentImage, editor.textBoxes, selectedTextBox, isDragging, drawMeme]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (selectedTextBox) {
      const ctx = getContext();
      if (!ctx) return;

      const bounds = getTextBoxBounds(selectedTextBox, ctx);
      const deleteRect = getDeleteButtonRect(bounds);
      const resizeRect = getResizeHandleRect(bounds);

      if (isPointInRect(x, y, deleteRect)) {
        editor.deleteTextBox(selectedTextBox.id);
        editor.setSelectedTextBox(null);
        canvas.style.cursor = 'default';
        e.preventDefault();
        return;
      }

      if (isPointInRect(x, y, resizeRect)) {
        editor.setIsResizing(true);
        draggedTextBoxRef.current = selectedTextBox;
        const centerX = (bounds.left + bounds.right) / 2;
        const centerY = (bounds.top + bounds.bottom) / 2;
        resizeStartRef.current.distance = Math.max(1, Math.hypot(x - centerX, y - centerY));
        resizeStartRef.current.fontSize = selectedTextBox.fontSize;
        canvas.style.cursor = 'nwse-resize';
        e.preventDefault();
        return;
      }
    }

    const clickedTextBox = getTextBoxAtPosition(x, y);

    if (clickedTextBox) {
      editor.setSelectedTextBox(clickedTextBox);
      editor.setIsDragging(true);
      draggedTextBoxRef.current = clickedTextBox;
      dragOffsetRef.current.x = x - clickedTextBox.x;
      dragOffsetRef.current.y = y - clickedTextBox.y;
      canvas.style.cursor = 'move';
      drawMeme();
      e.preventDefault();
      return;
    }

    if (selectedTextBox) {
      editor.setSelectedTextBox(null);
      drawMeme();
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (isResizing && draggedTextBoxRef.current) {
      const ctx = getContext();
      if (!ctx) return;

      const bounds = getTextBoxBounds(draggedTextBoxRef.current, ctx);
      const centerX = (bounds.left + bounds.right) / 2;
      const centerY = (bounds.top + bounds.bottom) / 2;
      const currentDistance = Math.max(1, Math.hypot(x - centerX, y - centerY));
      const scale = currentDistance / resizeStartRef.current.distance;
      const newSize = Math.round(resizeStartRef.current.fontSize * scale);
      const clampedSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, newSize));
      
      editor.updateTextBox(draggedTextBoxRef.current.id, { fontSize: clampedSize });
      drawMeme();
      return;
    }

    if (isDragging && draggedTextBoxRef.current) {
      const newX = x - dragOffsetRef.current.x;
      const newY = y - dragOffsetRef.current.y;

      const constrainedX = Math.max(0, Math.min(canvas.width, newX));
      const constrainedY = Math.max(0, Math.min(canvas.height, newY));

      editor.updateTextBox(draggedTextBoxRef.current.id, {
        x: constrainedX,
        y: constrainedY
      });
      drawMeme();
    } else {
      if (selectedTextBox) {
        const ctx = getContext();
        if (!ctx) return;

        const bounds = getTextBoxBounds(selectedTextBox, ctx);
        const deleteRect = getDeleteButtonRect(bounds);
        const resizeRect = getResizeHandleRect(bounds);

        if (isPointInRect(x, y, deleteRect)) {
          canvas.style.cursor = 'pointer';
          return;
        }
        if (isPointInRect(x, y, resizeRect)) {
          canvas.style.cursor = 'nwse-resize';
          return;
        }
      }

      const hoveredTextBox = getTextBoxAtPosition(x, y);
      canvas.style.cursor = hoveredTextBox ? 'move' : 'default';
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDragging || isResizing) {
      editor.setIsDragging(false);
      editor.setIsResizing(false);
      draggedTextBoxRef.current = null;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = 'default';
      }
    }
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    if (selectedTextBox) {
      const ctx = getContext();
      if (!ctx) return;

      const bounds = getTextBoxBounds(selectedTextBox, ctx);
      const deleteRect = getDeleteButtonRect(bounds);
      const resizeRect = getResizeHandleRect(bounds);

      if (isPointInRect(x, y, deleteRect)) {
        editor.deleteTextBox(selectedTextBox.id);
        editor.setSelectedTextBox(null);
        return;
      }

      if (isPointInRect(x, y, resizeRect)) {
        editor.setIsResizing(true);
        draggedTextBoxRef.current = selectedTextBox;
        const centerX = (bounds.left + bounds.right) / 2;
        const centerY = (bounds.top + bounds.bottom) / 2;
        resizeStartRef.current.distance = Math.max(1, Math.hypot(x - centerX, y - centerY));
        resizeStartRef.current.fontSize = selectedTextBox.fontSize;
        return;
      }
    }

    const clickedTextBox = getTextBoxAtPosition(x, y);

    if (clickedTextBox) {
      editor.setSelectedTextBox(clickedTextBox);
      editor.setIsDragging(true);
      draggedTextBoxRef.current = clickedTextBox;
      dragOffsetRef.current.x = x - clickedTextBox.x;
      dragOffsetRef.current.y = y - clickedTextBox.y;
      drawMeme();
    } else if (selectedTextBox) {
      editor.setSelectedTextBox(null);
      drawMeme();
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage || !draggedTextBoxRef.current) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    if (isResizing) {
      const ctx = getContext();
      if (!ctx) return;

      const bounds = getTextBoxBounds(draggedTextBoxRef.current, ctx);
      const centerX = (bounds.left + bounds.right) / 2;
      const centerY = (bounds.top + bounds.bottom) / 2;
      const currentDistance = Math.max(1, Math.hypot(x - centerX, y - centerY));
      const scale = currentDistance / resizeStartRef.current.distance;
      const newSize = Math.round(resizeStartRef.current.fontSize * scale);
      const clampedSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, newSize));
      
      editor.updateTextBox(draggedTextBoxRef.current.id, { fontSize: clampedSize });
      drawMeme();
      return;
    }

    if (isDragging) {
      const newX = x - dragOffsetRef.current.x;
      const newY = y - dragOffsetRef.current.y;

      const constrainedX = Math.max(0, Math.min(canvas.width, newX));
      const constrainedY = Math.max(0, Math.min(canvas.height, newY));

      editor.updateTextBox(draggedTextBoxRef.current.id, {
        x: constrainedX,
        y: constrainedY
      });
      drawMeme();
    }
  };

  const handleCanvasTouchEnd = () => {
    if (isDragging || isResizing) {
      editor.setIsDragging(false);
      editor.setIsResizing(false);
      draggedTextBoxRef.current = null;
    }
  };

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        id="memeCanvas"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onTouchStart={handleCanvasTouchStart}
        onTouchMove={handleCanvasTouchMove}
        onTouchEnd={handleCanvasTouchEnd}
        onTouchCancel={handleCanvasTouchEnd}
        style={{ cursor: 'default', display: currentImage ? 'block' : 'none' }}
      />
      {!currentImage && (
        <div className="canvas-placeholder">
          <div className="placeholder-content">
            <h3>Ready to Create?</h3>
            <p>Upload an image to start making your meme</p>
          </div>
        </div>
      )}
    </div>
  );
}
