import { motion } from "framer-motion";
import { Post as PostComponent } from "@/components/shared/Post";
import type { PostsListProps } from "@/types/feed";

export function PostsList({ posts }: PostsListProps) {
  return (
    <div className="space-y-8">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <PostComponent {...post} />
        </motion.div>
      ))}
    </div>
  );
}