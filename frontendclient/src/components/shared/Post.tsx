// src/components/shared/Post.tsx
import { useEffect, useState } from 'react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Flag,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/auth.context';
import { useTimeAgo } from '@/hooks/useTimeAgo';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likePost, savePost, deletePost } from '@/api/posts';
import { queryKeys } from '@/api/queryKeys';
import type { InfiniteData } from '@tanstack/react-query';
import type { FeedPage, PostsPage } from '@/api/posts';

interface PostProps {
  id: string;
  username: string;
  authorId: string;
  userImage: string | null;
  image: string | null;
  caption: string;
  likes: number;
  comments: number;
  timePosted: string;
  isLiked: boolean;
  isSaved: boolean;
}

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

function Toast({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      className={`fixed bottom-5 right-5 flex items-center gap-3 rounded-xl px-4 py-3 text-white shadow-xl z-[100] ${type === 'success' ? 'bg-slate-800 border border-green-500/30' : 'bg-slate-800 border border-red-500/30'}`}
    >
      {type === 'success'
        ? <CheckCircle size={16} className="text-green-400 shrink-0" />
        : <XCircle size={16} className="text-red-400 shrink-0" />}
      <p className="text-sm font-medium text-slate-200">{message}</p>
    </motion.div>
  );
}

type PageData = InfiniteData<FeedPage> | InfiniteData<PostsPage>;

function updatePostInPages(old: PageData | undefined, postId: string, updater: (p: PostProps) => PostProps): PageData | undefined {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      posts: page.posts.map((p) => (p.id === postId ? updater(p as unknown as PostProps) : p)),
    })),
  };
}

export function Post({
  id,
  username,
  authorId,
  userImage,
  image,
  caption,
  likes,
  comments,
  timePosted,
  isLiked,
  isSaved,
}: PostProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const timeAgo = useTimeAgo(timePosted);
  const qc = useQueryClient();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const isOwner = user?.id === authorId;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  const likeMutation = useMutation({
    mutationFn: () => likePost(id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.feed.infinite() });
      await qc.cancelQueries({ queryKey: ['posts'] });

      const previousFeed = qc.getQueryData<PageData>(queryKeys.feed.infinite());
      const previousPosts = qc.getQueriesData<PageData>({ queryKey: ['posts', 'list'] });

      const likeUpdater = (p: PostProps): PostProps => ({
        ...p,
        isLiked: !p.isLiked,
        likes: p.isLiked ? p.likes - 1 : p.likes + 1,
      });

      qc.setQueryData<PageData>(queryKeys.feed.infinite(), (old) =>
        updatePostInPages(old, id, likeUpdater)
      );
      previousPosts.forEach(([key]) => {
        qc.setQueryData<PageData>(key, (old) => updatePostInPages(old, id, likeUpdater));
      });

      return { previousFeed, previousPosts };
    },
    onError: (_, __, context) => {
      if (context?.previousFeed) {
        qc.setQueryData(queryKeys.feed.infinite(), context.previousFeed);
      }
      context?.previousPosts?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.feed.infinite() });
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => savePost(id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.feed.infinite() });
      await qc.cancelQueries({ queryKey: ['posts'] });

      const previousFeed = qc.getQueryData<PageData>(queryKeys.feed.infinite());
      const previousPosts = qc.getQueriesData<PageData>({ queryKey: ['posts', 'list'] });

      const saveUpdater = (p: PostProps): PostProps => ({ ...p, isSaved: !p.isSaved });

      qc.setQueryData<PageData>(queryKeys.feed.infinite(), (old) =>
        updatePostInPages(old, id, saveUpdater)
      );
      previousPosts.forEach(([key]) => {
        qc.setQueryData<PageData>(key, (old) => updatePostInPages(old, id, saveUpdater));
      });

      return { previousFeed, previousPosts };
    },
    onError: (_, __, context) => {
      if (context?.previousFeed) {
        qc.setQueryData(queryKeys.feed.infinite(), context.previousFeed);
      }
      context?.previousPosts?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
      showToast('Falha ao salvar o post.', 'error');
    },
    onSuccess: () => {
      showToast(isSaved ? 'Post removido dos salvos!' : 'Post salvo com sucesso!');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.feed.infinite() });
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(id),
    onSuccess: () => {
      showToast('Post deletado com sucesso!');
      qc.invalidateQueries({ queryKey: queryKeys.feed.infinite() });
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: () => {
      showToast('Falha ao deletar o post.', 'error');
    },
    onSettled: () => {
      setIsDeleteDialogOpen(false);
    },
  });

  const handleLike = () => likeMutation.mutate();
  const handleSave = () => saveMutation.mutate();
  const handleDeletePost = () => deleteMutation.mutate();
  const handleEditPost = () => navigate(`/post/${id}/edit`);

  return (
    <>
      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
        )}
      </AnimatePresence>

      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="group bg-slate-900/60 border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <Link to={`/perfil/${username}`} className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 shrink-0 ring-1 ring-white/[0.08]">
              <AvatarImage src={userImage || undefined} alt={username} />
              <AvatarFallback className="bg-slate-800 text-slate-300 text-xs font-semibold">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate hover:text-red-400 transition-colors">
                {username}
              </p>
              <p className="text-xs text-slate-500">{timeAgo}</p>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-slate-800 border-white/[0.08] text-slate-200 w-44 rounded-xl"
            >
              {isOwner ? (
                <>
                  <DropdownMenuItem
                    onClick={handleEditPost}
                    className="flex items-center gap-2 cursor-pointer rounded-lg focus:bg-white/[0.06] focus:text-slate-100"
                  >
                    <Edit className="h-4 w-4 text-slate-400" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="flex items-center gap-2 cursor-pointer rounded-lg focus:bg-red-500/10 focus:text-red-400 text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Deletar</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/[0.06]" />
                  <DropdownMenuItem
                    onClick={handleSave}
                    className="flex items-center gap-2 cursor-pointer rounded-lg focus:bg-white/[0.06] focus:text-slate-100"
                  >
                    <Bookmark className="h-4 w-4 text-slate-400" />
                    <span>{isSaved ? 'Remover dos salvos' : 'Salvar'}</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={handleSave}
                    className="flex items-center gap-2 cursor-pointer rounded-lg focus:bg-white/[0.06] focus:text-slate-100"
                  >
                    <Bookmark className="h-4 w-4 text-slate-400" />
                    <span>{isSaved ? 'Remover dos salvos' : 'Salvar'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/[0.06]" />
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer rounded-lg focus:bg-white/[0.06] focus:text-slate-100">
                    <Flag className="h-4 w-4 text-slate-400" />
                    <span>Denunciar</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Image — só renderiza se existir */}
        {image && (
          <Link to={`/post/${id}`} className="block">
            <div className="aspect-square overflow-hidden bg-slate-800">
              <img
                src={image}
                alt={caption}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </Link>
        )}

        {/* Caption — texto puro em destaque quando não há imagem */}
        {!image && (
          <Link to={`/post/${id}`} className="block px-4 pt-2 pb-1">
            <p className="text-base text-slate-100 leading-relaxed whitespace-pre-wrap">
              {caption}
            </p>
          </Link>
        )}

        {/* Actions */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 group/like"
            >
              <motion.div whileTap={{ scale: 0.8 }}>
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    isLiked
                      ? 'text-red-500 fill-red-500'
                      : 'text-slate-400 group-hover/like:text-slate-200'
                  }`}
                />
              </motion.div>
              <span className={`text-sm font-medium tabular-nums ${isLiked ? 'text-red-500' : 'text-slate-400'}`}>
                {likes.toLocaleString()}
              </span>
            </button>

            <Link
              to={`/post/${id}`}
              className="flex items-center gap-1.5 group/comment"
            >
              <MessageCircle className="h-5 w-5 text-slate-400 group-hover/comment:text-slate-200 transition-colors" />
              <span className="text-sm font-medium text-slate-400 tabular-nums">
                {comments.toLocaleString()}
              </span>
            </Link>
          </div>

          <button
            onClick={handleSave}
            className="group/save"
          >
            <motion.div whileTap={{ scale: 0.8 }}>
              <Bookmark
                className={`h-5 w-5 transition-colors ${
                  isSaved
                    ? 'text-red-400 fill-red-400'
                    : 'text-slate-400 group-hover/save:text-slate-200'
                }`}
              />
            </motion.div>
          </button>
        </div>

        {/* Caption compacta abaixo da imagem (só quando há foto) */}
        {image && (
          <div className="px-4 pb-4 pt-1">
            <p className="text-sm text-slate-300 leading-relaxed">
              <Link
                to={`/perfil/${username}`}
                className="font-semibold text-slate-100 hover:text-red-400 transition-colors mr-1.5"
              >
                {username}
              </Link>
              {caption}
            </p>
            {comments > 0 && (
              <Link
                to={`/post/${id}`}
                className="mt-1.5 inline-block text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                Ver todos os {comments.toLocaleString()} comentários
              </Link>
            )}
          </div>
        )}

        {/* Link "ver comentários" para posts de texto puro */}
        {!image && comments > 0 && (
          <div className="px-4 pb-4">
            <Link
              to={`/post/${id}`}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              Ver todos os {comments.toLocaleString()} comentários
            </Link>
          </div>
        )}
      </motion.article>

      {/* Delete confirmation — plain overlay, no Radix portal */}
      {isDeleteDialogOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
          onClick={() => setIsDeleteDialogOpen(false)}
        >
          <div
            className="bg-slate-900 border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-slate-100 mb-1">Deletar post?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Esta ação é permanente e não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePost}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-full text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? 'Deletando…' : 'Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
