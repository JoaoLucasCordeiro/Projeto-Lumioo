import { Download, MoreHorizontal, Flag, Edit, Trash2, Bookmark, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface WorkCardProps {
  work: {
    id: string;
    title: string;
    author: string;
    type: string;
    year: string;
    abstract: string;
    keywords: string[];
    downloads: number;
    image: string;
  };
  onUpdate: () => void;
}

export function WorkCard({ work, onUpdate }: WorkCardProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const currentUser = "user_example";
  const isOwner = currentUser === work.author;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      onUpdate();
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleDeleteWork = () => console.log("Deletar trabalho:", work.id);
  const handleEditWork = () => console.log("Editar trabalho:", work.id);
  const handleSaveWork = () => setIsSaved(!isSaved);
  const handleReportWork = () => setIsReportDialogOpen(true);
  const handleContactRepresentative = () => console.log("Entrar em contato sobre:", work.id);
  const handleSubmitReport = () => setIsReportDialogOpen(false);
  const handleCancelReport = () => setIsReportDialogOpen(false);

  return (
    <>
      <Card
        className="bg-slate-800/50 border-slate-700 hover:border-red-500/30 transition-colors h-full flex flex-col cursor-pointer relative overflow-hidden group"
        onClick={() => navigate(`/trabalhos/${work.id}`)}
      >
        <div className="h-48 overflow-hidden relative">
          <img
            src={work.image}
            alt={work.title}
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
          <div className="absolute top-3 right-3 z-10">
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-red-400 backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-slate-800 border-slate-700 text-slate-200 w-48"
                onClick={(e) => e.stopPropagation()}
              >
                {isOwner ? (
                  <>
                    <DropdownMenuItem className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400" onClick={handleDeleteWork}>
                      <Trash2 className="h-4 w-4 mr-2 text-red-400" /><span>Deletar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400" onClick={handleEditWork}>
                      <Edit className="h-4 w-4 mr-2 text-red-400" /><span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400" onClick={handleSaveWork}>
                      <Bookmark className="h-4 w-4 mr-2 text-red-400" /><span>{isSaved ? 'Remover dos salvos' : 'Salvar'}</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400" onClick={handleSaveWork}>
                      <Bookmark className="h-4 w-4 mr-2 text-red-400" /><span>{isSaved ? 'Remover dos salvos' : 'Salvar'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400" onClick={handleContactRepresentative}>
                      <Mail className="h-4 w-4 mr-2 text-red-400" /><span>Entrar em contato</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400" onClick={handleReportWork}>
                      <Flag className="h-4 w-4 mr-2 text-red-400" /><span>Denunciar</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardContent className="p-4 flex-1">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="bg-red-900/20 border-red-700/50 text-red-400">{work.type}</Badge>
            <span className="text-sm text-slate-400">{work.year}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-2">{work.title}</h3>
          <p className="text-sm text-slate-300 mb-3">{work.author}</p>
          <p className="text-sm text-slate-400 line-clamp-3 mb-4">{work.abstract}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {work.keywords.map(keyword => (<Badge key={keyword} variant="outline" className="bg-slate-700/50 border-slate-600 text-slate-300">{keyword}</Badge>))}
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
            className="bg-green-600 text-white hover:text-white hover:bg-green-700 border-none"
            onClick={handleDownload}
          >
            Baixar
          </Button>

        </CardFooter>
      </Card>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-200 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-400">Denunciar Trabalho</DialogTitle>
            <DialogDescription className="text-slate-400">Por favor, selecione o motivo da denúncia. Sua denúncia é anônima.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right text-slate-300">Motivo</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600 text-slate-200"><SelectValue placeholder="Selecione um motivo" /></SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-slate-200">
                  <SelectItem value="plagiarism">Plágio</SelectItem>
                  <SelectItem value="inappropriate">Conteúdo inadequado</SelectItem>
                  <SelectItem value="false_info">Informação falsa</SelectItem>
                  <SelectItem value="copyright">Violação de direitos autorais</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancelReport} className="bg-transparent text-slate-300 border-slate-600 hover:bg-slate-700">Cancelar</Button>
            <Button type="submit" onClick={handleSubmitReport} disabled={!reportReason} className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">Enviar Denúncia</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}