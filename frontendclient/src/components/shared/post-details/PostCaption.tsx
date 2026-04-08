// src/components/shared/post-details/PostCaption.tsx
import { Link } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PostDetailsData } from '@/types/post';

interface PostCaptionProps {
  post: PostDetailsData;
  onLikePost: () => void;
}

export function PostCaption({ post, onLikePost }: PostCaptionProps) {
  const isTextOnly = !post.image;

  return (
    <div className={`px-4 border-b border-white/[0.06] ${isTextOnly ? 'py-5' : 'py-3'}`}>
      {isTextOnly ? (
        // Texto puro: caption em destaque, sem prefixo de username
        <p className="text-base text-slate-100 leading-relaxed whitespace-pre-wrap">
          {post.caption}
        </p>
      ) : (
        // Post com foto: caption compacta com username prefixado
        <p className="text-sm text-slate-300 leading-relaxed">
          <Link
            to={`/perfil/${post.username}`}
            className="font-semibold text-slate-100 hover:text-red-400 transition-colors mr-1.5"
          >
            {post.username}
          </Link>
          {post.caption}
        </p>
      )}

      <div className="flex items-center gap-4 mt-3">
        <button
          onClick={onLikePost}
          className="flex items-center gap-1.5 group/like"
        >
          <motion.div whileTap={{ scale: 0.8 }} transition={{ duration: 0.1 }}>
            <Heart
              className={`h-4 w-4 transition-colors ${
                post.isLiked
                  ? 'text-red-500 fill-red-500'
                  : 'text-slate-400 group-hover/like:text-slate-200'
              }`}
            />
          </motion.div>
          <span className={`text-sm font-medium tabular-nums ${post.isLiked ? 'text-red-500' : 'text-slate-400'}`}>
            {post.likes.toLocaleString()}
          </span>
        </button>

        <div className="flex items-center gap-1.5 text-slate-400">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm font-medium tabular-nums">
            {post.comments.length.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
