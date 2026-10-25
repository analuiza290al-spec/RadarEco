const KEY = 'radareco:foto';
const $ = id => document.getElementById(id);
let token = 0;       // evita que uma análise antiga apareça depois de remover a foto
let blobUrl = null;

// Painel da direita: 'wait' | 'loading' | 'result'
function panel(name) {
  ['wait', 'loading', 'result'].forEach(id => { $(id).hidden = id !== name; });
}

function setPhoto(src, name, bytes) {
  $('prev').src = src;
  $('prev').hidden = false;
  $('empty').hidden = true;
  $('fn').textContent = name + ' · ' + (bytes / 1048576).toFixed(1).replace('.', ',') + ' MB';
  $('fn').hidden = false;
  $('clear').hidden = false;
  $('cap').textContent = 'Sua foto. A análise ao lado é demonstração: a identificação real ainda não foi ativada.';

  const my = ++token;
  panel('loading');
  setTimeout(() => { if (my === token) panel('result'); }, 900);
}

function clearPhoto() {
  token++;
  if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
  try { sessionStorage.removeItem(KEY); } catch (_) {}
  $('prev').removeAttribute('src');
  $('prev').hidden = true;
  $('empty').hidden = false;
  $('fn').hidden = true;
  $('clear').hidden = true;
  $('cap').textContent = 'Um item por foto, com boa luz.';
  panel('wait');
}

// 1) Foto vinda da página Escanear Lixo
try {
  const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
  if (saved && saved.d) setPhoto(saved.d, saved.n, saved.s);
} catch (_) { /* sem foto salva */ }

// 2) Envio direto pelo botão "Enviar imagem"
$('up').onchange = e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  if (f.size > 10 * 1024 * 1024) return alert('A imagem passa de 10 MB. Escolha um arquivo menor.');
  if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) {
    return alert('Esse formato não tem pré-visualização aqui. Use JPG ou PNG, ou o botão Tirar foto.');
  }
  if (blobUrl) URL.revokeObjectURL(blobUrl);
  blobUrl = URL.createObjectURL(f);
  setPhoto(blobUrl, f.name, f.size);
};

$('clear').onclick = clearPhoto;
