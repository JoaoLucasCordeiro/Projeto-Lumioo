import { Link } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PostDetailsData } from '@/types/post';

interface PostCaptionProps {
  post: PostDetailsData;
  onLikePost: () => void;
}

export function PostCaption({ post, onLikePost }: PostCaptionProps) {
  return (
    <div className="p-4 border-b border-slate-700">
      <p className="text-slate-300 whitespace-pre-line">
        <Link to={`/perfil/${post.username}`} className="font-bold text-slate-100 hover:text-red-400 mr-2">
          {post.username}
        </Link>
        {post.caption}
      </p>
      <div className="flex items-center mt-4 space-x-4">
        <Button 
          onClick={onLikePost} 
          variant="ghost" 
          className={`flex items-center space-x-1 ${post.isLiked ? 'text-red-500' : 'text-slate-400'} hover:bg-transparent`}
        >
          <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
          <span>{post.likes.toLocaleString()}</span>
        </Button>
        <Button variant="ghost" className="flex items-center space-x-1 text-slate-400 hover:bg-transparent">
          <MessageCircle className="h-5 w-5" />
          <span>{post.comments.length.toLocaleString()}</span>
        </Button>
      </div>
    </div>
  );
}