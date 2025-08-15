import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Users, BookOpen, Calendar, Download, ArrowLeft} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

// Dados de exemplo (deveriam vir de uma API na prática)
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
    image: '/works/ai-health.jpg',
    detailedDescription: 'Este trabalho apresenta uma abordagem inovadora para o diagnóstico precoce de doenças raras utilizando redes neurais convolucionais. O estudo foi realizado em parceria com o Hospital das Clínicas, analisando um dataset de mais de 10.000 imagens médicas. Os resultados mostram uma acurácia de 92.3% no diagnóstico precoce, superando métodos tradicionais em 15%. A pesquisa contribui significativamente para o campo da medicina diagnóstica assistida por computador.',
    advisor: 'Prof. Dr. Marcos Antônio Lima',
    institution: 'Universidade Federal de Pernambuco',
    department: 'Departamento de Ciência da Computação',
    references: [
      'LEE, S. et al. Deep learning in medical imaging. Neurospine, 2019.',
      'WANG, X. et al. Rare disease diagnosis with AI. Nature Medicine, 2021.'
    ]
  },
  // ... outros trabalhos (adicionar conforme necessário)
];

export function WorkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Encontrar o trabalho com base no ID
  const work = academicWorks.find(w => w.id === id);
  
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
      <main className="py-8 px-4 md:px-6 lg:px-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mx-auto"
        >
          {/* Cabeçalho Mobile */}
          <div className="md:hidden flex items-center justify-between mb-8 pt-12">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/trabalhos')}
              className="text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h2 className="text-xl font-bold text-slate-100">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">Detalhes</span>
            </h2>
          </div>

          {/* Cabeçalho Desktop */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/trabalhos')}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para trabalhos
            </Button>
          </div>

          {/* Conteúdo do trabalho */}
          <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 mb-8">
            {/* Imagem principal */}
            <div className="h-64 md:h-80 bg-slate-700 relative overflow-hidden">
              <img 
                src={work.image} 
                alt={work.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4">
                <Badge variant="outline" className="bg-red-900/20 border-red-700/50 text-red-400">
                  {work.type}
                </Badge>
              </div>
            </div>
            
            {/* Informações principais */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">{work.title}</h1>
                  <p className="text-lg text-slate-300 mb-4">{work.author}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-slate-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{work.year}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{work.area}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{work.downloads.toLocaleString()} downloads</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  size="lg"
                  className="bg-[#ff3131] hover:bg-red-600 text-white font-bold shadow-lg shadow-[#ff3131]/20 hover:shadow-[#ff3131]/40 transition-all duration-300"
                  onClick={() => window.open(work.fileUrl, '_blank')}
                >
                  <Download className="h-5 w-5 mr-2" />
                  Baixar Trabalho
                </Button>
              </div>
              
              {/* Resumo */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-100 mb-3">Resumo</h2>
                <p className="text-slate-300">{work.abstract}</p>
              </div>
              
              {/* Descrição detalhada */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-100 mb-3">Descrição Detalhada</h2>
                <p className="text-slate-300 whitespace-pre-line">{work.detailedDescription}</p>
              </div>
              
              {/* Metadados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="font-medium text-slate-100 mb-2">Orientador</h3>
                  <p className="text-slate-300">{work.advisor}</p>
                </div>
                
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="font-medium text-slate-100 mb-2">Instituição</h3>
                  <p className="text-slate-300">{work.institution}</p>
                </div>
                
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="font-medium text-slate-100 mb-2">Departamento</h3>
                  <p className="text-slate-300">{work.department}</p>
                </div>
                
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="font-medium text-slate-100 mb-2">Tipo de Trabalho</h3>
                  <p className="text-slate-300">{work.type}</p>
                </div>
              </div>
              
              {/* Palavras-chave */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-100 mb-3">Palavras-chave</h2>
                <div className="flex flex-wrap gap-2">
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
              </div>
              
              {/* Referências */}
              {work.references && work.references.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-100 mb-3">Referências Bibliográficas</h2>
                  <div className="space-y-2">
                    {work.references.map((ref, index) => (
                      <p key={index} className="text-sm text-slate-400">{ref}</p>
                    ))}
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