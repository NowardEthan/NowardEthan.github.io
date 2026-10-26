/* Portfólio — André Ramos de Oliveira
   Motion em JavaScript puro. Tudo desliga quando o visitante pede menos movimento. */

(() => {
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const ponteiroFino = window.matchMedia('(pointer: fine)').matches
  const raiz = document.documentElement

  /* ---------------- menu do celular ---------------- */
  const botaoMenu = document.getElementById('menu-toggle')
  const menu = document.getElementById('mobile-menu')
  if (botaoMenu && menu) {
    const abrir = (aberto) => {
      raiz.classList.toggle('menu-open', aberto)
      botaoMenu.setAttribute('aria-expanded', String(aberto))
      botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu')
    }
    botaoMenu.addEventListener('click', () => abrir(botaoMenu.getAttribute('aria-expanded') !== 'true'))
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => abrir(false)))
    document.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape') abrir(false)
    })
  }

  /* ---------------- revelação em cascata ---------------- */
  const alvos = document.querySelectorAll('[data-reveal]')
  alvos.forEach((alvo) => {
    const atraso = alvo.dataset.delay
    if (atraso) alvo.style.setProperty('--delay', `${atraso}ms`)
  })

  if (reduzido || !('IntersectionObserver' in window)) {
    alvos.forEach((alvo) => alvo.classList.add('is-visible'))
  } else {
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue
          entrada.target.classList.add('is-visible')
          observador.unobserve(entrada.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    alvos.forEach((alvo) => observador.observe(alvo))
    // Rede de segurança: aba em segundo plano ou janela oculta não deixa o site vazio.
    window.setTimeout(() => alvos.forEach((alvo) => alvo.classList.add('is-visible')), 2200)
  }

  /* ---------------- barra de progresso e barra fixa ---------------- */
  const barra = document.getElementById('progress')
  const topo = document.getElementById('topbar')
  const links = Array.from(document.querySelectorAll('.nav a'))
  const glider = document.getElementById('nav-glider')
  const secoes = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter((secao) => secao instanceof HTMLElement)

  function moverGlider(link) {
    if (!glider || !link) return
    glider.style.width = `${link.offsetWidth}px`
    glider.style.transform = `translateX(${link.offsetLeft}px)`
    glider.style.opacity = '1'
  }

  let pendente = false
  function aoRolar() {
    if (pendente) return
    pendente = true
    requestAnimationFrame(() => {
      pendente = false
      const y = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight

      if (barra) barra.style.width = `${total > 0 ? Math.min(100, (y / total) * 100) : 0}%`
      topo?.classList.toggle('is-stuck', y > 24)

      // Seção ativa: a última cujo topo já passou de um terço da tela.
      let ativa = null
      for (const secao of secoes) {
        if (secao.getBoundingClientRect().top <= window.innerHeight * 0.34) ativa = secao
      }
      links.forEach((link) => {
        const marcada = ativa ? link.getAttribute('href') === `#${ativa.id}` : false
        link.classList.toggle('is-active', marcada)
        if (marcada) moverGlider(link)
      })
      if (!ativa && glider) glider.style.opacity = '0'
    })
  }
  window.addEventListener('scroll', aoRolar, { passive: true })
  window.addEventListener('resize', aoRolar)
  aoRolar()

  /* ---------------- contadores ---------------- */
  const numeros = document.querySelectorAll('[data-count]')
  if (numeros.length > 0) {
    const contar = (elemento) => {
      const alvo = Number(elemento.dataset.count || '0')
      if (reduzido || !Number.isFinite(alvo)) {
        elemento.textContent = String(alvo)
        return
      }
      const duracao = 1100
      const inicio = performance.now()
      const passo = (agora) => {
        const t = Math.min(1, (agora - inicio) / duracao)
        const suave = 1 - Math.pow(1 - t, 3)
        elemento.textContent = String(Math.round(alvo * suave))
        if (t < 1) requestAnimationFrame(passo)
      }
      requestAnimationFrame(passo)
    }

    if ('IntersectionObserver' in window) {
      const observador = new IntersectionObserver(
        (entradas) => {
          for (const entrada of entradas) {
            if (!entrada.isIntersecting) continue
            contar(entrada.target)
            observador.unobserve(entrada.target)
          }
        },
        { threshold: 0.6 },
      )
      numeros.forEach((numero) => observador.observe(numero))
    } else {
      numeros.forEach(contar)
    }
  }

  /* ---------------- ponteiro: luz, inclinação e ímã ---------------- */
  if (!reduzido && ponteiroFino) {
    const luz = document.getElementById('cursor-glow')
    if (luz) {
      let alvoX = 0
      let alvoY = 0
      let x = 0
      let y = 0
      document.addEventListener('pointermove', (evento) => {
        alvoX = evento.clientX
        alvoY = evento.clientY
        document.body.classList.add('has-cursor')
      })
      const seguir = () => {
        x += (alvoX - x) * 0.12
        y += (alvoY - y) * 0.12
        luz.style.transform = `translate(${x}px, ${y}px)`
        requestAnimationFrame(seguir)
      }
      seguir()
    }

    document.querySelectorAll('.spotlight').forEach((cartao) => {
      cartao.addEventListener('pointermove', (evento) => {
        const area = cartao.getBoundingClientRect()
        cartao.style.setProperty('--mx', `${evento.clientX - area.left}px`)
        cartao.style.setProperty('--my', `${evento.clientY - area.top}px`)
      })
    })

    document.querySelectorAll('.tilt').forEach((cartao) => {
      let dentro = false
      cartao.addEventListener('pointerenter', () => {
        dentro = true
      })
      cartao.addEventListener('pointermove', (evento) => {
        if (!dentro) return
        const area = cartao.getBoundingClientRect()
        const px = (evento.clientX - area.left) / area.width - 0.5
        const py = (evento.clientY - area.top) / area.height - 0.5
        cartao.style.transform = `perspective(900px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg) translateY(-4px)`
      })
      cartao.addEventListener('pointerleave', () => {
        dentro = false
        cartao.style.transform = ''
      })
    })

    document.querySelectorAll('.magnetic').forEach((elemento) => {
      elemento.addEventListener('pointermove', (evento) => {
        const area = elemento.getBoundingClientRect()
        const dx = (evento.clientX - (area.left + area.width / 2)) * 0.18
        const dy = (evento.clientY - (area.top + area.height / 2)) * 0.3
        elemento.style.transform = `translate(${dx.toFixed(1)}px, ${(dy - 3).toFixed(1)}px)`
      })
      elemento.addEventListener('pointerleave', () => {
        elemento.style.transform = ''
      })
    })
  }

  /* ---------------- aurora da abertura ---------------- */
  const canvas = document.getElementById('aurora')
  if (canvas && !reduzido) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      let largura = 0
      let altura = 0
      let estrelas = []

      const medir = () => {
        const area = canvas.getBoundingClientRect()
        largura = area.width
        altura = area.height
        canvas.width = largura * ratio
        canvas.height = altura * ratio
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
        const quantidade = Math.round(Math.min(150, (largura * altura) / 11000))
        estrelas = Array.from({ length: quantidade }, () => ({
          x: Math.random() * largura,
          y: Math.random() * altura,
          r: Math.random() * 1.5 + 0.4,
          v: Math.random() * 0.18 + 0.04,
          fase: Math.random() * Math.PI * 2,
        }))
      }
      medir()
      window.addEventListener('resize', medir)

      // Faixas de luz que respiram devagar ao fundo.
      const faixas = [
        { cor: 'rgba(169, 139, 255, .20)', amplitude: 70, periodo: 14000, deslocamento: 0.3 },
        { cor: 'rgba(91, 124, 255, .16)', amplitude: 96, periodo: 19000, deslocamento: 0.55 },
        { cor: 'rgba(203, 184, 255, .11)', amplitude: 54, periodo: 25000, deslocamento: 0.72 },
      ]

      const desenhar = (agora) => {
        ctx.clearRect(0, 0, largura, altura)

        for (const faixa of faixas) {
          const t = (agora % faixa.periodo) / faixa.periodo
          const base = altura * faixa.deslocamento
          ctx.beginPath()
          ctx.moveTo(0, base)
          for (let x = 0; x <= largura; x += 18) {
            const onda =
              Math.sin(x / 190 + t * Math.PI * 2) * faixa.amplitude +
              Math.sin(x / 90 - t * Math.PI * 3) * (faixa.amplitude * 0.26)
            ctx.lineTo(x, base + onda)
          }
          ctx.lineTo(largura, altura)
          ctx.lineTo(0, altura)
          ctx.closePath()
          const gradiente = ctx.createLinearGradient(0, base - faixa.amplitude, 0, altura)
          gradiente.addColorStop(0, faixa.cor)
          gradiente.addColorStop(1, 'rgba(10, 12, 20, 0)')
          ctx.fillStyle = gradiente
          ctx.fill()
        }

        for (const estrela of estrelas) {
          estrela.y -= estrela.v
          if (estrela.y < -2) {
            estrela.y = altura + 2
            estrela.x = Math.random() * largura
          }
          estrela.fase += 0.015
          ctx.globalAlpha = 0.3 + Math.sin(estrela.fase) * 0.28
          ctx.fillStyle = '#cbb8ff'
          ctx.beginPath()
          ctx.arc(estrela.x, estrela.y, estrela.r, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
        requestAnimationFrame(desenhar)
      }
      requestAnimationFrame(desenhar)
    }
  }

  /* ---------------- ano ---------------- */
  const ano = document.getElementById('ano')
  if (ano) ano.textContent = String(new Date().getFullYear())

  /* ---------------- projetos do GitHub ---------------- */
  const OCULTOS = new Set([
    'luna-core',
    'aster',
    'aura-releases',
    'luna-ide-releases',
    'luna-ide',
    'orbit-lab-releases',
    'orbit-lab-debug-releases',
    'NowardEthan.github.io',
  ])

  const RESERVA = [
    {
      name: 'Luna',
      description: 'Assistente de IA para desktop com chat, IDE integrada, agente e memória. Electron, React e Python.',
      language: 'TypeScript',
      html_url: 'https://github.com/NowardEthan/Luna',
      pushed_at: '2026-08-14',
    },
    {
      name: 'voicecraft',
      description: 'Spaces de voz e chat ponto a ponto para desktop, em Electron e Firebase.',
      language: 'JavaScript',
      html_url: 'https://github.com/NowardEthan/voicecraft',
      pushed_at: '2026-10-02',
    },
    {
      name: 'orbit-lab',
      description: 'Laboratório Android nativo em Kotlin e Compose do ecossistema Luna.',
      language: 'Kotlin',
      html_url: 'https://github.com/NowardEthan/orbit-lab',
      pushed_at: '2026-08-11',
    },
    {
      name: 'orbit-releases',
      description: 'Orbit, o app da Luna: uma IA companheira com memória e personalidade próprias.',
      language: null,
      html_url: 'https://github.com/NowardEthan/orbit-releases',
      pushed_at: '2026-08-11',
    },
    {
      name: 'Lumen',
      description: 'Hub social para programadores e jogadores, com perfis, grupos e busca de parceiros.',
      language: 'JavaScript',
      html_url: 'https://github.com/NowardEthan/Lumen',
      pushed_at: '2025-12-02',
    },
    {
      name: 'Modifiers-Sync',
      description: 'Complemento em Python que sincroniza modificadores entre objetos no Blender.',
      language: 'Python',
      html_url: 'https://github.com/NowardEthan/Modifiers-Sync',
      pushed_at: '2026-05-17',
    },
  ]

  const CORES = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572a5',
    Kotlin: '#a97bff',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Ruby: '#701516',
  }

  function cartaoRepo(repo, indice) {
    const link = document.createElement('a')
    link.className = 'repo spotlight'
    link.href = repo.html_url
    link.target = '_blank'
    link.rel = 'noopener'
    link.setAttribute('data-reveal', '')
    link.style.setProperty('--delay', `${Math.min(indice, 6) * 50}ms`)

    const titulo = document.createElement('h3')
    titulo.textContent = repo.name
    link.append(titulo)

    if (repo.description) {
      const texto = document.createElement('p')
      texto.textContent = repo.description
      link.append(texto)
    }

    const meta = document.createElement('div')
    meta.className = 'meta'
    if (repo.language) {
      const lang = document.createElement('span')
      lang.className = 'lang'
      const bolinha = document.createElement('i')
      bolinha.style.background = CORES[repo.language] ?? 'var(--violet)'
      lang.append(bolinha, document.createTextNode(repo.language))
      meta.append(lang)
    }
    const data = new Date(repo.pushed_at)
    if (!Number.isNaN(data.getTime())) {
      const quando = document.createElement('span')
      quando.textContent = `atualizado em ${data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`
      meta.append(quando)
    }
    link.append(meta)
    return link
  }

  function pintarRepos(repos) {
    const alvo = document.getElementById('repos')
    if (!alvo) return
    const cartoes = repos.map(cartaoRepo)
    alvo.replaceChildren(...cartoes)
    // Os cartões nascem depois do observador original, então revelam na hora.
    requestAnimationFrame(() => cartoes.forEach((cartao) => cartao.classList.add('is-visible')))
    if (!reduzido && ponteiroFino) {
      cartoes.forEach((cartao) => {
        cartao.addEventListener('pointermove', (evento) => {
          const area = cartao.getBoundingClientRect()
          cartao.style.setProperty('--mx', `${evento.clientX - area.left}px`)
          cartao.style.setProperty('--my', `${evento.clientY - area.top}px`)
        })
      })
    }
  }

  pintarRepos(RESERVA)

  fetch('https://api.github.com/users/NowardEthan/repos?per_page=100&sort=pushed')
    .then((resposta) => (resposta.ok ? resposta.json() : Promise.reject(new Error('sem resposta'))))
    .then((repos) => {
      const filtrados = repos
        .filter((repo) => !repo.fork && !repo.archived && !OCULTOS.has(repo.name))
        .slice(0, 9)
      if (filtrados.length > 0) pintarRepos(filtrados)
    })
    .catch(() => {
      /* limite da API ou sem rede: fica a lista de reserva */
    })
})()
