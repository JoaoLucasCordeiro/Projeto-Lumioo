import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search, Menu, Filter, Calendar } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useMemo } from "react";
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
import { useDebounce } from "@/hooks/useDebouce";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchProjectsPage } from "@/api/projects";
import { queryKeys } from "@/api/queryKeys";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export function ProjectsPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const filters = { search: debouncedSearchQuery, category: selectedCategory, year: selectedYear };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQuery({
      queryKey: queryKeys.projects.list(filters),
      queryFn: ({ pageParam }) =>
        fetchProjectsPage({ pageParam: pageParam as string | undefined, ...filters }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  const projects = data?.pages.flatMap((p) => p.projects) ?? [];

  const sentinelRef = useIntersectionObserver(
    fetchNextPage,
    (hasNextPage ?? false) && !isFetchingNextPage
  );

  const { categories, years } = useMemo(() => {
    const uniqueCategories = [...new Set(projects.map((p) => p.category))];
    const uniqueYears = [...new Set(projects.map((p) => p.year))].sort((a, b) =>
      b.localeCompare(a)
    );
    return { categories: uniqueCategories, years: uniqueYears };
  }, [projects]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedYear("all");
  };

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
      <main className="py-8 px-4 md:px-6 lg:px-8 overflow-y-auto flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <div className="hidden md:flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-100">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">
                Projetos de Pesquisa
              </span>
            </h2>
            <Button
              className="bg-[#ff3131] hover:bg-red-600 text-white font-bold"
              onClick={() => navigate('/novo-projeto')}
            >
              Novo Projeto
            </Button>
          </div>
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Pesquisar projetos..."
                className="pl-10 bg-slate-800 border-slate-700 text-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-200">
                  <Filter className="h-4 w-4 text-slate-400 mr-2" />
                  <SelectValue placeholder="Todos os nichos" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem className="text-slate-100" value="all">
                    Todos os nichos
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} className="text-slate-100" value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setSelectedYear} value={selectedYear}>
                <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-200">
                  <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                  <SelectValue placeholder="Todos os anos" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem className="text-slate-100" value="all">
                    Todos os anos
                  </SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} className="text-slate-100" value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="border-[#ff3131] bg-[#ff3131] text-white font-bold"
                onClick={handleClearFilters}
              >
                Limpar filtros
              </Button>
            </div>
          </div>
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Carregando projetos...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">{error.message}</div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProjectCard
                    {...project}
                    image={
                      project.image ||
                      "https://placehold.co/600x400/1e293b/ef4444?text=Projeto"
                    }
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">
                Nenhum projeto encontrado com os filtros selecionados
              </p>
              <Button
                className="mt-4 bg-[#ff3131] hover:bg-red-600 text-white font-bold"
                onClick={handleClearFilters}
              >
                Limpar filtros
              </Button>
            </div>
          )}

          {isFetchingNextPage && (
            <div className="text-center py-4 text-slate-400">Carregando mais...</div>
          )}
          <div ref={sentinelRef} />
        </motion.div>
      </main>
    </div>
  );
}
