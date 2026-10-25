// Pré-visualização local da imagem (nada é enviado para servidor)
function onFile(e) {
  const f = e.target.files[0];
  if (!f) return;
  if (f.size > 10 * 1024 * 1024) {
    alert('A imagem passa de 10 MB. Escolha um arquivo menor.');
    return;
  }
  const img = document.getElementById('prev');
  if (f.type.startsWith('image/') && !/heic/i.test(f.type)) {
    img.src = URL.createObjectURL(f);
    img.hidden = false;
    document.getElementById('ph').hidden = true;
  }
  document.getElementById('fn').textContent =
    f.name + ' · ' + (f.size / 1048576).toFixed(1).replace('.', ',') + ' MB';
  document.getElementById('cap').textContent =
    'Análise de demonstração: a classificação real exige uma API de IA.';
}
document.getElementById('cam').onchange = onFile;
document.getElementById('up').onchange = onFile;
