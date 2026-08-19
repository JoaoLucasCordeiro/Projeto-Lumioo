export type LatLng = [number, number];

// Capital de cada UF — usado como ponto de referência para agregação por estado.
export const BRAZIL_UF_COORDINATES: Record<string, LatLng> = {
  AC: [-9.9750, -67.8243],
  AL: [-9.6498, -35.7089],
  AP: [0.0349, -51.0694],
  AM: [-3.1190, -60.0217],
  BA: [-12.9714, -38.5014],
  CE: [-3.7172, -38.5433],
  DF: [-15.7975, -47.8919],
  ES: [-20.3155, -40.3128],
  GO: [-16.6869, -49.2648],
  MA: [-2.5307, -44.3068],
  MT: [-15.6014, -56.0979],
  MS: [-20.4697, -54.6201],
  MG: [-19.9167, -43.9345],
  PA: [-1.4558, -48.4902],
  PB: [-7.1195, -34.8450],
  PR: [-25.4284, -49.2733],
  PE: [-8.0476, -34.8770],
  PI: [-5.0892, -42.8019],
  RJ: [-22.9068, -43.1729],
  RN: [-5.7945, -35.2110],
  RS: [-30.0346, -51.2177],
  RO: [-8.7619, -63.9039],
  RR: [2.8235, -60.6758],
  SC: [-27.5954, -48.5480],
  SP: [-23.5505, -46.6333],
  SE: [-10.9472, -37.0731],
  TO: [-10.1689, -48.3317],
};

export const BRAZIL_UF_NAMES: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins',
};

// Capital de cada país — mesma lista de `COUNTRY_OPTIONS` (frontendclient/src/api/works.ts).
export const COUNTRY_COORDINATES: Record<string, LatLng> = {
  Brasil: [-15.7975, -47.8919],
  Portugal: [38.7223, -9.1393],
  Angola: [-8.8390, 13.2894],
  Moçambique: [-25.9692, 32.5732],
  'Cabo Verde': [14.9330, -23.5133],
  'Guiné-Bissau': [11.8636, -15.5977],
  'São Tomé e Príncipe': [0.3302, 6.7333],
  'Timor-Leste': [-8.5569, 125.5603],
  'Estados Unidos': [38.9072, -77.0369],
  Canadá: [45.4215, -75.6972],
  México: [19.4326, -99.1332],
  Argentina: [-34.6037, -58.3816],
  Chile: [-33.4489, -70.6693],
  Uruguai: [-34.9011, -56.1645],
  Paraguai: [-25.2637, -57.5759],
  Bolívia: [-16.5000, -68.1500],
  Colômbia: [4.7110, -74.0721],
  Peru: [-12.0464, -77.0428],
  Espanha: [40.4168, -3.7038],
  França: [48.8566, 2.3522],
  Alemanha: [52.5200, 13.4050],
  Itália: [41.9028, 12.4964],
  'Reino Unido': [51.5074, -0.1278],
  'Países Baixos': [52.3676, 4.9041],
  China: [39.9042, 116.4074],
  Japão: [35.6762, 139.6503],
  'Coreia do Sul': [37.5665, 126.9780],
  Índia: [28.6139, 77.2090],
  Austrália: [-35.2809, 149.1300],
};

// Lista curada das principais cidades de Pernambuco, onde se concentra a maior parte do
// conteúdo da UPE — dá mais precisão que cair direto no pino do estado. Cidade de PE fora
// desta lista usa o fallback do estado (BRAZIL_UF_COORDINATES.PE).
export const PE_CITY_COORDINATES: Record<string, LatLng> = {
  Recife: [-8.0476, -34.8770],
  Olinda: [-8.0089, -34.8553],
  'Jaboatão dos Guararapes': [-8.1130, -35.0150],
  Caruaru: [-8.2828, -35.9714],
  Petrolina: [-9.3891, -40.5030],
  Garanhuns: [-8.8827, -36.4964],
  'Vitória de Santo Antão': [-8.1189, -35.2933],
  Camaragibe: [-8.0217, -34.9822],
  Paulista: [-7.9407, -34.8728],
  'Cabo de Santo Agostinho': [-8.2892, -35.0353],
  'Serra Talhada': [-7.9908, -38.2953],
  Arcoverde: [-8.4189, -37.0672],
  'Belo Jardim': [-8.3358, -36.4247],
  Gravatá: [-8.2011, -35.5678],
  Ipojuca: [-8.4000, -35.0631],
  Igarassu: [-7.8339, -34.9061],
  Escada: [-8.3572, -35.2247],
  Palmares: [-8.6836, -35.5919],
  'Santa Cruz do Capibaribe': [-7.9550, -36.2050],
  'São Lourenço da Mata': [-8.0011, -35.0181],
};

/**
 * Resolve uma localidade (cidade + UF + país) para coordenadas, na ordem de maior precisão
 * disponível: cidade de PE curada -> estado (BR) -> país. Retorna null se nada bater
 * (ex: país fora de COUNTRY_OPTIONS, ou dado incompleto).
 */
export function resolveCoordinates(location: {
  city?: string | null;
  state?: string | null;
  country?: string | null;
}): LatLng | null {
  const { city, state, country } = location;

  if (country === 'Brasil' || !country) {
    if (state === 'PE' && city && PE_CITY_COORDINATES[city]) {
      return PE_CITY_COORDINATES[city];
    }
    if (state && BRAZIL_UF_COORDINATES[state]) {
      return BRAZIL_UF_COORDINATES[state];
    }
  }

  if (country && COUNTRY_COORDINATES[country]) {
    return COUNTRY_COORDINATES[country];
  }

  return null;
}
