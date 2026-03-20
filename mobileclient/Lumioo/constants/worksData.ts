import { USERS, type User } from './feedData';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WorkType = 'TCC' | 'Artigo' | 'Tese' | 'Dissertação';

export type WorkArea =
  | 'Computação'
  | 'Medicina'
  | 'Design'
  | 'Física'
  | 'Biologia'
  | 'Engenharia';

export interface Work {
  id: string;
  title: string;
  type: WorkType;
  area: WorkArea;
  areaIcon: string;
  coverColor: string;
  abstract: string;
  fullAbstract: string;
  authors: User[];
  institution: string;
  year: number;
  keywords: string[];
  downloadCount: number;
  viewCount: number;
  pages: number;
  doi?: string;
  publishedAt: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const TYPE_CONFIG: Record<WorkType, { icon: string; color: string }> = {
  TCC:         { icon: 'school-outline',         color: '#2563eb' },
  Artigo:      { icon: 'newspaper-outline',       color: '#7c3aed' },
  Tese:        { icon: 'ribbon-outline',          color: '#dc2626' },
  Dissertação: { icon: 'document-text-outline',   color: '#059669' },
};

export const AREA_CONFIG: Record<WorkArea, { icon: string; color: string }> = {
  Computação: { icon: 'laptop-outline',          color: '#1e3a8a' },
  Medicina:   { icon: 'medkit-outline',           color: '#7f1d1d' },
  Design:     { icon: 'color-palette-outline',    color: '#4c1d95' },
  Física:     { icon: 'flask-outline',            color: '#713f12' },
  Biologia:   { icon: 'leaf-outline',             color: '#14532d' },
  Engenharia: { icon: 'build-outline',            color: '#1e3a5f' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const COVER_ACCENT: Record<string, string> = {
  '#1e3a8a': '#93c5fd',
  '#7f1d1d': '#fca5a5',
  '#4c1d95': '#c4b5fd',
  '#713f12': '#fcd34d',
  '#14532d': '#6ee7b7',
  '#1e3a5f': '#7dd3fc',
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const INITIAL_WORKS: Work[] = [
  {
    id: 'work_1',
    title: 'Aplicação de Redes Neurais Convolucionais no Diagnóstico Precoce de Melanoma',
    type: 'Artigo',
    area: 'Medicina',
    areaIcon: 'medkit-outline',
    coverColor: '#7f1d1d',
    abstract:
      'Este artigo apresenta uma abordagem baseada em deep learning para detecção precoce de melanoma a partir de imagens dermatoscópicas, alcançando 96.2% de acurácia.',
    fullAbstract:
      'O melanoma é o tipo mais letal de câncer de pele, mas quando detectado precocemente apresenta alta taxa de cura. Este trabalho propõe o uso de Redes Neurais Convolucionais (CNNs) para análise automatizada de imagens dermatoscópicas, visando auxiliar dermatologistas no diagnóstico precoce.\n\nUtilizamos a base de dados ISIC 2020 com 33.126 imagens rotuladas por especialistas. O modelo ResNet-50 adaptado com transfer learning alcançou acurácia de 96.2%, sensibilidade de 94.8% e especificidade de 97.1%, superando métricas de modelos anteriores na literatura.\n\nA ferramenta foi desenvolvida como aplicativo móvel e testada com 3 dermatologistas em ambiente clínico real, mostrando redução de 28% no tempo de triagem. Os resultados sugerem potencial clínico significativo para adoção em atenção primária.',
    authors: [USERS.user_2, USERS.user_5],
    institution: 'USP — Faculdade de Medicina',
    year: 2024,
    keywords: ['Deep Learning', 'Melanoma', 'CNN', 'Dermatologia', 'Diagnóstico'],
    downloadCount: 1247,
    viewCount: 4832,
    pages: 12,
    doi: '10.1234/med.2024.001',
    publishedAt: 'Março 2024',
  },
  {
    id: 'work_2',
    title: 'Desenvolvimento de um Framework Serverless para Microsserviços de Alta Disponibilidade',
    type: 'TCC',
    area: 'Computação',
    areaIcon: 'laptop-outline',
    coverColor: '#1e3a8a',
    abstract:
      'Trabalho de conclusão de curso que propõe um framework open-source para orquestração de microsserviços em arquitetura serverless, com foco em resiliência e escalabilidade automática.',
    fullAbstract:
      'A arquitetura serverless emergiu como paradigma dominante para sistemas de alta escala, porém a orquestração de microsserviços neste modelo ainda carece de ferramentas padronizadas. Este TCC apresenta o LumiServ, um framework open-source desenvolvido em TypeScript que abstrai a complexidade de gerenciamento de funções serverless em múltiplos provedores (AWS Lambda, Google Cloud Functions, Azure Functions).\n\nO framework implementa padrões de circuit breaker, retry automático, distributed tracing e health checks configuráveis via YAML. Os testes de carga com k6 demonstraram throughput de 50.000 req/s com latência P99 abaixo de 80ms.\n\nO projeto foi validado em ambiente de produção em uma startup parceira durante 3 meses, processando mais de 2 bilhões de invocações sem downtime.',
    authors: [USERS.user_1],
    institution: 'UNICAMP — Instituto de Computação',
    year: 2024,
    keywords: ['Serverless', 'Microsserviços', 'Cloud', 'TypeScript', 'DevOps'],
    downloadCount: 892,
    viewCount: 3541,
    pages: 87,
    publishedAt: 'Junho 2024',
  },
  {
    id: 'work_3',
    title: 'Design Emocional em Interfaces Digitais: Como a Estética Influencia a Confiança do Usuário',
    type: 'Dissertação',
    area: 'Design',
    areaIcon: 'color-palette-outline',
    coverColor: '#4c1d95',
    abstract:
      'Dissertação de mestrado que investiga a relação entre escolhas estéticas em interfaces digitais e a percepção de confiança pelos usuários, com 280 participantes em estudo longitudinal.',
    fullAbstract:
      'O design emocional representa uma dimensão frequentemente subestimada no desenvolvimento de produtos digitais. Esta dissertação investiga empiricamente como elementos estéticos — tipografia, paleta de cores, hierarquia visual e microanimações — influenciam a confiança e o engajamento de usuários em plataformas financeiras digitais.\n\nO estudo envolveu 280 participantes em um experimento longitudinal de 6 semanas, testando 4 variações de interface de um aplicativo de investimentos. Métricas coletadas incluíram biometria facial (EEG), rastreamento ocular, NPS e comportamento de uso.\n\nOs resultados revelam que interfaces com espaço branco generoso e tipografia serifada aumentaram a percepção de confiança em 34% e a taxa de conversão em 22% em comparação a designs mais compactos. O trabalho propõe um framework de avaliação de design emocional aplicável a produtos financeiros digitais.',
    authors: [USERS.user_4],
    institution: 'ESPM — Mestrado em Design',
    year: 2023,
    keywords: ['Design Emocional', 'UX', 'Confiança', 'Fintech', 'Pesquisa'],
    downloadCount: 673,
    viewCount: 2198,
    pages: 134,
    doi: '10.5678/design.2023.042',
    publishedAt: 'Dezembro 2023',
  },
  {
    id: 'work_4',
    title: 'Computação Quântica Aplicada à Otimização de Rotas em Logística Urbana',
    type: 'Tese',
    area: 'Física',
    areaIcon: 'flask-outline',
    coverColor: '#713f12',
    abstract:
      'Tese de doutorado que demonstra vantagem quântica no problema do caixeiro viajante para logística urbana, utilizando algoritmos QAOA em hardware da IBM Quantum.',
    fullAbstract:
      'O Problema do Caixeiro Viajante (TSP) é NP-difícil e central em logística urbana. Esta tese demonstra, pela primeira vez em hardware quântico disponível comercialmente, vantagem computacional mensurável em instâncias do TSP com até 24 cidades utilizando o Quantum Approximate Optimization Algorithm (QAOA).\n\nOs experimentos foram conduzidos em processadores de 127 qubits da IBM Quantum (Eagle e Osprey) com técnicas avançadas de mitigação de erros. Para instâncias com 20 cidades, o QAOA com profundidade p=5 encontrou soluções ótimas ou sub-ótimas (≤2% do ótimo) em 87% dos casos, com speedup de 3.2x em relação a heurísticas clássicas equivalentes.\n\nA tese também propõe um modelo híbrido quântico-clássico para escalonamento gradual à medida que hardware quântico mais capaz se torna disponível. O trabalho tem colaboração com a empresa de logística Movile e potencial de redução de 15-20% em custos operacionais.',
    authors: [USERS.user_5],
    institution: 'ITA — Programa de Pós-Graduação em Física',
    year: 2024,
    keywords: ['Computação Quântica', 'QAOA', 'Logística', 'TSP', 'IBM Quantum'],
    downloadCount: 2103,
    viewCount: 8914,
    pages: 203,
    doi: '10.9012/phys.2024.107',
    publishedAt: 'Agosto 2024',
  },
  {
    id: 'work_5',
    title: 'Biorremediação de Solos Contaminados com Metais Pesados por Fungos Micorrízicos',
    type: 'Artigo',
    area: 'Biologia',
    areaIcon: 'leaf-outline',
    coverColor: '#14532d',
    abstract:
      'Estudo experimental que demonstra eficácia de consórcios de fungos micorrízicos arbusculares na fitorremediação de solos contaminados com chumbo, cádmio e mercúrio.',
    fullAbstract:
      'A contaminação de solos por metais pesados representa ameaça crítica à segurança alimentar e saúde pública. Este trabalho investiga o potencial de consórcios de fungos micorrízicos arbusculares (AMF) — especialmente Rhizophagus irregularis e Funneliformis mosseae — em acelerar a fitorremediação de solos contaminados com Pb²⁺, Cd²⁺ e Hg²⁺.\n\nExperimentos em casa de vegetação durante 120 dias demonstraram que plantas de girassol inoculadas com AMF acumularam 3.4x mais Pb e 2.8x mais Cd em parte aérea comparado ao controle, com redução de 67% da concentração de metais no solo.\n\nA análise metabolômica por espectrometria de massas revelou que AMF induzem síntese de fitoquelatinas e metalotioneínas nas raízes, mecanismo chave para tolerância e acúmulo. Os resultados abrem perspectivas para biorremediação de áreas agrícolas degradadas com baixo custo e impacto ambiental mínimo.',
    authors: [USERS.user_2, USERS.user_3],
    institution: 'UNESP — Instituto de Biociências',
    year: 2023,
    keywords: ['Biorremediação', 'Micorrizas', 'Metais Pesados', 'Fitorremediação', 'Solos'],
    downloadCount: 456,
    viewCount: 1732,
    pages: 16,
    doi: '10.3456/bio.2023.089',
    publishedAt: 'Setembro 2023',
  },
  {
    id: 'work_6',
    title: 'Análise de Falhas em Estruturas de Aço Submetidas a Cargas Sísmicas: Modelagem FEM',
    type: 'TCC',
    area: 'Engenharia',
    areaIcon: 'build-outline',
    coverColor: '#1e3a5f',
    abstract:
      'TCC que aplica o Método dos Elementos Finitos para simular e prever falhas em estruturas metálicas sob ação de cargas sísmicas, com validação experimental em mesa vibratória.',
    fullAbstract:
      'O Brasil, apesar de não ser região de alto risco sísmico, possui áreas com atividade moderada que justificam o estudo de resposta sísmica em edificações. Este TCC desenvolve e valida modelos de elementos finitos (FEM) para análise não-linear de pórticos de aço sob excitação sísmica, utilizando o software ANSYS Mechanical.\n\nOs modelos foram calibrados com ensaios experimentais em mesa vibratória do Laboratório de Engenharia Estrutural da UNICAMP, testando 4 configurações de pórticos com variações de rigidez e amortecimento. O erro médio entre simulação e experimento foi de apenas 3.7%.\n\nA análise paramétrica identificou que a razão altura/largura do pórtico é o principal fator de vulnerabilidade, com estruturas de proporção 4:1 apresentando 2.8x maior deslocamento máximo que proporções 2:1 sob o mesmo espectro de resposta. O trabalho contribui com um protocolo de inspeção preventiva para estruturas existentes.',
    authors: [USERS.user_3],
    institution: 'UNICAMP — Faculdade de Engenharia Civil',
    year: 2024,
    keywords: ['FEM', 'Engenharia Estrutural', 'Sísmica', 'Aço', 'ANSYS'],
    downloadCount: 334,
    viewCount: 1209,
    pages: 112,
    publishedAt: 'Novembro 2024',
  },
];
