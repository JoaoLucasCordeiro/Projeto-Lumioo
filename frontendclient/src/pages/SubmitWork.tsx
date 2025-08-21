import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, FileText, FileUp, User, BookOpen, Building, Hash, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeedLayout } from "@/components/shared/feed/FeedLayout";
import { useAuth } from "@/contexts/auth.context";

const API_URL = import.meta.env.VITE_API_URL;

const WORK_TYPE_MAP: { [key: string]: string } = {
  "TCC": "TCC",
  "Artigo Científico": "ARTICLE",
  "Dissertação": "DISSERTATION",
  "Tese": "THESIS",
  "Monografia": "TCC", 
  "Relatório Técnico": "ARTICLE", 
  "Projeto de Pesquisa": "ARTICLE" 
};

const WORK_TYPES = Object.keys(WORK_TYPE_MAP);

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export function SubmitWorkPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
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
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      fileToBase64(file).then(base64 => {
        setFormData(prev => ({ ...prev, coverImage: base64 }));
      });
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, pdfFile: e.target.files![0] }));
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword) && formData.keywords.length < 5) {
      setFormData(prev => ({ ...prev, keywords: [...prev.keywords, newKeyword.trim()] }));
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
    if (!token) {
        setError("Autenticação necessária para submeter um trabalho.");
        return;
    }
    if (!formData.pdfFile) {
        setError("O arquivo PDF do trabalho é obrigatório.");
        return;
    }
    if (formData.keywords.length < 3) {
        setError("Por favor, adicione pelo menos 3 palavras-chave.");
        return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const pdfBase64 = await fileToBase64(formData.pdfFile);

      const payload = {
        title: formData.title,
        workType: WORK_TYPE_MAP[formData.workType],
        coverImage: formData.coverImage,
        summary: formData.abstract,
        description: formData.description,
        keywords: formData.keywords,
        references: formData.references.split('\n').filter(ref => ref.trim() !== ''),
        advisor: formData.advisor,
        institution: formData.institution,
        department: formData.department,
        pdfFile: pdfBase64,
      };

      const response = await fetch(`${API_URL}/works`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ocorreu um erro ao submeter o trabalho.");
      }

      navigate('/trabalhos');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
        <div className="hidden md:flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/trabalhos')} className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50">
            <X className="h-4 w-4 mr-2" />
            Voltar para trabalhos
          </Button>
          <Button type="submit" form="submit-work-form" disabled={!formData.pdfFile || isLoading} className="bg-[#ff3131] hover:bg-red-600 text-white font-bold shadow-lg shadow-[#ff3131]/20 hover:shadow-[#ff3131]/40 transition-all duration-300">
            {isLoading ? "Enviando..." : "Submeter Trabalho"}
          </Button>
        </div>

        <form id="submit-work-form" onSubmit={handleSubmit}>
          <div className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50">
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-semibold text-slate-100 mb-4">Informações Básicas</h3>
              <div className="mb-4">
                <Label htmlFor="title" className="text-slate-300 mb-2 block">Título do Trabalho *</Label>
                <Input id="title" type="text" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Digite o título completo do trabalho" className="bg-slate-800/30 border-slate-700 text-slate-100" required />
              </div>
              <div className="mb-4">
                <Label htmlFor="workType" className="text-slate-300 mb-2 block">Tipo de Trabalho *</Label>
                <Select value={formData.workType} onValueChange={(value) => handleInputChange('workType', value)} required>
                  <SelectTrigger className="bg-slate-800/30 border-slate-700 text-slate-100"><SelectValue placeholder="Selecione o tipo de trabalho" /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {WORK_TYPES.map((type) => (<SelectItem key={type} value={type} className="hover:bg-slate-700/50 focus:bg-slate-700/50">{type}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <Label className="text-slate-300 mb-2 block">Imagem de Capa (opcional)</Label>
                {formData.coverImage ? (
                  <div className="relative group">
                    <img src={formData.coverImage} alt="Capa do trabalho" className="rounded-lg object-cover w-full h-48 border border-slate-700" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setFormData({ ...formData, coverImage: null })} className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-800/90 text-slate-100"><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center gap-3 bg-slate-800/30 hover:bg-slate-800/50 transition-colors h-32 cursor-pointer">
                    <FileText className="h-8 w-8 text-slate-500" />
                    <Label htmlFor="cover-image" className="text-center">
                      <div className="text-slate-300 font-medium">Adicionar imagem de capa</div>
                      <div className="text-slate-500 text-xs mt-1">Recomendado: 1200x630px</div>
                    </Label>
                    <Input id="cover-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-semibold text-slate-100 mb-4">Conteúdo Acadêmico</h3>
              <div className="mb-4">
                <Label htmlFor="abstract" className="text-slate-300 mb-2 block">Resumo *</Label>
                <Textarea id="abstract" value={formData.abstract} onChange={(e) => handleInputChange('abstract', e.target.value)} placeholder="Digite o resumo do trabalho (até 300 palavras)" className="min-h-[120px] bg-slate-800/30 border-slate-700 text-slate-100" required />
              </div>
              <div className="mb-4">
                <Label htmlFor="description" className="text-slate-300 mb-2 block">Descrição Completa *</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Descreva o trabalho com detalhes (metodologia, resultados, etc.)" className="min-h-[180px] bg-slate-800/30 border-slate-700 text-slate-100" required/>
              </div>
              <div className="mb-4">
                <Label className="text-slate-300 mb-2 block">Palavras-chave (3 a 5) *</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.keywords.map((keyword) => (
                    <Badge key={keyword} variant="outline" className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 group">
                      {keyword}
                      <button type="button" onClick={() => handleRemoveKeyword(keyword)} className="ml-1.5 text-slate-400 hover:text-slate-200"><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input type="text" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} placeholder="Adicionar palavra-chave" className="bg-slate-800/30 border-slate-700 text-slate-100 pl-9" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword(); }}} />
                    <div className="absolute left-3 top-3"><Hash className="h-4 w-4 text-slate-400" /></div>
                  </div>
                  <Button type="button" variant="outline" onClick={handleAddKeyword} disabled={!newKeyword.trim()} className="border-slate-700 text-slate-300 hover:bg-slate-700/50">Adicionar</Button>
                </div>
              </div>
              <div>
                <Label htmlFor="references" className="text-slate-300 mb-2 block">Referências Bibliográficas (uma por linha) *</Label>
                <Textarea id="references" value={formData.references} onChange={(e) => handleInputChange('references', e.target.value)} placeholder="Liste as principais referências utilizadas no trabalho" className="min-h-[120px] bg-slate-800/30 border-slate-700 text-slate-100" required/>
              </div>
            </div>
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-xl font-semibold text-slate-100 mb-4">Informações Institucionais</h3>
              <div className="mb-4">
                <Label htmlFor="advisor" className="text-slate-300 mb-2 block">Orientador *</Label>
                <div className="relative">
                  <Input id="advisor" type="text" value={formData.advisor} onChange={(e) => handleInputChange('advisor', e.target.value)} placeholder="Nome completo do orientador" className="bg-slate-800/30 border-slate-700 text-slate-100 pl-9" required />
                  <div className="absolute left-3 top-3"><User className="h-4 w-4 text-slate-400" /></div>
                </div>
              </div>
              <div className="mb-4">
                <Label htmlFor="institution" className="text-slate-300 mb-2 block">Instituição *</Label>
                <div className="relative">
                  <Input id="institution" type="text" value={formData.institution} onChange={(e) => handleInputChange('institution', e.target.value)} placeholder="Nome da instituição de ensino" className="bg-slate-800/30 border-slate-700 text-slate-100 pl-9" required />
                  <div className="absolute left-3 top-3"><Building className="h-4 w-4 text-slate-400" /></div>
                </div>
              </div>
              <div>
                <Label htmlFor="department" className="text-slate-300 mb-2 block">Departamento/Faculdade (opcional)</Label>
                <div className="relative">
                  <Input id="department" type="text" value={formData.department} onChange={(e) => handleInputChange('department', e.target.value)} placeholder="Departamento ou faculdade" className="bg-slate-800/30 border-slate-700 text-slate-100 pl-9" />
                  <div className="absolute left-3 top-3"><BookOpen className="h-4 w-4 text-slate-400" /></div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-100 mb-4">Documento do Trabalho *</h3>
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center gap-4 bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                {formData.pdfFile ? (
                  <div className="text-center">
                    <FileText className="h-10 w-10 text-red-400 mx-auto mb-3" />
                    <p className="text-slate-100 font-medium">{formData.pdfFile.name}</p>
                    <p className="text-slate-400 text-sm mt-1">{(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <Button type="button" variant="ghost" onClick={() => setFormData({ ...formData, pdfFile: null })} className="text-red-400 hover:text-red-300 mt-3">Remover arquivo</Button>
                  </div>
                ) : (
                  <>
                    <FileUp className="h-10 w-10 text-slate-500" />
                    <Label htmlFor="pdf-file" className="text-center cursor-pointer">
                      <div className="text-slate-300 font-medium">Arraste e solte o PDF aqui</div>
                      <div className="text-slate-500 text-sm mt-1">ou clique para selecionar</div>
                    </Label>
                    <Input id="pdf-file" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" required />
                    <Badge variant="outline" className="bg-slate-800/50 border-slate-700 text-slate-400">Tamanho máximo: 50MB</Badge>
                  </>
                )}
              </div>
            </div>
            {error && (
                <div className="p-6">
                    <div className="flex items-center p-3 text-sm text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg">
                        <AlertCircle className="flex-shrink-0 inline w-5 h-5 mr-3" />
                        <div>{error}</div>
                    </div>
                </div>
            )}
            <div className="md:hidden p-4 border-t border-slate-700/50">
              <Button type="submit" disabled={!formData.pdfFile || isLoading} className="w-full bg-[#ff3131] hover:bg-red-600 text-white font-bold shadow-lg shadow-[#ff3131]/20 hover:shadow-[#ff3131]/40 transition-all duration-300">
                {isLoading ? "Enviando..." : "Submeter Trabalho"}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </FeedLayout>
  );
}