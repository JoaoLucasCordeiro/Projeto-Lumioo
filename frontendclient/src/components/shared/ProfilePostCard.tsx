import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, MoreHorizontal, Edit, Trash2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { Post } from '@/types/feed';

const API_URL = import.meta.env.VITE_API_URL;

interface ProfilePostCardProps {
  post: Post;
  isOwner: boolean;
  onUpdate: () => void;
}

export function ProfilePostCard({ post, isOwner, onUpdate }: ProfilePostCardProps) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await fetch(`${API_URL}/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      onUpdate(); 
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await fetch(`${API_URL}/posts/${post.id}/save`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      onUpdate(); 
    } catch (error) {
      console.error("Failed to save post:", error);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!token || !isOwner) return;
    try {
      await fetch(`${API_URL}/posts/${post.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      onUpdate();
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  return (
    <>
      <div 
        className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => navigate(`/post/${post.id}`)}
      >
        <img
          src={post.image}
          alt={post.caption}
          className="w-full h-full object-cover"
        />

        <div 
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white"
        >
          {/* --- CORREÇÃO AQUI: onClick adicionado --- */}
          <button onClick={handleLike} className="flex items-center gap-1 font-semibold bg-transparent border-none">
            <Heart className={`h-6 w-6 ${post.isLiked ? 'fill-white' : ''}`} />
            <span>{post.likes}</span>
          </button>
          <div className="flex items-center gap-1 font-semibold">
            <MessageCircle className="h-6 w-6" />
            <span>{post.comments}</span>
          </div>
        </div>

        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
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
                      navigate(`/post/${post.id}/edit`);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2 text-red-400" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem 
                  className="flex items-center cursor-pointer focus:bg-slate-700 focus:text-red-400"
                  onClick={handleSave}
                >
                  <Bookmark className="h-4 w-4 mr-2 text-red-400" />
                  <span>{post.isSaved ? 'Remover dos salvos' : 'Salvar'}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Deletar Publicação?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação é permanente. Você tem certeza que quer deletar este post?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}