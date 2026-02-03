'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { db } from '@/lib/instant';
import { Meme } from '@/types/meme';
import UserMenu from '@/components/UserMenu';
import { useUpvote } from '@/hooks/useUpvote';
import Link from 'next/link';

function MemeDetailContent({ memeId }: { memeId: string }) {

  const query = useMemo(() => ({
    memes: {
      $: {
        where: { id: memeId },
      },
    },
  }), [memeId]);

  const { data, isLoading, error } = db.useQuery(query);

  const meme = useMemo(() => {
    if (!data?.memes) return null;
    const found = Object.values(data.memes).find((m: any) => m.id === memeId);
    return found ? (found as unknown as Meme) : null;
  }, [data?.memes, memeId]);

  if (isLoading) {
    return (
      <div className="app-wrapper">
        <header className="app-header">
          <div className="header-content">
            <div>
              <h1 className="app-title">Meme Generator</h1>
              <p className="app-subtitle">Loading meme...</p>
            </div>
            <UserMenu />
          </div>
        </header>
        <div className="app-container" style={{ gridTemplateColumns: '1fr' }}>
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error || !meme) {
    return (
      <div className="app-wrapper">
        <header className="app-header">
          <div className="header-content">
            <div>
              <h1 className="app-title">Meme Generator</h1>
              <p className="app-subtitle">Meme not found</p>
            </div>
            <UserMenu />
          </div>
        </header>
        <div className="app-container" style={{ gridTemplateColumns: '1fr' }}>
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--danger-color)' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              {error ? 'Error loading meme' : 'Meme not found'}
            </p>
            <Link
              href="/"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--primary-gradient)',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-block',
              }}
            >
              Back to Feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1 className="app-title">Meme Generator</h1>
            <p className="app-subtitle">Meme Detail</p>
          </div>
          <UserMenu />
        </div>
      </header>

      <div className="app-container" style={{ gridTemplateColumns: '1fr' }}>
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '2rem' }}>
            <Link
              href="/"
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--bg-secondary)',
                color: '#ffffff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-block',
                marginBottom: '1rem',
              }}
            >
              ← Back to Feed
            </Link>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <div style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'var(--bg-secondary)',
              padding: '2rem',
            }}>
              <img
                src={meme.imageUrl}
                alt="Meme"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  height: 'auto',
                  objectFit: 'contain',
                }}
              />
            </div>
            <div style={{
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                }}>
                  Posted {new Date(meme.createdAt).toLocaleDateString()} at {new Date(meme.createdAt).toLocaleTimeString()}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-light)',
                }}>
                  Author: {meme.authorId.substring(0, 8)}...
                </div>
              </div>
              <db.SignedIn>
                <MemeDetailUpvote memeId={meme.id} />
              </db.SignedIn>
              <db.SignedOut>
                <div className="upvote-button" style={{ opacity: 0.6, cursor: 'not-allowed', color: '#ffffff' }}>
                  <span>▲</span>
                  <span>{meme.upvoteCount || 0}</span>
                </div>
              </db.SignedOut>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MemeDetailUpvote({ memeId }: { memeId: string }) {
  const { hasUpvoted, upvoteCount, toggleUpvote, isToggling } = useUpvote(memeId);

  return (
    <button
      className={`upvote-button ${hasUpvoted ? 'upvoted' : ''}`}
      onClick={toggleUpvote}
      disabled={isToggling}
      style={{ fontSize: '1.1rem', padding: '0.75rem 1.5rem' }}
    >
      <span>▲</span>
      <span>{upvoteCount}</span>
    </button>
  );
}

export default function MemeDetailPage() {
  const params = useParams();
  const memeId = params.id as string;

  return <MemeDetailContent memeId={memeId} />;
}
