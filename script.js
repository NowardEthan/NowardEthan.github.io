/* Portfólio — André Ramos de Oliveira */

(() => {
  const root = document.documentElement

  /* ---------- tema ---------- */
  const THEME_KEY = 'portfolio.theme'
  const saved = (() => {
    try {
      return localStorage.getItem(THEME_KEY)
    } catch {
      return null
    }
  })()
  if (saved === 'light' || saved === 'dark') root.dataset.theme = saved

  document.getElementById('theme')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light'
    root.dataset.theme = next
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* navegação privada: o tema vale só nesta visita */
    }
  })

  /* ---------- ano no rodapé ---------- */
  const ano = document.getElementById('ano')
  if (ano) ano.textContent = String(new Date().getFullYear())

  /* ---------- entrada suave das seções ---------- */
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduzido && 'IntersectionObserver' in window) {
    const alvos = document.querySelectorAll('.band, .facts')
    alvos.forEach((alvo) => alvo.classList.add('reveal'))
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue
          entrada.target.classList.add('in')
          observador.unobserve(entrada.target)
        }
      },
      { rootMargin: '-40px' },
    )
    alvos.forEach((alvo) => observador.observe(alvo))

    // Rede de segurança: se o observador não rodar (aba em segundo plano, janela
    // oculta, navegador antigo), o conteúdo aparece do mesmo jeito.
    window.setTimeout(() => {
      alvos.forEach((alvo) => alvo.classList.add('in'))
    }, 1500)
  }

  /* ---------- projetos ---------- */

  // Já aparecem na seção do ecossistema, ou são só pacotes de download.
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

  // Lista de reserva: o site continua completo se a API do GitHub não responder.
  const RESERVA = [
    {
      name: 'Luna',
      description:
        'Assistente de IA para desktop com chat, IDE integrada, agente e memória. Electron, React e Python.',
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
      description:
        'Orbit, o app da Luna: uma IA companheira com memória e personalidade próprias. Downloads e atualização automática.',
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

  function cartao(repo) {
    const link = document.createElement('a')
    link.className = 'repo'
    link.href = repo.html_url
    link.target = '_blank'
    link.rel = 'noopener'

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
      bolinha.style.background = CORES[repo.language] ?? 'var(--accent)'
      lang.append(bolinha, document.createTextNode(repo.language))
      meta.append(lang)
    }
    const quando = document.createElement('span')
    const data = new Date(repo.pushed_at)
    quando.textContent = Number.isNaN(data.getTime())
      ? ''
      : `atualizado em ${data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`
    meta.append(quando)
    link.append(meta)

    return link
  }

  function pintar(repos) {
    const alvo = document.getElementById('repos')
    if (!alvo) return
    alvo.replaceChildren(...repos.map(cartao))
  }

  pintar(RESERVA)

  // Depois tenta os dados ao vivo, para a página não envelhecer sozinha.
  fetch('https://api.github.com/users/NowardEthan/repos?per_page=100&sort=pushed')
    .then((resposta) => (resposta.ok ? resposta.json() : Promise.reject(new Error('sem resposta'))))
    .then((repos) => {
      const filtrados = repos
        .filter((repo) => !repo.fork && !repo.archived && !OCULTOS.has(repo.name))
        .slice(0, 8)
      if (filtrados.length > 0) pintar(filtrados)
    })
    .catch(() => {
      /* limite da API ou sem rede: fica a lista de reserva */
    })
})()
