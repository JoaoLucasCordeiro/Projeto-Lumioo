// src/pages/WorksPage.tsx
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState, useMemo } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { WorksHeader } from "@/components/shared/WorksHeader";
import { WorksFilters } from "@/components/shared/WorksFilter";
import { WorksGrid } from "@/components/shared/WroksGrid";
import { useDebounce } from "@/hooks/useDebouce";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchWorksPage, WORK_AREA_OPTIONS } from "@/api/works";
import { queryKeys } from "@/api/queryKeys";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/600x400/1e293b/ef4444?text=Lumioo";

export function WorksPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const filters = {
    search: debouncedSearchQuery,
    workType: selectedType,
    year: selectedYear,
    area: selectedArea,
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQuery({
      queryKey: queryKeys.works.list(filters),
      queryFn: ({ pageParam }) =>
        fetchWorksPage({ pageParam: pageParam as string | undefined, ...filters }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  const allWorks = data?.pages.flatMap((p) => p.works) ?? [];

  const sentinelRef = useIntersectionObserver(
    fetchNextPage,
    (hasNextPage ?? false) && !isFetchingNextPage
  );

  const { workTypes, workYears } = useMemo(() => {
    const types = [...new Set(allWorks.map((work) => work.type))];
    const years = [...new Set(allWorks.map((work) => work.year))].sort((a, b) =>
      b.localeCompare(a)
    );
    return { workTypes: types, workYears: years };
  }, [allWorks]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setSelectedArea("");
    setSelectedYear("");
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
          className="w-full max-w-6xl"
        >
          <WorksHeader isMobile={false} />

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
            workAreas={WORK_AREA_OPTIONS}
            workYears={workYears}
            onClearFilters={handleClearFilters}
          />

          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Carregando trabalhos...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">{error.message}</div>
          ) : (
            <>
              <WorksGrid
                works={allWorks.map((work) => ({
                  ...work,
                  image: work.image || PLACEHOLDER_IMAGE_URL,
                }))}
              />

              {allWorks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-400 mb-4">
                    Nenhum trabalho encontrado com os filtros aplicados.
                  </p>
                  <Button
                    variant="ghost"
                    className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
                    onClick={handleClearFilters}
                  >
                    Limpar filtros
                  </Button>
                </div>
              )}
            </>
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
