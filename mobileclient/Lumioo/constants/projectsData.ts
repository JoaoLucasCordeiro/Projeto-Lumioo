import { USERS, type User } from './feedData';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ProjectArea =
  | 'Computação'
  | 'Medicina'
  | 'Design'
  | 'Física'
  | 'Biologia'
  | 'Engenharia';

export interface ProjectMember {
  user: User;
  role: string;
}

export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  area: ProjectArea;
  areaIcon: string;
  coverColor: string;
  author: User;
  members: ProjectMember[];
  tags: string[];
  acceptingMembers: boolean;
  openRoles: string[];
  createdAt: string;
  links: { label: string; url: string }[];
}

// ─── Area config ─────────────────────────────────────────────────────────────

export const AREA_CONFIG: Record<ProjectArea, { icon: string; color: string }> = {
  Computação: { icon: 'laptop-outline', color: '#1e3a8a' },
  Medicina:   { icon: 'medkit-outline', color: '#7f1d1d' },
  Design:     { icon: 'color-palette-outline', color: '#4c1d95' },
  Física:     { icon: 'flask-outline', color: '#713f12' },
  Biologia:   { icon: 'leaf-outline', color: '#14532d' },
  Engenharia: { icon: 'build-outline', color: '#1e3a5f' },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_1',
    title: 'ClimaData',
    shortDescription: 'Análise de dados climáticos com Python e React para monitoramento ambiental em tempo real.',
    fullDescription: 'O ClimaData é uma plataforma open-source de análise e visualização de dados climáticos. Utilizamos sensores IoT distribuídos em pontos estratégicos para coletar temperatura, umidade, pressão e qualidade do ar. Os dados são processados com Python (Pandas, NumPy) e exibidos em dashboards interativos construídos com React.\n\nO projeto tem potencial de contribuir com pesquisas de mudanças climáticas e políticas públicas ambientais. Buscamos colaboradores para expandir a cobertura de sensores e melhorar os modelos preditivos com Machine Learning.',
    area: 'Computação',
    areaIcon: 'laptop-outline',
    coverColor: '#1e3a8a',
    author: USERS.user_3,
    members: [
      { user: USERS.user_3, role: 'Fundador & Backend' },
      { user: USERS.user_5, role: 'Análise de Dados' },
    ],
    tags: ['Python', 'React', 'IoT', 'Machine Learning', 'Open Source'],
    acceptingMembers: true,
    openRoles: ['Desenvolvedor Mobile', 'Designer UI/UX', 'Especialista em ML'],
    createdAt: '3 meses atrás',
    links: [
      { label: 'GitHub', url: 'https://github.com' },
      { label: 'Demo', url: 'https://climadata.app' },
    ],
  },
  {
    id: 'proj_2',
    title: 'NeuroAI Diagnostics',
    shortDescription: 'Inteligência artificial para diagnóstico precoce de doenças neurológicas por análise de exames de imagem.',
    fullDescription: 'O NeuroAI Diagnostics aplica deep learning na análise de ressonâncias magnéticas e tomografias para identificar padrões precoces de doenças neurológicas como Alzheimer, Parkinson e tumores cerebrais.\n\nO modelo atual possui 94% de acurácia na detecção de Alzheimer em estágio inicial, superando métodos tradicionais. O projeto conta com parceria de dois hospitais universitários e foi publicado como artigo científico em revisão.\n\nAtualmente a equipe está fechada enquanto finalizamos a validação clínica, mas em breve abriremos para novos pesquisadores.',
    area: 'Medicina',
    areaIcon: 'medkit-outline',
    coverColor: '#7f1d1d',
    author: USERS.user_2,
    members: [
      { user: USERS.user_2, role: 'Pesquisadora Principal' },
      { user: USERS.user_3, role: 'Engenheiro de ML' },
      { user: USERS.user_5, role: 'Físico Médico' },
    ],
    tags: ['Deep Learning', 'Neurologia', 'Diagnóstico', 'Visão Computacional'],
    acceptingMembers: false,
    openRoles: [],
    createdAt: '8 meses atrás',
    links: [
      { label: 'Artigo (preprint)', url: 'https://arxiv.org' },
    ],
  },
  {
    id: 'proj_3',
    title: 'EcoDesign Studio',
    shortDescription: 'Plataforma colaborativa de design sustentável conectando estudantes a empresas que precisam de soluções eco-friendly.',
    fullDescription: 'O EcoDesign Studio é uma plataforma que conecta estudantes de design com empresas comprometidas com sustentabilidade. Os estudantes desenvolvem projetos reais — embalagens, identidades visuais, produtos — enquanto ganham experiência e portfólio.\n\nAs empresas parceiras recebem soluções criativas com custo reduzido, e parte da receita é revertida para projetos de reflorestamento. Já conectamos 47 estudantes a 12 empresas nos últimos 4 meses.\n\nBuscamos desenvolvedores para expandir a plataforma e novos designers para ampliar o catálogo.',
    area: 'Design',
    areaIcon: 'color-palette-outline',
    coverColor: '#4c1d95',
    author: USERS.user_4,
    members: [
      { user: USERS.user_4, role: 'Fundadora & Design Lead' },
      { user: USERS.user_1, role: 'Desenvolvedor Frontend' },
    ],
    tags: ['Sustentabilidade', 'UX/UI', 'Design Thinking', 'Impacto Social'],
    acceptingMembers: true,
    openRoles: ['Desenvolvedor Backend', 'Designer de Produto', 'Marketing'],
    createdAt: '5 meses atrás',
    links: [
      { label: 'Website', url: 'https://ecodesign.studio' },
      { label: 'Instagram', url: 'https://instagram.com' },
    ],
  },
  {
    id: 'proj_4',
    title: 'QuantumSim Lab',
    shortDescription: 'Simulador de circuitos quânticos acessível para estudantes universitários aprenderem computação quântica.',
    fullDescription: 'O QuantumSim Lab democratiza o aprendizado de computação quântica através de um simulador visual e interativo. Diferente de ferramentas profissionais complexas como Qiskit, nosso foco é na didática — o estudante visualiza o estado dos qubits e entende intuitivamente o funcionamento dos gates quânticos.\n\nA plataforma inclui tutoriais gamificados, desafios progressivos e integração com a grade curricular de física e computação. Já foi adotado como material complementar em 3 universidades.\n\nProcuramos pesquisadores de física quântica para validar os modelos e desenvolvedores para melhorar a interface.',
    area: 'Física',
    areaIcon: 'flask-outline',
    coverColor: '#713f12',
    author: USERS.user_5,
    members: [
      { user: USERS.user_5, role: 'Fundador & Físico' },
      { user: USERS.user_3, role: 'Desenvolvedor' },
    ],
    tags: ['Computação Quântica', 'Educação', 'Simulação', 'WebAssembly'],
    acceptingMembers: true,
    openRoles: ['Pesquisador de Física Quântica', 'Designer Instrucional'],
    createdAt: '6 meses atrás',
    links: [
      { label: 'Demo online', url: 'https://quantumsim.lab' },
      { label: 'Paper', url: 'https://arxiv.org' },
    ],
  },
  {
    id: 'proj_5',
    title: 'EduBot',
    shortDescription: 'Assistente de IA conversacional para suporte acadêmico personalizado a estudantes universitários.',
    fullDescription: 'O EduBot é um assistente acadêmico baseado em IA que ajuda estudantes universitários com dúvidas de disciplinas, organização de estudos e preparação para provas. Diferente de chatbots genéricos, o EduBot se adapta ao histórico do estudante, ao currículo da sua instituição e ao seu estilo de aprendizagem.\n\nIntegramos com Google Calendar para gestão de provas, Notion para notas, e temos um modo de "estudo ativo" que faz perguntas ao invés de apenas responder.\n\nEstamos em beta fechado com 200 estudantes e buscamos expandir a equipe para lançar a versão pública.',
    area: 'Computação',
    areaIcon: 'laptop-outline',
    coverColor: '#1e3a8a',
    author: USERS.user_1,
    members: [
      { user: USERS.user_1, role: 'Fundador & Full Stack' },
      { user: USERS.user_4, role: 'UX Research' },
    ],
    tags: ['LLM', 'Educação', 'React Native', 'Node.js', 'IA'],
    acceptingMembers: true,
    openRoles: ['Engenheiro de IA', 'iOS Developer', 'Growth Hacker'],
    createdAt: '2 meses atrás',
    links: [
      { label: 'GitHub', url: 'https://github.com' },
    ],
  },
  {
    id: 'proj_6',
    title: 'BioPrint 3D',
    shortDescription: 'Bioimpressão 3D de tecidos para regeneração celular — pesquisa de ponta com potencial terapêutico revolucionário.',
    fullDescription: 'O BioPrint 3D é um projeto de pesquisa que desenvolve bio-tintas e protocolos de impressão 3D para criar scaffolds de tecidos biológicos. Nossa abordagem usa hidrogéis à base de alginato e gelatina combinados com células-tronco para regeneração de cartilagem e tecido ósseo.\n\nOs resultados preliminares mostram taxa de viabilidade celular de 87% após 72h, superando o benchmark da literatura. O projeto tem financiamento FAPESP e está em colaboração com o Hospital das Clínicas.\n\nEquipe atualmente completa, mas acompanhe as atualizações para futuras vagas.',
    area: 'Biologia',
    areaIcon: 'leaf-outline',
    coverColor: '#14532d',
    author: USERS.user_2,
    members: [
      { user: USERS.user_2, role: 'Pesquisadora Principal' },
      { user: USERS.user_5, role: 'Biofísico' },
      { user: USERS.user_3, role: 'Engenheiro de Biomateriais' },
      { user: USERS.user_4, role: 'Especialista em Células-Tronco' },
    ],
    tags: ['Biotecnologia', 'Impressão 3D', 'Células-Tronco', 'FAPESP'],
    acceptingMembers: false,
    openRoles: [],
    createdAt: '1 ano atrás',
    links: [
      { label: 'Artigo publicado', url: 'https://nature.com' },
      { label: 'FAPESP', url: 'https://fapesp.br' },
    ],
  },
];
