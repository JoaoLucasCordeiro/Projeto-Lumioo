import { ProfilePostCard } from "./ProfilePostCard";
import type { Post } from "@/types/feed";

interface PostGridProps {
  posts: Post[];
  isOwner: boolean;
}

export function PostGrid({ posts, isOwner }: PostGridProps) {
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
        <ProfilePostCard key={post.id} post={post} isOwner={isOwner} />
      ))}
    </div>
  );
}
