// src/components/shared/post-details/PostHeader.tsx
import { Link } from 'react-router-dom';
import { Clock, Bookmark, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
    <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50 flex-shrink-0">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10 border-2 border-red-500/30">
          <AvatarImage src={post.userImage} alt={post.username} />
          <AvatarFallback className="bg-slate-700 text-red-400 font-bold">
            {post.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <Link to={`/perfil/${post.username}`} className="font-bold text-slate-100 hover:text-red-400">
            {post.username}
          </Link>
          <div className="flex items-center text-xs text-slate-400">
            <Clock className="h-3 w-3 mr-1 text-red-400" />
            {/* 3. Exibir a data formatada */}
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button 
          onClick={onSavePost} 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-red-400 hover:bg-red-900/10"
        >
          <Bookmark className={`h-5 w-5 ${post.isSaved ? 'fill-current text-red-400' : ''}`} />
        </Button>
        <Button 
          onClick={onClose} 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-red-400 hover:bg-red-900/10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}