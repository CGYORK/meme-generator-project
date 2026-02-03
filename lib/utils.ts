export function generateUserId(): string {
  if (typeof window === 'undefined') {
    return 'anonymous';
  }
  
  let userId = localStorage.getItem('meme_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('meme_user_id', userId);
  }
  return userId;
}
