// src/components/shared/post-details/CommentForm.tsx
import { Send } from 'lucide-react';

interface CommentFormProps {
  newComment: string;
  onCommentChange: (comment: string) => void;
  onPostComment: () => void;
  isSubmitting: boolean;
}

export function CommentForm({
  newComment,
  onCommentChange,
  onPostComment,
  isSubmitting,
}: CommentFormProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onPostComment();
    }
  };

  return (
    <div className="border-t border-white/[0.06] px-4 py-3 flex-shrink-0">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => onCommentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Adicione um comentário…"
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none"
        />
        <button
          onClick={onPostComment}
          disabled={!newComment.trim() || isSubmitting}
          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
