const cardContainer = document.getElementById('card-container');
const dropAreas = document.querySelectorAll('.drop-area');
const resultado = document.getElementById('resultado');

const telaInicial = document.getElementById('tela-inicial');
const telaJogo = document.getElementById('tela-jogo');
const telaFinal = document.getElementById('tela-final');

const btnIniciar = document.getElementById('btn-iniciar');
const btnReiniciar = document.getElementById('btn-reiniciar');
const pontuacaoFinal = document.getElementById('pontuacao-final');

const placeholder = document.getElementById('card-placeholder');

let cartas = [];
let indiceCartaAtual = 0;
let pontuacao = 0;

// Pontuação para cada ação
const pontosPorAcao = {
  educar: 10,
  denunciar: 15,
  ignorar: 0
};

btnIniciar.addEventListener('click', () => {
  mostrarTela('jogo');
  carregarCartas();
});

btnReiniciar.addEventListener('click', () => {
  mostrarTela('inicial');
  pontuacao = 0;
  resultado.textContent = '';
  cardContainer.innerHTML = '';
  indiceCartaAtual = 0;
  pontuacaoFinal.textContent = '';
});

function mostrarTela(nome) {
  telaInicial.classList.remove('ativa');
  telaJogo.classList.remove('ativa');
  telaFinal.classList.remove('ativa');

  if (nome === 'inicial') telaInicial.classList.add('ativa');
  if (nome === 'jogo') telaJogo.classList.add('ativa');
  if (nome === 'final') telaFinal.classList.add('ativa');
}

function criarCarta(carta) {
  const div = document.createElement('div');
  div.className = 'card';
  div.setAttribute('draggable', true);
  div.dataset.id = carta.id;
  div.textContent = carta.texto;

  // Drag para desktop
  div.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', carta.id);
  });

  // Drag para mobile via touch
  let touchOffset = { x: 0, y: 0 };

  div.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const rect = div.getBoundingClientRect();
    touchOffset.x = touch.clientX - rect.left;
    touchOffset.y = touch.clientY - rect.top;
    div.style.position = 'absolute';
    div.style.zIndex = 1000;
  });

  div.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  div.style.left = `${touch.clientX - touchOffset.x}px`;
  div.style.top = `${touch.clientY - touchOffset.y}px`;

  dropAreas.forEach(area => {
    const areaRect = area.getBoundingClientRect();
    if (
      touch.clientX > areaRect.left &&
      touch.clientX < areaRect.right &&
      touch.clientY > areaRect.top &&
      touch.clientY < areaRect.bottom
    ) {
      area.classList.add('highlight');
    } else {
      area.classList.remove('highlight');
    }
  });
});


  div.addEventListener('touchend', (e) => {
    const cardRect = div.getBoundingClientRect();
    let matched = false;

    dropAreas.forEach(area => area.classList.remove('highlight'));

    dropAreas.forEach(area => {
      const areaRect = area.getBoundingClientRect();
      const isOverlapping =
        cardRect.right > areaRect.left &&
        cardRect.left < areaRect.right &&
        cardRect.bottom > areaRect.top &&
        cardRect.top < areaRect.bottom;

      if (isOverlapping && !matched) {
        matched = true;
        const acao = area.dataset.acao;
        processarAcao(carta.id, acao);
        removerCarta(div);
        mostrarProximaCarta();
      }
    });

    if (!matched) {
      resetCard(div);
    }
  });

  return div;
}

function processarAcao(cartaId, acao) {
  const carta = cartas.find(c => c.id === cartaId);
  if (!carta) return;

  resultado.textContent = carta.respostas[acao] || '';

  // Atualiza pontuação usando o valor da carta
  const valor = carta.pontuacoes ? carta.pontuacoes[acao] : 0;
  pontuacao += valor || 0;
}


function removerCarta(cartaEl) {
  
cartaEl.classList.add('removendo');
setTimeout(() => {
  cartaEl.remove();
}, 400); // tempo igual à duração da animação
  resetCard(cartaEl);

}

function resetCard(cartaEl) {
  cartaEl.style.position = '';
  cartaEl.style.left = '';
  cartaEl.style.top = '';
  cartaEl.style.zIndex = '';
}

function mostrarProximaCarta() {
  document.getElementById('card-placeholder').style.display = 'none';
  cardContainer.innerHTML = '';
  indiceCartaAtual++;
  updateCardCounter();
  if (indiceCartaAtual >= cartas.length) {
    finalizarJogo();
    return;
  }
  const proxCarta = criarCarta(cartas[indiceCartaAtual]);
  cardContainer.appendChild(proxCarta);
}

function carregarCartas() {
  fetch('cartas.json')
    .then(res => res.json())
    .then(data => {
      shuffle(data);
      cartas = data;
      indiceCartaAtual = 0;
      pontuacao = 0;
      updateCardCounter();
      resultado.textContent = '';
      cardContainer.innerHTML = '';
      if (cartas.length > 0) {
        const primeiraCarta = criarCarta(cartas[indiceCartaAtual]);
        cardContainer.appendChild(primeiraCarta);
      }
    })
    .catch(err => {
      resultado.textContent = "Erro ao carregar cartas.";
      console.error(err);
    });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function updateCardCounter() {
  const counter = document.getElementById('card-counter');
  counter.textContent = `Cartas restantes: ${cartas.length - indiceCartaAtual}`;
}

function avaliarJogador(pontuacao) {
  if (pontuacao <= 0) {
    return "Você precisa refletir mais sobre suas ações.";
  } else if (pontuacao <= 20) {
    return "Você pode melhorar sua consciência antirracista.";
  } else if (pontuacao <= 40) {
    return "Boa! Você está atento às questões raciais.";
  } else if (pontuacao <= 60) {
    return "Excelente! Você é um agente ativo contra o racismo.";
  } else {
    return "Parabéns! Você demonstra uma postura exemplar.";
  }
}

function finalizarJogo() {
  mostrarTela('final');
  pontuacaoFinal.textContent = pontuacao + " pontos";

  const feedback = avaliarJogador(pontuacao);
  const feedbackEl = document.getElementById('feedback-ia');
  if (feedbackEl) {
    feedbackEl.textContent = feedback;
  }
}

// Mostrar tela inicial no carregamento
mostrarTela('inicial');

// Eventos drop para desktop
dropAreas.forEach(area => {
  area.addEventListener('dragover', e => {
    e.preventDefault();
  });

  area.addEventListener('dragenter', e => {
    e.preventDefault();
    area.classList.add('highlight');
  });

  area.addEventListener('dragleave', e => {
    area.classList.remove('highlight');
  });

  area.addEventListener('drop', e => {
    e.preventDefault();
    area.classList.remove('highlight');

    const cartaId = parseInt(e.dataTransfer.getData('text/plain'));
    const cartaEl = document.querySelector(`.card[data-id="${cartaId}"]`);
    if (!cartaEl) return;

    const acao = area.dataset.acao;
    processarAcao(cartaId, acao);
    removerCarta(cartaEl);
    mostrarProximaCarta();
  });
});
