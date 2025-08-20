import { useEffect, useState } from 'react';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Clock, Flag, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

function Toast({ message, type, onDismiss }: { message: string, type: 'success' | 'error', onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      className={`fixed bottom-5 right-5 flex items-center gap-4 rounded-lg px-4 py-3 text-white shadow-lg z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
    >
      {type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
      <p className="font-medium">{message}</p>
    </motion.div>
  );
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
  const navigate = useNavigate();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  const isOwner = user?.id === authorId;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

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
      showToast(isSaved ? 'Post removido dos salvos!' : 'Post salvo com sucesso!');
      onUpdate();
    } catch (error) {
      console.error("Failed to save post:", error);
      showToast('Falha ao salvar o post.', 'error');
    }
  };

  const handleDeletePost = async () => {
    if (!token || !isOwner) return;
    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Falha ao deletar o post.');
      showToast('Post deletado com sucesso!');
      onUpdate();
    } catch (error) {
      console.error("Failed to delete post:", error);
      showToast('Falha ao deletar o post.', 'error');
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEditPost = () => {
    navigate(`/post/${id}/edit`);
  };

  return (
    <>
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-lg mb-8 hover:border-red-500/30 transition-all"
      >
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="outline" className="bg-red-900/20 border-red-700/50 text-red-400">Novo Post</Badge>
        </div>
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border-2 border-red-500/30">
              <AvatarImage src={userImage} alt={username} />
              <AvatarFallback className="bg-slate-800 text-red-400 font-bold">{username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <Link to={`/perfil/${username}`} className="font-bold text-slate-100 hover:text-red-400 transition-colors">{username}</Link>
              <div className="flex items-center text-sm text-slate-400 mt-1"><Clock className="h-4 w-4 mr-1 text-red-400" /><span>{timePosted}</span></div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400 hover:bg-red-900/10"><MoreHorizontal className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-slate-200 w-48">
              {isOwner ? (
                <>
                  <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400">
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
                  <DropdownMenuItem className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400">
                    <Flag className="h-4 w-4 mr-2 text-red-400" /><span>Denunciar</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Link to={`/post/${id}`}>
          <div className="relative group overflow-hidden">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="aspect-square">
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
                <motion.div whileTap={{ scale: 0.9 }}><Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} /></motion.div>
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-transparent">
                <MessageCircle className="h-6 w-6" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className={`${isSaved ? 'text-red-400' : 'text-slate-400'} hover:bg-transparent`} onClick={handleSave}>
              <Bookmark className={`h-6 w-6 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
          </div>
          <motion.div whileHover={{ x: 5 }} className="text-sm font-bold text-slate-100 mb-3">{likes.toLocaleString()} curtidas</motion.div>
          <div className="mb-3">
            <Link to={`/perfil/${username}`} className="font-bold text-slate-100 hover:text-red-400 transition-colors mr-2">{username}</Link>
            <span className="text-slate-300">{caption}</span>
          </div>
          <motion.div whileHover={{ x: 5 }}>
            <Link to={`/post/${id}`} className="text-sm text-slate-400 hover:text-red-400 transition-colors">Ver todos os {comments.toLocaleString()} comentários</Link>
          </motion.div>
        </div>
      </motion.div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente o seu post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent text-slate-300 border-slate-600 hover:bg-slate-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-red-600 hover:bg-red-700 text-white">Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}