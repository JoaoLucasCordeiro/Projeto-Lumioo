export interface Post {
  id: string;
  username: string;
  authorId: string;
  userImage: string | null;
  image: string | null;
  caption: string;
  likes: number;
  comments: number;
  timePosted: string;
  isLiked: boolean;
  isSaved: boolean;
}

export interface FeedHeaderProps {
  variant?: 'mobile' | 'desktop';
  onNewPost?: () => void;
}

export interface PostsListProps {
  posts: Post[];
}

export interface FeedPage {
  posts: Post[];
  nextCursor: string | null;
}

export interface PostsPage {
  posts: Post[];
  nextCursor: string | null;
}
