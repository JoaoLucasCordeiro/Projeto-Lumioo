import { Heart, MessageCircle, Bookmark, X, Send, MoreHorizontal, Clock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface Comment {
  id: string;
  username: string;
  userImage: string;
  text: string;
  timePosted: string;
  likes: number;
  isLiked: boolean;
}

interface PostDetailsProps {
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
  const { id } = useParams();
  const [post, setPost] = useState<PostDetailsProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Dados mockados - substituir por API real
        const mockPost: PostDetailsProps = {
          id: id || '1',
          username: 'dr_maria_silva',
          userImage: '/user-scientist.jpg',
          image: '/research-post.jpg',
          caption: 'Publicando os resultados da nossa pesquisa sobre nanotecnologia aplicada à medicina. Os testes mostraram eficácia de 92% nos tratamentos experimentais! #Ciência #Nanotecnologia #Saúde',
          likes: 1243,
          comments: [
            {
              id: 'c1',
              username: 'prof_carlos',
              userImage: '/user-professor.jpg',
              text: 'Resultados impressionantes! Parabéns à equipe pelo trabalho meticuloso.',
              timePosted: '45 min atrás',
              likes: 24,
              isLiked: false
            },
            {
              id: 'c2',
              username: 'lab_farmacologia',
              userImage: '/user-lab.jpg',
              text: 'Gostaríamos de colaborar no próximo estágio da pesquisa. Vamos conversar?',
              timePosted: '1h atrás',
              likes: 18,
              isLiked: true
            }
          ],
          timePosted: '2h atrás',
          isLiked: false,
          isSaved: true
        };
        
        setPost(mockPost);
      } catch (error) {
        console.error('Erro ao buscar post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 rounded-full border-4 border-t-red-500 border-r-red-500 border-b-transparent border-l-transparent"
        />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center">
        <div className="text-center p-8 bg-slate-800 rounded-xl border border-slate-700 max-w-md">
          <h3 className="text-2xl font-bold text-slate-100 mb-2">Post não encontrado</h3>
          <p className="text-slate-400 mb-6">O post solicitado não está disponível</p>
          <Link 
            to="/feed" 
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#ff3131] to-red-600 rounded-lg text-white font-medium hover:from-[#ff3131]/90 hover:to-red-600/90 transition-all"
          >
            Voltar ao Feed
          </Link>
        </div>
      </div>
    );
  }

  const { username, userImage, image, caption, likes, comments, timePosted, isLiked, isSaved } = post;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col md:flex-row"
      >
        {/* Seção da Imagem com Efeito de Destaque */}
        <div className="md:w-2/3 bg-gradient-to-br from-slate-900 to-black relative group">
          <img 
            src={image} 
            alt={caption} 
            className="w-full h-full object-contain max-h-[80vh] p-4 md:p-8 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-6">
            <Badge variant="outline" className="bg-red-900/20 border-red-700/50 text-red-400">
              Detalhes da Pesquisa
            </Badge>
          </div>
        </div>

        {/* Seção de Conteúdo */}
        <div className="md:w-1/3 flex flex-col border-t md:border-t-0 md:border-l border-slate-700">
          {/* Cabeçalho com Informações do Autor */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 border-2 border-red-500/30">
                <AvatarImage src={userImage} alt={username} />
                <AvatarFallback className="bg-slate-700 text-red-400 font-bold">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link 
                  to={`/perfil/${username}`} 
                  className="font-bold text-slate-100 hover:text-red-400 transition-colors"
                >
                  {username}
                </Link>
                <div className="flex items-center text-xs text-slate-400">
                  <Clock className="h-3 w-3 mr-1 text-red-400" />
                  <span>{timePosted}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400 hover:bg-red-900/10">
                <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current text-red-400' : ''}`} />
              </Button>
              <Link to="/feed">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400 hover:bg-red-900/10">
                  <X className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Área Rolável de Conteúdo */}
          <div className="flex-1 overflow-y-auto">
            {/* Legenda do Post */}
            <div className="p-4 border-b border-slate-700">
              <p className="text-slate-300 whitespace-pre-line">
                <Link 
                  to={`/perfil/${username}`} 
                  className="font-bold text-slate-100 hover:text-red-400 transition-colors mr-2"
                >
                  {username}
                </Link>
                {caption}
              </p>
              <div className="flex items-center mt-4 space-x-4">
                <Button 
                  variant="ghost" 
                  className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-slate-400'} hover:bg-transparent`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likes.toLocaleString()}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-1 text-slate-400 hover:bg-transparent"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>{comments.length.toLocaleString()}</span>
                </Button>
              </div>
            </div>

            {/* Lista de Comentários */}
            <div className="p-4 space-y-6">
              {comments.map((comment) => (
                <motion.div 
                  key={comment.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start space-x-3 group"
                >
                  <Avatar className="h-9 w-9 flex-shrink-0 border border-slate-600">
                    <AvatarImage src={comment.userImage} alt={comment.username} />
                    <AvatarFallback className="bg-slate-700 text-slate-300">
                      {comment.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline">
                      <Link 
                        to={`/perfil/${comment.username}`} 
                        className="font-bold text-slate-100 hover:text-red-400 transition-colors mr-2"
                      >
                        {comment.username}
                      </Link>
                      <span className="text-xs text-slate-500">{comment.timePosted}</span>
                    </div>
                    <p className="text-slate-300 mt-1">{comment.text}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`text-xs ${comment.isLiked ? 'text-red-500' : 'text-slate-400'} hover:bg-transparent h-6`}
                      >
                        <Heart className={`h-3 w-3 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
                        <span>{comment.likes.toLocaleString()}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-slate-400 hover:bg-transparent h-6"
                      >
                        Responder
                      </Button>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 h-6 w-6"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Área de Comentário */}
          <div className="border-t border-slate-700 p-4 bg-slate-800/50">
            <div className="flex items-center space-x-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário..."
                className="flex-1 bg-slate-800 border-slate-700 text-slate-200 resize-none min-h-[40px]"
                rows={1}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-400 hover:text-red-300 hover:bg-red-900/10"
                disabled={!newComment.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}