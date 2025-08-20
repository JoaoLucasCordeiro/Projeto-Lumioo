import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, X, Send, MoreHorizontal, Clock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
// import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth.context';

const API_URL = import.meta.env.VITE_API_URL;

interface Comment {
  id: string;
  username: string;
  userImage: string;
  text: string;
  timePosted: string;
  likes: number;
  isLiked: boolean;
}

interface PostDetailsData {
  id: string;
  username: string;
  userImage: string;
  image: string;
  caption: string;
  likes: number;
  comments: Comment[];
  timePosted: string;
  isLiked: boolean;
  isSaved: boolean;
}

export function PostDetails() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<PostDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  const fetchPost = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Post not found');
      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error('Erro ao buscar post:', error);
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !token || !id) return;
    try {
      await fetch(`${API_URL}/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: newComment }),
      });
      setNewComment('');
      fetchPost();
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  const handleLikePost = async () => {
    if (!token || !id) return;
    try {
      await fetch(`${API_URL}/posts/${id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchPost();
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleSavePost = async () => {
    if (!token || !id) return;
    try {
      await fetch(`${API_URL}/posts/${id}/save`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchPost();
    } catch (error) {
      console.error("Failed to save post:", error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center">
        <div className="flex items-center justify-center space-x-2">
            <motion.div className="h-3 w-3 bg-red-500 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} />
            <motion.div className="h-3 w-3 bg-red-500 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
            <motion.div className="h-3 w-3 bg-red-500 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center">
            <div className="text-center p-8 bg-slate-800 rounded-xl border border-slate-700 max-w-md">
                <h3 className="text-2xl font-bold text-slate-100 mb-2">Post não encontrado</h3>
                <p className="text-slate-400 mb-6">O post que você está procurando não existe ou foi removido.</p>
                <Button onClick={() => navigate('/feed')} className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#ff3131] to-red-600 rounded-lg text-white font-medium hover:from-[#ff3131]/90 hover:to-red-600/90 transition-all">
                    Voltar ao Feed
                </Button>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col md:flex-row"
      >
        <div className="md:w-2/3 bg-gradient-to-br from-slate-900 to-black relative">
          <img 
            src={post.image} 
            alt={post.caption} 
            className="w-full h-full object-cover" 
          />
          {/* <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-6">
            <Badge variant="outline" className="bg-red-900/20 border-red-700/50 text-red-400">
           
            </Badge>
          </div> */}
        </div>

        <div className="md:w-1/3 flex flex-col border-t md:border-t-0 md:border-l border-slate-700">
          <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 border-2 border-red-500/30">
                <AvatarImage src={post.userImage} alt={post.username} />
                <AvatarFallback className="bg-slate-700 text-red-400 font-bold">{post.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <Link to={`/perfil/${post.username}`} className="font-bold text-slate-100 hover:text-red-400">{post.username}</Link>
                <div className="flex items-center text-xs text-slate-400"><Clock className="h-3 w-3 mr-1 text-red-400" /><span>{post.timePosted}</span></div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSavePost} variant="ghost" size="icon" className="text-slate-400 hover:text-red-400 hover:bg-red-900/10"><Bookmark className={`h-5 w-5 ${post.isSaved ? 'fill-current text-red-400' : ''}`} /></Button>
              <Button onClick={() => navigate(-1)} variant="ghost" size="icon" className="text-slate-400 hover:text-red-400 hover:bg-red-900/10"><X className="h-5 w-5" /></Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b border-slate-700">
              <p className="text-slate-300 whitespace-pre-line"><Link to={`/perfil/${post.username}`} className="font-bold text-slate-100 hover:text-red-400 mr-2">{post.username}</Link>{post.caption}</p>
              <div className="flex items-center mt-4 space-x-4">
                <Button onClick={handleLikePost} variant="ghost" className={`flex items-center space-x-1 ${post.isLiked ? 'text-red-500' : 'text-slate-400'} hover:bg-transparent`}><Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} /><span>{post.likes.toLocaleString()}</span></Button>
                <Button variant="ghost" className="flex items-center space-x-1 text-slate-400 hover:bg-transparent"><MessageCircle className="h-5 w-5" /><span>{post.comments.length.toLocaleString()}</span></Button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {post.comments.map((comment) => (
                <motion.div key={comment.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="flex items-start space-x-3 group">
                  <Avatar className="h-9 w-9 flex-shrink-0 border border-slate-600"><AvatarImage src={comment.userImage} alt={comment.username} /><AvatarFallback className="bg-slate-700 text-slate-300">{comment.username.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline"><Link to={`/perfil/${comment.username}`} className="font-bold text-slate-100 hover:text-red-400 mr-2">{comment.username}</Link><span className="text-xs text-slate-500">{comment.timePosted}</span></div>
                    <p className="text-slate-300 mt-1">{comment.text}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <Button variant="ghost" size="sm" className={`text-xs ${comment.isLiked ? 'text-red-500' : 'text-slate-400'} hover:bg-transparent h-6`}><Heart className={`h-3 w-3 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} /><span>{comment.likes.toLocaleString()}</span></Button>
                      <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:bg-transparent h-6">Responder</Button>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 h-6 w-6"><MoreHorizontal className="h-3 w-3" /></Button>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700 p-4 bg-slate-800/50">
            <div className="flex items-center space-x-2">
              <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Adicione um comentário..." className="flex-1 bg-slate-800 border-slate-700 text-slate-200 resize-none min-h-[40px]" rows={1} />
              <Button onClick={handlePostComment} variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-900/10" disabled={!newComment.trim()}><Send className="h-5 w-5" /></Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}