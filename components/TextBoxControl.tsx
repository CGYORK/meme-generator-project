'use client';

import { TextBox } from '@/types/meme';

interface TextBoxControlProps {
  textBox: TextBox;
  index: number;
  fontFamilies: string[];
  onUpdate: (id: string, updates: Partial<TextBox>) => void;
  onDelete: (id: string) => void;
}

export default function TextBoxControl({
  textBox,
  index,
  fontFamilies,
  onUpdate,
  onDelete,
}: TextBoxControlProps) {
  return (
    <div className="text-box" id={textBox.id}>
      <div className="text-box-header">
        <span className="text-box-title">Text Box {index + 1}</span>
        <button className="btn-delete" onClick={() => onDelete(textBox.id)}>
          Delete
        </button>
      </div>
      <div className="control-group">
        <label htmlFor={`text-${textBox.id}`}>Text</label>
        <textarea
          id={`text-${textBox.id}`}
          placeholder="Enter text here... (Press Enter for new line)"
          rows={3}
          value={textBox.text}
          onChange={(e) => onUpdate(textBox.id, { text: e.target.value })}
        />
      </div>
      <div className="control-group">
        <label htmlFor={`fontSize-${textBox.id}`}>Font Size</label>
        <div className="slider-container">
          <input
            type="range"
            id={`fontSize-${textBox.id}`}
            min="12"
            max="120"
            value={textBox.fontSize}
            onChange={(e) => onUpdate(textBox.id, { fontSize: parseInt(e.target.value) })}
          />
          <span className="slider-value">{textBox.fontSize}px</span>
        </div>
      </div>
      <div className="control-group">
        <label htmlFor={`fontFamily-${textBox.id}`}>Font Family</label>
        <select
          id={`fontFamily-${textBox.id}`}
          value={textBox.fontFamily}
          onChange={(e) => onUpdate(textBox.id, { fontFamily: e.target.value })}
        >
          {fontFamilies.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </div>
      <div className="control-group">
        <label htmlFor={`textColor-${textBox.id}`}>Text Color</label>
        <div className="color-picker-container">
          <input
            type="color"
            id={`textColor-${textBox.id}`}
            value={textBox.color}
            onChange={(e) => onUpdate(textBox.id, { color: e.target.value })}
          />
          <span className="color-value">{textBox.color}</span>
        </div>
      </div>
    </div>
  );
}
