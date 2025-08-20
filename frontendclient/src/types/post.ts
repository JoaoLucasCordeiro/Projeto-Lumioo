// src/types/post.ts
export interface Comment {
  id: string;
  username: string;
  authorId: string;
  userImage: string;
  text: string;
  timePosted: string;
  likes: number;
  isLiked: boolean;
}

export interface PostDetailsData {
  id: string;
  username: string;
  userImage: string;
  image: string;
  caption: string;
  likes: number;
  comments: Comment[];
  timePosted: string;
  isLiked: boolean;
  isSaved: boolean;
}