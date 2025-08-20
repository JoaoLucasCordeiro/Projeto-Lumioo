import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MoreHorizontal, Edit, Trash2, Flag } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTimeAgo } from '@/hooks/useTimeAgo'; 
import type { Comment } from '@/types/post';

interface CommentItemProps {
  comment: Comment;
  isOwner: boolean;
  onStartEdit: (comment: Comment) => void;
  onStartDelete: (comment: Comment) => void;
  onLikeComment: (commentId: string) => void;
}

export function CommentItem({ comment, isOwner, onStartEdit, onStartDelete, onLikeComment }: CommentItemProps) {
  const timeAgo = useTimeAgo(comment.timePosted); 

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -10, height: 0, marginBottom: 0, padding: 0 }}
      transition={{ duration: 0.3 }} 
      className="flex items-start space-x-3 group"
    >
      <Avatar className="h-9 w-9 flex-shrink-0 border border-slate-600">
        <AvatarImage src={comment.userImage} alt={comment.username} />
        <AvatarFallback className="bg-slate-700 text-slate-300">
          {comment.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline">
          <Link to={`/perfil/${comment.username}`} className="font-bold text-slate-100 hover:text-red-400 mr-2 truncate">
            {comment.username}
          </Link>
          {/* 3. Exibir a data formatada */}
          <span className="text-xs text-slate-500 flex-shrink-0">{timeAgo}</span>
        </div>
        <p className="text-slate-300 mt-1 break-words">{comment.text}</p>
        <div className="flex items-center mt-2 space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-xs ${comment.isLiked ? 'text-red-500' : 'text-slate-400'} hover:bg-transparent h-6`}
            onClick={() => onLikeComment(comment.id)}
          >
            <Heart className={`h-3 w-3 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
            <span>{comment.likes.toLocaleString()}</span>
          </Button>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 hover:bg-red-900/10 h-6 w-6 flex-shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-slate-200">
          {isOwner ? (
            <>
              <DropdownMenuItem onClick={() => onStartEdit(comment)} className="focus:bg-slate-700 focus:text-red-400 cursor-pointer">
                <Edit className="h-4 w-4 mr-2 text-red-400" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStartDelete(comment)} className="focus:bg-slate-700 focus:text-red-400 cursor-pointer">
                <Trash2 className="h-4 w-4 mr-2 text-red-400" /> Deletar
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem className="focus:bg-slate-700 focus:text-red-400 cursor-pointer">
              <Flag className="h-4 w-4 mr-2 text-red-400" /> Denunciar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}