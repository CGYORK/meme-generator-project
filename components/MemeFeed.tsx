'use client';

import { useMemo } from 'react';
import { db } from '@/lib/instant';
import MemeCard from './MemeCard';
import Link from 'next/link';
import { Meme } from '@/types/meme';
import UserMenu from './UserMenu';

export default function MemeFeed() {
  // IMPORTANT: All hooks must be called in the same order every render
  // All hooks are called unconditionally at the top level
  
  const query = useMemo(() => ({ memes: {} }), []);
  const { data, isLoading, error } = db.useQuery(query);
  const memes = useMemo(() => {
    if (!data?.memes) return [];
    return Object.values(data.memes) as Meme[];
  }, [data?.memes]);

  if (isLoading) {
    return (
      <div className="app-wrapper">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">Meme Generator</h1>
            <p className="app-subtitle">Create hilarious memes in seconds</p>
          </div>
        </header>
        <div className="app-container" style={{ gridTemplateColumns: '1fr' }}>
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>
            Loading memes...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-wrapper">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">Meme Generator</h1>
            <p className="app-subtitle">Create hilarious memes in seconds</p>
          </div>
        </header>
        <div className="app-container" style={{ gridTemplateColumns: '1fr' }}>
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--danger-color)' }}>
            Error loading memes: {error.message}
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
            <p className="app-subtitle">Create hilarious memes in seconds</p>
          </div>
          <UserMenu />
        </div>
      </header>

      <div className="app-container" style={{ gridTemplateColumns: '1fr' }}>
        <div style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff' }}>
              Meme Feed
            </h2>
            <db.SignedIn>
              <Link
                href="/create"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--primary-gradient)',
                  color: 'white',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.3s ease',
                }}
              >
                Create Meme
              </Link>
            </db.SignedIn>
            <db.SignedOut>
              <Link
                href="/create"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--primary-gradient)',
                  color: 'white',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.3s ease',
                }}
              >
                Sign In to Create
              </Link>
            </db.SignedOut>
          </div>

          {memes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No memes yet!</p>
              <db.SignedIn>
                <Link
                  href="/create"
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
                  Create the first meme
                </Link>
              </db.SignedIn>
              <db.SignedOut>
                <Link
                  href="/create"
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
                  Sign In to Create
                </Link>
              </db.SignedOut>
            </div>
          ) : (
            <div className="meme-feed">
              {memes.map((meme) => (
                <MemeCard key={meme.id} meme={meme} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
