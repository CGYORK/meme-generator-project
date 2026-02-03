'use client';

import { useState, useCallback, useMemo } from 'react';
import { db, id } from '@/lib/instant';
import { Meme, Upvote } from '@/types/meme';

export function useUpvote(memeId: string) {
  const [isToggling, setIsToggling] = useState(false);
  
  // Get authenticated user - this hook can only be used when signed in
  const user = db.useUser();
  const userId = user.id;

  // Memoize the query object to ensure it's stable across renders
  const query = useMemo(() => ({
    upvotes: {
      $: {
        where: {
          memeId,
          userId,
        },
      },
    },
    memes: {
      $: {
        where: { id: memeId },
      },
    },
  }), [memeId, userId]);

  const { data } = db.useQuery(query);

  const existingUpvote = useMemo(() => {
    if (!data?.upvotes) return null;
    const upvote = Object.values(data.upvotes)[0];
    return upvote ? (upvote as unknown as Upvote) : null;
  }, [data?.upvotes]);

  const meme = useMemo(() => {
    if (!data?.memes) return null;
    const found = Object.values(data.memes).find((m: any) => m.id === memeId);
    return found ? (found as unknown as Meme) : null;
  }, [data?.memes, memeId]);

  const hasUpvoted = !!existingUpvote;
  const upvoteCount = meme?.upvoteCount || 0;

  const toggleUpvote = useCallback(async () => {
    if (isToggling) return;

    setIsToggling(true);
    try {
      if (hasUpvoted && existingUpvote) {
        // Remove upvote
        db.transact([
          db.tx.upvotes[existingUpvote.id].delete(),
          db.tx.memes[memeId].update({
            upvoteCount: Math.max(0, upvoteCount - 1),
          }),
        ]);
      } else {
        // Add upvote
        db.transact([
          db.tx.upvotes[id()].create({
            memeId,
            userId,
            createdAt: new Date(),
          }),
          db.tx.memes[memeId].update({
            upvoteCount: upvoteCount + 1,
          }),
        ]);
      }
    } catch (error) {
      console.error('Failed to toggle upvote:', error);
    } finally {
      setIsToggling(false);
    }
  }, [hasUpvoted, existingUpvote, memeId, userId, upvoteCount, isToggling]);

  return {
    hasUpvoted,
    upvoteCount,
    toggleUpvote,
    isToggling,
  };
}
