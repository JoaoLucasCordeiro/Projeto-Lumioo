// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  username: string;
  initials: string;
  institution: string;
  avatarColor: string;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  user: User;
  content: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  commentsCount: number;
  comments: Comment[];
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const CURRENT_USER_ID = 'user_1';

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const USERS: Record<string, User> = {
  user_1: {
    id: 'user_1', name: 'João Lucas', username: '@joaolucas',
    initials: 'JL', institution: 'USP · Eng. Computação', avatarColor: '#ff3131',
  },
  user_2: {
    id: 'user_2', name: 'Maria Silva', username: '@mariasilva',
    initials: 'MS', institution: 'UNICAMP · Medicina', avatarColor: '#3b82f6',
  },
  user_3: {
    id: 'user_3', name: 'Pedro Costa', username: '@pedrocosta',
    initials: 'PC', institution: 'UFMG · Ciência da Computação', avatarColor: '#10b981',
  },
  user_4: {
    id: 'user_4', name: 'Ana Ferreira', username: '@anaferreira',
    initials: 'AF', institution: 'PUC · Design', avatarColor: '#8b5cf6',
  },
  user_5: {
    id: 'user_5', name: 'Carlos Lima', username: '@carloslima',
    initials: 'CL', institution: 'UFRJ · Física', avatarColor: '#f59e0b',
  },
};

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1', user: USERS.user_2,
    content: 'Acabei de publicar meu artigo sobre inteligência artificial aplicada ao diagnóstico precoce de câncer! Foram 2 anos de pesquisa intensa. Muito orgulhosa deste resultado! 🎉',
    likes: 87, liked: false, saved: false, commentsCount: 14,
    comments: [
      { id: 'c1', user: USERS.user_3, text: 'Parabéns! Trabalho incrível! Em qual journal vai publicar?', createdAt: '45min' },
      { id: 'c2', user: USERS.user_1, text: 'Sensacional, Maria! Mal posso esperar para ler.', createdAt: '40min' },
      { id: 'c3', user: USERS.user_4, text: 'Isso vai mudar muitas vidas! Que pesquisa fantástica 🙌', createdAt: '35min' },
      { id: 'c4', user: USERS.user_5, text: 'Compartilhei com o grupo de pesquisa da UFRJ. Todos acharam incrível!', createdAt: '30min' },
      { id: 'c5', user: USERS.user_3, text: 'Já está disponível para leitura? Manda o link!', createdAt: '20min' },
    ],
    createdAt: '1h',
  },
  {
    id: 'post_2', user: USERS.user_1,
    content: 'Finalizei meu TCC sobre otimização de algoritmos de ML para dispositivos embarcados. Apresento na próxima semana! Quem tiver dicas, pode mandar 😅',
    likes: 42, liked: true, saved: true, commentsCount: 8,
    comments: [
      { id: 'c6', user: USERS.user_4, text: 'Vai lá! Você consegue! 💪', createdAt: '2h' },
      { id: 'c7', user: USERS.user_2, text: 'Dica: pratique com perguntas difíceis antes. Funciona muito!', createdAt: '1h30' },
      { id: 'c8', user: USERS.user_5, text: 'Quantização de modelos pode ajudar na otimização. Boa sorte!', createdAt: '1h' },
    ],
    createdAt: '3h',
  },
  {
    id: 'post_3', user: USERS.user_3,
    content: 'Procurando colaboradores para um projeto open-source de análise de dados climáticos com Python e React. Se tiver interesse, manda mensagem! Seria incrível ter pessoas de diferentes áreas no time.',
    likes: 23, liked: false, saved: false, commentsCount: 5,
    comments: [
      { id: 'c9', user: USERS.user_5, text: 'Tenho interesse! Mando DM.', createdAt: '4h' },
      { id: 'c10', user: USERS.user_2, text: 'Compartilhei com minha turma, projeto incrível!', createdAt: '3h' },
      { id: 'c11', user: USERS.user_4, text: 'Posso ajudar com a parte de UI/UX do dashboard!', createdAt: '2h' },
    ],
    createdAt: '5h',
  },
  {
    id: 'post_4', user: USERS.user_4,
    content: 'Workshop de UX/UI para estudantes universitários neste sábado! Vamos falar sobre design thinking, prototipação e tendências de 2026. Inscrições gratuitas pelo link na bio ✨',
    likes: 156, liked: false, saved: false, commentsCount: 29,
    comments: [
      { id: 'c12', user: USERS.user_1, text: 'Já me inscrevi! Ansioso 🙌', createdAt: '7h' },
      { id: 'c13', user: USERS.user_2, text: 'Vai ter certificado? Pergunta de estudante kkk', createdAt: '6h' },
      { id: 'c14', user: USERS.user_3, text: 'Compartilhando com todo mundo que conheço! Tema incrível.', createdAt: '5h' },
      { id: 'c15', user: USERS.user_5, text: 'Sábado de manhã ou à tarde?', createdAt: '4h' },
    ],
    createdAt: '8h',
  },
  {
    id: 'post_5', user: USERS.user_1,
    content: 'Reflexão do dia: a academia me ensinou que falhar faz parte do processo. Meu primeiro experimento de TCC deu errado, o segundo também... mas no terceiro acertei. Não desistam! 🙏',
    likes: 201, liked: false, saved: false, commentsCount: 33,
    comments: [
      { id: 'c16', user: USERS.user_2, text: 'Que mensagem linda! Preciso ouvir isso hoje.', createdAt: '23h' },
      { id: 'c17', user: USERS.user_3, text: 'Salvando esse post 🔥', createdAt: '22h' },
      { id: 'c18', user: USERS.user_4, text: 'Isso me deu forças para continuar meu projeto. Obrigada!', createdAt: '20h' },
      { id: 'c19', user: USERS.user_5, text: 'Persistência é tudo! Ótima reflexão.', createdAt: '18h' },
    ],
    createdAt: '1d',
  },
  {
    id: 'post_6', user: USERS.user_5,
    content: 'Publicamos um paper sobre supercondutividade em temperatura ambiente! Ainda em peer review, mas estamos muito otimistas. A física nunca deixa de surpreender. 🔬⚡',
    likes: 312, liked: false, saved: false, commentsCount: 45,
    comments: [
      { id: 'c20', user: USERS.user_4, text: 'Isso seria revolucionário! Boa sorte no review!', createdAt: '2d' },
      { id: 'c21', user: USERS.user_2, text: 'Cadê o preprint? Quero ler já!', createdAt: '1d' },
      { id: 'c22', user: USERS.user_3, text: 'Se confirmado, Nobel de Física garantido!', createdAt: '1d' },
      { id: 'c23', user: USERS.user_1, text: 'Que notícia incrível! Qual é a temperatura ambiente alcançada?', createdAt: '20h' },
    ],
    createdAt: '2d',
  },
];
