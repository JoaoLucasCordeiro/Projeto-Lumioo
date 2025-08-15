import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Post } from "@/components/shared/Post";

export function FeedPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const posts = [
    {
      id: '1',
      username: 'pesquisador_upe',
      userImage: '/user1.jpg',
      image: '/post1.jpg',
      caption: 'Novo artigo publicado sobre inteligência artificial aplicada à pesquisa científica! #Lumioo #Pesquisa',
      likes: 1243,
      comments: 42,
      timePosted: '2h atrás',
      isLiked: false,
      isSaved: true
    },
    {
      id: '2',
      username: 'cientista_br',
      userImage: '/user2.jpg',
      image: '/post2.jpg',
      caption: 'Compartilhando minha última pesquisa sobre mudanças climáticas na região nordeste. #Ciência #Sustentabilidade',
      likes: 856,
      comments: 23,
      timePosted: '5h atrás',
      isLiked: true,
      isSaved: false
    },
    {
      id: '3',
      username: 'lab_fisica',
      userImage: '/user3.jpg',
      image: '/post3.jpg',
      caption: 'Resultados promissores em nosso novo experimento com supercondutores! #Física #Inovação',
      likes: 2105,
      comments: 87,
      timePosted: '1d atrás',
      isLiked: false,
      isSaved: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 grid grid-cols-1 md:grid-cols-[280px_1fr]">

      {/* Sidebar Desktop (fixa) */}
      <div className="hidden md:block sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>

      {/* Botão do Menu Mobile */}
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
          <SheetContent side="left" className="bg-slate-900/95 backdrop-blur-sm border-slate-800 p-0 w-[280px]">
            <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Conteúdo principal */}
      <main className="py-8 px-4 md:px-8 lg:px-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Cabeçalho do Feed Mobile */}
          <div className="md:hidden flex items-center justify-between mb-8 pt-12">
            <div>
              <Badge variant="outline" className="mb-2 bg-red-900/20 border-red-700/50 text-red-400">
                Comunidade
              </Badge>
              <h2 className="text-2xl font-bold text-slate-100">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">Feed</span>
              </h2>
            </div>
            <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-900/20">
              Novo Post
            </Button>
          </div>

          {/* Cabeçalho do Feed Desktop */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <div>
              <Badge variant="outline" className="mb-2 bg-red-900/20 border-red-700/50 text-red-400">
                Comunidade Ativa
              </Badge>
              <h2 className="text-3xl font-bold text-slate-100">
                Seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">Feed</span>
              </h2>
            </div>
            <Button
              className="bg-[#ff3131] hover:bg-red-600 text-white font-bold shadow-lg shadow-[#ff3131]/20 hover:shadow-[#ff3131]/40 transition-all duration-300"
            >
              Novo Post
            </Button>

          </div>

          {/* Lista de Posts */}
          <div className="space-y-8">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Post {...post} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
