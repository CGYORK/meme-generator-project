'use client';

import { useRouter } from 'next/navigation';
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
      onClick={(e) => {
        e.stopPropagation();
        toggleUpvote();
      }}
      disabled={isToggling}
    >
      <span>▲</span>
      <span>{upvoteCount}</span>
    </button>
  );
}

export default function MemeCard({ meme }: MemeCardProps) {
  const router = useRouter();
  const upvoteCount = meme.upvoteCount || 0;

  const handleCardClick = () => {
    router.push(`/meme/${meme.id}`);
  };

  return (
    <div className="meme-card" onClick={handleCardClick}>
      <div className="meme-image-container">
        <img
          src={meme.imageUrl}
          alt="Meme"
          className="meme-image"
        />
      </div>
      <div className="meme-footer">
        <db.SignedIn>
          <UpvoteButton meme={meme} />
        </db.SignedIn>
        <db.SignedOut>
          <div className="upvote-button" style={{ opacity: 0.6, cursor: 'not-allowed', color: '#ffffff' }}>
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
