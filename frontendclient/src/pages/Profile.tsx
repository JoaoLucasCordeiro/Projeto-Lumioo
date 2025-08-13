import { Sidebar } from "../components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Mail, GraduationCap, Calendar, Edit, Lock, Bookmark, Grid3x3, Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const userPosts = [
    {
      id: '1',
      username: userData.username,
      userImage: userData.avatar,
      image: '/post1.jpg',
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
    },
    {
      id: '4',
      username: userData.username,
      userImage: userData.avatar,
      image: '/post4.jpg',
      caption: 'Workshop sobre ética em IA aplicada à saúde na UFPE esta semana',
      likes: 432,
      comments: 15,
      timePosted: '3d atrás',
      isLiked: true,
      isSaved: false
    },
    {
      id: '5',
      username: userData.username,
      userImage: userData.avatar,
      image: '/post5.jpg',
      caption: 'Resultados preliminares do nosso novo modelo preditivo para doenças raras',
      likes: 1567,
      comments: 64,
      timePosted: '5d atrás',
      isLiked: false,
      isSaved: true
    },
    {
      id: '6',
      username: userData.username,
      userImage: userData.avatar,
      image: '/post6.jpg',
      caption: 'Convidada para palestrar no simpósio internacional de tecnologia médica',
      likes: 987,
      comments: 32,
      timePosted: '1sem atrás',
      isLiked: true,
      isSaved: false
    }
  ];

  // Posts salvos completos
  const savedPosts = [
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
    },
    {
      id: 's3',
      username: 'neurociencia_br',
      userImage: '/user-neuro.jpg',
      image: '/saved3.jpg',
      caption: 'Chamada para colaboração em pesquisa multicêntrica sobre Alzheimer',
      likes: 876,
      comments: 23,
      timePosted: '2sem atrás',
      isLiked: false,
      isSaved: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 grid grid-cols-1 md:grid-cols-[280px_1fr]">
      {/* Sidebar Desktop */}
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
      <main className="overflow-y-auto">
        {/* Cabeçalho do Perfil */}
        <div className="relative">
          {/* Foto de capa */}
          <div className="h-48 md:h-64 w-full bg-gradient-to-r from-slate-800 to-slate-900 overflow-hidden">
            <img 
              src={userData.coverPhoto} 
              alt="Capa do perfil" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Área de informações do perfil */}
          <div className="px-4 md:px-8 lg:px-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16 mb-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-slate-900">
                  <AvatarImage src={userData.avatar} alt={userData.fullName} />
                  <AvatarFallback className="bg-slate-700 text-red-400 text-4xl font-bold">
                    {userData.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="absolute bottom-2 right-2 bg-slate-800/80 backdrop-blur-sm border-slate-700 text-slate-200 hover:bg-slate-700/80"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Nome e ações */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-100">{userData.fullName}</h1>
                    <p className="text-slate-400">@{userData.username}</p>
                  </div>
                  
                  {isOwner ? (
                    <div className="flex gap-3">
                      {isEditing ? (
                        <>
                          <Button 
                            variant="outline" 
                            className="border-slate-700 text-slate-300 hover:bg-slate-800/50"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancelar
                          </Button>
                          <Button className="bg-red-600 hover:bg-red-700">
                            Salvar Alterações
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            className="border-red-500 text-red-400 hover:bg-red-900/20"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Perfil
                          </Button>
                          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800/50">
                            <Lock className="h-4 w-4 mr-2" />
                            Privacidade
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-900/20">
                        Seguir
                      </Button>
                      <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800/50">
                        Mensagem
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Bio */}
                {isEditing ? (
                  <textarea
                    defaultValue={userData.bio}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-red-500 focus:border-red-500"
                    rows={3}
                  />
                ) : (
                  <p className="text-slate-300">{userData.bio}</p>
                )}
                
                {/* Estatísticas */}
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="font-medium text-slate-200">{userData.posts}</span>
                    <span>Publicações</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="font-medium text-slate-200">{userData.followers}</span>
                    <span>Seguidores</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="font-medium text-slate-200">{userData.following}</span>
                    <span>Seguindo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Abas do perfil */}
        <Tabs defaultValue="posts" className="px-4 md:px-8 lg:px-12">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900 border-b border-slate-800 rounded-none">
            <TabsTrigger 
              value="posts" 
              className="flex items-center gap-2 data-[state=active]:text-red-400 data-[state=active]:border-b-2 data-[state=active]:border-red-500"
            >
              <Grid3x3 className="h-4 w-4" />
              Publicações
            </TabsTrigger>
            <TabsTrigger 
              value="saved" 
              className="flex items-center gap-2 data-[state=active]:text-red-400 data-[state=active]:border-b-2 data-[state=active]:border-red-500"
            >
              <Bookmark className="h-4 w-4" />
              Salvos
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo das abas */}
          <div className="py-8">
            <TabsContent value="posts">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userPosts.map((post) => (
                  <div key={post.id} className="aspect-square overflow-hidden rounded-lg group relative">
                    <img
                      src={post.image}
                      alt={post.caption}
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <div className="flex items-center text-white space-x-4">
                        <Heart className="h-5 w-5" />
                        <span>{post.likes}</span>
                        <MessageCircle className="h-5 w-5" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="saved">
              {isOwner ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedPosts.map((post) => (
                    <div key={post.id} className="aspect-square overflow-hidden rounded-lg group relative">
                      <img
                        src={post.image}
                        alt={post.caption}
                        className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <div className="flex items-center text-white space-x-4">
                          <Heart className="h-5 w-5" />
                          <span>{post.likes}</span>
                          <MessageCircle className="h-5 w-5" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  Apenas o dono do perfil pode ver os posts salvos
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Informações do perfil (apenas para o dono) */}
        {isOwner && (
          <div className="px-4 md:px-8 lg:px-12 py-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-slate-100 mb-6">Informações do Perfil</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Informação 1 - Email */}
                <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-full bg-slate-700/50">
                      <Mail className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Email</h3>
                      {isEditing ? (
                        <Input
                          type="email"
                          defaultValue={userData.email}
                          className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
                        />
                      ) : (
                        <p className="text-slate-200">{userData.email}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Informação 2 - Instituição */}
                <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-full bg-slate-700/50">
                      <GraduationCap className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Instituição</h3>
                      {isEditing ? (
                        <Input
                          type="text"
                          defaultValue={userData.institution}
                          className="bg-slate-800 border-slate-700 text-slate-200 mt-1"
                        />
                      ) : (
                        <p className="text-slate-200">{userData.institution}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Informação 3 - Nível Acadêmico */}
                <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-full bg-slate-700/50">
                      <GraduationCap className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Nível Acadêmico</h3>
                      {isEditing ? (
                        <select
                          defaultValue={userData.academicLevel}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-slate-200 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="Graduação">Estudante de Graduação</option>
                          <option value="Mestrado">Estudante de Mestrado</option>
                          <option value="Doutorado">Estudante de Doutorado</option>
                          <option value="Professor">Professor/Pesquisador</option>
                        </select>
                      ) : (
                        <p className="text-slate-200">{userData.academicLevel}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Informação 4 - Data de Nascimento */}
                <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-full bg-slate-700/50">
                      <Calendar className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-400">Data de Nascimento</h3>
                      {isEditing ? (
                        <Input
                          type="date"
                          defaultValue={userData.birthDate}
                          className="bg-slate-800 border-slate-700 text-slate-200 mt-1 [&::-webkit-calendar-picker-indicator]:invert-[0.7]"
                        />
                      ) : (
                        <p className="text-slate-200">
                          {new Date(userData.birthDate).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Áreas de pesquisa */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-100 mb-4">Áreas de Pesquisa</h2>
                <div className="flex flex-wrap gap-2">
                  {isEditing ? (
                    <>
                      <Input
                        type="text"
                        placeholder="Adicione uma área de pesquisa"
                        className="bg-slate-800 border-slate-700 text-slate-200 max-w-xs"
                      />
                      <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-900/20">
                        Adicionar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Badge className="bg-slate-800 text-red-400 border-red-500/30 hover:bg-slate-700">
                        Inteligência Artificial
                      </Badge>
                      <Badge className="bg-slate-800 text-red-400 border-red-500/30 hover:bg-slate-700">
                        Saúde Digital
                      </Badge>
                      <Badge className="bg-slate-800 text-red-400 border-red-500/30 hover:bg-slate-700">
                        Aprendizado de Máquina
                      </Badge>
                      <Badge className="bg-slate-800 text-red-400 border-red-500/30 hover:bg-slate-700">
                        Diagnóstico Médico
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}