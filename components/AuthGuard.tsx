'use client';

import { db } from '@/lib/instant';
import LoginForm from './LoginForm';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  return (
    <>
      <db.SignedIn>
        {children}
      </db.SignedIn>
      <db.SignedOut>
        {fallback || (
          <div className="app-wrapper">
            <header className="app-header">
              <div className="header-content">
                <h1 className="app-title">Meme Generator</h1>
                <p className="app-subtitle">Sign in to continue</p>
              </div>
            </header>
            <LoginForm />
          </div>
        )}
      </db.SignedOut>
    </>
  );
}
