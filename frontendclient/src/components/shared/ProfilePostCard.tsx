// src/components/shared/ProfilePostCard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, MoreHorizontal, Edit, Trash2, Bookmark } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Post } from '@/types/feed';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likePost, savePost, deletePost } from '@/api/posts';
import { queryKeys } from '@/api/queryKeys';

interface ProfilePostCardProps {
  post: Post;
  isOwner: boolean;
}

export function ProfilePostCard({ post, isOwner }: ProfilePostCardProps) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const invalidateProfile = () => {
    qc.invalidateQueries({ queryKey: queryKeys.profile.own() });
  };

  const likeMutation = useMutation({
    mutationFn: () => likePost(post.id),
    onSuccess: invalidateProfile,
  });

  const saveMutation = useMutation({
    mutationFn: () => savePost(post.id),
    onSuccess: invalidateProfile,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => {
      invalidateProfile();
      qc.invalidateQueries({ queryKey: queryKeys.feed.infinite() });
    },
    onSettled: () => setIsDeleteOpen(false),
  });

  return (
    <>
      <div
        className="relative aspect-square overflow-hidden rounded-xl group cursor-pointer bg-slate-800"
        onClick={() => navigate(`/post/${post.id}`)}
      >
        <img
          src={post.image}
          alt={post.caption}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5">
          <button
            onClick={(e) => { e.stopPropagation(); likeMutation.mutate(); }}
            className="flex items-center gap-1.5 text-white font-semibold"
          >
            <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-white' : ''}`} />
            <span className="text-sm">{post.likes}</span>
          </button>
          <div className="flex items-center gap-1.5 text-white font-semibold">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">{post.comments}</span>
          </div>
        </div>

        {/* Context menu */}
        <div
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-slate-800 border-white/[0.08] text-slate-200 w-40 rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {isOwner ? (
                <>
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer rounded-lg focus:bg-white/[0.06] focus:text-slate-100 text-sm"
                    onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.id}/edit`); }}
                  >
                    <Edit className="h-3.5 w-3.5 text-slate-400" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer rounded-lg focus:bg-red-500/10 focus:text-red-400 text-red-400 text-sm"
                    onClick={(e) => { e.stopPropagation(); setIsDeleteOpen(true); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Deletar
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer rounded-lg focus:bg-white/[0.06] focus:text-slate-100 text-sm"
                  onClick={(e) => { e.stopPropagation(); saveMutation.mutate(); }}
                >
                  <Bookmark className="h-3.5 w-3.5 text-slate-400" />
                  {post.isSaved ? 'Remover dos salvos' : 'Salvar'}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete confirmation — plain overlay, no Radix portal */}
      {isDeleteOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
          onClick={() => setIsDeleteOpen(false)}
        >
          <div
            className="bg-slate-900 border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-slate-100 mb-1">Deletar publicação?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Esta ação é permanente e não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white/[0.06] text-slate-200 hover:bg-white/[0.10] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
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
