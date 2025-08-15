import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Users, Building2, Calendar, ArrowLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ProjectCard } from "@/components/shared/ProjectCard";

// Dados de exemplo (deveriam vir de uma API na prática)
const projectsData = [
  {
    id: '1',
    title: 'Sistema de Gestão de Pesquisas',
    description: 'Plataforma integrada para gerenciamento de projetos de pesquisa acadêmica com colaboração em tempo real. Este projeto visa criar uma solução completa que permita aos pesquisadores gerenciar todas as etapas de seus projetos, desde a submissão até a publicação dos resultados. A plataforma inclui ferramentas para colaboração, versionamento de documentos, agendamento de reuniões e integração com bases de dados acadêmicas.',
    category: 'Software',
    year: '2023',
    image: '/project1.jpg',
    members: 8,
    institution: 'UPE',
    status: 'Em andamento',
    detailedDescription: 'O Sistema de Gestão de Pesquisas é uma plataforma web desenvolvida com React, Node.js e MongoDB. Ele oferece recursos avançados como:\n\n- Controle de versão para documentos de pesquisa\n- Ferramentas de colaboração em tempo real\n- Integração com ORCID e outras plataformas acadêmicas\n- Dashboard de métricas e acompanhamento de progresso\n\nO projeto está sendo desenvolvido em parceria com o departamento de Ciência da Computação da UPE e tem previsão de conclusão para dezembro de 2024.',
    team: [
      { name: 'Prof. Dr. Carlos Silva', role: 'Coordenador' },
      { name: 'Dra. Ana Oliveira', role: 'Pesquisadora Principal' },
      { name: 'MSc. João Santos', role: 'Desenvolvedor Sênior' },
      { name: 'BSc. Maria Costa', role: 'Desenvolvedora Front-end' }
    ],
    publications: [
      { title: 'Desafios na gestão de projetos de pesquisa acadêmica', conference: 'CONAC 2022' },
      { title: 'Ferramentas colaborativas para pesquisa científica', journal: 'Journal of Academic Research' }
    ]
  },
  {
    id: '2',
    title: 'Análise de Dados Climáticos',
    description: 'Estudo longitudinal das mudanças climáticas na região Nordeste nos últimos 50 anos.',
    category: 'Ciência de Dados',
    year: '2022',
    image: '/project2.jpg',
    members: 5,
    institution: 'UFPE',
    status: 'Concluído',
    detailedDescription: 'Este projeto coletou e analisou dados climáticos de 20 estações meteorológicas na região Nordeste, identificando padrões e tendências nas mudanças climáticas. Utilizamos técnicas de machine learning para prever cenários futuros baseados nos dados históricos.\n\nPrincipais resultados:\n\n- Identificação de aumento médio de 1.2°C na temperatura regional\n- Redução de 15% no volume de chuvas nas últimas duas décadas\n- Desenvolvimento de modelo preditivo com 89% de acurácia',
    team: [
      { name: 'Prof. Dr. Roberto Lima', role: 'Coordenador' },
      { name: 'Dra. Fernanda Alves', role: 'Cientista de Dados' }
    ],
    publications: [
      { title: 'Mudanças climáticas no Nordeste brasileiro: 1970-2020', journal: 'Environmental Research' },
      { title: 'Modelagem preditiva para microclimas', conference: 'Data Science Brazil 2021' }
    ]
  },
  // ... outros projetos (adicionar conforme necessário)
];

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Encontrar o projeto com base no ID
  const project = projectsData.find(p => p.id === id);
  
  if (!project) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Projeto não encontrado</h2>
          <Button 
            onClick={() => navigate('/projetos')}
            className="bg-[#ff3131] hover:bg-red-600 text-white"
          >
            Voltar para projetos
          </Button>
        </div>
      </div>
    );
  }

  // Projetos relacionados (filtra por mesma categoria excluindo o atual)
  const relatedProjects = projectsData.filter(
    p => p.category === project.category && p.id !== project.id
  ).slice(0, 2);

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
      <main className="py-8 px-4 md:px-6 lg:px-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mx-auto"
        >
          {/* Cabeçalho Mobile */}
          <div className="md:hidden flex items-center justify-between mb-8 pt-12">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/projetos')}
              className="text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h2 className="text-xl font-bold text-slate-100">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">Detalhes</span>
            </h2>
          </div>

          {/* Cabeçalho Desktop */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/projetos')}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para projetos
            </Button>
          </div>

          {/* Conteúdo do projeto */}
          <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 mb-8">
            {/* Imagem principal */}
            <div className="h-64 md:h-80 bg-slate-700 relative overflow-hidden">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4">
                <Badge variant="outline" className="bg-slate-900/80 backdrop-blur-sm border-slate-700 text-slate-200">
                  {project.category}
                </Badge>
              </div>
            </div>
            
            {/* Informações principais */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">{project.title}</h1>
                  <div className="flex items-center space-x-4 text-slate-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{project.year}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Building2 className="h-4 w-4" />
                      <span>{project.institution}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{project.members} membros</span>
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={project.status === 'Concluído' ? 'default' : 'secondary'} 
                  className={`text-sm ${project.status === 'Concluído' ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'}`}
                >
                  {project.status}
                </Badge>
              </div>
              
              {/* Descrição detalhada */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-100 mb-3">Sobre o projeto</h2>
                <p className="text-slate-300 whitespace-pre-line">{project.detailedDescription}</p>
              </div>
              
              {/* Equipe */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-100 mb-3">Equipe</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.team.map((member, index) => (
                    <div key={index} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                      <h3 className="font-medium text-slate-100">{member.name}</h3>
                      <p className="text-sm text-slate-400">{member.role}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Publicações */}
              {project.publications && project.publications.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-100 mb-3">Publicações</h2>
                  <div className="space-y-3">
                    {project.publications.map((pub, index) => (
                      <div key={index} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                        <h3 className="font-medium text-slate-100">{pub.title}</h3>
                        {pub.journal && <p className="text-sm text-slate-400">Publicado em: {pub.journal}</p>}
                        {pub.conference && <p className="text-sm text-slate-400">Apresentado em: {pub.conference}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Projetos relacionados */}
          {relatedProjects.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">Projetos relacionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedProjects.map(project => (
                  <ProjectCard key={project.id} {...project} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}