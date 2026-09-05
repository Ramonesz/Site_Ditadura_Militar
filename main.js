const audio = new Audio()
const audioSwap = new Audio('audio/efeitos sonoros/swap.wav')
const audioSwapBack = new Audio('audio/efeitos sonoros/swap1.wav')
const telaInicial = document.querySelector('.tela-inicial')
const botaoVoltarCapa = document.querySelector('.voltar-capa')
const linkVoltarCapa = document.querySelector('.link-capa')
const botaoReproduzir = document.querySelector('#botao-reproduzir')
const nomeMusica = document.querySelector('#nome-musica')
const nomeArtista = document.querySelector('#nome-artista')
const cartoesMusicais = document.querySelectorAll('.cartao-musical')
const progress = document.querySelector('.progress')
const progressFill = progress?.querySelector('span')
const volumeButtons = document.querySelectorAll('.volume-btn')
const volumeSlider = document.querySelector('.volume-slider')
const artePlayer = document.querySelector('.arte-player')

audio.volume = 0.8

function setupFlipCards() {
  cartoesMusicais.forEach((card) => {
    const description = card.querySelector('.descricao-artista')
    const action = card.querySelector('.acao-descricao')
    if (!description || card.querySelector('.cartao-inner')) return

    const inner = document.createElement('div')
    const front = document.createElement('div')
    const back = document.createElement('div')
    inner.className = 'cartao-inner'
    front.className = 'cartao-frente'
    back.className = 'cartao-verso'

    Array.from(card.children).forEach((child) => {
      if (child === description) {
        back.appendChild(child)
      } else {
        front.appendChild(child)
      }
    })

    inner.append(front, back)
    if (action) {
      back.appendChild(action.cloneNode(true))
    }
    card.appendChild(inner)
  })
}

setupFlipCards()

function updateVolumeDisplay() {
  const volume = Math.round(audio.volume * 100)
  if (volumeSlider) {
    volumeSlider.value = String(volume)
  }
}

function updateProgressBar() {
  if (!progressFill || !audio.duration || !Number.isFinite(audio.duration)) {
    if (progressFill) progressFill.style.width = '0%'
    return
  }

  const percent = (audio.currentTime / audio.duration) * 100
  progressFill.style.width = `${Math.min(100, Math.max(0, percent))}%`
  if (progress) {
    progress.setAttribute('aria-valuenow', String(Math.round(percent)))
  }
}

function clearPlayingCard() {
  document.querySelector('.cartao-musical.playing')?.classList.remove('playing')
}

function pauseMusic() {
  audio.pause()
  clearPlayingCard()
  document.body.classList.remove('player-no-final')
  if (botaoReproduzir) {
    botaoReproduzir.textContent = '▶'
  }
}

function resetPlayer() {
  audio.pause()
  audio.removeAttribute('src')
  audio.load()
  clearPlayingCard()
  nomeMusica.textContent = 'Escolha uma voz para começar'
  nomeArtista.textContent = 'O áudio aparecerá aqui'
  if (botaoReproduzir) {
    botaoReproduzir.textContent = '▶'
  }
  if (artePlayer) {
    artePlayer.style.backgroundImage = ''
    artePlayer.innerHTML = '♪'
  }
  document.body.classList.remove('player-visivel')
}

function closeExpandedDescriptions() {
  cartoesMusicais.forEach((card) => {
    card.classList.remove('expanded')
    card.querySelectorAll('.botao-descricao').forEach((button) => {
      button.setAttribute('aria-expanded', 'false')
    })
  })
}

function selectArtist(card) {
  pauseMusic()
  nomeMusica.textContent = card.dataset.song
  nomeArtista.textContent = card.dataset.artist || 'Nome do Artista'
  audio.src = card.dataset.audio

  if (artePlayer) {
    if (card.dataset.cover) {
      artePlayer.style.backgroundImage = `url('${card.dataset.cover}')`
      artePlayer.innerHTML = '<img src="' + card.dataset.cover + '" alt="Capa da música" />'
    } else {
      artePlayer.style.backgroundImage = ''
      artePlayer.innerHTML = '♪'
    }
  }

  audio.load()
  audio.play().then(() => {
    card.classList.add('playing')
    document.body.classList.add('player-visivel')
    updatePlayerAtPageEnd()
    if (botaoReproduzir) {
      botaoReproduzir.textContent = '×'
    }
  }).catch(() => {
    resetPlayer()
  })
}

function openArchive() {
  audioSwap.currentTime = 0
  audioSwap.play().catch(() => {})
  document.body.classList.add('acervo-aberto')
}

function updatePlayerAtPageEnd() {
  if (!document.body.classList.contains('player-visivel')) return

  const atPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8
  document.body.classList.toggle('player-no-final', atPageEnd)
}

window.addEventListener('scroll', updatePlayerAtPageEnd, { passive: true })
window.addEventListener('resize', updatePlayerAtPageEnd)

telaInicial?.addEventListener('click', openArchive)
telaInicial?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    openArchive()
  }
})

function voltarParaCapa(event) {
  event?.preventDefault()
  pauseMusic()
  closeExpandedDescriptions()
  audioSwapBack.currentTime = 0
  audioSwapBack.play().catch(() => {})
  document.body.classList.remove('acervo-aberto', 'player-visivel')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

botaoVoltarCapa?.addEventListener('click', voltarParaCapa)
linkVoltarCapa?.addEventListener('click', voltarParaCapa)

cartoesMusicais.forEach((card) => {
  const selectCard = () => {
    if (card.classList.contains('playing')) return
    selectArtist(card)
  }

  card.addEventListener('click', (event) => {
    const button = event.target.closest('.botao-descricao')
    if (button) {
      event.stopPropagation()
      const isExpanded = card.classList.toggle('expanded')
      card.querySelectorAll('.botao-descricao').forEach((cardButton) => {
        cardButton.setAttribute('aria-expanded', String(isExpanded))
      })
      return
    }

    selectCard()
  })

  card.addEventListener('keydown', (event) => {
    if (event.target.closest('.botao-descricao')) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectCard()
    }
  })
})

document.addEventListener('click', (event) => {
  if (event.target.closest('.cartao-musical, .player-audio, .tela-inicial, .voltar-capa')) {
    return
  }

  pauseMusic()
  document.body.classList.remove('player-visivel')
})

botaoReproduzir?.addEventListener('click', () => {
  if (!audio.src) return

  if (audio.paused) {
    if (botaoReproduzir) {
      botaoReproduzir.textContent = '×'
    }
    audio.play().catch(() => {
      if (botaoReproduzir) botaoReproduzir.textContent = '×'
    })
    document.body.classList.add('player-visivel')
    updatePlayerAtPageEnd()
  } else {
    pauseMusic()
    document.body.classList.remove('player-visivel')
  }
})

if (progress) {
  let dragPercent = 0

  const updateDragPreview = (event) => {
    if (!audio.src || !audio.duration || !Number.isFinite(audio.duration)) return

    const rect = progress.getBoundingClientRect()
    dragPercent = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    if (progressFill) {
      progressFill.style.width = `${dragPercent * 100}%`
    }
    progress.setAttribute('aria-valuenow', String(Math.round(dragPercent * 100)))
  }

  progress.addEventListener('pointerdown', (event) => {
    if (!audio.src || !audio.duration || !Number.isFinite(audio.duration)) return

    progress.classList.add('dragging')
    try {
      progress.setPointerCapture(event.pointerId)
    } catch {}
    updateDragPreview(event)
  })

  progress.addEventListener('pointermove', (event) => {
    if (progress.classList.contains('dragging')) {
      updateDragPreview(event)
    }
  })

  progress.addEventListener('pointerup', (event) => {
    updateDragPreview(event)
    if (audio.src && audio.duration && Number.isFinite(audio.duration)) {
      audio.currentTime = dragPercent * audio.duration
    }
    progress.classList.remove('dragging')
    updateProgressBar()
    if (progress.hasPointerCapture(event.pointerId)) {
      try {
        progress.releasePointerCapture(event.pointerId)
      } catch {}
    }
  })

  progress.addEventListener('pointercancel', () => {
    progress.classList.remove('dragging')
  })

  progress.addEventListener('keydown', (event) => {
    if (!audio.src || !audio.duration || !Number.isFinite(audio.duration)) return

    const step = 5
    if (event.key === 'ArrowRight') {
      audio.currentTime = Math.min(audio.duration, audio.currentTime + step)
    }
    if (event.key === 'ArrowLeft') {
      audio.currentTime = Math.max(0, audio.currentTime - step)
    }
    updateProgressBar()
  })
}

volumeSlider?.addEventListener('input', () => {
    audio.volume = Number(volumeSlider.value) / 100
    updateVolumeDisplay()
})

volumeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const delta = button.dataset.volumeAction === 'up' ? 0.1 : -0.1
    audio.volume = Math.min(1, Math.max(0, audio.volume + delta))
    updateVolumeDisplay()
  })
})

updateVolumeDisplay()

audio.addEventListener('playing', () => {
  document.body.classList.add('player-visivel')
})

audio.addEventListener('pause', () => {
  document.body.classList.remove('player-visivel')
  document.body.classList.remove('player-no-final')
})

audio.addEventListener('timeupdate', updateProgressBar)
audio.addEventListener('loadedmetadata', updateProgressBar)

audio.addEventListener('ended', () => {
  pauseMusic()
})

if (artePlayer && artePlayer.innerHTML.trim() === '') {
  artePlayer.innerHTML = '♪'
}
