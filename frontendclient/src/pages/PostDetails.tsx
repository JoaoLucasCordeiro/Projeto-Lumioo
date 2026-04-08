// src/pages/PostDetails.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth.context';
import type { Comment } from '@/types/post';
import { LoadingState } from '@/components/shared/post-details/LoadingState';
import { ErrorState } from '@/components/shared/post-details/ErrorState';
import { PostImage } from '@/components/shared/post-details/PostImage';
import { PostHeader } from '@/components/shared/post-details/PostHeader';
import { PostCaption } from '@/components/shared/post-details/PostCaption';
import { CommentList } from '@/components/shared/post-details/CommentList';
import { CommentForm } from '@/components/shared/post-details/CommentForm';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPostById, createComment, updateComment, deleteComment, likeComment } from '@/api/posts';
import { queryKeys } from '@/api/queryKeys';

export function PostDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editedText, setEditedText] = useState('');
  const [deletingComment, setDeletingComment] = useState<Comment | null>(null);

  const { data: post, isLoading } = useQuery({
    queryKey: queryKeys.posts.detail(id!),
    queryFn: () => fetchPostById(id!),
    enabled: !!id,
  });

  const invalidatePost = () => qc.invalidateQueries({ queryKey: queryKeys.posts.detail(id!) });

  const handlePostComment = async () => {
    if (!newComment.trim() || !token || !id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createComment(id, newComment);
      setNewComment('');
      await invalidatePost();
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = async () => {
    if (!token || !id || !post) return;
    const { likePost } = await import('@/api/posts');
    try {
      await likePost(id);
      await invalidatePost();
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleSavePost = async () => {
    if (!token || !id || !post) return;
    const { savePost } = await import('@/api/posts');
    try {
      await savePost(id);
      await invalidatePost();
    } catch (error) {
      console.error("Failed to save post:", error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!token || !post) return;
    try {
      await likeComment(commentId);
      await invalidatePost();
    } catch (error) {
      console.error("Failed to like comment:", error);
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingComment(comment);
    setEditedText(comment.text);
  };

  const handleConfirmUpdate = async () => {
    if (!token || !editingComment || !editedText.trim()) return;
    // Fechar o dialog ANTES de qualquer await para evitar que o Radix tente
    // restaurar foco em um elemento que pode não existir mais após o refetch.
    const commentId = editingComment.id;
    const nextText = editedText;
    setEditingComment(null);
    try {
      await updateComment(commentId, nextText);
      // Mutação otimista: atualiza o cache sem refetch completo.
      qc.setQueryData(queryKeys.posts.detail(id!), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.map((c: Comment) =>
            c.id === commentId ? { ...c, text: nextText } : c
          ),
        };
      });
    } catch (error) {
      console.error("Failed to update comment:", error);
      // Em caso de erro, refetch para garantir consistência.
      await invalidatePost();
    }
  };

  const handleConfirmDelete = async () => {
    if (!token || !deletingComment) return;
    // Fechar o dialog ANTES de qualquer await — mesma razão acima.
    const commentId = deletingComment.id;
    setDeletingComment(null);
    try {
      await deleteComment(commentId);
      // Mutação otimista: remove o comentário do cache localmente.
      qc.setQueryData(queryKeys.posts.detail(id!), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          comments: old.comments.filter((c: Comment) => c.id !== commentId),
        };
      });
    } catch (error) {
      console.error("Failed to delete comment:", error);
      await invalidatePost();
    }
  };

  if (isLoading) return <LoadingState />;
  if (!post) return <ErrorState onNavigateBack={() => navigate('/feed')} />;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className={`bg-slate-900 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl w-full flex ${
            post.image
              ? 'flex-col md:flex-row max-w-5xl h-[90vh] md:h-[80vh]'
              : 'flex-col max-w-2xl h-[75vh]'
          }`}
        >
          {post.image && <PostImage image={post.image} caption={post.caption} />}
          <div className={`flex flex-col min-h-0 border-white/[0.06] ${post.image ? 'md:w-1/2 md:border-l border-t md:border-t-0' : 'w-full flex-1'}`}>
            <PostHeader post={post} onSavePost={handleSavePost} onClose={() => navigate(-1)} />
            <div className="flex-1 overflow-y-auto">
              <PostCaption post={post} onLikePost={handleLikePost} />
              <CommentList
                comments={post.comments}
                currentUserId={user?.id}
                onStartEdit={handleStartEdit}
                onStartDelete={setDeletingComment}
                onLikeComment={handleLikeComment}
              />
            </div>
            <CommentForm
              newComment={newComment}
              onCommentChange={setNewComment}
              onPostComment={handlePostComment}
              isSubmitting={isSubmitting}
            />
          </div>
        </motion.div>
      </div>

      {editingComment && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
          onClick={() => setEditingComment(null)}
        >
          <div
            className="bg-slate-900 border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-slate-100 mb-1">Editar Comentário</h3>
            <p className="text-sm text-slate-400 mb-3">Faça as alterações desejadas.</p>
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="min-h-[100px] bg-slate-900 border-slate-600 text-slate-200"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingComment(null)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white/[0.06] text-slate-200 hover:bg-white/[0.10] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmUpdate}
                className="px-4 py-2 rounded-full text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingComment && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
          onClick={() => setDeletingComment(null)}
        >
          <div
            className="bg-slate-900 border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-slate-100 mb-1">Deletar Comentário?</h3>
            <p className="text-sm text-slate-400 mb-6">Esta ação é permanente e não pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingComment(null)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white/[0.06] text-slate-200 hover:bg-white/[0.10] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-full text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
