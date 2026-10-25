const KEY = 'radareco:foto';
const $ = id => document.getElementById(id);

let photo = null;
try { photo = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (_) {}

if (!photo || !photo.d) {
  // Sem foto não há o que mostrar: volta para o início
  location.replace('index.html');
} else {
  const m = escolher(photo.s);
  document.title = 'RadarEco · ' + m.nome;

  $('foto').src = photo.d;
  $('arq').textContent = photo.n + ' · ' + (photo.s / 1048576).toFixed(1).replace('.', ',') + ' MB';

  $('r-nome').textContent = m.nome;
  $('r-chip').textContent = m.chip;
  $('r-chip').style.background = m.cor;
  $('r-rec').textContent = m.recicla ? '♻ Reciclável' : '⚠ Descarte especial';
  $('r-lista').innerHTML = m.passos.map(p => '<li>' + p + '</li>').join('');
  $('r-pontos').href = 'pontos-de-coleta.html' + (m.destino ? '?m=' + m.destino : '');
  $('aviso').hidden = !m.alerta;

  $('remover').onclick = () => {
    try { sessionStorage.removeItem(KEY); } catch (_) {}
    location.href = 'index.html';
  };
}
