'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMemeEditor } from '@/hooks/useMemeEditor';
import { db, id } from '@/lib/instant';
import MemeCanvas from './MemeCanvas';
import Sidebar from './Sidebar';
import AuthGuard from './AuthGuard';
import UserMenu from './UserMenu';

function MemeEditorContent() {
  const router = useRouter();
  const editor = useMemeEditor();
  const [isUploading, setIsUploading] = useState(false);
  const user = db.useUser();

  const handleUploadMeme = async () => {
    if (!editor.currentImage || editor.textBoxes.length === 0) {
      alert('Please upload an image and add at least one text box!');
      return;
    }

    setIsUploading(true);
    try {
      const imageDataUrl = editor.exportCanvasAsDataURL();
      if (!imageDataUrl) {
        alert('Failed to export meme image');
        return;
      }

      const now = new Date();

      db.transact(
        db.tx.memes[id()].create({
          imageUrl: imageDataUrl,
          createdAt: now,
          authorId: user.id,
          upvoteCount: 0,
        })
      );

      router.push('/');
    } catch (error) {
      console.error('Failed to upload meme:', error);
      alert('Failed to upload meme. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1 className="app-title">Meme Generator</h1>
            <p className="app-subtitle">Create hilarious memes in seconds</p>
          </div>
          <UserMenu />
        </div>
      </header>

      <div className="app-container">
        <Sidebar editor={editor} onUploadMeme={handleUploadMeme} />
        <main className="canvas-area">
          <MemeCanvas editor={editor} />
        </main>
      </div>
    </div>
  );
}

export default function MemeEditor() {
  return (
    <AuthGuard>
      <MemeEditorContent />
    </AuthGuard>
  );
}
