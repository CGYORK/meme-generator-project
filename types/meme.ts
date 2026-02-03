export interface TextBox {
  id: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  x: number;
  y: number;
}

export interface Meme {
  id: string;
  imageUrl: string;
  createdAt: Date;
  authorId: string;
  upvoteCount: number;
}

export interface Upvote {
  id: string;
  memeId: string;
  userId: string;
  createdAt: Date;
}
