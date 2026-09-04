const audio = new Audio()
const audioSwap = new Audio('Soun Effect/swap.wav')
const audioSwapBack = new Audio('Soun Effect/swap1.wav')
const audioSelect = new Audio('Soun Effect/select_sound.wav')
const telaInicial = document.querySelector('.tela-inicial')
const botaoVoltarCapa = document.querySelector('.voltar-capa')
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
  if (botaoReproduzir) {
    botaoReproduzir.textContent = '▶'
  }
}

function closeExpandedDescriptions() {
  cartoesMusicais.forEach((card) => {
    card.classList.remove('expanded')
    const button = card.querySelector('.botao-descricao')
    button?.setAttribute('aria-expanded', 'false')
  })
}

function selectArtist(card) {
  pauseMusic()
  card.classList.add('playing')
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

  document.body.classList.add('player-visivel')
  if (botaoReproduzir) {
    botaoReproduzir.textContent = '×'
  }
  audio.play().catch(() => {})
}

telaInicial?.addEventListener('click', () => {
  audioSwap.currentTime = 0
  audioSwap.play().catch(() => {})
  document.body.classList.add('acervo-aberto')
})

botaoVoltarCapa?.addEventListener('click', () => {
  pauseMusic()
  closeExpandedDescriptions()
  audioSwapBack.currentTime = 0
  audioSwapBack.play().catch(() => {})
  document.body.classList.remove('acervo-aberto', 'player-visivel')
})

cartoesMusicais.forEach((card) => {
  card.addEventListener('click', (event) => {
    const button = event.target.closest('.botao-descricao')
    if (button) {
      event.stopPropagation()
      audioSelect.currentTime = 0
      audioSelect.play().catch(() => {})
      const isExpanded = card.classList.toggle('expanded')
      button.setAttribute('aria-expanded', String(isExpanded))
      return
    }

    if (!card.classList.contains('playing')) {
      audioSelect.currentTime = 0
      audioSelect.play().catch(() => {})
    } else {
      return
    }

    selectArtist(card)
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
})

audio.addEventListener('timeupdate', updateProgressBar)
audio.addEventListener('loadedmetadata', updateProgressBar)

audio.addEventListener('ended', () => {
  botaoReproduzir.textContent = '▶'
  pauseMusic()
})

if (artePlayer && artePlayer.innerHTML.trim() === '') {
  artePlayer.innerHTML = '♪'
}
