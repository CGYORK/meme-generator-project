'use client';

import { db } from '@/lib/instant';

export default function UserMenu() {
  return (
    <db.SignedIn>
      <UserMenuContent />
    </db.SignedIn>
  );
}

function UserMenuContent() {
  const user = db.useUser();

  const handleSignOut = async () => {
    try {
      await db.auth.signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <span style={{
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '0.9rem',
      }}>
        {user.email}
      </span>
      <button
        onClick={handleSignOut}
        style={{
          padding: '0.5rem 1rem',
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
