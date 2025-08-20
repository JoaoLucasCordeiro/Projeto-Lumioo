// src/components/shared/post-details/CommentList.tsx
import type { Comment } from '@/types/post';
import { CommentItem } from './CommentItem';
import { AnimatePresence } from 'framer-motion';

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string;
  onStartEdit: (comment: Comment) => void;
  onStartDelete: (comment: Comment) => void;
  onLikeComment: (commentId: string) => void; // <-- Adicionado
}

export function CommentList({ comments, currentUserId, onStartEdit, onStartDelete, onLikeComment }: CommentListProps) {
  return (
    <div className="p-4 space-y-6">
      <AnimatePresence>
        {comments.map((comment) => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            isOwner={currentUserId === comment.authorId} 
            onStartEdit={onStartEdit}
            onStartDelete={onStartDelete}
            onLikeComment={onLikeComment} // <-- Passando para o item
          />
        ))}
      </AnimatePresence>
    </div>
  );
}