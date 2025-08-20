import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Clock, Flag, Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
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
import { useAuth } from '@/contexts/auth.context';

const API_URL = import.meta.env.VITE_API_URL;

interface PostProps {
  id: string;
  username: string;
  authorId: string; 
  userImage: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timePosted: string;
  isLiked: boolean;
  isSaved: boolean;
  onUpdate: () => void; 
}

export function Post({
  id,
  username,
  authorId,
  userImage,
  image,
  caption,
  likes,
  comments,
  timePosted,
  isLiked,
  isSaved,
  onUpdate
}: PostProps) {
  const { user, token } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  
  const isOwner = user?.id === authorId;

  const handleLike = async () => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/posts/${id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      onUpdate();
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleSave = async () => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/posts/${id}/save`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      onUpdate();
    } catch (error) {
      console.error("Failed to save post:", error);
    }
  };

  const handleDeletePost = () => console.log("Deletar post:", id);
  const handleEditPost = () => console.log("Editar post:", id);
  const handleReportPost = () => setIsReportDialogOpen(true);
  const handleSubmitReport = () => console.log("Denunciar post:", id, "Motivo:", reportReason);
  const handleCancelReport = () => setIsReportDialogOpen(false);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-lg mb-8 hover:border-red-500/30 transition-all"
      >
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="outline" className="bg-red-900/20 border-red-700/50 text-red-400">
            Novo Post
          </Badge>
        </div>

        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border-2 border-red-500/30">
              <AvatarImage src={userImage} alt={username} />
              <AvatarFallback className="bg-slate-800 text-red-400 font-bold">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link to={`/perfil/${username}`} className="font-bold text-slate-100 hover:text-red-400 transition-colors">
                {username}
              </Link>
              <div className="flex items-center text-sm text-slate-400 mt-1">
                <Clock className="h-4 w-4 mr-1 text-red-400" />
                <span>{timePosted}</span>
              </div>
            </div>
          </div>
          
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400 hover:bg-red-900/10">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-slate-200 w-48">
              {isOwner ? (
                <>
                  <DropdownMenuItem onClick={handleDeletePost} className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400">
                    <Trash2 className="h-4 w-4 mr-2 text-red-400" /><span>Deletar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEditPost} className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400">
                    <Edit className="h-4 w-4 mr-2 text-red-400" /><span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem onClick={handleSave} className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400">
                    <Bookmark className="h-4 w-4 mr-2 text-red-400" /><span>{isSaved ? 'Remover dos salvos' : 'Salvar'}</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={handleSave} className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400">
                    <Bookmark className="h-4 w-4 mr-2 text-red-400" /><span>{isSaved ? 'Remover dos salvos' : 'Salvar'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem onClick={handleReportPost} className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400">
                    <Flag className="h-4 w-4 mr-2 text-red-400" /><span>Denunciar</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Link to={`/post/${id}`}>
          <div className="relative group overflow-hidden">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="aspect-square"
            >
              <img src={image} alt={caption} className="w-full h-full object-cover" />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
              <p className="text-slate-100 text-lg font-medium">{caption}</p>
            </div>
          </div>
        </Link>

        <div className="p-6">
          <div className="flex justify-between mb-4">
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className={`${isLiked ? 'text-red-500' : 'text-slate-400'} hover:bg-transparent`} onClick={handleLike}>
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
                </motion.div>
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-transparent">
                <MessageCircle className="h-6 w-6" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className={`${isSaved ? 'text-red-400' : 'text-slate-400'} hover:bg-transparent`} onClick={handleSave}>
              <Bookmark className={`h-6 w-6 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
          </div>

          <motion.div whileHover={{ x: 5 }} className="text-sm font-bold text-slate-100 mb-3">
            {likes.toLocaleString()} curtidas
          </motion.div>

          <div className="mb-3">
            <Link to={`/perfil/${username}`} className="font-bold text-slate-100 hover:text-red-400 transition-colors mr-2">
              {username}
            </Link>
            <span className="text-slate-300">{caption}</span>
          </div>

          <motion.div whileHover={{ x: 5 }}>
            <Link to={`/post/${id}`} className="text-sm text-slate-400 hover:text-red-400 transition-colors">
              Ver todos os {comments.toLocaleString()} comentários
            </Link>
          </motion.div>
        </div>
      </motion.div>

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
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="inappropriate">Conteúdo inadequado</SelectItem>
                  <SelectItem value="harassment">Assédio</SelectItem>
                  <SelectItem value="false_info">Informação falsa</SelectItem>
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