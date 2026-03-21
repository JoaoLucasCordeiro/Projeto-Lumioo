import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Users, Building2, Calendar, ArrowLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProjectById } from "@/api/projects";
import { queryKeys } from "@/api/queryKeys";

const STATUS_DISPLAY_MAP: { [key: string]: string } = {
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  OPEN_FOR_APPLICATIONS: 'Aberto para inscrições'
};

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: queryKeys.projects.detail(id!),
    queryFn: () => fetchProjectById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Carregando projeto...</p>
      </div>
    );
  }

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

  const displayStatus = STATUS_DISPLAY_MAP[project.status] || project.status;

  return (
    <div className="min-h-screen bg-slate-900 grid grid-cols-1 md:grid-cols-[280px_1fr]">
      <div className="hidden md:block sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
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
          <SheetContent
            side="left"
            className="bg-slate-900/95 backdrop-blur-sm border-slate-800 p-0 w-[280px]"
          >
            <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
      <main className="py-8 px-4 md:px-6 lg:px-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mx-auto"
        >
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
          <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 mb-8">
            <div className="h-64 md:h-80 bg-slate-700 relative overflow-hidden">
              <img
                src={project.image || "https://placehold.co/1200x400/1e293b/ef4444?text=Projeto"}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4">
                <Badge
                  variant="outline"
                  className="bg-slate-900/80 backdrop-blur-sm border-slate-700 text-slate-200"
                >
                  {project.category}
                </Badge>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
                    {project.title}
                  </h1>
                  <Link to={`/perfil/${project.authorUsername}`}>
                    <p className="text-lg text-slate-300 mb-4 hover:text-red-400 transition-colors">
                      Por: {project.author}
                    </p>
                  </Link>
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
                  variant={project.status === 'COMPLETED' ? 'default' : 'secondary'}
                  className={`text-sm ${project.status === 'COMPLETED' ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'}`}
                >
                  {displayStatus}
                </Badge>
              </div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-100 mb-3">Sobre o projeto</h2>
                <p className="text-slate-300 whitespace-pre-line">{project.detailedDescription}</p>
              </div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-100 mb-3">Equipe</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.team.map((member, index) => (
                    <div
                      key={index}
                      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
                    >
                      <h3 className="font-medium text-slate-100">{member.name}</h3>
                      <p className="text-sm text-slate-400">{member.role}</p>
                    </div>
                  ))}
                </div>
              </div>
              {project.publications && project.publications.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-100 mb-3">Publicações</h2>
                  <div className="space-y-3">
                    {project.publications.map((pub, index) => (
                      <div
                        key={index}
                        className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
                      >
                        <h3 className="font-medium text-slate-100">{pub.title}</h3>
                        {pub.journal && (
                          <p className="text-sm text-slate-400">Publicado em: {pub.journal}</p>
                        )}
                        {pub.conference && (
                          <p className="text-sm text-slate-400">Apresentado em: {pub.conference}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
