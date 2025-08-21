import { Users, Building2, MoreHorizontal, Flag, Edit, Trash2, Bookmark, Mail, Users2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
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
import { useState } from 'react';

// --- DICIONÁRIO DE TRADUÇÃO ---
const STATUS_DISPLAY_MAP: { [key: string]: string } = {
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  OPEN_FOR_APPLICATIONS: 'Aberto para inscrições'
};

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  year: string;
  image: string;
  members: number;
  institution: string;
  status: string;
}

export function ProjectCard({
  id,
  title,
  description,
  category,
  year,
  image,
  members,
  institution,
  status
}: ProjectCardProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  
  const isOwner = false; 

  const handleDeleteProject = () => console.log("Deletar projeto:", id);
  const handleEditProject = () => console.log("Editar projeto:", id);
  const handleSaveProject = () => setIsSaved(!isSaved);
  const handleReportProject = () => setIsReportDialogOpen(true);
  const handleContactTeam = () => console.log("Entrar em contato com a equipe do projeto:", id);
  const handleJoinProject = () => console.log("Solicitar participação no projeto:", id);
  const handleSubmitReport = () => setIsReportDialogOpen(false);
  const handleCancelReport = () => setIsReportDialogOpen(false);

  const displayStatus = STATUS_DISPLAY_MAP[status] || status;

  return (
    <>
      <div 
        className="bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer relative h-full flex flex-col"
        onClick={() => navigate(`/projetos/${id}`)}
      >
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
                  <DropdownMenuItem onClick={handleDeleteProject} className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"><Trash2 className="h-4 w-4 mr-2 text-red-400" /><span>Deletar</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEditProject} className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"><Edit className="h-4 w-4 mr-2 text-red-400" /><span>Editar</span></DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem onClick={handleSaveProject} className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"><Bookmark className="h-4 w-4 mr-2 text-red-400" /><span>{isSaved ? 'Remover dos salvos' : 'Salvar'}</span></DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={handleSaveProject} className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"><Bookmark className="h-4 w-4 mr-2 text-red-400" /><span>{isSaved ? 'Remover dos salvos' : 'Salvar'}</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={handleJoinProject} className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"><Users2 className="h-4 w-4 mr-2 text-red-400" /><span>Participar</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={handleContactTeam} className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"><Mail className="h-4 w-4 mr-2 text-red-400" /><span>Contatar equipe</span></DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem onClick={handleReportProject} className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"><Flag className="h-4 w-4 mr-2 text-red-400" /><span>Denunciar</span></DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="h-48 bg-slate-700 relative overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" className="bg-slate-900/80 backdrop-blur-sm border-slate-700 text-slate-200">
              {category}
            </Badge>
          </div>
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-slate-100">{title}</h3>
            <span className="text-sm text-slate-400">{year}</span>
          </div>
          
          <p className="text-sm text-slate-300 mb-4 line-clamp-2 flex-1">{description}</p>
          
          <div className="flex items-center space-x-3 text-sm text-slate-400 mb-4">
            <div className="flex items-center space-x-1"><Users className="h-4 w-4" /><span>{members} membros</span></div>
            <div className="flex items-center space-x-1"><Building2 className="h-4 w-4" /><span>{institution}</span></div>
          </div>
          
          <div className="flex justify-between items-center mt-auto">
            <Badge 
              variant={status === 'COMPLETED' ? 'default' : 'secondary'} 
              className={status === 'COMPLETED' ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'}
            >
              {displayStatus}
            </Badge>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="border-red-500/50 text-red-400 hover:bg-red-900/20"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projetos/${id}`);
              }}
            >
              Detalhes
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Denúncia */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-200 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-400">Denunciar Projeto</DialogTitle>
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
                  <SelectItem value="inappropriate">Conteúdo inadequado</SelectItem>
                  <SelectItem value="false_info">Informação falsa</SelectItem>
                  <SelectItem value="spam">Spam ou propaganda</SelectItem>
                  <SelectItem value="scam">Projeto fraudulento</SelectItem>
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