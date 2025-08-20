import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FeedHeaderProps } from "@/types/feed";
import { useNavigate } from "react-router-dom";

export function FeedHeader({ variant = 'desktop', onNewPost }: FeedHeaderProps) {
  const isMobile = variant === 'mobile';
  const navigate = useNavigate();

  const handleNewPostClick = () => {
    // Se existir um callback personalizado, executa primeiro
    if (onNewPost) {
      onNewPost();
    }
    // Navega para a rota de novo post
    navigate('/new-post');
  };

  return (
    <div className={`flex items-center justify-between mb-8 ${isMobile ? 'pt-12' : ''}`}>
      <div>
        <Badge 
          variant="outline" 
          className={`mb-2 bg-red-900/20 border-red-700/50 text-red-400 ${isMobile ? '' : ''}`}
        >
          {isMobile ? 'Comunidade' : 'Comunidade Ativa'}
        </Badge>
        <h2 className={`font-bold text-slate-100 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
          {isMobile ? (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">Feed</span>
          ) : (
            <>
              Seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">Feed</span>
            </>
          )}
        </h2>
      </div>
      
      {isMobile ? (
        <Button 
          variant="outline" 
          className="border-red-500 text-red-400 hover:bg-red-900/20"
          onClick={handleNewPostClick}
        >
          Novo Post
        </Button>
      ) : (
        <Button
          className="bg-[#ff3131] hover:bg-red-600 text-white font-bold shadow-lg shadow-[#ff3131]/20 hover:shadow-[#ff3131]/40 transition-all duration-300"
          onClick={handleNewPostClick}
        >
          Novo Post
        </Button>
      )}
    </div>
  );
}