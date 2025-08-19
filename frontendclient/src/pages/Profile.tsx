import { useState } from "react";
import { Sidebar } from "../components/shared/Sidebar";
import { ProfileHeader } from "@/components/shared/ProfileHeader";
import { MobileSidebar } from "@/components/shared/MobileSidebar";
import { ProfileTabs } from "@/components/shared/ProfileTabs";
import { ProfileInfo } from "@/components/shared/ProfileInfo";


export function ProfilePage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const isOwner = true; // Simulando que o usuário atual é dono do perfil

  // Dados completos do usuário
  const userData = {
    fullName: "João Lucas",
    username: "joao_pesquisador",
    email: "joao@academico.ufpe.br",
    institution: "Universidade Federal de Pernambuco",
    academicLevel: "Doutorado",
    birthDate: "1990-05-15",
    joinDate: "2022-03-10",
    bio: "Pesquisador em Inteligência Artificial aplicada à Saúde. Mestre em Ciência da Computação e atualmente cursando Doutorado.",
    avatar: "/user-avatar.jpg",
    coverPhoto: "/profile-cover.jpg",
    followers: 342,
    following: 156,
    posts: 28
  };

  // Posts completos do usuário
  const [userPosts, setUserPosts] = useState([
    {
      id: '1',
      username: userData.username,
      userImage: userData.avatar,
      image: '/joaolucas.jpg',
      caption: 'Novos resultados da nossa pesquisa em diagnóstico médico assistido por IA! #Saúde #IA',
      likes: 1243,
      comments: 42,
      timePosted: '2h atrás',
      isLiked: false,
      isSaved: true
    },
    {
      id: '2',
      username: userData.username,
      userImage: userData.avatar,
      image: '/post2.jpg',
      caption: 'Participando do Congresso Internacional de IA em Saúde em Boston. Ótimas discussões! #Evento #Pesquisa',
      likes: 856,
      comments: 23,
      timePosted: '5h atrás',
      isLiked: true,
      isSaved: false
    },
    {
      id: '3',
      username: userData.username,
      userImage: userData.avatar,
      image: '/post3.jpg',
      caption: 'Publicação do nosso novo artigo na revista Nature Medicine sobre algoritmos de diagnóstico precoce',
      likes: 2105,
      comments: 87,
      timePosted: '1d atrás',
      isLiked: false,
      isSaved: true
    }
  ]);

  // Posts salvos completos
  const [savedPosts, setSavedPosts] = useState([
    {
      id: 's1',
      username: 'lab_saude_digital',
      userImage: '/user-lab.jpg',
      image: '/saved1.jpg',
      caption: 'Novas técnicas de processamento de imagens médicas usando redes neurais',
      likes: 3421,
      comments: 156,
      timePosted: '3d atrás',
      isLiked: false,
      isSaved: true
    },
    {
      id: 's2',
      username: 'ia_medica',
      userImage: '/user-ia.jpg',
      image: '/saved2.jpg',
      caption: 'Conjunto de dados aberto para pesquisa em diagnóstico por imagem',
      likes: 1256,
      comments: 42,
      timePosted: '1sem atrás',
      isLiked: true,
      isSaved: true
    }
  ]);

  // Funções para manipular interações com posts
  const handleLike = (postId: string) => {
    console.log("Curtir post:", postId);
    // Lógica para curtir/descurtir post
  };

  const handleSave = (postId: string) => {
    console.log("Salvar post:", postId);
    // Lógica para salvar/remover post dos salvos
  };

  const handleDelete = (postId: string) => {
    console.log("Deletar post:", postId);
    // Lógica para deletar post
    setUserPosts(userPosts.filter(post => post.id !== postId));
  };

  return (
    <div className="min-h-screen bg-slate-900 grid grid-cols-1 md:grid-cols-[280px_1fr]">
      {/* Sidebar Desktop */}
      <div className="hidden md:block sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>

      {/* Botão do Menu Mobile */}
      <MobileSidebar 
        mobileSidebarOpen={mobileSidebarOpen} 
        setMobileSidebarOpen={setMobileSidebarOpen} 
      />

      {/* Conteúdo principal */}
      <main className="overflow-y-auto">
        <ProfileHeader 
          userData={userData}
          isOwner={isOwner}
          isEditing={isEditing}
          onEditToggle={() => setIsEditing(!isEditing)}
        />

        <ProfileTabs 
          userPosts={userPosts}
          savedPosts={savedPosts}
          isOwner={isOwner}
          onLike={handleLike}
          onSave={handleSave}
          onDelete={handleDelete}
        />

        {isOwner && (
          <ProfileInfo 
            userData={userData}
            isEditing={isEditing}
          />
        )}
      </main>
    </div>
  );
}