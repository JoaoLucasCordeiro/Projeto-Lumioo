// src/components/shared/ProfileTabs.tsx
import { useState } from "react";
import { Grid3x3, Bookmark } from "lucide-react";
import { PostGrid } from "./PostGrid";
import type { Post } from "@/types/feed";

interface ProfileTabsProps {
  userPosts: Post[];
  savedPosts: Post[];
  isOwner: boolean;
  onUpdate?: () => void;
}

function EmptyState({ message, description }: { message: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-2xl border border-white/[0.06] flex items-center justify-center mb-4">
        <Grid3x3 className="h-5 w-5 text-slate-600" />
      </div>
      <p className="text-sm font-medium text-slate-300">{message}</p>
      <p className="text-xs text-slate-500 mt-1 max-w-xs">{description}</p>
    </div>
  );
}

export function ProfileTabs({ userPosts, savedPosts, isOwner }: ProfileTabsProps) {
  const [active, setActive] = useState<"posts" | "saved">("posts");

  return (
    <div className="w-full">
      {/* Segmented control — centered, Apple/OneUI style */}
      <div className="flex justify-center px-4 pt-1 pb-5">
        <div className="flex items-center bg-white/[0.04] border border-white/[0.07] rounded-full p-1 gap-0.5">
          <button
            onClick={() => setActive("posts")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              active === "posts"
                ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                : "text-slate-400 hover:text-red-400"
            }`}
          >
            <Grid3x3 className="h-3.5 w-3.5" />
            Publicações
          </button>

          {isOwner && (
            <button
              onClick={() => setActive("saved")}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                active === "saved"
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                  : "text-slate-400 hover:text-red-400"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              Salvos
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 py-6">
        {active === "posts" ? (
          userPosts.length === 0 ? (
            <EmptyState
              message="Nenhuma publicação ainda."
              description={
                isOwner
                  ? "Quando você compartilhar publicações, elas aparecerão aqui."
                  : "Este usuário ainda não compartilhou nenhuma publicação."
              }
            />
          ) : (
            <PostGrid posts={userPosts} isOwner={isOwner} />
          )
        ) : savedPosts.length === 0 ? (
          <EmptyState
            message="Nenhuma publicação salva."
            description="Quando você salvar publicações, elas aparecerão aqui."
          />
        ) : (
          <PostGrid posts={savedPosts} isOwner={isOwner} />
        )}
      </div>
    </div>
  );
}
