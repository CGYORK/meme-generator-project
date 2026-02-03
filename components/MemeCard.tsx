'use client';

import { Meme } from '@/types/meme';
import { useUpvote } from '@/hooks/useUpvote';
import { db } from '@/lib/instant';

interface MemeCardProps {
  meme: Meme;
}

function UpvoteButton({ meme }: { meme: Meme }) {
  const { hasUpvoted, upvoteCount, toggleUpvote, isToggling } = useUpvote(meme.id);

  return (
    <button
      className={`upvote-button ${hasUpvoted ? 'upvoted' : ''}`}
      onClick={toggleUpvote}
      disabled={isToggling}
    >
      <span>▲</span>
      <span>{upvoteCount}</span>
    </button>
  );
}

export default function MemeCard({ meme }: MemeCardProps) {
  const upvoteCount = meme.upvoteCount || 0;

  return (
    <div className="meme-card">
      <img
        src={meme.imageUrl}
        alt="Meme"
        className="meme-image"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
      <div className="meme-footer">
        <db.SignedIn>
          <UpvoteButton meme={meme} />
        </db.SignedIn>
        <db.SignedOut>
          <div className="upvote-button" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
            <span>▲</span>
            <span>{upvoteCount}</span>
          </div>
        </db.SignedOut>
        <div className="meme-meta">
          {new Date(meme.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
