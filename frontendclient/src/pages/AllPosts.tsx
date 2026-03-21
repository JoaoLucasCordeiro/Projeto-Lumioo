// src/pages/AllPosts.tsx
import { Sidebar } from "../components/shared/Sidebar";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "../components/ui/button";
import { useState } from "react";
import { Post as PostComponent } from "@/components/shared/Post";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPostsPage } from "@/api/posts";
import { queryKeys } from "@/api/queryKeys";
import { useDebounce } from "@/hooks/useDebouce";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export function AllPosts() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQuery({
      queryKey: queryKeys.posts.list(debouncedSearchQuery),
      queryFn: ({ pageParam }) =>
        fetchPostsPage({ pageParam: pageParam as string | undefined, search: debouncedSearchQuery }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  const sentinelRef = useIntersectionObserver(
    fetchNextPage,
    (hasNextPage ?? false) && !isFetchingNextPage
  );

  return (
    <div className="min-h-screen bg-slate-900 grid grid-cols-1 md:grid-cols-[280px_1fr]">
      <div className="hidden md:block sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>

      <div className="md:hidden fixed top-4 left-4 z-20">
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-slate-800/50 backdrop-blur-sm border-slate-700 text-slate-200 hover:bg-slate-700/50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-slate-900/95 backdrop-blur-sm border-slate-800 p-0 w-[280px]"
          >
            <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <main className="py-8 px-4 md:px-6 lg:px-8 overflow-y-auto flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <div className="md:hidden flex items-center justify-between mb-8 pt-12">
            <h2 className="text-2xl font-bold text-slate-100">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">
                Explorar
              </span>
            </h2>
          </div>
          <div className="hidden md:flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-100">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">
                Posts Recomendados
              </span>
            </h2>
          </div>

          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Pesquisar por legendas, usuários ou #hashtags..."
              className="pl-10 bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-red-500 focus-visible:ring-offset-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Carregando posts...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">{error.message}</div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post) => (
                <PostComponent key={post.id} {...post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">Nenhum post encontrado para "{searchQuery}"</p>
            </div>
          )}

          {isFetchingNextPage && (
            <div className="text-center py-4 text-slate-400">Carregando mais...</div>
          )}
          <div ref={sentinelRef} />
        </motion.div>
      </main>
    </div>
  );
}
