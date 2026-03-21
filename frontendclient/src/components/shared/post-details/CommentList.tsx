// src/components/shared/post-details/CommentList.tsx
import type { Comment } from '@/types/post';
import { CommentItem } from './CommentItem';

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string;
  onStartEdit: (comment: Comment) => void;
  onStartDelete: (comment: Comment) => void;
  onLikeComment: (commentId: string) => void;
}

export function CommentList({
  comments,
  currentUserId,
  onStartEdit,
  onStartDelete,
  onLikeComment,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-slate-500">Nenhum comentário ainda.</p>
        <p className="text-xs text-slate-600 mt-1">Seja o primeiro a comentar.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isOwner={currentUserId === comment.authorId}
          onStartEdit={onStartEdit}
          onStartDelete={onStartDelete}
          onLikeComment={onLikeComment}
        />
      ))}
    </div>
  );
}
