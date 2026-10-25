// Resultados simulados. Quando houver IA de verdade, esta lista deixa de existir.
const MATERIAIS = [
  { id: 'pet', nome: 'Garrafa PET', chip: 'Plástico · PET 1', cor: '#f6a85c', recicla: true, destino: 'plastico',
    passos: ['Esvazie a garrafa e retire os resíduos.', 'Deixe secar e mantenha a tampa junto.', 'Separe dos orgânicos e leve à coleta seletiva.'] },
  { id: 'papelao', nome: 'Caixa de papelão', chip: 'Papel · Papelão', cor: '#e4cf9a', recicla: true, destino: 'papel',
    passos: ['Retire fitas adesivas e restos de comida.', 'Desmonte e dobre a caixa para ocupar menos espaço.', 'Mantenha seco: papel molhado ou engordurado não é reciclado.'] },
  { id: 'vidro', nome: 'Pote de vidro', chip: 'Vidro · Embalagem', cor: '#a8d8c9', recicla: true, destino: 'vidro',
    passos: ['Esvazie e enxágue rapidamente.', 'Se estiver quebrado, embale os cacos em jornal e identifique.', 'Não misture com espelhos, cerâmica ou lâmpadas.'] },
  { id: 'lata', nome: 'Lata de alumínio', chip: 'Metal · Alumínio', cor: '#c8d0d8', recicla: true, destino: 'metal',
    passos: ['Esvazie e enxágue.', 'Amasse, se possível, para ocupar menos espaço.', 'Separe dos resíduos orgânicos.'] },
  { id: 'pilha', nome: 'Pilha ou bateria', chip: 'Resíduo perigoso', cor: '#f4b6b0', recicla: false, destino: null, alerta: true,
    passos: ['Não jogue no lixo comum e não abra a pilha.', 'Guarde em pote seco e fechado, longe do calor.', 'Leve a um ponto específico para pilhas e baterias.'] }
];

// Mesma foto → mesmo resultado (usa o tamanho da imagem como semente)
function escolher(seed) {
  return MATERIAIS[Math.abs(Math.floor(seed || 0)) % MATERIAIS.length];
}
