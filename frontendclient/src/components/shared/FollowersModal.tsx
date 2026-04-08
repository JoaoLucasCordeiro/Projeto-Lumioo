import { useInfiniteQuery } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { getFollowers, getFollowing } from '@/api/follow';
import { queryKeys } from '@/api/queryKeys';
import { FollowButton } from './FollowButton';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useAuth } from '@/contexts/auth.context';

interface FollowersModalProps {
  userId: string;
  mode: 'followers' | 'following';
  onClose: () => void;
}

const ACADEMIC_LEVEL: Record<string, string> = {
  UNDERGRADUATE: 'Graduação',
  MASTER: 'Mestrado',
  PHD: 'Doutorado',
  PROFESSOR: 'Professor',
};

export function FollowersModal({ userId, mode, onClose }: FollowersModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const title = mode === 'followers' ? 'Seguidores' : 'Seguindo';

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey:
        mode === 'followers'
          ? queryKeys.follow.followers(userId)
          : queryKeys.follow.following(userId),
      queryFn: ({ pageParam }) => {
        const cursor = pageParam as string | undefined;
        return mode === 'followers'
          ? getFollowers(userId, cursor)
          : getFollowing(userId, cursor);
      },
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) => last.nextCursor ?? undefined,
    });

  const users = data?.pages.flatMap((p) => p.users) ?? [];

  const sentinelRef = useIntersectionObserver(
    fetchNextPage,
    (hasNextPage ?? false) && !isFetchingNextPage
  );

  const handleNavigate = (username: string) => {
    onClose();
    navigate(`/perfil/${username}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-slate-900 border border-white/[0.08] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="h-5 w-5 text-slate-500 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                <p className="text-sm font-medium text-slate-400">
                  {mode === 'followers'
                    ? 'Nenhum seguidor ainda.'
                    : 'Não está seguindo ninguém ainda.'}
                </p>
              </div>
            ) : (
              <>
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.04] last:border-b-0"
                  >
                    <button
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                      onClick={() => handleNavigate(u.username)}
                    >
                      <Avatar className="h-10 w-10 shrink-0 ring-1 ring-white/[0.08]">
                        <AvatarImage src={u.avatar || undefined} />
                        <AvatarFallback className="bg-slate-700 text-slate-300 text-sm font-semibold">
                          {u.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-100 truncate">
                          {u.fullName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {ACADEMIC_LEVEL[u.academicLevel] ?? u.academicLevel} · {u.institution}
                        </p>
                      </div>
                    </button>

                    {u.id !== user?.id && (
                      <FollowButton
                        userId={u.id}
                        initialIsFollowing={false}
                        size="sm"
                      />
                    )}
                  </div>
                ))}

                {isFetchingNextPage && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-4 w-4 text-slate-500 animate-spin" />
                  </div>
                )}
                <div ref={sentinelRef} />
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
