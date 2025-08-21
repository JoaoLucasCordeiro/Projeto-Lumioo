import { ProfilePostCard } from "./ProfilePostCard";
import type { Post } from "@/types/feed"; // Certifique-se que o tipo Post está correto

interface PostGridProps {
  posts: Post[];
  isOwner: boolean;
  onUpdate: () => void; // Corrigido para aceitar onUpdate
}

export function PostGrid({ posts, isOwner, onUpdate }: PostGridProps) {
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
          onUpdate={onUpdate} // Passa a função onUpdate para cada card
        />
      ))}
    </div>
  );
}