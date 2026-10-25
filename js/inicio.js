const KEY = 'radareco:foto';
const MAX_SIDE = 1280;
const $ = id => document.getElementById(id);
let token = 0; // evita que uma análise antiga apareça depois de remover a foto

function panel(name) {
  ['wait', 'loading', 'result'].forEach(id => { $(id).hidden = id !== name; });
}

function fill(m) {
  $('r-nome').textContent = m.nome;
  $('r-chip').textContent = m.chip;
  $('r-chip').style.background = m.cor;
  $('r-rec').textContent = m.recicla ? '♻ Reciclável' : '⚠ Descarte especial';
  $('r-lista').innerHTML = m.passos.map(p => '<li>' + p + '</li>').join('');
  $('r-pontos').href = 'pontos-de-coleta.html' + (m.destino ? '?m=' + m.destino : '');
}

function show(photo) {
  $('prev').src = photo.d;
  $('prev').hidden = false;
  $('empty').hidden = true;
  $('fn').textContent = photo.n + ' · ' + (photo.s / 1048576).toFixed(1).replace('.', ',') + ' MB';
  $('fn').hidden = false;
  $('clear').hidden = false;
  $('cap').textContent = 'Sua foto. A análise ao lado é uma simulação: a identificação real ainda não foi ativada.';
  fill(escolher(photo.s));

  const my = ++token;
  panel('loading');
  setTimeout(() => { if (my === token) panel('result'); }, 900);
}

function clearPhoto() {
  token++;
  try { sessionStorage.removeItem(KEY); } catch (_) {}
  $('prev').removeAttribute('src');
  $('prev').hidden = true;
  $('empty').hidden = false;
  $('fn').hidden = true;
  $('clear').hidden = true;
  $('cap').textContent = 'Um item por foto, com boa luz.';
  panel('wait');
}

// 1) Foto vinda da página Escanear Lixo (ou de uma visita anterior na mesma aba)
try {
  const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
  if (saved && saved.d) show(saved);
} catch (_) { /* sem foto salva */ }

// 2) Envio direto: reduz para JPEG, guarda na sessão e mostra
$('up').onchange = e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  if (f.size > 10 * 1024 * 1024) return alert('A imagem passa de 10 MB. Escolha um arquivo menor.');
  const url = URL.createObjectURL(f);
  const img = new Image();
  img.onload = () => {
    const sc = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * sc);
    c.height = Math.round(img.naturalHeight * sc);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    const d = c.toDataURL('image/jpeg', 0.85);
    const photo = { d, n: f.name, s: Math.round(d.length * 3 / 4) };
    try { sessionStorage.setItem(KEY, JSON.stringify(photo)); } catch (_) {}
    show(photo);
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    alert('Não consegui abrir essa imagem. Use JPG ou PNG, ou o botão Tirar foto.');
  };
  img.src = url;
};

$('clear').onclick = clearPhoto;
