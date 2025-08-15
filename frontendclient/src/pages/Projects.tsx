import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search, Menu, Filter, Calendar } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sidebar } from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { useNavigate } from "react-router-dom";

export function ProjectsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  // Projetos de exemplo
  const projects = [
    {
      id: '1',
      title: 'Sistema de Gestão de Pesquisas',
      description: 'Plataforma integrada para gerenciamento de projetos de pesquisa acadêmica com colaboração em tempo real.',
      category: 'Software',
      year: '2023',
      image: '/project1.jpg',
      members: 8,
      institution: 'UPE',
      status: 'Em andamento'
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
      status: 'Concluído'
    },
    {
      id: '3',
      title: 'Robótica Educacional',
      description: 'Desenvolvimento de kits de robótica acessíveis para escolas públicas.',
      category: 'Engenharia',
      year: '2023',
      image: '/project3.jpg',
      members: 12,
      institution: 'IFPE',
      status: 'Em andamento'
    },
    {
      id: '4',
      title: 'Biomateriais Sustentáveis',
      description: 'Pesquisa de novos materiais biodegradáveis para aplicação médica.',
      category: 'Biotecnologia',
      year: '2021',
      image: '/project4.jpg',
      members: 6,
      institution: 'UFRPE',
      status: 'Concluído'
    },
    {
      id: '5',
      title: 'Inteligência Artificial na Agricultura',
      description: 'Aplicação de modelos de ML para previsão de safras e otimização de recursos.',
      category: 'IA',
      year: '2023',
      image: '/project5.jpg',
      members: 7,
      institution: 'UPE',
      status: 'Em andamento'
    },
    {
      id: '6',
      title: 'Energias Renováveis',
      description: 'Estudo de viabilidade de microgeração eólica em zonas costeiras.',
      category: 'Energia',
      year: '2020',
      image: '/project6.jpg',
      members: 4,
      institution: 'UFPE',
      status: 'Concluído'
    }
  ];

  // Filtrar projetos
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" ? true : project.category === selectedCategory;
    const matchesYear = selectedYear === "all" ? true : project.year === selectedYear;

    return matchesSearch && matchesCategory && matchesYear;
  });

  // Categorias únicas para o filtro
  const categories = [...new Set(projects.map(p => p.category))];
  // Anos únicos para o filtro
  const years = [...new Set(projects.map(p => p.year))].sort((a, b) => b.localeCompare(a));

  const navigate = useNavigate();

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
          {/* Cabeçalho Mobile */}
          <div className="md:hidden flex items-center justify-between mb-8 pt-12">
            <h2 className="text-2xl font-bold text-slate-100">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">Projetos</span>
            </h2>
          </div>

          {/* Cabeçalho Desktop */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-100">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">Projetos de Pesquisa</span>
            </h2>
            <Button
              className="bg-[#ff3131] hover:bg-red-600 text-white font-bold shadow-lg shadow-[#ff3131]/20 hover:shadow-[#ff3131]/40 transition-all duration-300"
              onClick={() => navigate('/novo-projeto')}
            >
              Novo Projeto
            </Button>
          </div>

          {/* Barra de Pesquisa e Filtros */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Pesquisar projetos..."
                className="pl-10 bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-red-500 focus-visible:ring-offset-slate-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="flex-1">
                <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                  <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-200 flex items-center">
                    <Filter className="h-4 w-4 text-slate-400 mr-2" />
                    <SelectValue placeholder="Todos os nichos" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem className="text-slate-100" value="all">Todos os nichos</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} className="text-slate-100" value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Select onValueChange={setSelectedYear} value={selectedYear}>
                  <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-200 flex items-center">
                    <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                    <SelectValue placeholder="Todos os anos" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem className="text-slate-100" value="all">Todos os anos</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} className="text-slate-100" value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="border-[#ff3131] bg-[#ff3131] text-white font-bold shadow-lg shadow-[#ff3131]/20 hover:bg-red-600 hover:shadow-[#ff3131]/40 transition-all duration-300"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedYear("all");
                }}
              >
                Limpar filtros
              </Button>

            </div>
          </div>

          {/* Lista de Projetos */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProjectCard {...project} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">Nenhum projeto encontrado com os filtros selecionados</p>
              <Button
                className="mt-4 bg-[#ff3131] hover:bg-red-600 text-white font-bold shadow-lg shadow-[#ff3131]/20 hover:shadow-[#ff3131]/40 transition-all duration-300"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedYear("all");
                }}
              >
                Limpar filtros
              </Button>

            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
