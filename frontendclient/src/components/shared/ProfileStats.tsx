interface ProfileStatsProps {
  posts: number;
  followers: number;
  following: number;
}

export function ProfileStats({ posts, followers, following }: ProfileStatsProps) {
  return (
    <div className="flex gap-6 text-sm">
      <div className="flex items-center gap-1 text-slate-400">
        <span className="font-medium text-slate-200">{posts}</span>
        <span>Publicações</span>
      </div>
      <div className="flex items-center gap-1 text-slate-400">
        <span className="font-medium text-slate-200">{followers}</span>
        <span>Seguidores</span>
      </div>
      <div className="flex items-center gap-1 text-slate-400">
        <span className="font-medium text-slate-200">{following}</span>
        <span>Seguindo</span>
      </div>
    </div>
  );
}