const KEY = 'radareco:foto';
const $ = id => document.getElementById(id);

function showPhoto(src, name, sizeBytes, caption) {
  $('prev').src = src;
  $('prev').hidden = false;
  $('ph').hidden = true;
  $('fn').textContent = name + ' · ' + (sizeBytes / 1048576).toFixed(1).replace('.', ',') + ' MB';
  $('cap').textContent = caption;
}

// 1) Foto vinda da página Escanear Lixo
try {
  const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
  if (saved && saved.d) {
    showPhoto(saved.d, saved.n, saved.s,
      'Sua foto. A análise abaixo é demonstração: a identificação real ainda não foi ativada.');
  }
} catch (_) { /* sem foto salva */ }

// 2) Envio direto pelo botão "Enviar imagem"
$('up').onchange = e => {
  const f = e.target.files[0];
  if (!f) return;
  if (f.size > 10 * 1024 * 1024) {
    alert('A imagem passa de 10 MB. Escolha um arquivo menor.');
    return;
  }
  if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) {
    alert('Esse formato não tem pré-visualização aqui. Use JPG ou PNG, ou o botão Tirar foto.');
    return;
  }
  showPhoto(URL.createObjectURL(f), f.name, f.size,
    'Sua foto. A análise abaixo é demonstração: a identificação real ainda não foi ativada.');
};
