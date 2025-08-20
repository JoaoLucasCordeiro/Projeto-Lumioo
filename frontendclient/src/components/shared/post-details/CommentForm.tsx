// src/components/shared/post-details/CommentForm.tsx
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentFormProps {
  newComment: string;
  onCommentChange: (comment: string) => void;
  onPostComment: () => void;
  isSubmitting: boolean; // <-- Nova prop
}

export function CommentForm({ newComment, onCommentChange, onPostComment, isSubmitting }: CommentFormProps) {
  return (
    <div className="border-t border-slate-700 p-4 bg-slate-800/50 flex-shrink-0">
      <div className="flex items-center space-x-2">
        <Textarea 
          value={newComment} 
          onChange={(e) => onCommentChange(e.target.value)} 
          placeholder="Adicione um comentário..." 
          className="flex-1 bg-slate-800 border-slate-700 text-slate-200 resize-none min-h-[40px]" 
          rows={1} 
        />
        <Button 
          onClick={onPostComment} 
          variant="ghost" 
          size="icon" 
          className="text-red-400 hover:text-red-300 hover:bg-red-900/10" 
          disabled={!newComment.trim() || isSubmitting} // <-- Desabilita com base na nova prop
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}