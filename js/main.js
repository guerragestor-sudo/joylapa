/* =========================================================
   Joy Lapa · interações (sem bibliotecas)
   ========================================================= */
(() => {
  /* ============ EDITE AQUI ============ */
  const CONFIG = {
    // Número que recebe os leads (código do país + DDD + número, só dígitos)
    whatsapp: '5511945913535',

    // Aparece no rodapé. Ex.: 'Guerra · Corretor de imóveis · CRECI 000000-F'
    // Deixe vazio ('') para não mostrar.
    creci: 'Gabriel Guerra - Corretor de imóveis - CRECI 267059-f',

    // ID do Pixel da Meta (Facebook/Instagram Ads): SÓ OS NÚMEROS, não o código inteiro.
    // Ex.: '123456789012345'. O código do Pixel já está pronto mais abaixo neste arquivo.
    // Se preenchido, a página registra PageView, "Lead" no envio do formulário
    // e "Contact" nos botões de WhatsApp.
    metaPixelId: '2018343195510481',

    // Mensagem dos botões de WhatsApp direto (sem formulário)
    mensagemPadrao: 'Olá! Quero saber mais sobre o Joy Lapa.',
  };
  /* ==================================== */

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const hasIO = 'IntersectionObserver' in window;
  const waUrl = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

  /* ---------- Meta Pixel (opcional) ---------- */
  // usa só os dígitos do ID (tolera espaços ou texto junto, ex.: "ID 123...")
  const pixelId = (String(CONFIG.metaPixelId || '').match(/\d{10,20}/) || [''])[0];
  if (pixelId) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }
  const track = (event, data, opts) => {
    if (!pixelId || !window.fbq) return;
    const args = ['track', event];
    if (data || opts) args.push(data || {});
    if (opts) args.push(opts);
    window.fbq(...args);
  };

  /* ---------- Rodapé: ano e CRECI ---------- */
  $$('.js-year').forEach((el) => (el.textContent = new Date().getFullYear()));
  const creci = String(CONFIG.creci || '').trim();
  const creciEl = $('[data-creci]');
  if (creci && creciEl) { creciEl.textContent = creci; creciEl.hidden = false; }

  /* ---------- Botões de WhatsApp direto ---------- */
  $$('[data-wa]').forEach((a) => {
    a.href = waUrl(a.dataset.waMsg || CONFIG.mensagemPadrao);
    a.target = '_blank';
    a.rel = 'noopener';
    a.addEventListener('click', () => track('Contact'));
  });

  /* ---------- Topo com sombra ao rolar ---------- */
  const topbar = $('.topbar');
  const onScroll = () => topbar && topbar.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Revelação suave ao rolar ---------- */
  const revealables = $$('.reveal');
  if (hasIO) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Barra fixa (celular) ----------
     Aparece depois do botão do topo e some no formulário e no rodapé */
  const bar = $('.sticky-cta');
  const heroCta = $('#cta-topo');
  if (bar && heroCta && hasIO) {
    let pastHero = false;
    const zones = new Map();
    const update = () => {
      const show = pastHero && ![...zones.values()].some(Boolean);
      bar.classList.toggle('is-visible', show);
      bar.toggleAttribute('inert', !show);
      bar.setAttribute('aria-hidden', String(!show));
    };
    new IntersectionObserver(([entry]) => {
      pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      update();
    }).observe(heroCta);
    const zoneObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => zones.set(entry.target, entry.isIntersecting));
      update();
    });
    $$('[data-hide-sticky]').forEach((el) => zoneObserver.observe(el));
  }

  /* ---------- Formulário: referências ---------- */
  const form = $('[data-lead-form]');
  const selRenda = $('#f-renda');
  const selPlanta = $('#f-planta');

  /* ---------- Descubra sua faixa (regras MCMV vigentes desde abr/2026) ---------- */
  const FAIXAS = {
    'ate-3200': {
      nome: 'Faixa 1', sub: 'Renda familiar de até R$ 3.200', renda: 'Até R$ 3.200',
      itens: ['Subsídio de até R$ 55 mil, conforme renda e cidade', 'Juros a partir de 4% ao ano', 'Pode usar o FGTS na entrada', 'Até 420 meses para pagar'],
    },
    '3200-5000': {
      nome: 'Faixa 2', sub: 'Renda familiar de R$ 3.200 a R$ 5.000', renda: 'R$ 3.200 a R$ 5.000',
      itens: ['Subsídio de até R$ 55 mil, conforme renda e cidade', 'Juros reduzidos, bem abaixo do mercado', 'Pode usar o FGTS na entrada', 'Até 420 meses para pagar'],
    },
    '5000-9600': {
      nome: 'Faixa 3', sub: 'Renda familiar de R$ 5.000 a R$ 9.600', renda: 'R$ 5.000 a R$ 9.600',
      itens: ['Juros reduzidos, abaixo dos financiamentos comuns', 'Imóveis de até R$ 400 mil no programa', 'Pode usar o FGTS na entrada', 'Até 420 meses para pagar'],
    },
    '9600-13000': {
      nome: 'Faixa 4', sub: 'Renda familiar de R$ 9.600 a R$ 13.000', renda: 'R$ 9.600 a R$ 13.000',
      itens: ['Juros abaixo dos financiamentos de mercado', 'Imóveis de até R$ 600 mil no programa', 'Pode usar o FGTS na entrada', 'Até 420 meses para pagar'],
    },
    'acima-13000': {
      nome: 'Financiamento tradicional', sub: 'Renda familiar acima de R$ 13.000', renda: 'Acima de R$ 13.000',
      itens: ['Acima do teto do MCMV, mas você compra com financiamento bancário tradicional', 'Pode usar o FGTS, conforme as regras da Caixa', 'Escritura grátis e condições de lançamento Cavazani'],
    },
  };
  const chips = $$('.chip[data-renda]');
  const faixaEmpty = $('[data-faixa-empty]');
  const faixaResult = $('[data-faixa-result]');
  const faixaNome = $('[data-faixa-nome]');
  const faixaLista = $('[data-faixa-lista]');
  const checkSvg = '<svg aria-hidden="true"><use href="#i-check"/></svg>';
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const f = FAIXAS[chip.dataset.renda];
      if (!f) return;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      faixaNome.innerHTML = `${esc(f.nome)}<small>${esc(f.sub)}</small>`;
      faixaLista.innerHTML = f.itens.map((t) => `<li>${checkSvg}<span>${esc(t)}</span></li>`).join('');
      faixaEmpty.hidden = true;
      faixaResult.hidden = false;
      // reinicia a animação de entrada
      faixaResult.style.animation = 'none'; void faixaResult.offsetWidth; faixaResult.style.animation = '';
      if (selRenda) { selRenda.value = f.renda; selRenda.closest('.field')?.classList.remove('is-invalid'); }
    });
  });

  /* ---------- "Quero simular o X" preenche a planta ---------- */
  $$('[data-planta-cta]').forEach((a) => {
    a.addEventListener('click', () => {
      const v = a.dataset.plantaCta;
      if (v && selPlanta) selPlanta.value = v;
    });
  });

  /* ---------- Abas das plantas ---------- */
  $$('[data-tabs]').forEach((wrap) => {
    const tabs = $$('[role="tab"]', wrap);
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in map)) return;
        e.preventDefault();
        select(tabs[(map[e.key] + tabs.length) % tabs.length], true);
      });
    });
  });

  /* ---------- Galeria: setas ---------- */
  const gallery = $('[data-gallery]');
  const navBtns = $$('[data-slide]');
  if (gallery && navBtns.length) {
    const step = () => {
      const item = gallery.querySelector('li');
      return item ? item.getBoundingClientRect().width + 14 : 400;
    };
    const updateNav = () => {
      const max = gallery.scrollWidth - gallery.clientWidth - 4;
      navBtns.forEach((b) => {
        b.disabled = Number(b.dataset.slide) < 0 ? gallery.scrollLeft <= 4 : gallery.scrollLeft >= max;
      });
    };
    navBtns.forEach((b) => b.addEventListener('click', () => {
      gallery.scrollBy({ left: Number(b.dataset.slide) * step(), behavior: 'smooth' });
    }));
    gallery.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav);
    updateNav();
  }

  /* ---------- Visualizador de imagens ---------- */
  const lb = $('[data-lightbox]');
  if (lb && typeof lb.showModal === 'function') {
    const img = $('[data-lb-img]', lb);
    const cap = $('[data-lb-cap]', lb);
    let group = [];
    let index = 0;

    const show = (i) => {
      index = (i + group.length) % group.length;
      const el = group[index];
      img.src = el.dataset.zoom;
      img.alt = el.querySelector('img')?.alt || el.dataset.caption || '';
      cap.textContent = el.dataset.caption || '';
    };
    const open = (el) => {
      const inGallery = el.closest('[data-gallery]');
      group = inGallery ? $$('[data-zoom]', inGallery) : [el];
      lb.classList.toggle('is-single', group.length < 2);
      show(group.indexOf(el));
      lb.showModal();
    };
    $$('[data-zoom]').forEach((el) => el.addEventListener('click', () => open(el)));
    $$('[data-lb-step]', lb).forEach((b) => b.addEventListener('click', () => show(index + Number(b.dataset.lbStep))));
    $('[data-lb-close]', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target.tagName === 'FIGURE') lb.close(); });
    lb.addEventListener('keydown', (e) => {
      if (group.length < 2) return;
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === 'ArrowLeft') show(index - 1);
    });
    lb.addEventListener('close', () => { img.removeAttribute('src'); });
    let x0 = null;
    lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (x0 === null || group.length < 2) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* ---------- Formulário → Netlify Forms + WhatsApp ---------- */
  if (!form) return;

  // UTMs da URL (guardadas na sessão para não se perderem ao navegar)
  const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const params = new URLSearchParams(location.search);
  UTM.forEach((k) => {
    let v = params.get(k) || '';
    try {
      if (v) sessionStorage.setItem(k, v);
      else v = sessionStorage.getItem(k) || '';
    } catch (_) { /* navegação privada: segue sem guardar */ }
    if (form.elements[k]) form.elements[k].value = v;
  });
  if (form.elements.pagina) form.elements.pagina.value = location.href.split('#')[0];

  // Identificadores da Meta para a API de Conversões (cookies do Pixel + fbclid do anúncio)
  const cookie = (name) => (document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`)) || [])[1] || '';
  let fbcFromUrl = '';
  try {
    const fbclid = params.get('fbclid');
    if (fbclid) sessionStorage.setItem('fbc', `fb.1.${Date.now()}.${fbclid}`);
    fbcFromUrl = sessionStorage.getItem('fbc') || '';
  } catch (_) { /* navegação privada */ }
  const newEventId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`);

  // Máscara do WhatsApp: (11) 91234-5678
  const phone = $('#f-whats');
  const digits = (s) => s.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  const fmtPhone = (s) => {
    const d = digits(s).slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };
  phone.addEventListener('input', () => { phone.value = fmtPhone(phone.value); });

  const rules = {
    nome: (v) => v.trim().length >= 2,
    whatsapp: (v) => /^\d{10,11}$/.test(digits(v)),
    renda: (v) => v !== '',
  };
  const setValid = (name, ok) => {
    const input = form.elements[name];
    const field = input.closest('.field');
    field.classList.toggle('is-invalid', !ok);
    input.setAttribute('aria-invalid', String(!ok));
    if (!ok) input.setAttribute('aria-describedby', `${input.id}-err`);
    else input.removeAttribute('aria-describedby');
    return ok;
  };
  Object.keys(rules).forEach((name) => {
    const input = form.elements[name];
    const evt = input.tagName === 'SELECT' ? 'change' : 'blur';
    input.addEventListener(evt, () => {
      if (input.value || input.closest('.field').classList.contains('is-invalid')) setValid(name, rules[name](input.value));
    });
  });

  const status = $('[data-form-status]');
  const submit = $('[data-submit]');
  const submitLabel = submit.querySelector('span');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const results = Object.keys(rules).map((name) => [name, setValid(name, rules[name](form.elements[name].value))]);
    const firstBad = results.find(([, ok]) => !ok);
    if (firstBad) { form.elements[firstBad[0]].focus(); return; }

    const data = new FormData(form);
    const nome = String(data.get('nome')).trim();
    const fgts = data.get('fgts') || 'Não informado';
    const msg = [
      'Olá! Quero simular o Joy Lapa.',
      `Nome: ${nome}`,
      `WhatsApp: ${fmtPhone(String(data.get('whatsapp')))}`,
      `Renda familiar: ${data.get('renda')}`,
      `3+ anos de carteira (FGTS): ${fgts}`,
      `Planta de interesse: ${data.get('planta')}`,
    ].join('\n');

    submit.disabled = true;
    submitLabel.textContent = 'Enviando...';

    // Evento "Lead" no navegador (Pixel) e no servidor (API de Conversões) com o mesmo
    // event_id, para a Meta contar uma vez só. Sai antes de abrir o WhatsApp.
    const eventId = newEventId();
    track('Lead', { content_name: 'Joy Lapa', content_category: String(data.get('renda')) }, { eventID: eventId });
    const capi = pixelId ? fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: eventId,
        nome,
        whatsapp: digits(String(data.get('whatsapp'))),
        renda: String(data.get('renda')),
        url: location.href.split('#')[0],
        fbp: cookie('_fbp'),
        fbc: cookie('_fbc') || fbcFromUrl,
      }),
      keepalive: true,
    }).catch(() => null) : null;

    // Salva o lead no Netlify Forms (espera de 0,6 s a 1,5 s) e abre o WhatsApp
    const body = new URLSearchParams(data).toString();
    const save = fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      keepalive: true,
    }).catch(() => null);
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    await Promise.all([Promise.race([Promise.all([save, capi]), wait(1500)]), wait(600)]);

    const url = waUrl(msg);
    status.innerHTML = `Pronto! Abrindo o WhatsApp... Se não abrir, <a href="${url}" target="_blank" rel="noopener">toque aqui</a>.`;
    submit.disabled = false;
    submitLabel.textContent = 'Receber minha simulação';
    window.location.href = url;
  });
})();
