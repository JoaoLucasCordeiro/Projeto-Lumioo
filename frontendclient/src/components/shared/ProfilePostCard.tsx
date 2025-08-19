import { MoreHorizontal, Flag, Edit, Trash2, Bookmark, Mail, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface ProfilePostCardProps {
  post: {
    id: string;
    username: string;
    userImage: string;
    image: string;
    caption: string;
    likes: number;
    comments: number;
    timePosted: string;
    isLiked: boolean;
    isSaved: boolean;
  };
  isOwner: boolean;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onDelete: (postId: string) => void;
}

export function ProfilePostCard({ post, isOwner, onLike, onSave, onDelete }: ProfilePostCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isHovered, setIsHovered] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    onLike(post.id);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave(post.id);
    setIsMenuOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(post.id);
    setIsMenuOpen(false);
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsReportDialogOpen(true);
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Entrar em contato sobre post:", post.id);
    setIsMenuOpen(false);
  };

  const handleSubmitReport = () => {
    console.log("Denunciar post:", post.id, "Motivo:", reportReason);
    setIsReportDialogOpen(false);
    setReportReason("");
  };

  const handleCancelReport = () => {
    setIsReportDialogOpen(false);
    setReportReason("");
  };

  return (
    <>
      <div 
        className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Imagem do post */}
        <img
          src={post.image}
          alt={post.caption}
          className="w-full h-full object-cover"
        />

        {/* Overlay com interações ao passar o mouse */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-6 text-white">
            <div className="flex items-center gap-1 font-semibold">
              <Heart className="h-6 w-6 fill-current" />
              <span>{likesCount}</span>
            </div>
            <div className="flex items-center gap-1 font-semibold">
              <MessageCircle className="h-6 w-6" />
              <span>{post.comments}</span>
            </div>
          </div>
        )}

        {/* Botão de menu de opções */}
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 bg-black/50 hover:bg-black/70 text-white ${isHovered ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity`}
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
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2 text-red-400" />
                    <span>Deletar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Editar post:", post.id);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2 text-red-400" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"
                    onClick={handleSave}
                  >
                    <Bookmark className="h-4 w-4 mr-2 text-red-400" />
                    <span>{isSaved ? 'Remover dos salvos' : 'Salvar'}</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"
                    onClick={handleSave}
                  >
                    <Bookmark className="h-4 w-4 mr-2 text-red-400" />
                    <span>{isSaved ? 'Remover dos salvos' : 'Salvar'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"
                    onClick={handleContact}
                  >
                    <Mail className="h-4 w-4 mr-2 text-red-400" />
                    <span>Entrar em contato</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"
                    onClick={handleReport}
                  >
                    <Flag className="h-4 w-4 mr-2 text-red-400" />
                    <span>Denunciar</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Modal de Denúncia */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-200 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-400">Denunciar Post</DialogTitle>
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
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="false_info">Informação falsa</SelectItem>
                  <SelectItem value="harassment">Assédio</SelectItem>
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