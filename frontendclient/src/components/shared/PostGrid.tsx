import { ProfilePostCard } from "./ProfilePostCard";

interface Post {
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

interface PostGridProps {
  posts: Post[];
  isOwner: boolean;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onDelete: (postId: string) => void;
}

export function PostGrid({ posts, isOwner, onLike, onSave, onDelete }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        Nenhum post encontrado.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {posts.map((post) => (
        <ProfilePostCard
          key={post.id}
          post={post}
          isOwner={isOwner}
          onLike={onLike}
          onSave={onSave}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}