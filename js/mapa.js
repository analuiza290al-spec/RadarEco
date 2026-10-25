// Mapa: OpenStreetMap (blocos) + Nominatim (endereço) + Overpass (pontos de reciclagem)
const MN = { plastico: 'Plástico', papel: 'Papel', vidro: 'Vidro', metal: 'Metal' };
const TG = {
  plastico: ['plastic', 'plastic_bottles', 'plastic_packaging'],
  papel: ['paper', 'cardboard', 'paper_packaging'],
  vidro: ['glass', 'glass_bottles'],
  metal: ['scrap_metal', 'cans', 'metal']
};
const OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = d => d < 1 ? Math.round(d * 1000) + ' m' : d.toFixed(1).replace('.', ',') + ' km';
const status = t => { $('st').textContent = t; };

function dist(la1, lo1, la2, lo2) {
  const r = Math.PI / 180;
  const x = Math.sin((la2 - la1) * r / 2) ** 2 +
    Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin((lo2 - lo1) * r / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
}

let mat = 'plastico', sel = 0, all = [], cur = [], me = null;
let center = [-23.5505, -46.6333]; // São Paulo (ponto inicial)

const map = L.map('map').setView(center, 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
const layer = L.layerGroup().addTo(map);

async function overpass(query) {
  for (const url of OVERPASS) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query)
      });
      if (r.ok) return await r.json();
    } catch (_) { /* tenta o próximo servidor */ }
  }
  throw new Error('overpass');
}

async function load(lat, lon, msg) {
  center = [lat, lon];
  map.setView(center, 14);
  if (me) me.remove();
  me = L.circleMarker(center, { radius: 8, color: '#fff', weight: 3, fillColor: '#00579b', fillOpacity: 1 })
    .addTo(map).bindTooltip('Centro da busca');
  status('Buscando pontos de coleta…');
  try {
    const q = `[out:json][timeout:25];nwr["amenity"="recycling"](around:6000,${lat},${lon});out center tags 200;`;
    const j = await overpass(q);
    all = j.elements.map(e => {
      const t = e.tags || {};
      const la = e.lat ?? (e.center && e.center.lat);
      const lo = e.lon ?? (e.center && e.center.lon);
      const m = Object.keys(TG).filter(k => TG[k].some(x => t['recycling:' + x] === 'yes'));
      return { n: t.name || t.operator || 'Ponto de reciclagem', lat: la, lon: lo, t, m, d: dist(lat, lon, la, lo) };
    }).filter(p => p.lat != null).sort((a, b) => a.d - b.d);
    sel = 0;
    status(msg || (all.length ? '' : 'Nenhum ponto encontrado em 6 km. Tente outra região.'));
  } catch (_) {
    all = [];
    status('Não foi possível carregar os pontos agora. Tente de novo em instantes.');
  }
  render(true);
}

function render(fit) {
  cur = all.filter(p => p.m.includes(mat) || !p.m.length).slice(0, 8);
  if (sel >= cur.length) sel = 0;
  $('cnt').textContent = cur.length + (cur.length === 1 ? ' ponto encontrado' : ' pontos encontrados');

  $('list').innerHTML = cur.map((p, i) =>
    `<button class="pt" data-i="${i}" aria-pressed="${i === sel}">
       <span>${fmt(p.d)}</span><b>${i + 1}. ${esc(p.n)}</b>
       <small>${p.m.length ? p.m.map(k => MN[k]).join(', ') : 'Materiais não informados'}</small>
     </button>` +
    (i === sel
      ? `<p class="note" style="margin:-4px 0 10px">${p.t.opening_hours ? 'Horário: ' + esc(p.t.opening_hours) + ' · ' : ''}<a href="https://www.openstreetmap.org/directions?to=${p.lat}%2C${p.lon}" target="_blank" rel="noopener">Traçar rota</a></p>`
      : '')
  ).join('');

  layer.clearLayers();
  cur.forEach((p, i) => {
    L.marker([p.lat, p.lon], {
      title: p.n,
      icon: L.divIcon({ className: '', html: `<div class="nm${i === sel ? ' on' : ''}">${i + 1}</div>`, iconSize: [26, 26] })
    }).addTo(layer).on('click', () => { sel = i; render(); });
  });

  if (fit && cur.length) {
    map.fitBounds(L.latLngBounds([center, ...cur.map(p => [p.lat, p.lon])]), { padding: [40, 40], maxZoom: 16 });
  } else if (cur[sel]) {
    map.panTo([cur[sel].lat, cur[sel].lon]);
  }
}

// Seleção na lista
$('list').addEventListener('click', e => {
  const b = e.target.closest('.pt');
  if (b) { sel = +b.dataset.i; render(); }
});

// Filtro de material
$('chips').addEventListener('click', e => {
  const c = e.target.closest('button');
  if (!c) return;
  mat = c.dataset.m; sel = 0;
  $('chips').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === c));
  render(true);
});

// Busca por endereço
$('sf').addEventListener('submit', async e => {
  e.preventDefault();
  const q = $('addr').value.trim();
  if (!q) return;
  status('Procurando endereço…');
  try {
    const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=pt-BR&q=' + encodeURIComponent(q));
    const j = await r.json();
    if (!j.length) return status('Endereço não encontrado. Tente bairro e cidade.');
    load(+j[0].lat, +j[0].lon);
  } catch (_) {
    status('Não foi possível buscar o endereço agora.');
  }
});

// Localização do aparelho
$('loc').addEventListener('click', () => {
  if (!navigator.geolocation) return status('Seu navegador não oferece localização.');
  status('Obtendo sua localização…');
  navigator.geolocation.getCurrentPosition(
    p => load(p.coords.latitude, p.coords.longitude),
    () => status('Permissão negada. Digite um endereço para buscar.'),
    { timeout: 10000 }
  );
});

// Início: mostra pontos reais no centro de São Paulo
render();
load(center[0], center[1], 'Mostrando a região central de São Paulo. Busque seu endereço ou use sua localização.');
