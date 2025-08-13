import { Heart, MessageCircle, Bookmark, MoreHorizontal, Clock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';

interface PostProps {
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
}

export function Post({
  id,
  username,
  userImage,
  image,
  caption,
  likes,
  comments,
  timePosted,
  isLiked,
  isSaved
}: PostProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-lg mb-8 hover:border-red-500/30 transition-all"
    >
      {/* Header with gradient badge */}
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="outline" className="bg-red-900/20 border-red-700/50 text-red-400">
          Novo Post
        </Badge>
      </div>

      {/* Post header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 border-2 border-red-500/30">
            <AvatarImage src={userImage} alt={username} />
            <AvatarFallback className="bg-slate-800 text-red-400 font-bold">
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
            <div className="flex items-center text-sm text-slate-400 mt-1">
              <Clock className="h-4 w-4 mr-1 text-red-400" />
              <span>{timePosted}</span>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-red-400 hover:bg-red-900/10"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Post image with gradient overlay */}
      <Link to={`/post/${id}`}>
        <div className="relative group overflow-hidden">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="aspect-square"
          >
            <img 
              src={image} 
              alt={caption} 
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
            <p className="text-slate-100 text-lg font-medium">{caption}</p>
          </div>
        </div>
      </Link>

      {/* Post actions and info */}
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <div className="flex space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`${isLiked ? 'text-red-500' : 'text-slate-400'} hover:bg-transparent`}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
              >
                <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
              </motion.div>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-400 hover:bg-transparent"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`${isSaved ? 'text-red-400' : 'text-slate-400'} hover:bg-transparent`}
          >
            <Bookmark className={`h-6 w-6 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Likes count */}
        <motion.div 
          whileHover={{ x: 5 }}
          className="text-sm font-bold text-slate-100 mb-3"
        >
          {likes.toLocaleString()} curtidas
        </motion.div>

        {/* Caption with username */}
        <div className="mb-3">
          <Link 
            to={`/perfil/${username}`} 
            className="font-bold text-slate-100 hover:text-red-400 transition-colors mr-2"
          >
            {username}
          </Link>
          <span className="text-slate-300">{caption}</span>
        </div>

        {/* Comments link */}
        <motion.div whileHover={{ x: 5 }}>
          <Link 
            to={`/post/${id}`} 
            className="text-sm text-slate-400 hover:text-red-400 transition-colors"
          >
            Ver todos os {comments.toLocaleString()} comentários
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}