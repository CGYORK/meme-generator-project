'use client';

import { init, id, type InstantReactClient } from '@instantdb/react';

const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;

if (!appId) {
  throw new Error('NEXT_PUBLIC_INSTANT_APP_ID is not set');
}

// Use globalThis to persist db instance across hot reloads
declare global {
  var __instantdb_instance: InstantReactClient<any> | undefined;
}

// Initialize db instance - use global singleton to persist across hot reloads
function getDb(): InstantReactClient<any> {
  if (typeof window !== 'undefined') {
    if (!globalThis.__instantdb_instance) {
      globalThis.__instantdb_instance = init({ appId });
    }
    return globalThis.__instantdb_instance;
  }
  // Server-side: create a temporary instance just for type checking
  // This won't actually be used at runtime since components are client-only
  return init({ appId });
}

export const db = getDb();

export { id };
