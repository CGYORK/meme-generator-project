'use client';

import { useState } from 'react';
import Image from 'next/image';

const TEMPLATE_IMAGES = [
  { name: 'Batman Slapping Robin', path: '/Assets/rules/Batman-Slapping-Robin.jpg' },
  { name: 'Disaster Girl', path: '/Assets/rules/Disaster-Girl.jpg' },
  { name: 'Laughing Leo', path: '/Assets/rules/Laughing-Leo.webp' }
];

interface TemplateGalleryProps {
  onSelectTemplate: (path: string) => void;
  selectedTemplate?: string;
}

export default function TemplateGallery({ onSelectTemplate, selectedTemplate }: TemplateGalleryProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  if (TEMPLATE_IMAGES.length === 0) {
    return <div className="template-gallery-empty">No templates available</div>;
  }

  return (
    <div className="template-gallery">
      {TEMPLATE_IMAGES.map((template) => {
        const isSelected = selectedTemplate === template.path;
        const hasError = imageErrors.has(template.path);

        return (
          <div
            key={template.path}
            className={`template-item ${isSelected ? 'template-selected' : ''} ${hasError ? 'template-error' : ''}`}
            role="button"
            aria-label={`Select template: ${template.name}`}
            tabIndex={0}
            onClick={() => onSelectTemplate(template.path)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectTemplate(template.path);
              }
            }}
          >
            <Image
              src={template.path}
              alt={template.name}
              className="template-thumbnail"
              width={100}
              height={100}
              onError={() => {
                setImageErrors(prev => new Set(prev).add(template.path));
              }}
              onLoad={() => {
                setImageErrors(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(template.path);
                  return newSet;
                });
              }}
            />
            <div className="template-name">
              {hasError ? 'Failed to load' : template.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
