import { Download, MoreHorizontal, Flag, Edit, Trash2, Bookmark, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
    fileUrl: string;
    image: string;
  };
}

export function WorkCard({ work }: WorkCardProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSaved, setIsSaved] = useState(false); // Estado para controle de salvamento
  
  // Simulação: verificar se o usuário atual é o dono do trabalho
  // Em uma aplicação real, isso viria de um contexto de autenticação
  const currentUser = "user_example"; // Este seria o usuário logado
  const isOwner = currentUser === work.author;

  const handleDeleteWork = () => {
    // Lógica para deletar o trabalho
    console.log("Deletar trabalho:", work.id);
    setIsMenuOpen(false);
  };

  const handleEditWork = () => {
    // Lógica para editar o trabalho
    console.log("Editar trabalho:", work.id);
    setIsMenuOpen(false);
  };

  const handleSaveWork = () => {
    // Lógica para salvar/remover dos salvos
    console.log(isSaved ? "Remover dos salvos:" : "Salvar trabalho:", work.id);
    setIsSaved(!isSaved);
    setIsMenuOpen(false);
  };

  const handleReportWork = () => {
    setIsMenuOpen(false);
    setIsReportDialogOpen(true);
  };

  const handleContactRepresentative = () => {
    // Lógica para entrar em contato com o representante
    console.log("Entrar em contato sobre:", work.id);
    setIsMenuOpen(false);
  };

  const handleSubmitReport = () => {
    // Lógica para enviar a denúncia
    console.log("Denunciar trabalho:", work.id, "Motivo:", reportReason);
    setIsReportDialogOpen(false);
    setReportReason("");
  };

  const handleCancelReport = () => {
    setIsReportDialogOpen(false);
    setReportReason("");
  };

  return (
    <>
      <Card 
        className="bg-slate-800/50 border-slate-700 hover:border-red-500/30 transition-colors h-full flex flex-col cursor-pointer relative"
        onClick={() => navigate(`/trabalhos/${work.id}`)}
      >
        {/* Botão de menu de opções */}
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-red-400"
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
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"
                    onClick={handleDeleteWork}
                  >
                    <Trash2 className="h-4 w-4 mr-2 text-red-400" />
                    <span>Deletar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"
                    onClick={handleEditWork}
                  >
                    <Edit className="h-4 w-4 mr-2 text-red-400" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"
                    onClick={handleSaveWork}
                  >
                    <Bookmark className="h-4 w-4 mr-2 text-red-400" />
                    <span>{isSaved ? 'Remover dos salvos' : 'Salvar'}</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"
                    onClick={handleSaveWork}
                  >
                    <Bookmark className="h-4 w-4 mr-2 text-red-400" />
                    <span>{isSaved ? 'Remover dos salvos' : 'Salvar'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"
                    onClick={handleContactRepresentative}
                  >
                    <Mail className="h-4 w-4 mr-2 text-red-400" />
                    <span>Entrar em contato</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"
                    onClick={handleReportWork}
                  >
                    <Flag className="h-4 w-4 mr-2 text-red-400" />
                    <span>Denunciar</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardHeader className="p-0">
          <div className="h-48 overflow-hidden rounded-t-lg">
            <img
              src={work.image}
              alt={work.title}
              className="w-full h-full object-cover"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-1">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="bg-red-900/20 border-red-700/50 text-red-400">
              {work.type}
            </Badge>
            <span className="text-sm text-slate-400">{work.year}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-2">{work.title}</h3>
          <p className="text-sm text-slate-300 mb-3">{work.author}</p>
          <p className="text-sm text-slate-400 line-clamp-3 mb-4">{work.abstract}</p>
          <div className="flex flex-wrap gap-2 mb-4">
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
        </CardContent>
        <CardFooter className="p-4 border-t border-slate-700/50 flex justify-between items-center">
          <span className="text-sm text-slate-400 flex items-center">
            <Download className="h-4 w-4 mr-1" />
            {work.downloads.toLocaleString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/50 text-red-400 hover:bg-red-900/20"
            onClick={(e) => {
              e.stopPropagation();
              window.open(work.fileUrl, '_blank');
            }}
          >
            Baixar
          </Button>
        </CardFooter>
      </Card>

      {/* Modal de Denúncia (mesmo do Post) */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-200 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-400">Denunciar Trabalho</DialogTitle>
            <DialogDescription className="text-slate-400">
              Por favor, selecione o motivo da denúncia. Sua denúncia é anônima.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right text-slate-300">
                Motivo
              </Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600 text-slate-200">
                  <SelectValue placeholder="Selecione um motivo" />
                </SelectTrigger>
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
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancelReport}
              className="bg-transparent text-slate-300 border-slate-600 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              onClick={handleSubmitReport}
              disabled={!reportReason}
              className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
            >
              Enviar Denúncia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}