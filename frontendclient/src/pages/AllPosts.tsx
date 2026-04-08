// src/pages/AllPosts.tsx
import { Sidebar } from "../components/shared/Sidebar";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "../components/ui/button";
import { useState } from "react";
import { PostGrid } from "@/components/shared/PostGrid";
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

      {/* Mobile sidebar trigger */}
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

      <main className="py-8 px-4 md:px-6 lg:px-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-6 pt-12 md:pt-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
              Comunidade
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
              Posts{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">
                Recomendados
              </span>
            </h2>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Pesquisar por legendas, usuários ou #hashtags…"
              className="pl-10 bg-slate-800/60 border-white/[0.08] text-slate-200 rounded-xl placeholder:text-slate-600 focus-visible:ring-red-500/40 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-slate-800/60 animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-400 text-sm">{error.message}</p>
            </div>
          ) : (
            <PostGrid posts={posts} />
          )}

          {isFetchingNextPage && (
            <div className="flex justify-center py-6">
              <div className="h-5 w-5 rounded-full border-2 border-red-500/40 border-t-red-500 animate-spin" />
            </div>
          )}
          <div ref={sentinelRef} />
        </motion.div>
      </main>
    </div>
  );
}
