// src/components/shared/post-details/PostHeader.tsx
import { Link } from 'react-router-dom';
import { Bookmark, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTimeAgo } from '@/hooks/useTimeAgo';
import type { PostDetailsData } from '@/types/post';

interface PostHeaderProps {
  post: PostDetailsData;
  onSavePost: () => void;
  onClose: () => void;
}

export function PostHeader({ post, onSavePost, onClose }: PostHeaderProps) {
  const timeAgo = useTimeAgo(post.timePosted);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
      <Link to={`/perfil/${post.username}`} className="flex items-center gap-3 min-w-0">
        <Avatar className="h-8 w-8 shrink-0 ring-1 ring-white/[0.08]">
          <AvatarImage src={post.userImage ?? undefined} alt={post.username} />
          <AvatarFallback className="bg-slate-800 text-slate-300 text-xs font-semibold">
            {post.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-100 truncate hover:text-red-400 transition-colors">
            {post.username}
          </p>
          <p className="text-xs text-slate-500">{timeAgo}</p>
        </div>
      </Link>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onSavePost}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
        >
          <Bookmark
            className={`h-4 w-4 transition-colors ${post.isSaved ? 'fill-red-400 text-red-400' : ''}`}
          />
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
