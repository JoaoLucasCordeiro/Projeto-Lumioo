import { FeedHeader } from "@/components/shared/FeedHeader";
import { FeedLayout } from "@/components/shared/FeedLayout";
import { PostsList } from "@/components/shared/PostsList";
import type { Post } from "@/types/feed";
import { useState } from "react";


// Mock data - em uma aplicação real isso viria de uma API ou hook
const mockPosts: Post[] = [
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

export function FeedPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleNewPost = () => {
    // Lógica para criar novo post
    console.log('Criar novo post');
  };

  return (
    <FeedLayout 
      mobileSidebarOpen={mobileSidebarOpen} 
      setMobileSidebarOpen={setMobileSidebarOpen}
    >
      {/* Cabeçalho do Feed Mobile */}
      <div className="md:hidden">
        <FeedHeader variant="mobile" onNewPost={handleNewPost} />
      </div>

      {/* Cabeçalho do Feed Desktop */}
      <div className="hidden md:block">
        <FeedHeader variant="desktop" onNewPost={handleNewPost} />
      </div>

      {/* Lista de Posts */}
      <PostsList posts={mockPosts} />
    </FeedLayout>
  );
}