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
import { useAuth } from '@/contexts/auth.context';

interface ProfilePostCardProps {
  post: Post;
  /** true = grid mode (aspect-square, tight), false = list mode (auto height) */
  compact?: boolean;
}

function DeleteConfirm({ onConfirm, onCancel, isPending }: {
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
      onClick={onCancel}
    >
      <div
        className="bg-slate-900 border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-slate-100 mb-1">Deletar publicação?</h3>
        <p className="text-sm text-slate-400 mb-6">Esta ação é permanente e não pode ser desfeita.</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-sm font-medium bg-white/[0.06] text-slate-200 hover:bg-white/[0.10] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 rounded-full text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Deletando…' : 'Deletar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ContextMenu({ isOwner, onEdit, onDelete, onSave, isSaved }: {
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  isSaved: boolean;
}) {
  return (
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
                onClick={onEdit}
              >
                <Edit className="h-3.5 w-3.5 text-slate-400" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer rounded-lg focus:bg-red-500/10 focus:text-red-400 text-red-400 text-sm"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Deletar
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer rounded-lg focus:bg-white/[0.06] focus:text-slate-100 text-sm"
              onClick={onSave}
            >
              <Bookmark className="h-3.5 w-3.5 text-slate-400" />
              {isSaved ? 'Remover dos salvos' : 'Salvar'}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ProfilePostCard({ post, compact = true }: ProfilePostCardProps) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const isOwner = user?.id === post.authorId;
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

  const menuProps = {
    isOwner,
    onEdit: () => navigate(`/post/${post.id}/edit`),
    onDelete: () => setIsDeleteOpen(true),
    onSave: () => saveMutation.mutate(),
    isSaved: post.isSaved,
  };

  return (
    <>
      {post.image ? (
        /* ── Photo card ─────────────────────────────────── */
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

          <ContextMenu {...menuProps} />
        </div>
      ) : compact ? (
        /* ── Text card — grid mode (aspect-square) ──────── */
        <div
          className="relative aspect-square overflow-hidden rounded-xl group cursor-pointer
                     bg-gradient-to-br from-slate-800 to-slate-900
                     border border-white/[0.07] hover:border-red-500/20 transition-all duration-200"
          onClick={() => navigate(`/post/${post.id}`)}
        >
          {/* Lined paper lines */}
          <div className="absolute inset-0 flex flex-col justify-start pt-[2.1rem] px-4 gap-[1.35rem] pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-px w-full bg-white/[0.05]" />
            ))}
          </div>

          {/* Top strip — post-it fold */}
          <div className="absolute top-0 left-0 right-0 h-7 bg-red-500/10 border-b border-red-500/15 flex items-center px-3 gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400/50 shrink-0" />
            <span className="text-[10px] font-semibold text-red-400/80 truncate">
              @{post.username}
            </span>
          </div>

          {/* Caption — top aligned, note style */}
          <div className="absolute inset-0 pt-9 px-3 pb-8">
            <p className="text-[11px] font-medium text-slate-200/90 leading-[1.35rem] line-clamp-5 w-full tracking-wide">
              {post.caption}
            </p>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <span className="flex items-center gap-1.5 text-white font-semibold text-sm">
              <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-white' : ''}`} />
              {post.likes}
            </span>
            <span className="flex items-center gap-1.5 text-white font-semibold text-sm">
              <MessageCircle className="h-4 w-4" />
              {post.comments}
            </span>
          </div>

          <ContextMenu {...menuProps} />
        </div>
      ) : (
        /* ── Text card — list mode (auto height) ────────── */
        <div
          className="relative group cursor-pointer rounded-xl bg-gradient-to-br from-slate-800/70 to-slate-900/80
                     border border-white/[0.08] hover:border-red-500/25 transition-all duration-200
                     p-4 flex flex-col gap-3 min-h-[140px]"
          onClick={() => navigate(`/post/${post.id}`)}
        >
          <div className="w-6 h-0.5 rounded-full bg-gradient-to-r from-red-500 to-red-500/0" />

          <p className="text-sm text-slate-200 leading-relaxed line-clamp-4 pr-6 flex-1">
            {post.caption}
          </p>

          <div className="flex items-center gap-3 pt-1 border-t border-white/[0.05]">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Heart className={`h-3 w-3 ${post.isLiked ? 'fill-red-400 text-red-400' : ''}`} />
              {post.likes}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <MessageCircle className="h-3 w-3" />
              {post.comments}
            </span>
          </div>

          <ContextMenu {...menuProps} />
        </div>
      )}

      {isDeleteOpen && (
        <DeleteConfirm
          onConfirm={() => deleteMutation.mutate()}
          onCancel={() => setIsDeleteOpen(false)}
          isPending={deleteMutation.isPending}
        />
      )}
    </>
  );
}
