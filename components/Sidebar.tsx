'use client';

import { useRef, useState } from 'react';
import { useMemeEditor } from '@/hooks/useMemeEditor';
import TemplateGallery from './TemplateGallery';
import TextBoxControl from './TextBoxControl';

interface SidebarProps {
  editor: ReturnType<typeof useMemeEditor>;
  onUploadMeme?: () => void;
}

export default function Sidebar({ editor, onUploadMeme }: SidebarProps) {
  const {
    currentImage,
    textBoxes,
    addTextBox,
    deleteTextBox,
    updateTextBox,
    loadImageFromSource,
    downloadMeme,
  } = editor;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedTemplate(undefined);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        loadImageFromSource(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTemplateSelect = (path: string) => {
    setSelectedTemplate(path);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    loadImageFromSource(path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="section-header">
          <h2>Upload Image</h2>
        </div>
        <div className="upload-area">
          <input
            ref={fileInputRef}
            type="file"
            id="imageInput"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <label htmlFor="imageInput" className="upload-label">
            <span className="upload-text">Choose Image</span>
            <span className="upload-hint">PNG, JPG, GIF</span>
          </label>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <h2>Template Gallery</h2>
        </div>
        <TemplateGallery
          onSelectTemplate={handleTemplateSelect}
          selectedTemplate={selectedTemplate}
        />
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <h2>Text Boxes</h2>
        </div>
        <button className="btn-add" onClick={addTextBox}>
          Add Text Box
        </button>
        <div className="text-boxes-list">
          {textBoxes.map((textBox, index) => (
            <TextBoxControl
              key={textBox.id}
              textBox={textBox}
              index={index}
              fontFamilies={editor.FONT_FAMILIES}
              onUpdate={updateTextBox}
              onDelete={deleteTextBox}
            />
          ))}
        </div>
      </div>

      <div className="sidebar-section sidebar-footer">
        {onUploadMeme && (
          <button className="btn-upload" onClick={onUploadMeme}>
            Upload Meme
          </button>
        )}
        <button className="btn-download" onClick={downloadMeme}>
          Download Meme
        </button>
      </div>
    </aside>
  );
}
