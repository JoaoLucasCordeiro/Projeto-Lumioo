// src/components/shared/ProfileTabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3x3, Bookmark } from "lucide-react";
import { PostGrid } from "./PostGrid";
import type { Post } from "@/types/feed";

interface ProfileTabsProps {
  userPosts: Post[];
  savedPosts: Post[];
  isOwner: boolean;
  onUpdate: () => void;
}

// Componente para exibir quando não há posts
function EmptyState({ message, description }: { message: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-2xl bg-slate-800/50 p-5 mb-5 backdrop-blur-sm border border-slate-700/50">
        <svg 
          className="h-10 w-10 text-slate-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">{message}</h3>
      <p className="text-sm text-slate-400 max-w-md leading-relaxed">{description}</p>
    </div>
  );
}

export function ProfileTabs({ 
  userPosts, 
  savedPosts, 
  isOwner, 
  onUpdate
}: ProfileTabsProps) {
  return (
    <div className="px-4 md:px-8 lg:px-12">
      <Tabs defaultValue="posts" className="w-full">
        <div className="mb-8 flex justify-center">
          <TabsList className={`flex ${isOwner ? 'max-w-md' : 'max-w-xs'} bg-slate-800/30 rounded-2xl p-1.5 backdrop-blur-sm border border-slate-700/50 mx-auto`}>
            <TabsTrigger
              value="posts"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-slate-300 
                     data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 
                     data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-red-600/25
                     hover:text-slate-100 transition-all duration-300 ease-out group"
            >
              <Grid3x3 className="h-4 w-4 group-data-[state=active]:scale-110 transition-transform" />
              <span className="font-medium">Publicações</span>
              <span className="bg-slate-700/60 text-slate-200 text-xs px-2 py-1 rounded-full min-w-[24px] group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                {userPosts.length}
              </span>
            </TabsTrigger>

            {isOwner && (
              <TabsTrigger
                value="saved"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-slate-300 
                       data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-700 
                       data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-red-600/25
                       hover:text-slate-100 transition-all duration-300 ease-out group"
              >
                <Bookmark className="h-4 w-4 group-data-[state=active]:scale-110 transition-transform" />
                <span className="font-medium">Salvos</span>
                <span className="bg-slate-700/60 text-slate-200 text-xs px-2 py-1 rounded-full min-w-[24px] group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                  {savedPosts.length}
                </span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <div className="pb-8">
          <TabsContent value="posts" className="m-0 animate-fadeIn">
            {userPosts.length === 0 ? (
              <EmptyState 
                message="Nenhuma publicação ainda."
                description={isOwner ? "Quando você compartilhar publicações, elas aparecerão aqui." : "Este usuário ainda não compartilhou nenhuma publicação."}
              />
            ) : (
              <PostGrid 
                posts={userPosts} 
                isOwner={isOwner}
                onUpdate={onUpdate}
              />
            )}
          </TabsContent>

          {isOwner && (
            <TabsContent value="saved" className="m-0 animate-fadeIn">
              {savedPosts.length === 0 ? (
                <EmptyState 
                  message="Nenhuma publicação salva."
                  description="Quando você salvar publicações, elas aparecerão aqui."
                />
              ) : (
                <PostGrid 
                  posts={savedPosts} 
                  isOwner={isOwner}
                  onUpdate={onUpdate}
                />
              )}
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}