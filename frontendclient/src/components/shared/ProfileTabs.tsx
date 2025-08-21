import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3x3, Bookmark } from "lucide-react";
import { PostGrid } from "./PostGrid";
import type { Post } from "@/types/feed";

interface ProfileTabsProps {
  userPosts: Post[];
  savedPosts: Post[];
  isOwner: boolean;
  onUpdate: () => void; // Apenas uma função para atualizar
}

export function ProfileTabs({ 
  userPosts, 
  savedPosts, 
  isOwner, 
  onUpdate 
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue="posts" className="px-4 md:px-8 lg:px-12">
      <TabsList className="grid w-full grid-cols-2 bg-slate-900 border-b border-slate-800 rounded-none">
        <TabsTrigger
          value="posts"
          className="flex items-center gap-2 text-white data-[state=active]:bg-[#ff3131] data-[state=active]:shadow-lg data-[state=active]:shadow-[#ff3131]/20 hover:bg-red-600 hover:shadow-lg hover:shadow-[#ff3131]/40 transition-all duration-300 border border-transparent data-[state=active]:border-[#ff3131]"
        >
          <Grid3x3 className="h-4 w-4" />
          Publicações
        </TabsTrigger>

        <TabsTrigger
          value="saved"
          className="flex items-center gap-2 text-white data-[state=active]:bg-[#ff3131] data-[state=active]:shadow-lg data-[state=active]:shadow-[#ff3131]/20 hover:bg-red-600 hover:shadow-lg hover:shadow-[#ff3131]/40 transition-all duration-300 border border-transparent data-[state=active]:border-[#ff3131]"
        >
          <Bookmark className="h-4 w-4" />
          Salvos
        </TabsTrigger>
      </TabsList>

      <div className="py-8">
        <TabsContent value="posts">
          <PostGrid 
            posts={userPosts} 
            isOwner={isOwner}
            onUpdate={onUpdate} // Passa a função de update
          />
        </TabsContent>

        <TabsContent value="saved">
          {isOwner ? (
            <PostGrid 
              posts={savedPosts} 
              isOwner={isOwner}
              onUpdate={onUpdate} // Passa a função de update
            />
          ) : (
            <div className="text-center py-12 text-slate-400">
              Apenas o dono do perfil pode ver os posts salvos
            </div>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
}