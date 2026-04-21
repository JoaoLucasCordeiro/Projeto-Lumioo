// src/components/shared/post-details/CommentItem.tsx
import { Link } from 'react-router-dom';
import { Heart, MoreHorizontal, Edit, Trash2, Flag } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTimeAgo } from '@/hooks/useTimeAgo';
import type { Comment } from '@/types/post';

interface CommentItemProps {
  comment: Comment;
  isOwner: boolean;
  onStartEdit: (comment: Comment) => void;
  onStartDelete: (comment: Comment) => void;
  onLikeComment: (commentId: string) => void;
}

export function CommentItem({
  comment,
  isOwner,
  onStartEdit,
  onStartDelete,
  onLikeComment,
}: CommentItemProps) {
  const timeAgo = useTimeAgo(comment.timePosted);

  return (
    <div className="flex items-start gap-3 group">
      <Avatar className="h-7 w-7 shrink-0 ring-1 ring-white/[0.06]">
        <AvatarImage src={comment.userImage ?? undefined} alt={comment.username} />
        <AvatarFallback className="bg-slate-800 text-slate-400 text-xs font-semibold">
          {comment.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-300 leading-relaxed break-words">
          <Link
            to={`/perfil/${comment.username}`}
            className="font-semibold text-slate-100 hover:text-red-400 transition-colors mr-1.5"
          >
            {comment.username}
          </Link>
          {comment.text}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-slate-500">{timeAgo}</span>
          <button
            onClick={() => onLikeComment(comment.id)}
            className="flex items-center gap-1 group/like"
          >
            <Heart
              className={`h-3 w-3 transition-colors ${
                comment.isLiked
                  ? 'text-red-500 fill-red-500'
                  : 'text-slate-500 group-hover/like:text-slate-300'
              }`}
            />
            {comment.likes > 0 && (
              <span className={`text-xs tabular-nums ${comment.isLiked ? 'text-red-500' : 'text-slate-500'}`}>
                {comment.likes.toLocaleString()}
              </span>
            )}
          </button>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1 rounded-md text-slate-600 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-0.5">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-slate-800 border-white/[0.08] text-slate-200 w-36 rounded-xl"
        >
          {isOwner ? (
            <>
              <DropdownMenuItem
                onClick={() => onStartEdit(comment)}
                className="flex items-center gap-2 cursor-pointer rounded-lg focus:bg-white/[0.06] focus:text-slate-100 text-sm"
              >
                <Edit className="h-3.5 w-3.5 text-slate-400" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStartDelete(comment)}
                className="flex items-center gap-2 cursor-pointer rounded-lg focus:bg-red-500/10 focus:text-red-400 text-red-400 text-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Deletar
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer rounded-lg focus:bg-white/[0.06] focus:text-slate-100 text-sm">
              <Flag className="h-3.5 w-3.5 text-slate-400" />
              Denunciar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
