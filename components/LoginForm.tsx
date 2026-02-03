'use client';

import { useState } from 'react';
import { db } from '@/lib/instant';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await db.auth.sendMagicCode({ email: email.trim() });
      setMessage('Check your email for a 6-digit code');
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'Failed to send code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await db.auth.signInWithMagicCode({
        email: email.trim(),
        code: code.trim(),
      });
      setMessage('Successfully signed in!');
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setCode('');
    setError(null);
    setMessage(null);
  };

  if (step === 'email') {
    return (
      <div style={{
        maxWidth: '400px',
        margin: '2rem auto',
        padding: '2rem',
        background: 'var(--bg-card)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '1rem',
          color: 'var(--text-primary)',
          textAlign: 'center',
        }}>
          Sign In
        </h2>
        <p style={{
          marginBottom: '1.5rem',
          color: 'var(--text-secondary)',
          textAlign: 'center',
        }}>
          Enter your email to receive a 6-digit login code
        </p>
        <form onSubmit={handleSendCode}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
              }}
              required
            />
          </div>
          {error && (
            <div style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--danger-color)',
              borderRadius: '8px',
              fontSize: '0.9rem',
            }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              background: 'var(--primary-gradient)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            {isLoading ? 'Sending...' : 'Send Code'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '400px',
      margin: '2rem auto',
      padding: '2rem',
      background: 'var(--bg-card)',
      borderRadius: '16px',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '1rem',
        color: 'var(--text-primary)',
        textAlign: 'center',
      }}>
        Enter Code
      </h2>
      <p style={{
        marginBottom: '1.5rem',
        color: 'var(--text-secondary)',
        textAlign: 'center',
      }}>
        We sent a 6-digit code to {email}
      </p>
      {message && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          background: 'rgba(16, 185, 129, 0.1)',
          color: 'var(--secondary-color)',
          borderRadius: '8px',
          fontSize: '0.9rem',
        }}>
          {message}
        </div>
      )}
      <form onSubmit={handleSignIn}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="code" style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            6-Digit Code
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(value);
            }}
            placeholder="000000"
            disabled={isLoading}
            maxLength={6}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '1.5rem',
              textAlign: 'center',
              letterSpacing: '0.5rem',
              fontFamily: 'monospace',
              transition: 'all 0.3s ease',
            }}
            required
          />
        </div>
        {error && (
          <div style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger-color)',
            borderRadius: '8px',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleBack}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '2px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              background: 'var(--primary-gradient)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isLoading || code.length !== 6 ? 'not-allowed' : 'pointer',
              opacity: isLoading || code.length !== 6 ? 0.7 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
}
