import { useState, useMemo } from 'react';
import { motion } from "framer-motion";
import { TrendingUp, Clock, Star, Code, Brain, Dna, Calculator, Server, Users } from "lucide-react";

// Tipos para os projetos
interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  likes: number;
  members: number;
  isNew: boolean;
  isTrending: boolean;
}

// Dados de exemplo para os projetos
const projectsData: Project[] = [
  { id: 1, title: "Sistema de Recomendação com IA", description: "Desenvolvimento de algoritmo de recomendação usando aprendizado de máquina para conteúdos educacionais.", category: "IA", likes: 245, members: 12, isNew: true, isTrending: true },
  { id: 2, title: "Plataforma de Ensino Adaptativo", description: "Sistema que adapta o conteúdo conforme o desempenho do aluno usando técnicas de IA.", category: "IA", likes: 189, members: 8, isNew: false, isTrending: true },
  { id: 3, title: "Aplicativo para Cálculo de Limites", description: "Ferramenta interativa para auxiliar no aprendizado de cálculo diferencial e integral.", category: "Matemática", likes: 132, members: 5, isNew: true, isTrending: false },
  { id: 4, title: "Análise Genômica Comparativa", description: "Estudo comparativo de genomas para identificar marcadores genéticos em populações específicas.", category: "Biologia", likes: 178, members: 7, isNew: false, isTrending: true },
  { id: 5, title: "Sistema de Deploy Automatizado", description: "Pipeline CI/CD para deploy automatizado em múltiplos ambientes com monitoramento integrado.", category: "DevOps", likes: 210, members: 10, isNew: false, isTrending: true },
  { id: 6, title: "Framework para Microserviços", description: "Desenvolvimento de um framework especializado para criação de microserviços em Node.js.", category: "Desenvolvimento", likes: 156, members: 6, isNew: true, isTrending: false },
  { id: 7, title: "Otimização de Algoritmos Quânticos", description: "Pesquisa sobre técnicas de otimização para algoritmos em computação quântica.", category: "Matemática", likes: 98, members: 4, isNew: true, isTrending: false },
  { id: 8, title: "Análise de Expressão Gênica", description: "Estudo da expressão gênica em tecidos cancerígenos usando técnicas de bioinformática.", category: "Biologia", likes: 167, members: 9, isNew: false, isTrending: true },
  { id: 9, title: "Plataforma de Monitoramento de APIs", description: "Sistema completo para monitoramento e análise de performance de APIs em tempo real.", category: "DevOps", likes: 143, members: 5, isNew: true, isTrending: false },
  { id: 10, title: "App para Estudos de UX/UI", description: "Ferramenta colaborativa para testes e prototipagem de interfaces com usuários reais.", category: "Desenvolvimento", likes: 121, members: 7, isNew: false, isTrending: false },
];

// Categorias disponíveis
const categories = [
  { id: "all", name: "Todos", icon: Star },
  { id: "IA", name: "Inteligência Artificial", icon: Brain },
  { id: "Desenvolvimento", name: "Desenvolvimento", icon: Code },
  { id: "Biologia", name: "Biologia", icon: Dna },
  { id: "Matemática", name: "Matemática", icon: Calculator },
  { id: "DevOps", name: "DevOps", icon: Server },
];

export default function ExploreProjects() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filter, setFilter] = useState("all"); // all, trending, new

  // Gerar partículas para o background (igual à landing page)
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
  const filteredProjects = projectsData.filter(project => {
    const categoryMatch = selectedCategory === "all" || project.category === selectedCategory;
    
    if (filter === "trending") return categoryMatch && project.isTrending;
    if (filter === "new") return categoryMatch && project.isNew;
    
    return categoryMatch;
  });

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

          {/* Categorias */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-semibold text-slate-100 mb-6 text-center">Navegar por Categoria</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
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
                className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-6 hover:scale-105 transition-transform h-full flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 rounded-full bg-red-900/20 border border-red-700/50 text-red-400 text-xs font-medium">
                    {project.category}
                  </span>
                  <div className="flex gap-2">
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
                </div>
                
                <h3 className="text-xl font-semibold text-slate-100 mb-3">{project.title}</h3>
                <p className="text-slate-400 text-sm mb-4 flex-grow">{project.description}</p>
                
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
                  <div className="flex items-center text-slate-400 text-sm">
                    <Star size={16} className="mr-1 text-amber-400" fill="currentColor" />
                    <span>{project.likes}</span>
                  </div>
                  <div className="text-slate-400 text-sm">
                    <Users size={16} className="inline mr-1 text-blue-400" />
                    <span>{project.members} membros</span>
                  </div>
                  <button className="px-3 py-1 rounded-full bg-red-900/20 border border-red-700/50 text-red-400 text-xs font-medium hover:bg-red-900/30 transition-colors">
                    Participar
                  </button>
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