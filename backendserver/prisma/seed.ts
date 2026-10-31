/**
 * Seed de desenvolvimento do Lumioo.
 *
 * Uso (dentro de backendserver/):  npm run seed
 *
 * - Cria 10 usuários, 30 posts, comentários, curtidas (posts e comentários), posts salvos,
 *   seguidores, bloqueio, 8 projetos (com equipe), 12 trabalhos (públicos e privados),
 *   pedidos de acesso e 5 conversas com mensagens.
 * - Idempotente: todos os usuários do seed usam e-mail @seed.lumioo.dev. A cada execução os dados
 *   desses usuários são apagados e recriados. Usuários reais/de teste NÃO são tocados.
 * - Determinístico: usa gerador pseudo-aleatório com semente fixa (mesmos dados a cada execução,
 *   exceto as datas, que são relativas a "agora").
 * - Todos os usuários têm a senha: Lumioo@123
 * - Imagens: posts, projetos e trabalhos usam fotos temáticas de prisma/seed-images/ (Wikimedia Commons,
 *   créditos em CREDITS.md), embutidas como base64 — mesmo formato que o app usa. Avatares vêm de
 *   randomuser.me e capas de perfil de picsum.photos (URLs, precisam de internet).
 *   Para usar só imagens SVG geradas (sem internet nem arquivos): SEED_OFFLINE=1 npm run seed
 */
import { PrismaClient, AcademicLevel, ProjectStatus, WorkType, WorkVisibility, WorkArea, WorkAccessStatus, type User, type Post, type Work } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const SEED_DOMAIN = '@seed.lumioo.dev';
const PASSWORD = 'Lumioo@123';

// ─── Utilitários ──────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261021);
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T,>(arr: readonly T[]): T => arr[int(0, arr.length - 1)];
function sample<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) out.push(copy.splice(int(0, copy.length - 1), 1)[0]);
  return out;
}
const MS_DAY = 86_400_000;
const daysAgo = (d: number, jitterHours = 12) =>
  new Date(Date.now() - d * MS_DAY - int(0, jitterHours * 3_600_000));

const b64 = (s: string) => Buffer.from(s, 'utf-8').toString('base64');

/** Imagem SVG (data URI) com gradiente e texto, leve o bastante para ir no banco. */
function svgImage(label: string, w = 800, h = 450, hue = int(0, 360)): string {
  const safe = label.replace(/[<>&"]/g, '');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="hsl(${hue},70%,38%)"/><stop offset="1" stop-color="hsl(${(hue + 50) % 360},70%,22%)"/>` +
    `</linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>` +
    `<text x="50%" y="50%" fill="rgba(255,255,255,.9)" font-family="sans-serif" font-size="${Math.round(w / 20)}" ` +
    `font-weight="700" text-anchor="middle" dominant-baseline="middle">${safe}</text></svg>`;
  return `data:image/svg+xml;base64,${b64(svg)}`;
}

const OFFLINE = !!process.env.SEED_OFFLINE;

function avatarImage(name: string, portrait: string): string {
  if (!OFFLINE) return `https://randomuser.me/api/portraits/${portrait}.jpg`;
  const initials = name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  return svgImage(initials, 256, 256, (name.length * 37) % 360);
}

/** Foto de banco de imagens com semente fixa (mesma imagem a cada execução). */
function photo(seed: string, w: number, h: number, label: string): string {
  if (OFFLINE) return svgImage(label, w, h);
  return `https://picsum.photos/seed/lumioo-${encodeURIComponent(seed)}/${w}/${h}`;
}

/** Foto temática de prisma/seed-images/<nome>.jpg em data URI; cai para SVG se faltar o arquivo. */
function localImage(name: string, label: string, w = 800, h = 450): string {
  const file = path.join(__dirname, 'seed-images', `${name}.jpg`);
  if (OFFLINE || !fs.existsSync(file)) return svgImage(label, w, h);
  return `data:image/jpeg;base64,${fs.readFileSync(file).toString('base64')}`;
}

/** PDF mínimo e válido (uma página com o título), em data URI base64. */
function makePdf(title: string): string {
  const text = title.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[()\\]/g, '').replace(/[^\x20-\x7E]/g, '?');
  const content = `BT /F1 20 Tf 72 720 Td (${text.slice(0, 70)}) Tj 0 -30 Td /F1 12 Tf (Documento de exemplo gerado pelo seed do Lumioo.) Tj ET`;
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach(o => { pdf += `${String(o).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return `data:application/pdf;base64,${b64(pdf)}`;
}

// ─── Dados ────────────────────────────────────────────────────────────────────

interface SeedUser {
  fullName: string; username: string; institution: string; level: AcademicLevel;
  bio: string; born: string; portrait: string; // ex.: 'women/44' (randomuser.me)
}

const USERS: SeedUser[] = [
  { fullName: 'Ana Beatriz Souza', username: 'ana_souza', institution: 'Universidade de Pernambuco (UPE)', level: 'PHD',
    bio: 'Doutoranda em Ciência da Computação. Pesquiso aprendizado de máquina aplicado à saúde pública.', born: '1994-03-12', portrait: 'women/44' },
  { fullName: 'Carlos Eduardo Lima', username: 'carlos_lima', institution: 'Universidade Federal de Pernambuco (UFPE)', level: 'MASTER',
    bio: 'Mestrando em Engenharia Civil. Interesse em concreto sustentável e materiais alternativos.', born: '1996-07-30', portrait: 'men/32' },
  { fullName: 'Mariana Oliveira', username: 'mariana_oliveira', institution: 'Universidade de Pernambuco (UPE)', level: 'UNDERGRADUATE',
    bio: 'Graduanda em Biologia. Apaixonada por ecologia de manguezais e divulgação científica.', born: '2002-11-05', portrait: 'women/68' },
  { fullName: 'Roberto Menezes', username: 'prof_roberto', institution: 'Universidade Federal de Pernambuco (UFPE)', level: 'PROFESSOR',
    bio: 'Professor de Engenharia de Software. Orientador de TCCs, dissertações e teses.', born: '1979-01-22', portrait: 'men/75' },
  { fullName: 'Juliana Ferreira', username: 'juliana_ferreira', institution: 'Universidade Federal Rural de Pernambuco (UFRPE)', level: 'MASTER',
    bio: 'Mestranda em Agronomia. Pesquisa em manejo sustentável do solo no semiárido.', born: '1995-09-18', portrait: 'women/12' },
  { fullName: 'Pedro Henrique Alves', username: 'pedro_alves', institution: 'Universidade de Pernambuco (UPE)', level: 'UNDERGRADUATE',
    bio: 'Graduando em Sistemas de Informação. Gosto de desenvolvimento web e dados abertos.', born: '2003-04-09', portrait: 'men/22' },
  { fullName: 'Fernanda Costa', username: 'fernanda_costa', institution: 'Universidade Federal do Ceará (UFC)', level: 'PHD',
    bio: 'Doutoranda em Saúde Coletiva. Estudo desigualdades regionais no acesso à saúde.', born: '1992-12-01', portrait: 'women/65' },
  { fullName: 'Lucas Martins', username: 'lucas_martins', institution: 'Universidade de São Paulo (USP)', level: 'MASTER',
    bio: 'Mestrando em Física. Trabalho com simulações de matéria condensada.', born: '1997-06-14', portrait: 'men/45' },
  { fullName: 'Camila Rocha', username: 'profa_camila', institution: 'Universidade Estadual de Campinas (UNICAMP)', level: 'PROFESSOR',
    bio: 'Professora de Linguística. Pesquisa variação linguística e ensino de português.', born: '1981-08-27', portrait: 'women/33' },
  { fullName: 'Rafael Nogueira', username: 'rafael_nogueira', institution: 'Universidade Federal da Bahia (UFBA)', level: 'UNDERGRADUATE',
    bio: 'Graduando em Ciências Sociais. Interesse em políticas públicas e cultura.', born: '2001-02-20', portrait: 'men/52' },
];

interface SeedPost { by: number; caption: string; tags: string[]; location?: string; image?: string }

const POSTS: SeedPost[] = [
  { by: 0, caption: 'Acabei de submeter meu artigo sobre detecção precoce de diabetes com redes neurais. Agora é esperar a revisão por pares! 🤞', tags: ['machinelearning', 'saude', 'artigo'], location: 'Recife, PE', image: 'post_neural' },
  { by: 1, caption: 'Resultados preliminares: o concreto com 15% de resíduo cerâmico atingiu 32 MPa aos 28 dias. Promissor para obras de baixo custo.', tags: ['engenhariacivil', 'sustentabilidade'], location: 'UFPE - Recife, PE', image: 'post_concrete' },
  { by: 2, caption: 'Campo de hoje no manguezal de Itamaracá: monitoramento de caranguejo-uçá. Ciência de verdade se faz com bota e lama! 🦀', tags: ['biologia', 'manguezal', 'campo'], location: 'Itamaracá, PE', image: 'post_mangrove' },
  { by: 3, caption: 'Dica para quem está escrevendo o TCC: comece pela introdução só no final. Escreva primeiro metodologia e resultados.', tags: ['tcc', 'dicas', 'escritaacademica'] },
  { by: 4, caption: 'Teste de infiltração do solo concluído. Cobertura morta reduziu a perda de água em 40% no semiárido.', tags: ['agronomia', 'semiarido', 'solo'], location: 'Serra Talhada, PE', image: 'post_caatinga' },
  { by: 5, caption: 'Meu primeiro projeto open source acadêmico no ar! Um painel de dados abertos da UPE feito com React. Feedback é muito bem-vindo.', tags: ['react', 'dadosabertos', 'opensource'], location: 'Recife, PE' },
  { by: 6, caption: 'Revisão sistemática concluída: 87 estudos sobre acesso à atenção primária no Nordeste. A desigualdade intra-regional é gritante.', tags: ['saudecoletiva', 'revisaosistematica'], location: 'Fortaleza, CE' },
  { by: 7, caption: 'Simulação Monte Carlo rodando há 14 horas no cluster. Se tudo der certo, amanhã tenho o diagrama de fases. ☕', tags: ['fisica', 'simulacao', 'cluster'], location: 'São Paulo, SP', image: 'post_cluster' },
  { by: 8, caption: 'Aula de hoje sobre variação linguística: "oxente", "uai" e "bah" são marcadores regionais, não erros. Vamos discutir no seminário.', tags: ['linguistica', 'variacao', 'ensino'], location: 'Campinas, SP' },
  { by: 9, caption: 'Primeira leitura de Bourdieu da graduação. Cabeça explodindo com o conceito de capital cultural.', tags: ['sociologia', 'leitura'], location: 'Salvador, BA', image: 'post_library' },
  { by: 0, caption: 'Dica de ferramenta: Zotero + Better BibTeX salvou minha vida na qualificação. Referências automáticas no LaTeX.', tags: ['zotero', 'latex', 'dicas'] },
  { by: 3, caption: 'Abertas as inscrições para o grupo de estudos em Arquitetura de Software. Encontros quinzenais, online e gratuito.', tags: ['arquitetura', 'grupodeestudos', 'software'], location: 'Online' },
  { by: 1, caption: 'Congresso Brasileiro de Concreto: apresentei o trabalho e recebi ótimos questionamentos sobre durabilidade. Já anotei os próximos testes.', tags: ['congresso', 'concreto'], location: 'Foz do Iguaçu, PR', image: 'post_congress' },
  { by: 2, caption: 'Alguém tem indicação de bom material sobre estatística para biólogos? Estou travada em ANOVA de medidas repetidas.', tags: ['estatistica', 'biologia', 'ajuda'] },
  { by: 4, caption: 'Defesa de qualificação marcada para o mês que vem. Ansiedade nível máximo, mas os dados estão bonitos.', tags: ['mestrado', 'qualificacao'], location: 'UFRPE - Recife, PE' },
  { by: 5, caption: 'Aprendi hoje que 80% do tempo de uma pesquisa com dados é limpeza. Pandas, me ajuda. 🐼', tags: ['dados', 'python', 'pandas'] },
  { by: 6, caption: 'Visita técnica a unidades de saúde do interior do Ceará. Ver a realidade de perto muda a forma como a gente interpreta os números.', tags: ['saude', 'campo', 'interior'], location: 'Sobral, CE', image: 'post_clinic' },
  { by: 7, caption: 'Alguém aqui já usou GPU para acelerar simulações de spin? Procuro referências sobre implementação em CUDA.', tags: ['cuda', 'fisica', 'hpc'] },
  { by: 8, caption: 'Publicado o livro de atividades sobre ensino de gramática contextualizada. Material aberto para professores da rede pública.', tags: ['educacao', 'portugues', 'materialaberto'], location: 'Campinas, SP', image: 'post_classroom' },
  { by: 9, caption: 'Entrevistas de campo na feira de São Joaquim: cultura e economia popular se misturam de um jeito fascinante.', tags: ['culturapopular', 'pesquisadecampo'], location: 'Salvador, BA', image: 'post_market' },
  { by: 0, caption: 'Palestra convidada na UPE sobre IA ética na saúde. Casa cheia e muitas perguntas boas sobre viés em dados clínicos.', tags: ['ia', 'etica', 'saude'], location: 'UPE - Recife, PE', image: 'post_ai' },
  { by: 3, caption: 'Parabéns à turma de 2026.1 pelas defesas de TCC! Quatro trabalhos nota máxima. Orgulho de orientar vocês. 🎓', tags: ['tcc', 'defesa', 'orgulho'], location: 'UFPE - Recife, PE' },
  { by: 1, caption: 'Pergunta para a comunidade: vale a pena fazer doutorado direto após o mestrado ou trabalhar um tempo na indústria antes?', tags: ['carreira', 'doutorado', 'duvida'] },
  { by: 2, caption: 'Apresentei meu pôster na Semana de Ciência e Tecnologia. Duas pessoas pediram o contato para colaborar!', tags: ['poster', 'divulgacaocientifica'], location: 'Recife, PE', image: 'post_poster' },
  { by: 4, caption: 'Novo artigo no ar: "Cobertura morta e retenção hídrica em solos do semiárido". Link nos comentários do meu perfil em breve.', tags: ['artigo', 'agronomia', 'publicacao'] },
  { by: 5, caption: 'Hackathon universitário esse fim de semana! Nosso time vai propor uma plataforma de matching entre alunos e projetos de pesquisa.', tags: ['hackathon', 'inovacao'], location: 'Recife, PE' },
  { by: 7, caption: 'O diagrama de fases saiu! Transição de primeira ordem bem definida. Obrigado a todos que torceram pelo cluster. 🎉', tags: ['fisica', 'resultados'], location: 'São Paulo, SP', image: 'post_phase' },
  { by: 9, caption: 'Resenha do mês: "A Distinção" é pesado, mas muda a forma de olhar a própria universidade. Recomendo!', tags: ['resenha', 'sociologia', 'livros'] },
  { by: 6, caption: 'Abrindo vaga de iniciação científica em saúde coletiva: análise de dados do SUS. Interessados, chamem no direct.', tags: ['iniciacaocientifica', 'vaga', 'sus'], location: 'Fortaleza, CE' },
  { by: 4, caption: 'Primeiro dia de coleta da safra: amostras de solo etiquetadas e câmara fria lotada. Quem diria que ciência também é logística!', tags: ['agronomia', 'coleta', 'campo'], location: 'Serra Talhada, PE', image: 'post_soil' },
];

const COMMENT_POOL = [
  'Parabéns pelo trabalho! Muito bom.',
  'Que resultado interessante, quer compartilhar a metodologia?',
  'Também estou pesquisando algo parecido, vamos trocar ideias!',
  'Excelente dica, vou aplicar na minha pesquisa.',
  'Concordo totalmente. Obrigado por compartilhar!',
  'Isso é incrível. Qual foi o tamanho da amostra?',
  'Boa sorte! Tenho certeza de que vai dar certo.',
  'Salvei para ler com calma depois.',
  'Muito relevante para a nossa área, parabéns!',
  'Já passei por isso, posso ajudar se precisar.',
  'Que orgulho de ver a produção acadêmica avançando! 👏',
  'Ficou ótimo! Dá para ver o esforço por trás.',
  'Tem algum link ou material de apoio sobre isso?',
  'Adorei a abordagem, bem diferente do que se vê por aí.',
  'Interessante! Gostaria de saber mais detalhes.',
  'Obrigado pela indicação, vai ajudar muito.',
  'Compartilhando com meu grupo de pesquisa.',
  'Isso merece ser publicado em um bom periódico!',
  'Ótimo conteúdo, continue postando.',
  'Fico no aguardo dos próximos resultados!',
];

interface SeedProject {
  owner: number; title: string; description: string; category: string; status: ProjectStatus;
  campus?: string; city: string; state: string; team: [string, string][]; contact?: boolean; img: string;
}

const PROJECTS: SeedProject[] = [
  { owner: 0, img: 'project_medical', title: 'DiagnoSaúde: IA para triagem de diabetes', category: 'Computação', status: 'IN_PROGRESS',
    description: 'Sistema de apoio à decisão clínica que usa redes neurais para identificar pacientes com risco elevado de diabetes tipo 2 a partir de dados de atenção primária. Em parceria com unidades básicas de saúde do Recife.',
    campus: 'Campus Santo Amaro', city: 'Recife', state: 'PE', team: [['Ana Beatriz Souza', 'Coordenadora'], ['Pedro Henrique Alves', 'Desenvolvedor'], ['Dra. Helena Prado', 'Consultora clínica']] },
  { owner: 1, img: 'project_concrete', title: 'EcoConcreto: concreto com resíduos cerâmicos', category: 'Engenharia', status: 'IN_PROGRESS',
    description: 'Estudo da substituição parcial do agregado por resíduo de cerâmica vermelha em concretos estruturais, avaliando resistência, durabilidade e impacto ambiental.',
    campus: 'Campus Recife', city: 'Recife', state: 'PE', team: [['Carlos Eduardo Lima', 'Pesquisador principal'], ['Roberto Menezes', 'Orientador'], ['Tiago Barros', 'Técnico de laboratório']] },
  { owner: 2, img: 'project_mangrove', title: 'Guardiões do Manguezal', category: 'Biologia', status: 'OPEN_FOR_APPLICATIONS',
    description: 'Projeto de monitoramento participativo da fauna de manguezais do litoral norte de Pernambuco. Buscamos estudantes de biologia e áreas afins para trabalho de campo e análise de dados.',
    campus: 'Campus Mata Norte', city: 'Itamaracá', state: 'PE', contact: true,
    team: [['Mariana Oliveira', 'Coordenadora de campo'], ['Prof. Marcos Teles', 'Orientador']] },
  { owner: 3, img: 'project_software', title: 'Observatório de Engenharia de Software', category: 'Computação', status: 'COMPLETED',
    description: 'Levantamento nacional das práticas de engenharia de software em startups brasileiras. Resultados publicados em periódico e disponibilizados em formato aberto.',
    campus: 'Centro de Informática', city: 'Recife', state: 'PE', team: [['Roberto Menezes', 'Coordenador'], ['Ana Beatriz Souza', 'Pesquisadora'], ['Lívia Campos', 'Bolsista']] },
  { owner: 4, img: 'project_caatinga', title: 'Solo Vivo no Semiárido', category: 'Outra', status: 'IN_PROGRESS',
    description: 'Avaliação de técnicas de cobertura do solo e manejo de água em pequenas propriedades do semiárido pernambucano, com foco em segurança alimentar.',
    campus: 'Unidade Acadêmica de Serra Talhada', city: 'Serra Talhada', state: 'PE', team: [['Juliana Ferreira', 'Pesquisadora'], ['Prof. Antônio Cabral', 'Orientador'], ['Sebastião Lima', 'Agricultor parceiro']] },
  { owner: 6, img: 'project_map', title: 'Mapa da Atenção Primária no Nordeste', category: 'Medicina', status: 'OPEN_FOR_APPLICATIONS',
    description: 'Mapeamento da cobertura e da qualidade da atenção primária à saúde nos municípios do Nordeste, usando dados abertos do SUS. Vagas para análise de dados e visualização.',
    campus: 'Campus do Porangabuçu', city: 'Fortaleza', state: 'CE', contact: true,
    team: [['Fernanda Costa', 'Coordenadora'], ['Dr. Paulo Vieira', 'Epidemiologista']] },
  { owner: 7, img: 'project_physics', title: 'Transições de fase em sistemas de spin', category: 'Física', status: 'COMPLETED',
    description: 'Simulações Monte Carlo para identificar transições de fase em modelos de spin bidimensionais, com implementação paralela em cluster.',
    campus: 'Instituto de Física', city: 'São Paulo', state: 'SP', team: [['Lucas Martins', 'Pesquisador'], ['Profa. Beatriz Nunes', 'Orientadora']] },
  { owner: 8, img: 'project_classroom', title: 'Português em Contexto: material aberto', category: 'Design', status: 'IN_PROGRESS',
    description: 'Produção de materiais didáticos abertos para ensino de gramática contextualizada, com ilustrações e atividades para a rede pública de ensino.',
    campus: 'Instituto de Estudos da Linguagem', city: 'Campinas', state: 'SP', team: [['Camila Rocha', 'Coordenadora'], ['Rafael Nogueira', 'Pesquisador voluntário'], ['Bianca Tavares', 'Ilustradora']] },
];

interface SeedWork {
  author: number; title: string; type: WorkType; visibility: WorkVisibility; area: WorkArea;
  summary: string; description: string; keywords: string[]; references: string[];
  advisor: string; department?: string; campus?: string; city: string; state: string; img: string;
}

const WORKS: SeedWork[] = [
  { author: 0, img: 'project_medical', title: 'Detecção precoce de diabetes tipo 2 com redes neurais em dados de atenção primária', type: 'ARTICLE', visibility: 'PUBLIC', area: 'HEALTH_SCIENCES',
    summary: 'Este artigo propõe um modelo de rede neural para estimar o risco de diabetes tipo 2 a partir de prontuários eletrônicos da atenção primária.',
    description: 'Foram utilizados dados anonimizados de 48 mil pacientes. O modelo alcançou AUC de 0,91, superando regressão logística. Discutimos limitações, viés de seleção e implicações éticas do uso de IA clínica.',
    keywords: ['diabetes', 'redes neurais', 'atenção primária', 'saúde digital'], references: ['GOODFELLOW, I. Deep Learning. MIT Press, 2016.', 'WHO. Global report on diabetes. 2016.'],
    advisor: 'Prof. Dr. Roberto Menezes', department: 'Ciência da Computação', campus: 'Campus Santo Amaro', city: 'Recife', state: 'PE' },
  { author: 1, img: 'project_concrete', title: 'Concreto estrutural com substituição parcial de agregado por resíduo cerâmico', type: 'DISSERTATION', visibility: 'PUBLIC', area: 'ENGINEERING',
    summary: 'Avalia o desempenho mecânico e a durabilidade de concretos com 5, 10 e 15% de resíduo cerâmico em substituição ao agregado graúdo.',
    description: 'Ensaios de compressão axial, absorção e carbonatação mostraram ganhos de sustentabilidade sem perda relevante de resistência até 15% de substituição.',
    keywords: ['concreto', 'resíduo cerâmico', 'sustentabilidade', 'durabilidade'], references: ['NEVILLE, A. M. Propriedades do Concreto. Bookman, 2016.', 'ABNT NBR 6118:2014.'],
    advisor: 'Prof. Dr. Antônio Cabral', department: 'Engenharia Civil', campus: 'Campus Recife', city: 'Recife', state: 'PE' },
  { author: 2, img: 'work_crab', title: 'Estrutura populacional do caranguejo-uçá em manguezais do litoral norte de Pernambuco', type: 'TCC', visibility: 'PUBLIC', area: 'BIOLOGICAL_SCIENCES',
    summary: 'Descreve a distribuição de tamanho e densidade de Ucides cordatus em três manguezais, relacionando-as à pressão de captura.',
    description: 'Em seis meses de campo, foram capturados e medidos 1.240 indivíduos. Áreas com maior pressão de captura apresentaram indivíduos significativamente menores.',
    keywords: ['manguezal', 'caranguejo-uçá', 'ecologia', 'conservação'], references: ['SCHAEFFER-NOVELLI, Y. Manguezal: ecossistema entre a terra e o mar. 1995.'],
    advisor: 'Prof. Dr. Marcos Teles', department: 'Ciências Biológicas', campus: 'Campus Mata Norte', city: 'Itamaracá', state: 'PE' },
  { author: 3, img: 'project_software', title: 'Práticas de engenharia de software em startups brasileiras', type: 'ARTICLE', visibility: 'PUBLIC', area: 'EXACT_EARTH_SCIENCES',
    summary: 'Survey com 312 startups sobre práticas ágeis, testes automatizados e dívida técnica.',
    description: 'A maioria adota Scrum adaptado, mas apenas 38% mantêm cobertura de testes acima de 60%. Discutimos relações entre maturidade de processo e tempo de entrega.',
    keywords: ['engenharia de software', 'startups', 'métodos ágeis', 'dívida técnica', 'survey'], references: ['SOMMERVILLE, I. Engenharia de Software. Pearson, 2018.', 'BECK, K. Extreme Programming Explained. 2004.'],
    advisor: 'Prof. Dr. Roberto Menezes', department: 'Centro de Informática', campus: 'Campus Recife', city: 'Recife', state: 'PE' },
  { author: 4, img: 'work_soil', title: 'Cobertura morta e retenção hídrica em solos do semiárido pernambucano', type: 'DISSERTATION', visibility: 'PRIVATE', area: 'AGRICULTURAL_SCIENCES',
    summary: 'Compara tratamentos de cobertura morta na infiltração e na umidade do solo em pequenas propriedades.',
    description: 'A cobertura com palhada de milho reduziu a perda de água em até 40% e aumentou a produtividade do feijão-caupi em 22%. Dados completos sob embargo até a publicação.',
    keywords: ['semiárido', 'cobertura morta', 'solo', 'água'], references: ['REICHARDT, K. Solo, planta e atmosfera. Manole, 2012.'],
    advisor: 'Prof. Dr. Antônio Cabral', department: 'Agronomia', campus: 'UAST', city: 'Serra Talhada', state: 'PE' },
  { author: 5, img: 'project_software', title: 'Painel de dados abertos da UPE: arquitetura e usabilidade', type: 'TCC', visibility: 'PUBLIC', area: 'EXACT_EARTH_SCIENCES',
    summary: 'Desenvolvimento e avaliação de um painel web de dados abertos institucionais.',
    description: 'O painel foi construído com React e uma API REST. Testes de usabilidade com 24 usuários resultaram em SUS de 82 (excelente).',
    keywords: ['dados abertos', 'react', 'usabilidade', 'visualização'], references: ['NIELSEN, J. Usability Engineering. 1993.', 'BROOKE, J. SUS: a quick and dirty usability scale. 1996.'],
    advisor: 'Prof. Dr. Roberto Menezes', department: 'Sistemas de Informação', campus: 'Campus Santo Amaro', city: 'Recife', state: 'PE' },
  { author: 6, img: 'work_clinic', title: 'Desigualdades regionais no acesso à atenção primária no Nordeste: revisão sistemática', type: 'THESIS', visibility: 'PUBLIC', area: 'HEALTH_SCIENCES',
    summary: 'Revisão sistemática de 87 estudos sobre acesso à atenção primária em municípios nordestinos.',
    description: 'Identificamos disparidades persistentes entre capitais e interior, associadas à fixação de profissionais e à infraestrutura. Propomos indicadores para monitoramento.',
    keywords: ['atenção primária', 'desigualdade', 'Nordeste', 'SUS', 'revisão sistemática'], references: ['STARFIELD, B. Atenção primária. UNESCO, 2002.', 'BRASIL. Política Nacional de Atenção Básica. 2017.'],
    advisor: 'Profa. Dra. Helena Prado', department: 'Saúde Coletiva', campus: 'Porangabuçu', city: 'Fortaleza', state: 'CE' },
  { author: 7, img: 'work_ising', title: 'Transições de fase no modelo de Ising bidimensional via Monte Carlo paralelo', type: 'DISSERTATION', visibility: 'PRIVATE', area: 'EXACT_EARTH_SCIENCES',
    summary: 'Estudo numérico de transições de fase com algoritmo de Wolff paralelizado em cluster.',
    description: 'O expoente crítico obtido concordou com o valor analítico dentro de 0,5%. A implementação paralela apresentou speedup quase linear até 64 núcleos.',
    keywords: ['Ising', 'Monte Carlo', 'transição de fase', 'computação paralela'], references: ['NEWMAN, M.; BARKEMA, G. Monte Carlo Methods in Statistical Physics. 1999.'],
    advisor: 'Profa. Dra. Beatriz Nunes', department: 'Física', campus: 'Cidade Universitária', city: 'São Paulo', state: 'SP' },
  { author: 8, img: 'work_grammar', title: 'Ensino de gramática contextualizada na rede pública: uma proposta didática', type: 'ARTICLE', visibility: 'PUBLIC', area: 'LINGUISTICS_LITERATURE_ARTS',
    summary: 'Propõe sequências didáticas que articulam gramática, leitura e produção textual.',
    description: 'A proposta foi aplicada em quatro turmas do 8º ano. Houve melhora de 18% na avaliação de produção textual e maior engajamento relatado pelos professores.',
    keywords: ['gramática', 'ensino de português', 'sequência didática'], references: ['ANTUNES, I. Aula de português. Parábola, 2003.', 'BAGNO, M. Preconceito linguístico. Loyola, 1999.'],
    advisor: 'Profa. Dra. Camila Rocha', department: 'Linguística', campus: 'IEL', city: 'Campinas', state: 'SP' },
  { author: 9, img: 'work_culture', title: 'Capital cultural e permanência estudantil: um estudo em universidade federal', type: 'TCC', visibility: 'PRIVATE', area: 'APPLIED_SOCIAL_SCIENCES',
    summary: 'Investiga a relação entre capital cultural e permanência de estudantes cotistas.',
    description: 'Entrevistas e questionários com 150 estudantes mostram que redes de apoio institucional compensam parte das desigualdades de capital cultural.',
    keywords: ['capital cultural', 'permanência estudantil', 'cotas', 'Bourdieu'], references: ['BOURDIEU, P. A Distinção. Edusp, 2007.'],
    advisor: 'Prof. Dr. Carlos Barreto', department: 'Ciências Sociais', campus: 'Ondina', city: 'Salvador', state: 'BA' },
  { author: 0, img: 'post_ai', title: 'Viés algorítmico em modelos clínicos: uma análise de equidade', type: 'THESIS', visibility: 'PRIVATE', area: 'HEALTH_SCIENCES',
    summary: 'Avalia viés racial e socioeconômico em modelos preditivos de risco clínico.',
    description: 'Tese em andamento. Resultados parciais indicam desempenho pior para grupos sub-representados nos dados de treinamento e propõem técnicas de mitigação.',
    keywords: ['viés algorítmico', 'equidade', 'IA em saúde'], references: ['OBERMEYER, Z. et al. Dissecting racial bias in an algorithm. Science, 2019.'],
    advisor: 'Prof. Dr. Roberto Menezes', department: 'Ciência da Computação', campus: 'Campus Santo Amaro', city: 'Recife', state: 'PE' },
  { author: 2, img: 'work_science', title: 'Divulgação científica em redes sociais: alcance e engajamento de perfis acadêmicos', type: 'ARTICLE', visibility: 'PUBLIC', area: 'HUMANITIES',
    summary: 'Analisa o alcance de perfis de divulgação científica em redes sociais brasileiras.',
    description: 'Foram analisadas 3.200 publicações. Conteúdos com linguagem acessível e elementos visuais tiveram engajamento 2,4 vezes maior.',
    keywords: ['divulgação científica', 'redes sociais', 'engajamento', 'comunicação'], references: ['BUENO, W. Comunicação científica e divulgação científica. 2010.'],
    advisor: 'Profa. Dra. Camila Rocha', department: 'Ciências Humanas', campus: 'Campus Santo Amaro', city: 'Recife', state: 'PE' },
];

const CONVERSATIONS: { a: number; b: number; lines: string[] }[] = [
  { a: 0, b: 3, lines: ['Professor, tudo bem? Posso marcar uma reunião sobre a revisão do artigo?', 'Claro, Ana! Que tal quinta às 14h?', 'Perfeito, combinado. Levo as figuras atualizadas.', 'Ótimo. Me mande o PDF antes para eu ir lendo.'] },
  { a: 2, b: 4, lines: ['Oi Juliana! Vi seu projeto no semiárido, muito legal.', 'Obrigada, Mariana! Vocês trabalham com manguezal, né?', 'Isso! Quem sabe uma parceria entre as duas linhas?', 'Adoraria. Podemos conversar na semana que vem?', 'Fechado! Te chamo por aqui.'] },
  { a: 5, b: 0, lines: ['Ana, vi que o DiagnoSaúde busca devs. Posso ajudar?', 'Pedro, claro! Você conhece Python e APIs?', 'Conheço sim, e também React para o front.', 'Perfeito, vamos conversar sobre as tarefas.'] },
  { a: 6, b: 7, lines: ['Lucas, seu trabalho com cluster me deu uma ideia para processar dados do SUS.', 'Que legal, Fernanda! Posso te passar os scripts de paralelização.', 'Seria ótimo. Obrigada!'] },
  { a: 8, b: 9, lines: ['Rafael, li seu post sobre Bourdieu. Quer colaborar com o projeto de materiais abertos?', 'Professora, adoraria! Posso ajudar com a parte de contexto cultural.', 'Excelente. Mando as próximas atividades por aqui.', 'Combinado, obrigado pela oportunidade!'] },
];

// ─── Reset ────────────────────────────────────────────────────────────────────

async function resetSeedData() {
  const existing = await prisma.user.findMany({
    where: { academicEmail: { endsWith: SEED_DOMAIN } },
    select: { id: true },
  });
  const ids = existing.map(u => u.id);
  if (!ids.length) return 0;

  await prisma.like.deleteMany({
    where: { OR: [{ userId: { in: ids } }, { post: { authorId: { in: ids } } }, { comment: { authorId: { in: ids } } }] },
  });
  await prisma.savedPost.deleteMany({ where: { OR: [{ userId: { in: ids } }, { post: { authorId: { in: ids } } }] } });
  await prisma.comment.deleteMany({ where: { OR: [{ authorId: { in: ids } }, { post: { authorId: { in: ids } } }] } });
  await prisma.post.deleteMany({ where: { authorId: { in: ids } } });
  await prisma.workAccessRequest.deleteMany({ where: { OR: [{ requesterId: { in: ids } }, { work: { authorId: { in: ids } } }] } });
  await prisma.work.deleteMany({ where: { authorId: { in: ids } } });
  await prisma.teamMember.deleteMany({ where: { project: { ownerId: { in: ids } } } });
  await prisma.project.deleteMany({ where: { ownerId: { in: ids } } });
  const convs = await prisma.conversation.findMany({ where: { participants: { some: { id: { in: ids } } } }, select: { id: true } });
  const convIds = convs.map(c => c.id);
  await prisma.message.deleteMany({ where: { OR: [{ senderId: { in: ids } }, { conversationId: { in: convIds } }] } });
  await prisma.conversation.deleteMany({ where: { id: { in: convIds } } });
  await prisma.follow.deleteMany({ where: { OR: [{ followerId: { in: ids } }, { followingId: { in: ids } }] } });
  await prisma.block.deleteMany({ where: { OR: [{ blockerId: { in: ids } }, { blockedId: { in: ids } }] } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
  return ids.length;
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  const removed = await resetSeedData();
  if (removed) console.log(`Removidos ${removed} usuários de seed anteriores (e seus dados).`);

  // Usuários
  const hash = await bcrypt.hash(PASSWORD, 10);
  const users: User[] = [];
  for (const u of USERS) {
    users.push(await prisma.user.create({
      data: {
        fullName: u.fullName,
        username: u.username,
        academicEmail: `${u.username}${SEED_DOMAIN}`,
        password: hash,
        institution: u.institution,
        academicLevel: u.level,
        dateOfBirth: new Date(u.born),
        bio: u.bio,
        avatar: avatarImage(u.fullName, u.portrait),
        coverPhoto: photo(`cover-${u.username}`, 1200, 400, u.institution.replace(/ \(.*\)/, '')),
        createdAt: daysAgo(int(60, 120)),
      },
    }));
  }

  // Seguidores (exceto o par 8↔9, que se bloqueia abaixo)
  const followPairs = new Set<string>();
  for (let i = 0; i < users.length; i++) {
    const targets = sample(users.map((_, j) => j).filter(j => j !== i && !(i + j === 17 && Math.abs(i - j) === 1)), int(3, 6));
    for (const j of targets) followPairs.add(`${i}:${j}`);
  }
  // Professores e a conta mais ativa ganham seguidores extras, para perfis variados
  for (let i = 0; i < users.length; i++) { if (i !== 3) followPairs.add(`${i}:3`); if (i !== 0) followPairs.add(`${i}:0`); }
  followPairs.delete('8:9'); followPairs.delete('9:8');
  await prisma.follow.createMany({
    data: [...followPairs].map(p => {
      const [a, b] = p.split(':').map(Number);
      return { followerId: users[a].id, followingId: users[b].id, createdAt: daysAgo(int(1, 50)) };
    }),
  });

  // Bloqueio: Rafael (9) bloqueou a Profa. Camila (8)
  await prisma.block.create({ data: { blockerId: users[9].id, blockedId: users[8].id, createdAt: daysAgo(5) } });

  // Posts (do mais antigo ao mais recente)
  const posts: Post[] = [];
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i];
    posts.push(await prisma.post.create({
      data: {
        caption: p.caption,
        hashtags: p.tags,
        location: p.location,
        image: p.image ? localImage(p.image, p.caption.slice(0, 30), 800, 600) : null,
        authorId: users[p.by].id,
        createdAt: daysAgo(Math.max(0, 58 - i * 2), 8),
      },
    }));
  }

  // Comentários (2 a 4 por post, de outros usuários)
  const comments: { id: string; authorId: string }[] = [];
  for (let i = 0; i < posts.length; i++) {
    const authors = sample(users.filter(u => u.id !== posts[i].authorId), int(2, 4));
    for (const a of authors) {
      const c = await prisma.comment.create({
        data: {
          text: pick(COMMENT_POOL),
          postId: posts[i].id,
          authorId: a.id,
          createdAt: new Date(posts[i].createdAt.getTime() + int(10, 4000) * 60_000),
        },
      });
      comments.push({ id: c.id, authorId: a.id });
    }
  }

  // Curtidas em posts e comentários (respeitando os índices únicos)
  const postLikes = posts.flatMap(p =>
    sample(users.filter(u => u.id !== p.authorId), int(2, 8)).map(u => ({
      userId: u.id, postId: p.id, createdAt: new Date(p.createdAt.getTime() + int(5, 3000) * 60_000),
    })));
  const commentLikes = comments.flatMap(c =>
    rand() < 0.45
      ? sample(users.filter(u => u.id !== c.authorId), int(1, 3)).map(u => ({ userId: u.id, commentId: c.id }))
      : []);
  await prisma.like.createMany({ data: postLikes });
  await prisma.like.createMany({ data: commentLikes });

  // Posts salvos
  const saved = users.flatMap(u =>
    sample(posts.filter(p => p.authorId !== u.id), int(2, 5)).map(p => ({ userId: u.id, postId: p.id, savedAt: daysAgo(int(0, 30)) })));
  await prisma.savedPost.createMany({ data: saved });

  // Projetos e equipes
  for (let i = 0; i < PROJECTS.length; i++) {
    const p = PROJECTS[i];
    const owner = users[p.owner];
    await prisma.project.create({
      data: {
        title: p.title,
        description: p.description,
        category: p.category,
        status: p.status,
        image: localImage(p.img, p.title.split(':')[0]),
        contactEmail: p.contact ? owner.academicEmail : null,
        contactPhone: p.contact ? `(81) 9${int(8000, 9999)}-${int(1000, 9999)}` : null,
        campus: p.campus,
        city: p.city,
        state: p.state,
        country: 'Brasil',
        ownerId: owner.id,
        createdAt: daysAgo(int(5, 70)),
        teamMembers: { create: p.team.map(([name, role]) => ({ name, role, photo: null })) },
      },
    });
  }

  // Trabalhos acadêmicos
  const works: Work[] = [];
  for (const w of WORKS) {
    works.push(await prisma.work.create({
      data: {
        title: w.title,
        workType: w.type,
        visibility: w.visibility,
        area: w.area,
        coverImage: localImage(w.img, w.title.slice(0, 28), 600, 800),
        summary: w.summary,
        description: w.description,
        keywords: w.keywords,
        references: w.references,
        advisor: w.advisor,
        institution: USERS[w.author].institution,
        campus: w.campus,
        city: w.city,
        state: w.state,
        country: 'Brasil',
        department: w.department,
        pdfFile: makePdf(w.title),
        downloads: w.visibility === 'PUBLIC' ? int(12, 480) : int(0, 20),
        authorId: users[w.author].id,
        createdAt: daysAgo(int(3, 80)),
      },
    }));
  }

  // Pedidos de acesso aos trabalhos privados, cobrindo todos os status
  const statuses: WorkAccessStatus[] = ['PENDING', 'APPROVED', 'DENIED', 'REVOKED', 'PENDING', 'APPROVED'];
  let accessRequests = 0;
  for (const w of works.filter(x => x.visibility === 'PRIVATE')) {
    const requesters = sample(users.filter(u => u.id !== w.authorId), 3);
    for (const r of requesters) {
      const status = pick(statuses);
      await prisma.workAccessRequest.create({
        data: {
          workId: w.id,
          requesterId: r.id,
          status,
          createdAt: daysAgo(int(1, 20)),
          respondedAt: status === 'PENDING' ? null : daysAgo(int(0, 10)),
        },
      });
      accessRequests++;
    }
  }

  // Conversas e mensagens
  let messages = 0;
  for (const c of CONVERSATIONS) {
    const start = Date.now() - int(2, 20) * MS_DAY;
    const conv = await prisma.conversation.create({
      data: { participants: { connect: [{ id: users[c.a].id }, { id: users[c.b].id }] }, createdAt: new Date(start) },
    });
    for (let i = 0; i < c.lines.length; i++) {
      await prisma.message.create({
        data: {
          text: c.lines[i],
          conversationId: conv.id,
          senderId: users[i % 2 === 0 ? c.a : c.b].id,
          createdAt: new Date(start + (i + 1) * int(3, 30) * 60_000),
        },
      });
      messages++;
    }
  }

  const count = {
    usuarios: users.length,
    seguidores: followPairs.size,
    bloqueios: 1,
    posts: posts.length,
    comentarios: comments.length,
    curtidasPosts: postLikes.length,
    curtidasComentarios: commentLikes.length,
    postsSalvos: saved.length,
    projetos: PROJECTS.length,
    membrosEquipe: PROJECTS.reduce((n, p) => n + p.team.length, 0),
    trabalhos: works.length,
    pedidosAcesso: accessRequests,
    conversas: CONVERSATIONS.length,
    mensagens: messages,
  };
  console.log('\nSeed concluído:');
  console.table(count);
  console.log(`Login: qualquer usuário (ex.: ana_souza) com a senha ${PASSWORD}`);
  console.log('Usuários:', USERS.map(u => u.username).join(', '));
}

main()
  .catch(err => { console.error('Falha no seed:', err); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
