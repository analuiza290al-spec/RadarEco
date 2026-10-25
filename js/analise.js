// Cole aqui a URL do seu Worker. Vazio = simulação (sem IA).
const API_URL = '';

const COR = {
  plastico: '#f6a85c', papel: '#e4cf9a', vidro: '#a8d8c9', metal: '#c8d0d8',
  organico: '#cfe3a8', eletronico: '#f4b6b0', perigoso: '#f4b6b0', outro: '#e1e5e1'
};
const DESTINO = {
  plastico: 'plastico', papel: 'papel', vidro: 'vidro', metal: 'metal',
  eletronico: 'eletronico', organico: 'organico'
};

// ---- Simulação (usada só quando API_URL está vazio) ----
const MATERIAIS = [
  { nome: 'Garrafa PET', chip: 'Plástico · PET 1', cor: COR.plastico, recicla: true, destino: 'plastico',
    passos: ['Esvazie a garrafa e retire os resíduos.', 'Deixe secar e mantenha a tampa junto.', 'Separe dos orgânicos e leve à coleta seletiva.'] },
  { nome: 'Caixa de papelão', chip: 'Papel · Papelão', cor: COR.papel, recicla: true, destino: 'papel',
    passos: ['Retire fitas adesivas e restos de comida.', 'Desmonte e dobre a caixa para ocupar menos espaço.', 'Mantenha seco: papel molhado ou engordurado não é reciclado.'] },
  { nome: 'Pote de vidro', chip: 'Vidro · Embalagem', cor: COR.vidro, recicla: true, destino: 'vidro',
    passos: ['Esvazie e enxágue rapidamente.', 'Se estiver quebrado, embale os cacos em jornal e identifique.', 'Não misture com espelhos, cerâmica ou lâmpadas.'] },
  { nome: 'Lata de alumínio', chip: 'Metal · Alumínio', cor: COR.metal, recicla: true, destino: 'metal',
    passos: ['Esvazie e enxágue.', 'Amasse, se possível, para ocupar menos espaço.', 'Separe dos resíduos orgânicos.'] },
  { nome: 'Celular antigo', chip: 'Eletrônico · Lixo eletrônico', cor: COR.eletronico, recicla: false, rotulo: '⚠ Descarte especial', destino: 'eletronico',
    alerta: 'Eletrônicos têm metais pesados e não vão no lixo comum. Apague seus dados antes de descartar.',
    passos: ['Apague seus dados e retire o chip.', 'Se possível, retire a bateria e descarte à parte.', 'Leve a um ponto de lixo eletrônico ou à loja do fabricante.'] },
  { nome: 'Cascas de frutas', chip: 'Orgânico · Resto de alimento', cor: COR.organico, recicla: false, rotulo: '♻ Compostável', destino: 'organico',
    passos: ['Separe de plásticos, papéis e outros recicláveis.', 'Use em composteira ou entregue em ponto de compostagem.', 'Evite misturar carne, laticínios e óleo se for compostar em casa.'] },
  { nome: 'Pilha ou bateria', chip: 'Resíduo perigoso', cor: COR.perigoso, recicla: false, rotulo: '⚠ Descarte especial', destino: 'pilhas',
    alerta: 'Não jogue no lixo comum e não abra a pilha. Leve a um ponto específico para pilhas e baterias.',
    passos: ['Não jogue no lixo comum e não abra a pilha.', 'Guarde em pote seco e fechado, longe do calor.', 'Leve a um ponto específico para pilhas e baterias.'] }
];
const escolher = seed => MATERIAIS[Math.abs(Math.floor(seed || 0)) % MATERIAIS.length];

// ---- Rótulo de reciclagem para a interface ----
function rotulo(m) {
  if (m.rotulo) return m.rotulo;
  return m.recicla ? '♻ Reciclável' : '⚠ Descarte especial';
}

// ---- Resposta da IA → formato que a interface usa ----
function normalizar(d) {
  if (!d.identificado) {
    return { nome: 'Não consegui identificar', chip: 'Sem resíduo claro', cor: COR.outro, recicla: false,
      rotulo: 'Tente outra foto', destino: null, confianca: 'baixa', alerta: '',
      passos: ['Tire a foto de perto, com boa luz.', 'Enquadre um único item.', 'Evite fundos muito cheios.'] };
  }
  return {
    nome: d.nome, chip: d.chip, cor: COR[d.categoria] || COR.outro,
    recicla: d.reciclavel === 'sim',
    rotulo: d.reciclavel === 'sim' ? '♻ Reciclável' : d.reciclavel === 'depende' ? '♻ Depende da região' : '⚠ Descarte especial',
    destino: DESTINO[d.categoria] || (/pilha|bateria/i.test(d.nome) ? 'pilhas' : /óleo|oleo/i.test(d.nome) ? 'oleo' : null),
    passos: d.passos, alerta: d.alerta || '', confianca: d.confianca
  };
}

// ---- Análise (com cache na sessão para não pagar duas vezes pela mesma foto) ----
async function analisar(dataUrl) {
  if (!API_URL) {
    await new Promise(r => setTimeout(r, 900));
    return escolher(dataUrl.length);
  }
  const k = dataUrl.length + ':' + dataUrl.slice(-40);
  try {
    const c = JSON.parse(sessionStorage.getItem('radareco:analise') || 'null');
    if (c && c.k === k) return c.r;
  } catch (_) {}

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  let resp;
  try {
    resp = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagem: dataUrl }),
      signal: ctrl.signal
    });
  } finally { clearTimeout(timer); }
  if (!resp.ok) throw new Error('api');

  const r = normalizar(await resp.json());
  try { sessionStorage.setItem('radareco:analise', JSON.stringify({ k, r })); } catch (_) {}
  return r;
}
