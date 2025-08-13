
import { useParams } from 'react-router-dom';
import { PostDetails } from './PostDetails';

export function PostPage() {
  const { id } = useParams();
  
  // Na prática, você buscaria esses dados de uma API
  const post = {
    id: '1',
    username: 'pesquisador_upe',
    userImage: '/user1.jpg',
    image: '/post1.jpg',
    caption: 'Novo artigo publicado sobre inteligência artificial aplicada à pesquisa científica! #Lumioo #Pesquisa',
    likes: 1243,
    comments: [
      {
        id: 'c1',
        username: 'outro_pesquisador',
        userImage: '/user2.jpg',
        text: 'Parabéns pelo trabalho! Muito relevante para nossa área.',
        timePosted: '1h atrás',
        likes: 24,
        isLiked: false
      },
      // Mais comentários...
    ],
    timePosted: '2h atrás',
    isLiked: false,
    isSaved: true
  };

  return <PostDetails {...post} />;
}