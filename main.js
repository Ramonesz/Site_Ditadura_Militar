const audio = new Audio()
const telaInicial = document.querySelector('.tela-inicial')
const botaoVoltarCapa = document.querySelector('.voltar-capa')
const botaoReproduzir = document.querySelector('#botao-reproduzir')
const nomeMusica = document.querySelector('#nome-musica')
const nomeArtista = document.querySelector('#nome-artista')
const cartoesMusicais = document.querySelectorAll('.cartao-musical')

function clearPlayingCard() {
  document.querySelector('.cartao-musical.playing')?.classList.remove('playing')
}

function pauseMusic() {
  audio.pause()
  clearPlayingCard()
}

function selectArtist(card) {
  pauseMusic()
  card.classList.add('playing')
  nomeMusica.textContent = card.dataset.song
  nomeArtista.textContent = 'Nome do Artista'
  audio.src = card.dataset.audio
  document.body.classList.add('player-visivel')
  audio.play().then(() => {
    botaoReproduzir.textContent = 'Ⅱ'
  }).catch(() => {
    botaoReproduzir.textContent = '▶'
  })
}

telaInicial.addEventListener('click', () => {
  document.body.classList.add('acervo-aberto')
})

botaoVoltarCapa.addEventListener('click', () => {
  pauseMusic()
  document.body.classList.remove('acervo-aberto', 'player-visivel')
})

cartoesMusicais.forEach((card) => {
  card.addEventListener('click', (event) => {
    if (!event.target.closest('.botao-descricao')) {
      selectArtist(card)
    }
  })

  card.querySelector('.botao-descricao').addEventListener('click', () => {
    const isOpen = card.classList.toggle('expanded')
    card.querySelector('.botao-descricao').setAttribute('aria-expanded', isOpen)
  })
})

document.addEventListener('click', (event) => {
  if (!event.target.closest('.cartao-musical') && !event.target.closest('.player-audio')) {
    pauseMusic()
  }
})

botaoReproduzir.addEventListener('click', () => {
  if (!audio.src) return

  if (audio.paused) {
    audio.play().then(() => {
      botaoReproduzir.textContent = 'Ⅱ'
      document.body.classList.add('player-visivel')
    })
  } else {
    pauseMusic()
    botaoReproduzir.textContent = '▶'
    document.body.classList.remove('player-visivel')
  }
})

audio.addEventListener('playing', () => {
  document.body.classList.add('player-visivel')
})

audio.addEventListener('pause', () => {
  document.body.classList.remove('player-visivel')
})

audio.addEventListener('ended', () => {
  botaoReproduzir.textContent = '▶'
  pauseMusic()
})
