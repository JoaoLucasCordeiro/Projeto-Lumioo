import { motion } from "framer-motion";
import { Post as PostComponent } from "@/components/shared/Post";
import type { Post } from "@/types/feed";
import type { RefCallback } from "react"; 

interface PostsListProps {
  posts: Post[];
  lastPostRef?: RefCallback<HTMLDivElement>;
  onUpdate: () => void; 
}

export function PostsList({ posts, lastPostRef, onUpdate }: PostsListProps) {
  return (
    <div className="space-y-8">
      {posts.map((post, index) => {
        const isLastElement = posts.length === index + 1;
        return (
          <motion.div
            ref={isLastElement ? lastPostRef : null}
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {/* CORREÇÃO AQUI */}
            <PostComponent {...post} onUpdate={onUpdate} />
          </motion.div>
        );
      })}
    </div>
  );
}