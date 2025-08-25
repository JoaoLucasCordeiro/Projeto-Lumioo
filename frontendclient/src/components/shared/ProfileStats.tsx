interface ProfileStatsProps {
  posts: number;

}

export function ProfileStats({ posts, }: ProfileStatsProps) {
  return (
    <div className="flex gap-6 text-sm">
      <div className="flex items-center gap-1 text-slate-400">
        <span className="font-medium text-slate-200">{posts}</span>
        <span>Publicações</span>
      </div>
    </div>
  );
}