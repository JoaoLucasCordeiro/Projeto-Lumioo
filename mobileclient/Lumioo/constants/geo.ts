// Espelha as listas validadas pelo backend (backendserver/src/lib/schemas.ts)
// e as constantes da web (frontendclient/src/api/works.ts).

export const BRAZILIAN_UF_CODES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export const COUNTRY_OPTIONS = [
  'Brasil', 'Portugal', 'Angola', 'Moçambique', 'Cabo Verde', 'Guiné-Bissau',
  'São Tomé e Príncipe', 'Timor-Leste', 'Estados Unidos', 'Canadá', 'México',
  'Argentina', 'Chile', 'Uruguai', 'Paraguai', 'Bolívia', 'Colômbia', 'Peru',
  'Espanha', 'França', 'Alemanha', 'Itália', 'Reino Unido', 'Países Baixos',
  'China', 'Japão', 'Coreia do Sul', 'Índia', 'Austrália',
] as const;

export const WORK_AREA_LABELS: Record<string, string> = {
  EXACT_EARTH_SCIENCES: 'Ciências Exatas e da Terra',
  BIOLOGICAL_SCIENCES: 'Ciências Biológicas',
  ENGINEERING: 'Engenharias',
  HEALTH_SCIENCES: 'Ciências da Saúde',
  AGRICULTURAL_SCIENCES: 'Ciências Agrárias',
  APPLIED_SOCIAL_SCIENCES: 'Ciências Sociais Aplicadas',
  HUMANITIES: 'Ciências Humanas',
  LINGUISTICS_LITERATURE_ARTS: 'Linguística, Letras e Artes',
};

export const WORK_AREA_OPTIONS = Object.entries(WORK_AREA_LABELS).map(([value, label]) => ({ value, label }));

export interface LocationValue {
  campus: string;
  city: string;
  state: string; // UF; só é usada quando country === 'Brasil'
  country: string;
}

export const EMPTY_LOCATION: LocationValue = { campus: '', city: '', state: '', country: 'Brasil' };

/** Retorna mensagem de erro de validação ou null se válido. */
export function validateLocation(loc: LocationValue): string | null {
  if (!loc.city.trim()) return 'Informe a cidade.';
  if (loc.country === 'Brasil' && !loc.state) return 'Selecione o estado (UF).';
  return null;
}

/** Campos de localização prontos para o payload da API. */
export function locationPayload(loc: LocationValue) {
  return {
    city: loc.city.trim(),
    country: loc.country,
    ...(loc.country === 'Brasil' && loc.state ? { state: loc.state } : {}),
    ...(loc.campus.trim() ? { campus: loc.campus.trim() } : {}),
  };
}
