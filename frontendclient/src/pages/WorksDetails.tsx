import { useParams, useNavigate, Link } from "react-router-dom"; // Adicionado Link
import { motion } from "framer-motion";
import { Menu, Users, BookOpen, Calendar, Download, ArrowLeft} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface WorkDetailsData {
  id: string;
  title: string;
  author: string;
  authorUsername: string; 
  type: string;
  area: string;
  year: string;
  abstract: string;
  keywords: string[];
  downloads: number;
  image: string | null;
  detailedDescription: string;
  advisor: string;
  institution: string;
  department: string | null;
  references: string[];
}

export function WorkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const [work, setWork] = useState<WorkDetailsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWork = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/works/${id}`);
      if (!response.ok) throw new Error("Trabalho não encontrado");
      const data = await response.json();
      setWork(data);
    } catch (error) {
      console.error("Erro ao buscar dados do trabalho:", error);
      setWork(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWork();
  }, [fetchWork]);

  const handleDownload = async () => {
    if (!work) return;
    try {
        const response = await fetch(`${API_URL}/works/${work.id}/download`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Falha no download");

        const byteCharacters = atob(data.pdfFile.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        setWork(prevWork => prevWork ? { ...prevWork, downloads: prevWork.downloads + 1 } : null);
    } catch (error) {
        console.error("Download error:", error);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Carregando detalhes do trabalho...</p>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Trabalho não encontrado</h2>
          <Button 
            onClick={() => navigate('/trabalhos')}
            className="bg-[#ff3131] hover:bg-red-600 text-white"
          >
            Voltar para trabalhos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 grid grid-cols-1 md:grid-cols-[280px_1fr]">
      <div className="hidden md:block sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </div>
      <div className="md:hidden fixed top-4 left-4 z-20">
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-slate-800/50 backdrop-blur-sm border-slate-700 text-slate-200 hover:bg-slate-700/50">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-slate-900/95 backdrop-blur-sm border-slate-800 p-0 w-[280px]">
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
            <Button variant="ghost" onClick={() => navigate('/trabalhos')} className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para trabalhos
            </Button>
          </div>
          <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 mb-8">
            <div className="h-64 md:h-80 bg-slate-700 relative overflow-hidden">
              <img 
                src={work.image || "https://placehold.co/1200x400/1e293b/ef4444?text=Lumioo"} 
                alt={work.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4">
                <Badge variant="outline" className="bg-red-900/20 border-red-700/50 text-red-400">{work.type}</Badge>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">{work.title}</h1>
                  <Link to={`/perfil/${work.authorUsername}`}>
                    <p className="text-lg text-slate-300 mb-4 hover:text-red-400 transition-colors">{work.author}</p>
                  </Link>
                  <div className="flex flex-wrap items-center gap-4 text-slate-400 mb-4">
                    <div className="flex items-center space-x-1"><Calendar className="h-4 w-4" /><span>{work.year}</span></div>
                    <div className="flex items-center space-x-1"><BookOpen className="h-4 w-4" /><span>{work.area}</span></div>
                    <div className="flex items-center space-x-1"><Users className="h-4 w-4" /><span>{work.downloads.toLocaleString()} downloads</span></div>
                  </div>
                </div>
                <Button size="lg" className="bg-green-600 text-white hover:text-white hover:bg-green-700 border-none" onClick={handleDownload}>
                  <Download className="h-5 w-5 mr-2" />
                  Baixar Trabalho
                </Button>
              </div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-100 mb-3">Resumo</h2>
                <p className="text-slate-300">{work.abstract}</p>
              </div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-100 mb-3">Descrição Detalhada</h2>
                <p className="text-slate-300 whitespace-pre-line">{work.detailedDescription}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50"><h3 className="font-medium text-slate-100 mb-2">Orientador</h3><p className="text-slate-300">{work.advisor}</p></div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50"><h3 className="font-medium text-slate-100 mb-2">Instituição</h3><p className="text-slate-300">{work.institution}</p></div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50"><h3 className="font-medium text-slate-100 mb-2">Departamento</h3><p className="text-slate-300">{work.department || 'Não informado'}</p></div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50"><h3 className="font-medium text-slate-100 mb-2">Tipo de Trabalho</h3><p className="text-slate-300">{work.type}</p></div>
              </div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-100 mb-3">Palavras-chave</h2>
                <div className="flex flex-wrap gap-2">
                  {work.keywords.map(keyword => (<Badge key={keyword} variant="outline" className="bg-slate-700/50 border-slate-600 text-slate-300">{keyword}</Badge>))}
                </div>
              </div>
              {work.references && work.references.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-100 mb-3">Referências Bibliográficas</h2>
                  <div className="space-y-2">
                    {work.references.map((ref, index) => (<p key={index} className="text-sm text-slate-400">{ref}</p>))}
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