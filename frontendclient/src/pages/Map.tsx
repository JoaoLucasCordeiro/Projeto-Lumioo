import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, MapPin, Filter, BookOpen, Tag } from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { fetchWorkStats, fetchWorksPage, WORK_AREA_OPTIONS } from "@/api/works";
import { fetchProjectStats, fetchProjectsPage } from "@/api/projects";
import {
  BRAZIL_UF_COORDINATES,
  BRAZIL_UF_NAMES,
  COUNTRY_COORDINATES,
  PE_CITY_COORDINATES,
  type LatLng,
} from "@/lib/mapCoordinates";

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const WORK_TYPE_OPTIONS = [
  { value: "TCC", label: "TCC" },
  { value: "ARTICLE", label: "Artigo Científico" },
  { value: "THESIS", label: "Tese" },
  { value: "DISSERTATION", label: "Dissertação" },
];

type EntityFilter = "both" | "works" | "projects";

interface LocationFilter {
  state?: string;
  city?: string;
  country?: string;
}

interface LocationPoint {
  key: string;
  label: string;
  coords: LatLng;
  works: number;
  projects: number;
  filter: LocationFilter;
}

function addPoint(
  map: Map<string, LocationPoint>,
  key: string,
  label: string,
  coords: LatLng,
  count: number,
  kind: "works" | "projects",
  filter: LocationFilter
) {
  if (count <= 0) return;
  const existing = map.get(key);
  if (existing) {
    existing[kind] += count;
    return;
  }
  map.set(key, { key, label, coords, works: 0, projects: 0, filter, [kind]: count } as LocationPoint);
}

function LocationPopupBody({ point, isActive }: { point: LocationPoint; isActive: boolean }) {
  const workItems = useQuery({
    queryKey: ["works", "map-preview", point.filter],
    queryFn: () => fetchWorksPage({ ...point.filter }),
    enabled: isActive && point.works > 0,
  });
  const projectItems = useQuery({
    queryKey: ["projects", "map-preview", point.filter],
    queryFn: () => fetchProjectsPage({ ...point.filter }),
    enabled: isActive && point.projects > 0,
  });

  return (
    <div className="min-w-[220px] max-w-[260px]">
      <p className="font-semibold text-slate-100 mb-2">{point.label}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {point.works > 0 && (
          <Badge variant="outline" className="bg-red-900/30 border-red-700/50 text-red-300">
            {point.works} {point.works === 1 ? "Trabalho" : "Trabalhos"}
          </Badge>
        )}
        {point.projects > 0 && (
          <Badge variant="outline" className="bg-slate-700/50 border-slate-600 text-slate-200">
            {point.projects} {point.projects === 1 ? "Projeto" : "Projetos"}
          </Badge>
        )}
      </div>
      {isActive && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {workItems.data?.works.slice(0, 5).map((w) => (
            <Link
              key={w.id}
              to={`/trabalhos/${w.id}`}
              className="block text-xs text-red-400 hover:text-red-300 hover:underline truncate"
            >
              {w.title}
            </Link>
          ))}
          {projectItems.data?.projects.slice(0, 5).map((p) => (
            <Link
              key={p.id}
              to={`/projetos/${p.id}`}
              className="block text-xs text-red-400 hover:text-red-300 hover:underline truncate"
            >
              {p.title}
            </Link>
          ))}
          {(workItems.isLoading || projectItems.isLoading) && (
            <p className="text-xs text-slate-400">Carregando...</p>
          )}
        </div>
      )}
    </div>
  );
}

export function MapPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [entity, setEntity] = useState<EntityFilter>("both");
  const [workType, setWorkType] = useState("");
  const [area, setArea] = useState("");
  const [category, setCategory] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const showWorks = entity === "both" || entity === "works";
  const showProjects = entity === "both" || entity === "projects";

  const workState = useQuery({
    queryKey: ["works", "stats", { dimension: "state", workType, area }],
    queryFn: () => fetchWorkStats({ dimension: "state", workType, area, limit: 50 }),
    enabled: showWorks,
  });
  const workCountry = useQuery({
    queryKey: ["works", "stats", { dimension: "country", workType, area }],
    queryFn: () => fetchWorkStats({ dimension: "country", workType, area, limit: 50 }),
    enabled: showWorks,
  });
  const workPeCity = useQuery({
    queryKey: ["works", "stats", { dimension: "city", state: "PE", workType, area }],
    queryFn: () => fetchWorkStats({ dimension: "city", state: "PE", workType, area, limit: 50 }),
    enabled: showWorks,
  });

  const projectState = useQuery({
    queryKey: ["projects", "stats", { dimension: "state", category }],
    queryFn: () => fetchProjectStats({ dimension: "state", category, limit: 50 }),
    enabled: showProjects,
  });
  const projectCountry = useQuery({
    queryKey: ["projects", "stats", { dimension: "country", category }],
    queryFn: () => fetchProjectStats({ dimension: "country", category, limit: 50 }),
    enabled: showProjects,
  });
  const projectPeCity = useQuery({
    queryKey: ["projects", "stats", { dimension: "city", state: "PE", category }],
    queryFn: () => fetchProjectStats({ dimension: "city", state: "PE", category, limit: 50 }),
    enabled: showProjects,
  });

  const categoryOptions = useQuery({
    queryKey: ["projects", "stats", { dimension: "category", forFilter: true }],
    queryFn: () => fetchProjectStats({ dimension: "category", limit: 50 }),
  });

  const isLoading =
    (showWorks && (workState.isLoading || workCountry.isLoading || workPeCity.isLoading)) ||
    (showProjects && (projectState.isLoading || projectCountry.isLoading || projectPeCity.isLoading));

  const points = useMemo(() => {
    const map = new Map<string, LocationPoint>();
    const peCurated = { works: 0, projects: 0 };

    for (const item of workState.data?.items ?? []) {
      if (item.value === "PE") continue;
      const coords = BRAZIL_UF_COORDINATES[item.value];
      if (!coords) continue;
      addPoint(map, `state:${item.value}`, BRAZIL_UF_NAMES[item.value] ?? item.value, coords, item.count, "works", {
        state: item.value,
      });
    }
    for (const item of projectState.data?.items ?? []) {
      if (item.value === "PE") continue;
      const coords = BRAZIL_UF_COORDINATES[item.value];
      if (!coords) continue;
      addPoint(map, `state:${item.value}`, BRAZIL_UF_NAMES[item.value] ?? item.value, coords, item.count, "projects", {
        state: item.value,
      });
    }

    for (const item of workCountry.data?.items ?? []) {
      if (item.value === "Brasil") continue;
      const coords = COUNTRY_COORDINATES[item.value];
      if (!coords) continue;
      addPoint(map, `country:${item.value}`, item.value, coords, item.count, "works", { country: item.value });
    }
    for (const item of projectCountry.data?.items ?? []) {
      if (item.value === "Brasil") continue;
      const coords = COUNTRY_COORDINATES[item.value];
      if (!coords) continue;
      addPoint(map, `country:${item.value}`, item.value, coords, item.count, "projects", { country: item.value });
    }

    for (const item of workPeCity.data?.items ?? []) {
      const coords = PE_CITY_COORDINATES[item.value];
      if (!coords) continue;
      addPoint(map, `city:${item.value}`, item.value, coords, item.count, "works", { state: "PE", city: item.value });
      peCurated.works += item.count;
    }
    for (const item of projectPeCity.data?.items ?? []) {
      const coords = PE_CITY_COORDINATES[item.value];
      if (!coords) continue;
      addPoint(map, `city:${item.value}`, item.value, coords, item.count, "projects", {
        state: "PE",
        city: item.value,
      });
      peCurated.projects += item.count;
    }

    const workPeTotal = workState.data?.items.find((i) => i.value === "PE")?.count ?? 0;
    const projectPeTotal = projectState.data?.items.find((i) => i.value === "PE")?.count ?? 0;
    const workResidual = workPeTotal - peCurated.works;
    const projectResidual = projectPeTotal - peCurated.projects;
    if (workResidual > 0) {
      addPoint(map, "state:PE", "Pernambuco (outras cidades)", BRAZIL_UF_COORDINATES.PE, workResidual, "works", {
        state: "PE",
      });
    }
    if (projectResidual > 0) {
      addPoint(map, "state:PE", "Pernambuco (outras cidades)", BRAZIL_UF_COORDINATES.PE, projectResidual, "projects", {
        state: "PE",
      });
    }

    return Array.from(map.values());
  }, [
    workState.data,
    workCountry.data,
    workPeCity.data,
    projectState.data,
    projectCountry.data,
    projectPeCity.data,
  ]);

  const totalWorks = points.reduce((sum, p) => sum + p.works, 0);
  const totalProjects = points.reduce((sum, p) => sum + p.projects, 0);

  const handleClearFilters = () => {
    setEntity("both");
    setWorkType("");
    setArea("");
    setCategory("");
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
          <div className="mb-8 pt-12 md:pt-0">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">
                Mapa Acadêmico
              </span>
            </h2>
            <p className="text-slate-400 mt-2">
              Onde estão os trabalhos e projetos da nossa comunidade — {totalWorks} trabalhos e{" "}
              {totalProjects} projetos localizados.
            </p>
          </div>

          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Select value={entity} onValueChange={(v) => setEntity(v as EntityFilter)}>
                <SelectTrigger className="w-full pl-10 bg-slate-800 border-slate-700 text-slate-200 flex items-center">
                  <SelectValue placeholder="Ambos" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectItem value="both" className="hover:bg-slate-700/50 focus:bg-slate-700/50">
                    Trabalhos e Projetos
                  </SelectItem>
                  <SelectItem value="works" className="hover:bg-slate-700/50 focus:bg-slate-700/50">
                    Somente Trabalhos
                  </SelectItem>
                  <SelectItem value="projects" className="hover:bg-slate-700/50 focus:bg-slate-700/50">
                    Somente Projetos
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showWorks && (
              <div className="flex-1 relative w-full">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Select value={workType || "all"} onValueChange={(v) => setWorkType(v === "all" ? "" : v)}>
                  <SelectTrigger className="w-full pl-10 bg-slate-800 border-slate-700 text-slate-200 flex items-center">
                    <SelectValue placeholder="Tipo de trabalho" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectItem value="all" className="hover:bg-slate-700/50 focus:bg-slate-700/50">
                      Todos os tipos
                    </SelectItem>
                    {WORK_TYPE_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="hover:bg-slate-700/50 focus:bg-slate-700/50"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showWorks && (
              <div className="flex-1 relative w-full">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Select value={area || "all"} onValueChange={(v) => setArea(v === "all" ? "" : v)}>
                  <SelectTrigger className="w-full pl-10 bg-slate-800 border-slate-700 text-slate-200 flex items-center">
                    <SelectValue placeholder="Área do conhecimento" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectItem value="all" className="hover:bg-slate-700/50 focus:bg-slate-700/50">
                      Todas as áreas
                    </SelectItem>
                    {WORK_AREA_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="hover:bg-slate-700/50 focus:bg-slate-700/50"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showProjects && (
              <div className="flex-1 relative w-full">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? "" : v)}>
                  <SelectTrigger className="w-full pl-10 bg-slate-800 border-slate-700 text-slate-200 flex items-center">
                    <SelectValue placeholder="Categoria do projeto" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectItem value="all" className="hover:bg-slate-700/50 focus:bg-slate-700/50">
                      Todas as categorias
                    </SelectItem>
                    {(categoryOptions.data?.items ?? []).map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="hover:bg-slate-700/50 focus:bg-slate-700/50"
                      >
                        {opt.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              className="border-[#ff3131] bg-[#ff3131] text-white font-bold shadow-lg shadow-[#ff3131]/20 hover:bg-red-600 hover:shadow-[#ff3131]/40 transition-all duration-300 w-full md:w-auto"
              onClick={handleClearFilters}
            >
              Limpar filtros
            </Button>
          </div>

          <div className="h-[560px] rounded-lg overflow-hidden border border-slate-700/50 relative">
            {isLoading && (
              <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 pointer-events-none">
                <p className="text-slate-300">Carregando mapa...</p>
              </div>
            )}
            <MapContainer center={[-8.0476, -37.5]} zoom={7} className="h-full w-full">
              <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
              {points.map((point) => {
                const total = point.works + point.projects;
                const radius = Math.min(28, 8 + Math.sqrt(total) * 4);
                return (
                  <CircleMarker
                    key={point.key}
                    center={point.coords}
                    radius={radius}
                    pathOptions={{ color: "#ff3131", fillColor: "#ff3131", fillOpacity: 0.5, weight: 1.5 }}
                    eventHandlers={{
                      popupopen: () => setActiveKey(point.key),
                      popupclose: () => setActiveKey((k) => (k === point.key ? null : k)),
                    }}
                  >
                    <Popup>
                      <LocationPopupBody point={point} isActive={activeKey === point.key} />
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          {!isLoading && points.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400">
                Nenhum trabalho ou projeto com localização encontrado para esses filtros.
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
