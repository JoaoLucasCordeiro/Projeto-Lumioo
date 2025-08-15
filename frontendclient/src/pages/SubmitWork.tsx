import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, FileText, FileUp, User, BookOpen, Building, Hash } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeedLayout } from "@/components/shared/FeedLayout";

const WORK_TYPES = [
  "TCC",
  "Artigo Científico",
  "Dissertação",
  "Tese",
  "Monografia",
  "Relatório Técnico",
  "Projeto de Pesquisa"
];

export function SubmitWorkPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    coverImage: null as string | null,
    abstract: "",
    description: "",
    advisor: "",
    institution: "",
    department: "",
    workType: "",
    keywords: [] as string[],
    references: "",
    pdfFile: null as File | null
  });
  const [newKeyword, setNewKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, coverImage: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, pdfFile: e.target.files![0] }));
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword)) {
      setFormData(prev => ({ ...prev, keywords: [...prev.keywords, newKeyword] }));
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove) 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Navegar de volta após submissão
    navigate('/trabalhos');
  };

  return (
    <FeedLayout 
      mobileSidebarOpen={false} 
      setMobileSidebarOpen={() => {}}
    >
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
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <h2 className="text-xl font-bold text-slate-100">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-[#ff3131]">Submeter Trabalho</span>
          </h2>
        </div>

        {/* Cabeçalho Desktop */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/trabalhos')}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            <X className="h-4 w-4 mr-2" />
            Voltar para trabalhos
          </Button>
          
          <Button
            type="submit"
            form="submit-work-form"
            disabled={!formData.pdfFile || isLoading}
            className="bg-[#ff3131] hover:bg-red-600 text-white font-bold shadow-lg shadow-[#ff3131]/20 hover:shadow-[#ff3131]/40 transition-all duration-300"
          >
            {isLoading ? "Enviando..." : "Submeter Trabalho"}
          </Button>
        </div>

        <form id="submit-work-form" onSubmit={handleSubmit}>
          <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50">
            {/* Seção 1: Informações Básicas */}
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-semibold text-slate-100 mb-4">Informações Básicas</h3>
              
              {/* Título */}
              <div className="mb-4">
                <Label htmlFor="title" className="text-slate-300 mb-2 block">
                  Título do Trabalho *
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Digite o título completo do trabalho"
                  className="bg-slate-800/30 border-slate-700 text-slate-100"
                  required
                />
              </div>

              {/* Tipo de Trabalho */}
              <div className="mb-4">
                <Label htmlFor="workType" className="text-slate-300 mb-2 block">
                  Tipo de Trabalho *
                </Label>
                <Select
                  value={formData.workType}
                  onValueChange={(value) => setFormData({ ...formData, workType: value })}
                  required
                >
                  <SelectTrigger className="bg-slate-800/30 border-slate-700 text-slate-100">
                    <SelectValue placeholder="Selecione o tipo de trabalho" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {WORK_TYPES.map((type) => (
                      <SelectItem 
                        key={type} 
                        value={type}
                        className="hover:bg-slate-700/50 focus:bg-slate-700/50"
                      >
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Imagem de Capa */}
              <div className="mb-4">
                <Label className="text-slate-300 mb-2 block">
                  Imagem de Capa (opcional)
                </Label>
                {formData.coverImage ? (
                  <div className="relative group">
                    <img 
                      src={formData.coverImage} 
                      alt="Capa do trabalho" 
                      className="rounded-lg object-cover w-full h-48 border border-slate-700"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setFormData({ ...formData, coverImage: null })}
                      className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-800/90 text-slate-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center gap-3 bg-slate-800/30 hover:bg-slate-800/50 transition-colors h-32 cursor-pointer">
                    <FileText className="h-8 w-8 text-slate-500" />
                    <Label htmlFor="cover-image" className="text-center">
                      <div className="text-slate-300 font-medium">Adicionar imagem de capa</div>
                      <div className="text-slate-500 text-xs mt-1">Recomendado: 1200x630px</div>
                    </Label>
                    <Input
                      id="cover-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Seção 2: Conteúdo Acadêmico */}
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-semibold text-slate-100 mb-4">Conteúdo Acadêmico</h3>
              
              {/* Resumo */}
              <div className="mb-4">
                <Label htmlFor="abstract" className="text-slate-300 mb-2 block">
                  Resumo *
                </Label>
                <Textarea
                  id="abstract"
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  placeholder="Digite o resumo do trabalho (até 300 palavras)"
                  className="min-h-[120px] bg-slate-800/30 border-slate-700 text-slate-100"
                  required
                />
              </div>

              {/* Descrição */}
              <div className="mb-4">
                <Label htmlFor="description" className="text-slate-300 mb-2 block">
                  Descrição Completa
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o trabalho com detalhes (metodologia, resultados, etc.)"
                  className="min-h-[180px] bg-slate-800/30 border-slate-700 text-slate-100"
                />
              </div>

              {/* Palavras-chave */}
              <div className="mb-4">
                <Label className="text-slate-300 mb-2 block">
                  Palavras-chave *
                </Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.keywords.map((keyword) => (
                    <Badge 
                      key={keyword}
                      variant="outline"
                      className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 group"
                    >
                      {keyword}
                      <button 
                        type="button"
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="ml-1.5 text-slate-400 hover:text-slate-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Adicionar palavra-chave"
                      className="bg-slate-800/30 border-slate-700 text-slate-100 pl-9"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                    />
                    <div className="absolute left-3 top-3">
                      <Hash className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddKeyword}
                    disabled={!newKeyword.trim()}
                    className="border-slate-700 text-slate-300 hover:bg-slate-700/50"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Referências */}
              <div>
                <Label htmlFor="references" className="text-slate-300 mb-2 block">
                  Referências Bibliográficas (principais)
                </Label>
                <Textarea
                  id="references"
                  value={formData.references}
                  onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                  placeholder="Liste as principais referências utilizadas no trabalho"
                  className="min-h-[120px] bg-slate-800/30 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            {/* Seção 3: Informações Institucionais */}
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-semibold text-slate-100 mb-4">Informações Institucionais</h3>
              
              {/* Orientador */}
              <div className="mb-4">
                <Label htmlFor="advisor" className="text-slate-300 mb-2 block">
                  Orientador *
                </Label>
                <div className="relative">
                  <Input
                    id="advisor"
                    type="text"
                    value={formData.advisor}
                    onChange={(e) => setFormData({ ...formData, advisor: e.target.value })}
                    placeholder="Nome completo do orientador"
                    className="bg-slate-800/30 border-slate-700 text-slate-100 pl-9"
                    required
                  />
                  <div className="absolute left-3 top-3">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Instituição */}
              <div className="mb-4">
                <Label htmlFor="institution" className="text-slate-300 mb-2 block">
                  Instituição *
                </Label>
                <div className="relative">
                  <Input
                    id="institution"
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="Nome da instituição de ensino"
                    className="bg-slate-800/30 border-slate-700 text-slate-100 pl-9"
                    required
                  />
                  <div className="absolute left-3 top-3">
                    <Building className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Departamento */}
              <div>
                <Label htmlFor="department" className="text-slate-300 mb-2 block">
                  Departamento/Faculdade (opcional)
                </Label>
                <div className="relative">
                  <Input
                    id="department"
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Departamento ou faculdade"
                    className="bg-slate-800/30 border-slate-700 text-slate-100 pl-9"
                  />
                  <div className="absolute left-3 top-3">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 4: Arquivo PDF */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-100 mb-4">Documento do Trabalho</h3>
              
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center gap-4 bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                {formData.pdfFile ? (
                  <div className="text-center">
                    <FileText className="h-10 w-10 text-red-400 mx-auto mb-3" />
                    <p className="text-slate-100 font-medium">{formData.pdfFile.name}</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setFormData({ ...formData, pdfFile: null })}
                      className="text-red-400 hover:text-red-300 mt-3"
                    >
                      Remover arquivo
                    </Button>
                  </div>
                ) : (
                  <>
                    <FileUp className="h-10 w-10 text-slate-500" />
                    <Label htmlFor="pdf-file" className="text-center cursor-pointer">
                      <div className="text-slate-300 font-medium">Arraste e solte o PDF aqui</div>
                      <div className="text-slate-500 text-sm mt-1">ou clique para selecionar</div>
                    </Label>
                    <Input
                      id="pdf-file"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <Badge variant="outline" className="bg-slate-800/50 border-slate-700 text-slate-400">
                      Tamanho máximo: 10MB
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Botão de submeter (mobile) */}
            <div className="md:hidden p-4 border-t border-slate-700/50">
              <Button
                type="submit"
                disabled={!formData.pdfFile || isLoading}
                className="w-full bg-[#ff3131] hover:bg-red-600 text-white font-bold shadow-lg shadow-[#ff3131]/20 hover:shadow-[#ff3131]/40 transition-all duration-300"
              >
                {isLoading ? "Enviando..." : "Submeter Trabalho"}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </FeedLayout>
  );
}