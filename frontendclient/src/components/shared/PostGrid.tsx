import { useState } from "react";
import { LayoutGrid, ImageIcon, Type } from "lucide-react";
import { ProfilePostCard } from "./ProfilePostCard";
import type { Post } from "@/types/feed";

interface PostGridProps {
  posts: Post[];
}

type FilterType = "all" | "media" | "text";

const FILTERS: { id: FilterType; label: string; icon: React.ElementType }[] = [
  { id: "all",   label: "Todos",     icon: LayoutGrid },
  { id: "media", label: "Com mídia", icon: ImageIcon  },
  { id: "text",  label: "Só texto",  icon: Type       },
];

export function PostGrid({ posts }: PostGridProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = posts.filter((p) => {
    if (filter === "media") return !!p.image;
    if (filter === "text")  return !p.image;
    return true;
  });

  const counts = {
    all:   posts.length,
    media: posts.filter((p) => !!p.image).length,
    text:  posts.filter((p) => !p.image).length,
  };

  const gridClass =
    filter === "text"
      ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
      : "grid grid-cols-2 md:grid-cols-3 gap-1.5";

  return (
    <div>
      {/* Filter pills — only show if there's a mix of post types */}
      {counts.media > 0 && counts.text > 0 && (
        <div className="flex items-center gap-1.5 mb-5 p-1 bg-slate-800/50 border border-white/[0.06] rounded-full w-fit">
          {FILTERS.map(({ id, label, icon: Icon }) => {
            const active = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
                  ${active
                    ? "bg-[#ff3131] text-white shadow-sm shadow-red-500/25"
                    : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                <Icon className="h-3 w-3" />
                {label}
                <span className={`tabular-nums ${active ? "text-red-200" : "text-slate-600"}`}>
                  {counts[id]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-10 w-10 rounded-xl border border-white/[0.06] flex items-center justify-center mb-3">
            {filter === "media" ? (
              <ImageIcon className="h-4 w-4 text-slate-600" />
            ) : (
              <Type className="h-4 w-4 text-slate-600" />
            )}
          </div>
          <p className="text-sm text-slate-400">
            {filter === "media"
              ? "Nenhum post com mídia."
              : "Nenhum post de texto."}
          </p>
        </div>
      ) : (
        <div className={gridClass}>
          {filtered.map((post) => (
            <ProfilePostCard
              key={post.id}
              post={post}
              compact={filter !== "text"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
