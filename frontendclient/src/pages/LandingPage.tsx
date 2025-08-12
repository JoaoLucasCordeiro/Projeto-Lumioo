import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#191919] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#191919]/90 backdrop-blur-sm border-b border-[#ffffff10]">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#ff3131] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                <path d="M4 6V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
                <path d="M10 15a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1z" />
                <path d="M16 11a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">Lumioo</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="hover:text-[#ff3131] transition-colors">Recursos</a>
            <a href="#how-it-works" className="hover:text-[#ff3131] transition-colors">Como funciona</a>
            <a href="#testimonials" className="hover:text-[#ff3131] transition-colors">Depoimentos</a>
            <a href="#pricing" className="hover:text-[#ff3131] transition-colors">Planos</a>
          </nav>
          <div className="flex space-x-4">
            <Button variant="ghost">Entrar</Button>
            <Button className="bg-[#ff3131] hover:bg-[#ff3131]/90">Cadastre-se</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Conecte-se. <span className="text-[#ff3131]">Colabore.</span> Cresça.
            </h1>
            <p className="text-lg mb-8 text-gray-300">
              Lumioo é a rede social acadêmica que conecta estudantes, pesquisadores e instituições para promover colaboração e descobertas.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Input placeholder="Seu e-mail acadêmico" className="bg-[#ffffff10] border-none" />
              <Button className="bg-[#ff3131] hover:bg-[#ff3131]/90">Comece agora</Button>
            </div>
            <p className="text-sm mt-4 text-gray-400">Junte-se a mais de 50.000 acadêmicos</p>
          </div>
          <div className="md:w-1/2 relative">
            <div className="relative w-full h-96 bg-[#ffffff10] rounded-xl overflow-hidden">
              {/* Mockup da rede social */}
              <div className="absolute inset-0 p-4 flex flex-col">
                <div className="flex items-center space-x-2 mb-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Dr. Carlos Silva</p>
                    <p className="text-xs text-gray-400">Universidade Federal</p>
                  </div>
                </div>
                
                <div className="bg-[#ffffff05] p-4 rounded-lg mb-4">
                  <p className="text-sm mb-2">Acabei de publicar meu novo artigo sobre inteligência artificial aplicada à educação. Leiam e comentem!</p>
                  <div className="flex space-x-2">
                    <Badge variant="outline">IA</Badge>
                    <Badge variant="outline">Educação</Badge>
                    <Badge variant="outline">Tecnologia</Badge>
                  </div>
                </div>
                
                <div className="bg-[#ffffff05] p-4 rounded-lg mb-4">
                  <p className="text-sm mb-2">Alguém tem experiência com análise de dados qualitativos usando NVivo? Preciso de ajuda com meu projeto.</p>
                  <div className="flex space-x-2">
                    <Badge variant="outline">Pesquisa</Badge>
                    <Badge variant="outline">NVivo</Badge>
                  </div>
                </div>
                
                <div className="mt-auto flex space-x-4 text-sm">
                  <button className="flex items-center space-x-1 text-[#ff3131]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>Salvar</span>
                  </button>
                  <button className="flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>Comentar</span>
                  </button>
                  <button className="flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                      <polyline points="16 6 12 2 8 6"></polyline>
                      <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                    <span>Compartilhar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-[#ffffff05]">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Recursos Exclusivos</h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Lumioo oferece ferramentas projetadas especificamente para a comunidade acadêmica
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-[#191919] border-[#ffffff10]">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-[#ff3131]/20 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <CardTitle>Rede de Colaboração</CardTitle>
                <CardDescription className="text-gray-400">
                  Conecte-se com pesquisadores da sua área e de áreas relacionadas
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-[#191919] border-[#ffffff10]">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-[#ff3131]/20 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <CardTitle>Publicação de Artigos</CardTitle>
                <CardDescription className="text-gray-400">
                  Compartilhe seus trabalhos e receba feedback da comunidade
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="bg-[#191919] border-[#ffffff10]">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-[#ff3131]/20 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <CardTitle>Gestão de Projetos</CardTitle>
                <CardDescription className="text-gray-400">
                  Ferramentas para organizar sua pesquisa e colaborações
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Como Funciona</h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Em poucos passos você estará conectado à maior rede acadêmica do país
          </p>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#ff3131] flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Crie seu perfil</h3>
              <p className="text-gray-400 text-sm">
                Informe sua formação, áreas de interesse e instituição
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#ff3131] flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Conecte-se</h3>
              <p className="text-gray-400 text-sm">
                Encontre colegas, orientadores e colaboradores
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#ff3131] flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Compartilhe</h3>
              <p className="text-gray-400 text-sm">
                Publique artigos, dúvidas e descobertas
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#ff3131] flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">Colabore</h3>
              <p className="text-gray-400 text-sm">
                Participe de grupos de pesquisa e projetos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-[#ffffff05]">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">O que dizem nossos usuários</h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Pesquisadores e acadêmicos que transformaram sua carreira com Lumioo
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-[#191919] border-[#ffffff10]">
              <CardContent className="pt-6">
                <p className="mb-6 italic text-gray-300">
                  "Através da Lumioo encontrei colaboradores para meu projeto de pesquisa que estava parado há meses. Hoje temos um artigo publicado em revista de alto impacto!"
                </p>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="https://randomuser.me/api/portraits/women/44.jpg" />
                    <AvatarFallback>PF</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Prof. Fernanda Oliveira</p>
                    <p className="text-sm text-gray-400">Universidade de São Paulo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#191919] border-[#ffffff10]">
              <CardContent className="pt-6">
                <p className="mb-6 italic text-gray-300">
                  "Como estudante de doutorado, a Lumioo me ajudou a encontrar material de pesquisa relevante e a discutir ideias com especialistas da minha área."
                </p>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" />
                    <AvatarFallback>RM</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Ricardo Mendes</p>
                    <p className="text-sm text-gray-400">Doutorando em Física</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#191919] border-[#ffffff10]">
              <CardContent className="pt-6">
                <p className="mb-6 italic text-gray-300">
                  "Nossa instituição adotou a Lumioo como plataforma oficial para colaboração entre departamentos. Os resultados em termos de produção científica foram impressionantes."
                </p>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="https://randomuser.me/api/portraits/men/75.jpg" />
                    <AvatarFallback>CS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Dr. Carlos Silva</p>
                    <p className="text-sm text-gray-400">Diretor de Pesquisa</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para transformar sua vida acadêmica?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de pesquisadores e estudantes que já estão colaborando na Lumioo
          </p>
          <Button className="bg-[#ff3131] hover:bg-[#ff3131]/90 text-lg px-8 py-6">
            Criar minha conta gratuita
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#ffffff05] py-12 px-4 border-t border-[#ffffff10]">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="w-8 h-8 rounded-full bg-[#ff3131] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  <path d="M4 6V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
                  <path d="M10 15a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1z" />
                  <path d="M16 11a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold">Lumioo</h1>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Produto</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-[#ff3131] transition-colors">Recursos</a></li>
                  <li><a href="#" className="hover:text-[#ff3131] transition-colors">Planos</a></li>
                  <li><a href="#" className="hover:text-[#ff3131] transition-colors">API</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Empresa</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-[#ff3131] transition-colors">Sobre</a></li>
                  <li><a href="#" className="hover:text-[#ff3131] transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-[#ff3131] transition-colors">Carreiras</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-[#ff3131] transition-colors">Privacidade</a></li>
                  <li><a href="#" className="hover:text-[#ff3131] transition-colors">Termos</a></li>
                  <li><a href="#" className="hover:text-[#ff3131] transition-colors">Cookies</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Contato</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-[#ff3131] transition-colors">Suporte</a></li>
                  <li><a href="#" className="hover:text-[#ff3131] transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-[#ff3131] transition-colors">LinkedIn</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-[#ffffff10] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">© 2023 Lumioo. Todos os direitos reservados.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-[#ff3131] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-[#ff3131] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-[#ff3131] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}