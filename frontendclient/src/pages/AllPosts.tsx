import { Post } from "../components/shared/Post";
import { Sidebar } from "../components/shared/Sidebar";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "../components/ui/button";
import { useState } from "react";

export function AllPosts() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Posts recomendados (dados de exemplo)
  const recommendedPosts = [
    {
      id: '4',
      username: 'astro_fisica',
      userImage: '/user4.jpg',
      image: '/post4.jpg',
      caption: 'Novas imagens do telescópio James Webb revelam detalhes impressionantes de galáxias distantes! #Astronomia #Ciência',
      likes: 3421,
      comments: 156,
      timePosted: '3h atrás',
      isLiked: false,
      isSaved: false
    },
    {
      id: '5',
      username: 'bioquimica_ufpe',
      userImage: '/user5.jpg',
      image: '/post5.jpg',
      caption: 'Descoberta revolucionária em enzimas que pode levar a novos tratamentos para doenças neurodegenerativas. #Pesquisa #Saúde',
      likes: 1892,
      comments: 94,
      timePosted: '6h atrás',
      isLiked: true,
      isSaved: false
    },
    {
      id: '6',
      username: 'engenharia_ufrgs',
      userImage: '/user6.jpg',
      image: '/post6.jpg',
      caption: 'Nosso novo protótipo de motor sustentável bate recorde de eficiência energética. #Engenharia #Inovação',
      likes: 2756,
      comments: 132,
      timePosted: '1d atrás',
      isLiked: false,
      isSaved: true
    },
    {
      id: '7',
      username: 'matematica_pura',
      userImage: '/user7.jpg',
      image: '/post7.jpg',
      caption: 'Resolvido um problema matemático que persistia há décadas! Publicação do artigo na próxima semana. #Matemática #Pesquisa',
      likes: 4123,
      comments: 287,
      timePosted: '2d atrás',
      isLiked: false,
      isSaved: false
    },
    {
      id: '8',
      username: 'neurociencia_br',
      userImage: '/user8.jpg',
      image: '/post8.jpg',
      caption: 'Estudo revela como diferentes áreas do cérebro se comunicam durante o processo criativo. #Neurociência #Cérebro',
      likes: 1567,
      comments: 83,
      timePosted: '2d atrás',
      isLiked: true,
      isSaved: true
    },
    {
      id: '9',
      username: 'fisica_quantica',
      userImage: '/user9.jpg',
      image: '/post9.jpg',
      caption: 'Experimento comprova teoria quântica em escala macroscópica. Resultados publicados na Nature. #Física #Quantum',
      likes: 4982,
      comments: 324,
      timePosted: '3d atrás',
      isLiked: false,
      isSaved: false
    }
  ];

  // Filtrar posts baseado na pesquisa
  const filteredPosts = recommendedPosts.filter(post =>
    post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <main className="py-8 px-4 md:px-6 lg:px-8 overflow-y-auto flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          {/* Cabeçalho do Feed Mobile */}
          <div className="md:hidden flex items-center justify-between mb-8 pt-12">
            <h2 className="text-2xl font-bold text-slate-100">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">Explorar</span>
            </h2>
          </div>

          {/* Cabeçalho do Feed Desktop */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-100">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">Posts Recomendados</span>
            </h2>
          </div>

          {/* Barra de Pesquisa */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Pesquisar posts, usuários..."
              className="pl-10 bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-red-500 focus-visible:ring-offset-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Lista de Posts */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts.map((post, index) => (
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
