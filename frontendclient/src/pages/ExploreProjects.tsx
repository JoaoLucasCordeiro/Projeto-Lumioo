import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { TrendingUp, Clock, Star, Code, Brain, Dna, Calculator, Server, Users } from "lucide-react";

// Tipos para os projetos
interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  members: number;
  year: string;
  image?: string | null;
  status: string;
  institution?: string;
  isNew?: boolean;
  isTrending?: boolean;
}

// Categorias disponíveis (baseadas no backend)
const categories = [
  { id: "all", name: "Todos", icon: Star },
  { id: "INTELIGENCIA_ARTIFICIAL", name: "Inteligência Artificial", icon: Brain },
  { id: "DESENVOLVIMENTO", name: "Desenvolvimento", icon: Code },
  { id: "BIOLOGIA", name: "Biologia", icon: Dna },
  { id: "MATEMATICA", name: "Matemática", icon: Calculator },
  { id: "DEVOPS", name: "DevOps", icon: Server },
  { id: "ENGENHARIA", name: "Engenharia", icon: Server },
  { id: "CIENCIAS_SOCIAIS", name: "Ciências Sociais", icon: Users },
  { id: "SAUDE", name: "Saúde", icon: Users },
  { id: "OUTROS", name: "Outros", icon: Star },
];

// Mapeamento de categorias do backend para exibição
const categoryMap: Record<string, string> = {
  "INTELIGENCIA_ARTIFICIAL": "IA",
  "DESENVOLVIMENTO": "Desenvolvimento",
  "BIOLOGIA": "Biologia", 
  "MATEMATICA": "Matemática",
  "DEVOPS": "DevOps",
  "ENGENHARIA": "Engenharia",
  "CIENCIAS_SOCIAIS": "Ciências Sociais",
  "SAUDE": "Saúde",
  "OUTROS": "Outros"
};

const API_URL = import.meta.env.VITE_API_URL;

export default function ExploreProjects() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filter, setFilter] = useState("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/projects`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        // Adicionar flags isNew e isTrending baseadas na data e popularidade
        const enhancedProjects = (data.projects ?? []).map((project: Project) => ({
          ...project,
          // Projeto é considerado "novo" se foi criado nos últimos 30 dias
          isNew: new Date().getTime() - new Date(project.year).getTime() < 30 * 24 * 60 * 60 * 1000,
          // Projeto é considerado "trending" se tem muitos membros (exemplo)
          isTrending: project.members > 5
        }));
        
        setProjects(enhancedProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Não foi possível carregar os projetos. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Gerar partículas para o background
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, () => ({
        size: Math.random() * 4 + 1,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 8 + 8,
        delay: Math.random() * 5,
      })),
    []
  );

  // Filtrar projetos com base na categoria selecionada
  const filteredProjects = projects.filter(project => {
    const categoryMatch = selectedCategory === "all" || project.category === selectedCategory;
    
    if (filter === "trending") return categoryMatch && project.isTrending;
    if (filter === "new") return categoryMatch && project.isNew;
    
    return categoryMatch;
  });

  // Agrupar categorias únicas dos projetos para exibição inteligente
  const availableCategories = useMemo(() => {
    const uniqueCategories = [...new Set(projects.map(p => p.category))];
    return categories.filter(cat => 
      cat.id === "all" || uniqueCategories.includes(cat.id)
    );
  }, [projects]);

  if (isLoading) {
    return (
      <section className="relative bg-slate-900 overflow-hidden min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-300">Carregando projetos...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative bg-slate-900 overflow-hidden min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-red-500 mb-2">Erro ao carregar</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-slate-900 overflow-hidden min-h-screen">

      {/* Background igual ao da landing page */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-black to-slate-900"></div>

        <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-red-500/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-red-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      {/* Partículas de background */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              repeatType: "mirror",
              delay: p.delay,
            }}
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
            }}
          />
        ))}
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-20 py-24 md:py-32">
        <div className="container mx-auto px-6">
          {/* Cabeçalho */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <span className="inline-block mb-4 px-3 py-1 rounded-full bg-red-900/20 border border-red-700/50 text-red-400 font-semibold">
              Explore Projetos
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 mb-6 leading-tight">
              Descubra <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">projetos incríveis</span> e faça parte deles
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-transparent mx-auto mb-6" />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-slate-300 leading-relaxed"
            >
              Encontre projetos acadêmicos que combinam com seus interesses, colabore com mentes brilhantes 
              e transforme ideias em realidade. A inovação começa aqui.
            </motion.p>
          </motion.div>

          {/* Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-full border transition-all ${filter === "all" 
                ? "bg-red-900/20 border-red-700/50 text-red-400" 
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}
            >
              Todos os Projetos
            </button>
            <button
              onClick={() => setFilter("trending")}
              className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${filter === "trending" 
                ? "bg-red-900/20 border-red-700/50 text-red-400" 
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}
            >
              <TrendingUp size={18} />
              Em Alta
            </button>
            <button
              onClick={() => setFilter("new")}
              className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${filter === "new" 
                ? "bg-red-900/20 border-red-700/50 text-red-400" 
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}
            >
              <Clock size={18} />
              Novos
            </button>
          </motion.div>

          {/* Categorias (inteligentes - mostram apenas as categorias que existem) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-semibold text-slate-100 mb-6 text-center">Navegar por Categoria</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {availableCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${selectedCategory === category.id 
                      ? "bg-red-900/20 border-red-700/50" 
                      : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                  >
                    <Icon className={`mb-2 h-6 w-6 ${selectedCategory === category.id ? "text-red-400" : "text-slate-300"}`} />
                    <span className={`text-sm font-medium ${selectedCategory === category.id ? "text-red-400" : "text-slate-300"}`}>
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Lista de Projetos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 overflow-hidden hover:scale-105 transition-transform h-full flex flex-col"
              >
                {/* Imagem do projeto */}
                <div className="relative h-44 bg-slate-800 shrink-0">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Code size={40} className="text-slate-600" />
                    </div>
                  )}
                  {/* Status badge sobre a imagem */}
                  <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm
                    ${project.status === 'OPEN_FOR_APPLICATIONS'
                      ? 'bg-green-900/70 border-green-600/50 text-green-300'
                      : project.status === 'IN_PROGRESS'
                      ? 'bg-blue-900/70 border-blue-600/50 text-blue-300'
                      : 'bg-slate-700/70 border-slate-500/50 text-slate-300'}`}
                  >
                    {project.status === 'OPEN_FOR_APPLICATIONS' ? 'Aberto' :
                     project.status === 'IN_PROGRESS' ? 'Em andamento' : 'Concluído'}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  {/* Categoria + badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-red-900/20 border border-red-700/50 text-red-400 text-xs font-medium">
                      {categoryMap[project.category] || project.category}
                    </span>
                    {project.isNew && (
                      <span className="px-2 py-1 rounded-full bg-blue-900/20 border border-blue-700/50 text-blue-400 text-xs font-medium flex items-center">
                        <Clock size={12} className="mr-1" /> Novo
                      </span>
                    )}
                    {project.isTrending && (
                      <span className="px-2 py-1 rounded-full bg-amber-900/20 border border-amber-700/50 text-amber-400 text-xs font-medium flex items-center">
                        <TrendingUp size={12} className="mr-1" /> Em Alta
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-slate-100 mb-2">{project.title}</h3>

                  {project.institution && (
                    <p className="text-xs text-slate-500 mb-2">por {project.institution}</p>
                  )}

                  <p className="text-slate-400 text-sm mb-4 flex-grow line-clamp-3">{project.description}</p>

                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
                    <div className="text-slate-400 text-sm">
                      <Users size={16} className="inline mr-1 text-blue-400" />
                      <span>{project.members} membros</span>
                    </div>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-3 py-1 rounded-full bg-red-900/20 border border-red-700/50 text-red-400 text-xs font-medium hover:bg-red-900/30 transition-colors"
                    >
                      Participar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Mensagem quando não há projetos */}
          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center py-12"
            >
              <p className="text-slate-400 text-lg">Nenhum projeto encontrado com os filtros selecionados.</p>
              <button 
                onClick={() => {
                  setSelectedCategory("all");
                  setFilter("all");
                }}
                className="mt-4 px-6 py-2 rounded-full bg-red-900/20 border border-red-700/50 text-red-400 font-medium hover:bg-red-900/30 transition-colors"
              >
                Limpar Filtros
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        @media (max-width: 640px) {
          .animate-blob {
            animation: none;
            opacity: 0.1;
          }
        }
      `}</style>
    </section>
  );
}