import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search, Menu, Filter, FileText, BookOpen, Calendar, Download } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Sidebar } from "./Sidebar";
import { Button } from "../ui/button";

export function WorksPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  // Trabalhos acadêmicos (dados de exemplo)
  const academicWorks = [
    {
      id: '1',
      title: 'Inteligência Artificial no Diagnóstico de Doenças Raras',
      author: 'Carlos Eduardo Silva',
      type: 'TCC',
      area: 'Ciência da Computação',
      year: '2023',
      abstract: 'Este trabalho investiga a aplicação de modelos de deep learning para diagnóstico precoce de doenças raras utilizando imagens médicas.',
      keywords: ['IA', 'Saúde', 'Diagnóstico'],
      downloads: 1243,
      fileUrl: '/files/tcc-carlos.pdf',
      image: '/works/ai-health.jpg'
    },
    {
      id: '2',
      title: 'Análise Comparativa de Algoritmos de Otimização',
      author: 'Mariana Oliveira Santos',
      type: 'Artigo',
      area: 'Engenharia de Software',
      year: '2022',
      abstract: 'Comparação detalhada entre diferentes algoritmos de otimização aplicados a problemas de roteamento logístico.',
      keywords: ['Otimização', 'Algoritmos', 'Logística'],
      downloads: 856,
      fileUrl: '/files/artigo-mariana.pdf',
      image: '/works/algorithms.jpg'
    },
    {
      id: '3',
      title: 'Sustentabilidade na Construção Civil',
      author: 'João Pedro Almeida',
      type: 'Dissertação',
      area: 'Engenharia Civil',
      year: '2021',
      abstract: 'Estudo sobre materiais sustentáveis e técnicas construtivas com menor impacto ambiental.',
      keywords: ['Sustentabilidade', 'Construção Civil', 'Meio Ambiente'],
      downloads: 1567,
      fileUrl: '/files/dissertacao-joao.pdf',
      image: '/works/construction.jpg'
    },
    {
      id: '4',
      title: 'Impacto das Redes Sociais na Saúde Mental',
      author: 'Ana Beatriz Costa',
      type: 'TCC',
      area: 'Psicologia',
      year: '2023',
      abstract: 'Análise do impacto do uso prolongado de redes sociais nos índices de ansiedade e depressão em jovens adultos.',
      keywords: ['Psicologia', 'Redes Sociais', 'Saúde Mental'],
      downloads: 2105,
      fileUrl: '/files/tcc-ana.pdf',
      image: '/works/social-media.jpg'
    },
    {
      id: '5',
      title: 'Novos Materiais para Armazenamento de Energia',
      author: 'Fernando Gomes Pereira',
      type: 'Tese',
      area: 'Engenharia de Materiais',
      year: '2020',
      abstract: 'Desenvolvimento e caracterização de novos materiais nanocompósitos para aplicação em baterias de alta capacidade.',
      keywords: ['Materiais', 'Energia', 'Nanotecnologia'],
      downloads: 987,
      fileUrl: '/files/tese-fernando.pdf',
      image: '/works/materials.jpg'
    },
    {
      id: '6',
      title: 'Educação Inclusiva no Ensino Superior',
      author: 'Patrícia Lima Rodrigues',
      type: 'Artigo',
      area: 'Educação',
      year: '2022',
      abstract: 'Análise das políticas de inclusão e acessibilidade em instituições de ensino superior brasileiras.',
      keywords: ['Educação', 'Inclusão', 'Acessibilidade'],
      downloads: 754,
      fileUrl: '/files/artigo-patricia.pdf',
      image: '/works/education.jpg'
    }
  ];

  // Filtrar trabalhos
  const filteredWorks = academicWorks.filter(work => {
    const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         work.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         work.abstract.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType ? work.type === selectedType : true;
    const matchesYear = selectedYear ? work.year === selectedYear : true;
    const matchesArea = selectedArea ? work.area === selectedArea : true;
    
    return matchesSearch && matchesType && matchesYear && matchesArea;
  });

  // Valores únicos para filtros
  const workTypes = [...new Set(academicWorks.map(work => work.type))];
  const workYears = [...new Set(academicWorks.map(work => work.year))].sort((a, b) => b.localeCompare(a));
  const workAreas = [...new Set(academicWorks.map(work => work.area))];

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
          className="w-full max-w-6xl"
        >
          {/* Cabeçalho Mobile */}
          <div className="md:hidden flex items-center justify-between mb-8 pt-12">
            <h2 className="text-2xl font-bold text-slate-100">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">Trabalhos Acadêmicos</span>
            </h2>
          </div>

          {/* Cabeçalho Desktop */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-100">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">Repositório Acadêmico</span>
              </h2>
              <p className="text-slate-400 mt-2">TCCs, artigos, dissertações e teses da nossa universidade</p>
            </div>
            <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-900/20">
              <FileText className="h-5 w-5 mr-2" />
              Submeter Trabalho
            </Button>
          </div>

          {/* Barra de Pesquisa e Filtros */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Pesquisar trabalhos, autores, palavras-chave..."
                className="pl-10 bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-red-500 focus-visible:ring-offset-slate-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tipo */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <Select onValueChange={(val) => setSelectedType(val === "all" ? "" : val)} value={selectedType || "all"}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {workTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Área */}
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-slate-400" />
                <Select onValueChange={(val) => setSelectedArea(val === "all" ? "" : val)} value={selectedArea || "all"}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Todas as áreas" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">Todas as áreas</SelectItem>
                    {workAreas.map(area => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ano */}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <Select onValueChange={(val) => setSelectedYear(val === "all" ? "" : val)} value={selectedYear || "all"}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Todos os anos" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">Todos os anos</SelectItem>
                    {workYears.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                variant="outline" 
                className="border-slate-700 text-slate-300 hover:bg-slate-800/50"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("");
                  setSelectedArea("");
                  setSelectedYear("");
                }}
              >
                Limpar filtros
              </Button>
            </div>
          </div>

          {/* Lista de Trabalhos */}
          {filteredWorks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorks.map((work, index) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700 hover:border-red-500/30 transition-colors h-full flex flex-col">
                    <CardHeader className="p-0">
                      <div className="h-48 overflow-hidden rounded-t-lg">
                        <img 
                          src={work.image} 
                          alt={work.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="bg-red-900/20 border-red-700/50 text-red-400">
                          {work.type}
                        </Badge>
                        <span className="text-sm text-slate-400">{work.year}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-2">{work.title}</h3>
                      <p className="text-sm text-slate-300 mb-3">{work.author}</p>
                      <p className="text-sm text-slate-400 line-clamp-3 mb-4">{work.abstract}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {work.keywords.map(keyword => (
                          <Badge 
                            key={keyword} 
                            variant="outline" 
                            className="bg-slate-700/50 border-slate-600 text-slate-300"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 border-t border-slate-700/50 flex justify-between items-center">
                      <span className="text-sm text-slate-400 flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        {work.downloads.toLocaleString()}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-500/50 text-red-400 hover:bg-red-900/20"
                        asChild
                      >
                        <a href={work.fileUrl} download>
                          Baixar
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">Nenhum trabalho encontrado com os filtros selecionados</p>
              <Button 
                variant="ghost" 
                className="mt-4 text-red-400 hover:bg-red-900/20"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("");
                  setSelectedArea("");
                  setSelectedYear("");
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
