'use client';

import { init, id } from '@instantdb/react';

const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;

if (!appId) {
  throw new Error('NEXT_PUBLIC_INSTANT_APP_ID is not set');
}

// Use globalThis to persist db instance across hot reloads
declare global {
  var __instantdb_instance: ReturnType<typeof init> | undefined;
}

// Initialize db instance - use global singleton to persist across hot reloads
if (typeof window !== 'undefined') {
  if (!globalThis.__instantdb_instance) {
    globalThis.__instantdb_instance = init({ appId });
  }
}

// Always export from globalThis on client, or create new on SSR
// This ensures db.useQuery is always the same function reference
export const db = typeof window !== 'undefined' 
  ? globalThis.__instantdb_instance!
  : init({ appId });

export { id };
