// src/types/post.ts
export interface Comment {
  id: string;
  username: string;
  authorId: string;
  userImage: string | null;
  text: string;
  timePosted: string;
  likes: number;
  isLiked: boolean;
}

export interface PostDetailsData {
  id: string;
  username: string;
  userImage: string | null;
  image: string | null;
  caption: string;
  likes: number;
  comments: Comment[];
  timePosted: string;
  isLiked: boolean;
  isSaved: boolean;
}