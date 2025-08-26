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

export function ProfileTabs({ 
  userPosts, 
  savedPosts, 
  isOwner, 
  onUpdate
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue="posts" className="px-4 md:px-8 lg:px-12">
      <TabsList className={`grid w-full ${isOwner ? 'grid-cols-2' : 'grid-cols-1'} bg-slate-900 border-b border-slate-800 rounded-none`}>
        <TabsTrigger
          value="posts"
          className="flex items-center gap-2 text-white 
                 data-[state=active]:bg-[#ff3131] data-[state=active]:shadow-lg data-[state=active]:shadow-[#ff3131]/20 
                 hover:bg-red-600 hover:shadow-lg hover:shadow-[#ff3131]/40 
                 transition-all duration-300 border border-transparent data-[state=active]:border-[#ff3131]"
        >
          <Grid3x3 className="h-4 w-4" />
          Publicações
        </TabsTrigger>

        {/* --- CORREÇÃO AQUI: A aba "Salvos" só aparece para o dono do perfil --- */}
        {isOwner && (
          <TabsTrigger
            value="saved"
            className="flex items-center gap-2 text-white 
                   data-[state=active]:bg-[#ff3131] data-[state=active]:shadow-lg data-[state=active]:shadow-[#ff3131]/20 
                   hover:bg-red-600 hover:shadow-lg hover:shadow-[#ff3131]/40 
                   transition-all duration-300 border border-transparent data-[state=active]:border-[#ff3131]"
          >
            <Bookmark className="h-4 w-4" />
            Salvos
          </TabsTrigger>
        )}
      </TabsList>

      <div className="py-8">
        <TabsContent value="posts">
          <PostGrid 
            posts={userPosts} 
            isOwner={isOwner}
            onUpdate={onUpdate}
          />
        </TabsContent>

        {isOwner && (
          <TabsContent value="saved">
            <PostGrid 
              posts={savedPosts} 
              isOwner={isOwner}
              onUpdate={onUpdate}
            />
          </TabsContent>
        )}
      </div>
    </Tabs>
  );
}