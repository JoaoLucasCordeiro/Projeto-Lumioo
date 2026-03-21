import { Post as PostComponent } from "@/components/shared/Post";
import type { Post } from "@/types/feed";

interface PostsListProps {
  posts: Post[];
}

export function PostsList({ posts }: PostsListProps) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostComponent key={post.id} {...post} />
      ))}
    </div>
  );
}
