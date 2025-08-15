import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { WorksHeader } from "@/components/shared/WorksHeader";
import { WorksFilters } from "@/components/shared/WorksFilter";
import { WorksGrid } from "@/components/shared/WroksGrid";

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

export function WorksPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

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

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setSelectedArea("");
    setSelectedYear("");
  };

  const handleUpload = () => {
    // Lógica para submissão de novo trabalho
    console.log("Submeter novo trabalho");
  };

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
          <WorksHeader isMobile={false}  />

          <WorksFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            workTypes={workTypes}
            workAreas={workAreas}
            workYears={workYears}
            onClearFilters={handleClearFilters}
          />

          <WorksGrid works={filteredWorks} />

          {filteredWorks.length === 0 && (
            <Button
              variant="ghost"
              className="mt-4 text-red-400 hover:bg-red-900/20 mx-auto block"
              onClick={handleClearFilters}
            >
              Limpar filtros
            </Button>
          )}
        </motion.div>
      </main>
    </div>
  );
}