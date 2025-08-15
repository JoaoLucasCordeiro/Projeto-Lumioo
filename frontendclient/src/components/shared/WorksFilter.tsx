import { Search, Filter, BookOpen, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface WorksFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedArea: string;
  setSelectedArea: (value: string) => void;
  selectedYear: string;
  setSelectedYear: (value: string) => void;
  workTypes: string[];
  workAreas: string[];
  workYears: string[];
  onClearFilters: () => void;
}

export function WorksFilters({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  selectedArea,
  setSelectedArea,
  selectedYear,
  setSelectedYear,
  workTypes,
  workAreas,
  workYears,
  onClearFilters
}: WorksFiltersProps) {
  return (
    <div className="mb-8 space-y-4">
      {/* Campo de Pesquisa */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Pesquisar trabalhos, autores, palavras-chave..."
          className="pl-10 bg-slate-800 border-slate-700 text-slate-200 focus-visible:ring-red-500 focus-visible:ring-offset-slate-900 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filtros + Botão Limpar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Tipo */}
        <div className="flex-1 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Select
            value={selectedType || "all"}
            onValueChange={(val) => setSelectedType(val === "all" ? "" : val)}
          >
            <SelectTrigger className="w-full pl-10 bg-slate-800 border-slate-700 text-slate-200 flex items-center">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-slate-100">Todos os tipos</SelectItem>
              {workTypes.map(type => (
                <SelectItem key={type} value={type} className="text-slate-100">{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Área */}
        <div className="flex-1 relative">
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Select
            value={selectedArea || "all"}
            onValueChange={(val) => setSelectedArea(val === "all" ? "" : val)}
          >
            <SelectTrigger className="w-full pl-10 bg-slate-800 border-slate-700 text-slate-200 flex items-center">
              <SelectValue placeholder="Todas as áreas" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-slate-100">Todas as áreas</SelectItem>
              {workAreas.map(area => (
                <SelectItem key={area} value={area} className="text-slate-100">{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ano */}
        <div className="flex-1 relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Select
            value={selectedYear || "all"}
            onValueChange={(val) => setSelectedYear(val === "all" ? "" : val)}
          >
            <SelectTrigger className="w-full pl-10 bg-slate-800 border-slate-700 text-slate-200 flex items-center">
              <SelectValue placeholder="Todos os anos" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-slate-100">Todos os anos</SelectItem>
              {workYears.map(year => (
                <SelectItem key={year} value={year} className="text-slate-100">{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botão Limpar filtros */}
        <div className="flex items-center">
          <Button
            className="border-[#ff3131] bg-[#ff3131] text-white font-bold shadow-lg shadow-[#ff3131]/20 hover:bg-red-600 hover:shadow-[#ff3131]/40 transition-all duration-300"
            onClick={onClearFilters}
          >
            Limpar filtros
          </Button>
        </div>
      </div>
    </div>
  );
}