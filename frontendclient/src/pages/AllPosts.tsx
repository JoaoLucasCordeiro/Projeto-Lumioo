// src/pages/AllPosts.tsx
import { Sidebar } from "../components/shared/Sidebar";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "../components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { Post as PostComponent } from "@/components/shared/Post";
import { useAuth } from "@/contexts/auth.context";
import type { Post } from "@/types/feed";
import { useDebounce } from "@/hooks/useDebouce";

const API_URL = import.meta.env.VITE_API_URL;

export function AllPosts() {
  const { token } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchPosts = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${API_URL}/posts?search=${query}`;
      const response = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("Falha ao buscar os posts.");
      const data = await response.json();
      setPosts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPosts(debouncedSearchQuery);
  }, [debouncedSearchQuery, fetchPosts]);

  const handleUpdate = () => {
    fetchPosts(debouncedSearchQuery);
  };

  return (
    <div className="min-h-screen bg-slate-900 grid grid-cols-1 md:grid-cols-[280px_1fr]">
      <div className="hidden md:block sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
      
      <div className="md:hidden fixed top-4 left-4 z-20">
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-slate-800/50 backdrop-blur-sm border-slate-700 text-slate-200 hover:bg-slate-700/50">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-slate-900/95 backdrop-blur-sm border-slate-800 p-0 w-[280px]">
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
            <h2 className="text-2xl font-bold text-slate-100"><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">Explorar</span></h2>
          </div>
          <div className="hidden md:flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-100"><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">Posts Recomendados</span></h2>
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
            <div className="text-center py-12 text-red-400">{error}</div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <PostComponent {...post} onUpdate={handleUpdate} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">Nenhum post encontrado para "{searchQuery}"</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}