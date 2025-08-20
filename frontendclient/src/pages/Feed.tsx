import { FeedHeader } from "@/components/shared/feed/FeedHeader";
import { FeedLayout } from "@/components/shared/feed/FeedLayout";
import { PostsList } from "@/components/shared/feed/PostsList";
import { useAuth } from "@/contexts/auth.context";
import type { Post } from "@/types/feed";
import { useState, useEffect, useRef, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export function FeedPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { token } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  const fetchPosts = useCallback(async (currentCursor?: string, isRefresh = false) => {
    if (isLoading || (!hasMore && !isRefresh)) return;
    
    setIsLoading(true);
    setError(null);

    try {
      let url = `${API_URL}/feed`;
      if (currentCursor && !isRefresh) {
        url += `?cursor=${currentCursor}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Falha ao buscar os posts.');

      const data = await response.json();
      
      setPosts(prevPosts => isRefresh ? data.posts : [...prevPosts, ...data.posts]);
      setCursor(data.nextCursor);
      setHasMore(data.nextCursor !== null);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handlePostUpdate = () => {
    fetchPosts(undefined, true);
  };

  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchPosts(cursor);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, cursor, fetchPosts]);

  useEffect(() => {
    if (token) {
      handlePostUpdate();
    }
  }, [token]);


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

      <PostsList posts={posts} lastPostRef={lastPostElementRef} onUpdate={handlePostUpdate} />

      {isLoading && posts.length === 0 && <p className="text-center text-slate-400 mt-8">Carregando feed...</p>}
      {isLoading && posts.length > 0 && <p className="text-center text-slate-400 mt-8">Carregando mais posts...</p>}
      {!hasMore && posts.length > 0 && <p className="text-center text-slate-500 mt-8">Você chegou ao fim! ✨</p>}
      {error && <p className="text-center text-red-500 mt-8">Erro: {error}</p>}
      {!isLoading && posts.length === 0 && !error && (
        <div className="text-center text-slate-400 mt-16">
          <h2 className="text-2xl font-bold">Bem-vindo ao seu feed!</h2>
          <p className="mt-2">Parece um pouco vazio. Crie seu primeiro post ou siga outros pesquisadores.</p>
        </div>
      )}
    </FeedLayout>
  );
}