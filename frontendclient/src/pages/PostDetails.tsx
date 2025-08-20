// src/pages/PostDetails.tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth.context';
import type { PostDetailsData, Comment } from '@/types/post';
import { LoadingState } from '@/components/shared/post-details/LoadingState';
import { ErrorState } from '@/components/shared/post-details/ErrorState';
import { PostImage } from '@/components/shared/post-details/PostImage';
import { PostHeader } from '@/components/shared/post-details/PostHeader';
import { PostCaption } from '@/components/shared/post-details/PostCaption';
import { CommentList } from '@/components/shared/post-details/CommentList';
import { CommentForm } from '@/components/shared/post-details/CommentForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const API_URL = import.meta.env.VITE_API_URL;

export function PostDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<PostDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editedText, setEditedText] = useState('');
  const [deletingComment, setDeletingComment] = useState<Comment | null>(null);

  const fetchPost = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Post not found');
      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error('Erro ao buscar post:', error);
      setPost(null);
    }
  }, [id, token]);

  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      await fetchPost();
      setLoading(false);
    };
    initialFetch();
  }, [fetchPost]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !token || !id || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: newComment }),
      });
      if (!response.ok) throw new Error('Failed to post comment');
      setNewComment('');
      await fetchPost(); // Aqui a atualização suave funciona bem
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

 const handleLikePost = async () => {
    if (!token || !id || !post) return;
    const originalPost = post;
    const newPostState = {
        ...post,
        isLiked: !post.isLiked,
        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
    };
    setPost(newPostState);
    try {
      await fetch(`${API_URL}/posts/${id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      await fetchPost();
    } catch (error) {
      console.error("Failed to like post:", error);
      setPost(originalPost);
    }
  };

  const handleSavePost = async () => {
    if (!token || !id || !post) return;
    const originalPost = post;
    const newPostState = { ...post, isSaved: !post.isSaved };
    setPost(newPostState);
    try {
      await fetch(`${API_URL}/posts/${id}/save`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      await fetchPost();
    } catch (error) {
      console.error("Failed to save post:", error);
      setPost(originalPost);
    }
  };

  // --- NOVA FUNÇÃO PARA CURTIR COMENTÁRIO ---
  const handleLikeComment = async (commentId: string) => {
    if (!token || !post) return;

    // Atualização otimista
    const originalComments = post.comments;
    const newComments = originalComments.map(c => {
        if (c.id === commentId) {
            return {
                ...c,
                isLiked: !c.isLiked,
                likes: c.isLiked ? c.likes - 1 : c.likes + 1,
            };
        }
        return c;
    });
    setPost({ ...post, comments: newComments });

    try {
        await fetch(`${API_URL}/comments/${commentId}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });
    } catch (error) {
        console.error("Failed to like comment:", error);
        setPost({ ...post, comments: originalComments }); // Reverte em caso de erro
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingComment(comment);
    setEditedText(comment.text);
  };

  const handleConfirmUpdate = async () => {
    if (!token || !editingComment || !editedText.trim()) return;
    try {
      const response = await fetch(`${API_URL}/comments/${editingComment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: editedText }),
      });
      if (!response.ok) throw new Error("Failed to update comment");
      
      window.location.reload();

    } catch (error) {
      console.error("Failed to update comment:", error);
    } finally {
      setEditingComment(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!token || !deletingComment) return;
    try {
      const response = await fetch(`${API_URL}/comments/${deletingComment.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete comment");

      window.location.reload();

    } catch (error) {
      console.error("Failed to delete comment:", error);
    } finally {
      setDeletingComment(null);
    }
  };

  if (loading) return <LoadingState />;
  if (!post) return <ErrorState onNavigateBack={() => navigate('/feed')} />;

  return (
    <>
       <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col md:flex-row"
        >
          <PostImage image={post.image} caption={post.caption} />
          <div className="md:w-1/3 flex flex-col border-t md:border-t-0 md:border-l border-slate-700">
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


      <Dialog open={!!editingComment} onOpenChange={(isOpen) => !isOpen && setEditingComment(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-red-400">Editar Comentário</DialogTitle>
            <DialogDescription className="text-slate-400">Faça as alterações desejadas.</DialogDescription>
          </DialogHeader>
          <Textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} className="mt-4 min-h-[100px] bg-slate-900 border-slate-600 text-slate-200" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingComment(null)}>Cancelar</Button>
            <Button onClick={handleConfirmUpdate} className="bg-red-600 hover:bg-red-700 text-white">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingComment} onOpenChange={(isOpen) => !isOpen && setDeletingComment(null)}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Deletar Comentário?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">Esta ação é permanente e não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-200 text-slate-700 hover:bg-slate-300 border-slate-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}