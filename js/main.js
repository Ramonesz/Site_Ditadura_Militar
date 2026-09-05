const audio = new Audio()
const audioEntradaSite = new Audio('../audio/efeitos sonoros/entrada-site.wav')
const audioClique = new Audio('../audio/efeitos sonoros/clique-navegacao.wav')
const audioRespostaCerta = new Audio('../audio/efeitos sonoros/resposta-correta.mp3')
const audioRespostaErrada = new Audio('../audio/efeitos sonoros/resposta-incorreta.mp3')
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

function playClickSound() {
  audioClique.currentTime = 0
  audioClique.play().catch(() => {})
}

function navigateWithTransition(link) {
  const isCoverLink = link.classList.contains('tela-inicial')
  if (isCoverLink) {
    audioEntradaSite.currentTime = 0
    audioEntradaSite.play().catch(() => {})
  } else {
    playClickSound()
  }
  if (isCoverLink) {
    link.classList.add('capa-saindo')
  } else {
    document.body.classList.add('pagina-saindo')
  }
  window.setTimeout(() => {
    window.location.href = link.href
  }, isCoverLink ? 700 : 520)
}

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

function updatePlayerAtPageEnd() {
  if (!document.body.classList.contains('player-visivel')) return

  const atPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8
  document.body.classList.toggle('player-no-final', atPageEnd)
}

window.addEventListener('scroll', updatePlayerAtPageEnd, { passive: true })
window.addEventListener('resize', updatePlayerAtPageEnd)

document.querySelectorAll('a[href$=".html"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return

    event.preventDefault()
    pauseMusic()
    closeExpandedDescriptions()
    navigateWithTransition(link)
  })
})

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
  if (event.target.closest('.cartao-musical, .player-audio, a[href], .voltar-capa, .link-acervo')) {
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

const quizInicio = document.querySelector('#iniciar-quiz')
const quizReinicio = document.querySelector('#reiniciar-quiz')
const quizApresentacao = document.querySelector('#quiz-apresentacao')
const quizJogo = document.querySelector('#quiz-jogo')
const quizResultado = document.querySelector('#quiz-resultado')
const quizProgresso = document.querySelector('#quiz-progresso')
const quizPontuacao = document.querySelector('#quiz-pontuacao')
const quizPergunta = document.querySelector('#quiz-pergunta')
const quizRespostas = document.querySelector('#quiz-respostas')
const quizFeedback = document.querySelector('#quiz-feedback')
const quizProxima = document.querySelector('#proxima-quiz')
const quizResultadoTitulo = document.querySelector('#quiz-resultado-titulo')
const quizResultadoTexto = document.querySelector('#quiz-resultado-texto')

let perguntaAtual = 0
let acertosQuiz = 0
let perguntasAtuais = []

function prepararPerguntasQuiz() {
  perguntasAtuais = perguntasQuiz.map((pergunta) => {
    const respostas = pergunta.respostas.map((texto, indice) => ({
      texto,
      correta: indice === pergunta.correta,
    }))

    for (let indice = respostas.length - 1; indice > 0; indice -= 1) {
      const indiceAleatorio = Math.floor(Math.random() * (indice + 1))
      const respostaTemporaria = respostas[indice]
      respostas[indice] = respostas[indiceAleatorio]
      respostas[indiceAleatorio] = respostaTemporaria
    }

    return {
      pergunta: pergunta.pergunta,
      respostas: respostas.map((resposta) => resposta.texto),
      correta: respostas.findIndex((resposta) => resposta.correta),
    }
  })
}

function atualizarPontuacaoQuiz() {
  if (quizPontuacao) quizPontuacao.textContent = `${acertosQuiz} ${acertosQuiz === 1 ? 'acerto' : 'acertos'}`
}

function mostrarPerguntaQuiz() {
  const item = perguntasAtuais[perguntaAtual]
  if (!item || !quizPergunta || !quizRespostas) return

  quizProgresso.textContent = `Pergunta ${perguntaAtual + 1} de ${perguntasAtuais.length}`
  quizPergunta.textContent = item.pergunta
  quizRespostas.innerHTML = ''
  quizFeedback.textContent = ''
  quizFeedback.className = 'quiz-feedback'
  quizProxima.hidden = true

  item.respostas.forEach((resposta, indice) => {
    const botao = document.createElement('button')
    botao.className = 'quiz-resposta'
    botao.type = 'button'
    botao.textContent = `${String.fromCharCode(97 + indice)}) ${resposta}`
    botao.addEventListener('click', () => corrigirRespostaQuiz(indice, item.correta))
    quizRespostas.appendChild(botao)
  })
  atualizarPontuacaoQuiz()
}

function corrigirRespostaQuiz(indiceEscolhido, indiceCorreto) {
  const botoes = quizRespostas.querySelectorAll('.quiz-resposta')
  botoes.forEach((botao) => { botao.disabled = true })

  if (indiceEscolhido === indiceCorreto) {
    botoes[indiceEscolhido].classList.add('correta')
    acertosQuiz += 1
    audioRespostaCerta.currentTime = 0
    audioRespostaCerta.play().catch(() => {})
    quizFeedback.textContent = ''
    quizFeedback.classList.add('feedback-correto')
  } else {
    botoes[indiceEscolhido].classList.add('errada')
    botoes[indiceCorreto].classList.add('correta')
    audioRespostaErrada.currentTime = 0
    audioRespostaErrada.play().catch(() => {})
    quizFeedback.textContent = ''
    quizFeedback.classList.add('feedback-errado')
  }

  atualizarPontuacaoQuiz()
  quizProxima.hidden = false
  quizProxima.textContent = perguntaAtual === perguntasAtuais.length - 1 ? 'Ver resultado' : 'Próxima pergunta'
}

function iniciarQuiz() {
  perguntaAtual = 0
  acertosQuiz = 0
  prepararPerguntasQuiz()
  playClickSound()
  document.body.classList.add('quiz-iniciado')
  const primeiraEntrada = !quizApresentacao.hidden

  if (!primeiraEntrada) {
    quizResultado.hidden = true
    quizJogo.hidden = false
    mostrarPerguntaQuiz()
    return
  }

  quizInicio.disabled = true
  quizApresentacao.classList.add('quiz-saindo')
  window.setTimeout(() => {
    quizApresentacao.hidden = true
    quizApresentacao.classList.remove('quiz-saindo')
    quizResultado.hidden = true
    quizJogo.hidden = false
    mostrarPerguntaQuiz()
  }, 420)
}

function finalizarQuiz() {
  quizJogo.hidden = true
  quizResultado.hidden = false
  quizResultadoTitulo.textContent = `${acertosQuiz} acertos`
  const mensagensResultado = [
    'Você não acertou nenhuma... Talvez seja hora de estudar um pouco mais!',
    'Pelo menos uma você acertou! Todo começo é alguma coisa.',
    'Ainda dá para melhorar bastante, mas você já começou bem.',
    'Não foi ruim, mas ainda falta um pouco para dominar o assunto.',
    'Quase na metade! Continue tentando.',
    'Metade do caminho! Um resultado razoável.',
    'Nada mal! Você mostrou que entende do assunto.',
    'Muito bem! Você teve um ótimo desempenho.',
    'Excelente resultado! Você realmente sabe bastante.',
    'Quase perfeito! Faltou muito pouco para acertar tudo.',
    'PERFEITO! Você acertou todas as perguntas. Parabéns!',
  ]
  quizResultadoTexto.textContent = mensagensResultado[acertosQuiz]
}

quizInicio?.addEventListener('click', iniciarQuiz)
quizReinicio?.addEventListener('click', iniciarQuiz)
quizProxima?.addEventListener('click', () => {
  playClickSound()
  if (perguntaAtual === perguntasAtuais.length - 1) {
    finalizarQuiz()
    return
  }
  perguntaAtual += 1
  mostrarPerguntaQuiz()
})
