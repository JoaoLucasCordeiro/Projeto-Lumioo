export interface Post {
  id: string;
  username: string;
  userImage: string;
  image: string;
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