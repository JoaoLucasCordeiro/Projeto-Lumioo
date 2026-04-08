import { useState } from 'react';
import { UserPlus, UserCheck, UserMinus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { followUser, unfollowUser } from '@/api/follow';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
  size?: 'sm' | 'md';
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  userId,
  initialIsFollowing,
  size = 'md',
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [hovered, setHovered] = useState(false);
  const qc = useQueryClient();

  // `wasFollowing` é capturado no momento do clique, antes de qualquer setState
  const mutation = useMutation({
    mutationFn: (wasFollowing: boolean) =>
      wasFollowing ? unfollowUser(userId) : followUser(userId),
    onMutate: (wasFollowing: boolean) => {
      setIsFollowing(!wasFollowing);
      onFollowChange?.(!wasFollowing);
      return { prev: wasFollowing };
    },
    onError: (_, __, ctx) => {
      setIsFollowing(ctx!.prev);
      onFollowChange?.(ctx!.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['follow'] });
    },
  });

  const pad = size === 'sm' ? 'px-3 py-1 text-xs gap-1' : 'px-4 py-2 text-sm gap-1.5';
  const icon = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  if (!isFollowing) {
    return (
      <button
        onClick={() => mutation.mutate(false)}
        disabled={mutation.isPending}
        className={`flex items-center ${pad} rounded-full font-semibold
          bg-[#ff3131] hover:bg-red-600 text-white shadow-lg shadow-red-500/20
          disabled:opacity-50 transition-all`}
      >
        <UserPlus className={icon} />
        Seguir
      </button>
    );
  }

  return (
    <button
      onClick={() => mutation.mutate(true)}
      disabled={mutation.isPending}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex items-center ${pad} rounded-full font-semibold border transition-all disabled:opacity-50
        ${hovered
          ? 'border-red-500/60 text-red-400 bg-red-500/10'
          : 'border-white/20 text-slate-200 bg-white/[0.04] hover:border-white/30'
        }`}
    >
      {hovered
        ? <><UserMinus className={icon} />Deixar de seguir</>
        : <><UserCheck className={icon} />Seguindo</>
      }
    </button>
  );
}
