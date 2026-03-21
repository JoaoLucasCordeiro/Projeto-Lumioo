import { FeedHeader } from "@/components/shared/feed/FeedHeader";
import { FeedLayout } from "@/components/shared/feed/FeedLayout";
import { PostsList } from "@/components/shared/feed/PostsList";
import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchFeedPage } from "@/api/posts";
import { queryKeys } from "@/api/queryKeys";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export function FeedPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQuery({
      queryKey: queryKeys.feed.infinite(),
      queryFn: ({ pageParam }) => fetchFeedPage({ pageParam: pageParam as string | undefined }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  const sentinelRef = useIntersectionObserver(
    fetchNextPage,
    (hasNextPage ?? false) && !isFetchingNextPage
  );

  const handleNewPost = () => console.log('Criar novo post');

  return (
    <FeedLayout
      mobileSidebarOpen={mobileSidebarOpen}
      setMobileSidebarOpen={setMobileSidebarOpen}
    >
      <div className="md:hidden">
        <FeedHeader variant="mobile" onNewPost={handleNewPost} />
      </div>
      <div className="hidden md:block">
        <FeedHeader variant="desktop" onNewPost={handleNewPost} />
      </div>

      <PostsList posts={posts} />

      {isLoading && posts.length === 0 && (
        <p className="text-center text-slate-400 mt-8">Carregando feed...</p>
      )}
      {isFetchingNextPage && (
        <p className="text-center text-slate-400 mt-8">Carregando mais posts...</p>
      )}
      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-slate-500 mt-8">Você chegou ao fim! ✨</p>
      )}
      {error && <p className="text-center text-red-500 mt-8">Erro: {error.message}</p>}
      {!isLoading && posts.length === 0 && !error && (
        <div className="text-center text-slate-400 mt-16">
          <h2 className="text-2xl font-bold">Bem-vindo ao seu feed!</h2>
          <p className="mt-2">
            Parece um pouco vazio. Crie seu primeiro post ou siga outros pesquisadores.
          </p>
        </div>
      )}

      <div ref={sentinelRef} />
    </FeedLayout>
  );
}
