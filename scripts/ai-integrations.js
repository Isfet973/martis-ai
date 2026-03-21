/* ═══════════════════════════════════════════════════════
   ai-integrations.js — Martis AI  v12
   Fallback triplo: Groq → OpenRouter → Gemini

   SETUP — cole suas chaves abaixo:

   1. GROQ (mais rápido, 14.400 req/dia)
      → console.groq.com → API Keys → Create API Key

   2. OPENROUTER (mais modelos, 200 req/dia)
      → openrouter.ai → Keys → Create Key

   3. GEMINI (Google, 1.500 req/dia)
      → aistudio.google.com → Get API Key → Create

   Qualquer uma que você deixar vazia é pulada automaticamente.
   O sistema tenta na ordem: Groq → OpenRouter → Gemini.
═══════════════════════════════════════════════════════ */

const KEYS = {
  groq:        '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',   // sk-...        (console.groq.com)
  openrouter:  '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',   // sk-or-v1-...  (openrouter.ai)
  gemini:      'AIzaSyC8k8MvwTRDWIZRKP85dnc1I5MqrGaYnlY',   // AIza...       (aistudio.google.com)
};

/* ══════════════════════════════════════════════════════
   PROVIDERS — configuração de cada API
══════════════════════════════════════════════════════ */

const PROVIDERS = [
  {
    name: 'Groq',
    active: () => KEYS.groq.startsWith('sk-'),
    call: async (messages, system) => {
      const payload = {
        model:    'llama-3.3-70b-versatile',
        messages: system ? [{ role: 'system', content: system }, ...messages] : messages,
        max_tokens: 1024,
      };
      const res  = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEYS.groq}` },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `Groq HTTP ${res.status}`);
      return data.choices[0].message.content;
    },
  },
  {
    name: 'OpenRouter',
    active: () => KEYS.openrouter.startsWith('sk-or-'),
    models: [
      'meta-llama/llama-3.3-70b-instruct:free',
      'deepseek/deepseek-r1:free',
      'mistralai/mistral-small-3.1-24b-instruct:free',
      'google/gemma-3-27b-it:free',
    ],
    call: async (messages, system) => {
      const provider = PROVIDERS[1];
      let lastErr;
      for (const model of provider.models) {
        try {
          const payload = {
            model,
            messages: system ? [{ role: 'system', content: system }, ...messages] : messages,
          };
          const res  = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method:  'POST',
            headers: {
              'Content-Type':  'application/json',
              'Authorization': `Bearer ${KEYS.openrouter}`,
              'HTTP-Referer':  window.location.href,
              'X-Title':       'Martis AI',
            },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!res.ok || data.error || !data.choices?.[0]?.message?.content)
            throw new Error(data?.error?.message || `OpenRouter HTTP ${res.status}`);
          console.log(`[Martis] OpenRouter usou: ${model}`);
          return data.choices[0].message.content;
        } catch (e) {
          lastErr = e;
          console.warn(`[Martis] OpenRouter modelo ${model} falhou: ${e.message}`);
          await sleep(400);
        }
      }
      throw lastErr;
    },
  },
  {
    name: 'Gemini',
    active: () => KEYS.gemini.startsWith('AIza'),
    call: async (messages, system) => {
      // Converte formato OpenAI → formato Gemini
      const contents = messages.map(m => ({
        role:  m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      const payload = { contents };
      if (system) payload.systemInstruction = { parts: [{ text: system }] };

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${KEYS.gemini}`;
      const res  = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `Gemini HTTP ${res.status}`);
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    },
  },
];

/* ══════════════════════════════════════════════════════
   CHAMADA PRINCIPAL — tenta cada provider em ordem
══════════════════════════════════════════════════════ */

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function anyConfigured() {
  return PROVIDERS.some(p => p.active());
}

async function callAI(messages, system) {
  if (!anyConfigured()) {
    return getDemoResponse(messages[messages.length - 1]?.content || '');
  }

  const active = PROVIDERS.filter(p => p.active());
  let lastError;

  for (const provider of active) {
    try {
      const reply = await provider.call(messages, system);
      console.log(`[Martis] Respondido por: ${provider.name}`);
      return reply;
    } catch (err) {
      console.warn(`[Martis] ${provider.name} falhou: ${err.message} → tentando próximo...`);
      lastError = err;
      await sleep(300);
    }
  }

  throw new Error(`Todos os providers falharam. Tente em alguns segundos. (${lastError?.message})`);
}

/* ══════════════════════════════════════════════════════
   DEMO (nenhuma chave configurada)
══════════════════════════════════════════════════════ */

function getDemoResponse(msg) {
  const m = msg.toLowerCase();
  if (m.includes('ola') || m.includes('oi') || m.includes('hello') || m.includes('hi'))
    return 'Olá! Sou a Martis AI 👋 Para ativar respostas reais, configure ao menos uma chave em `scripts/ai-integrations.js`. Opções: Groq, OpenRouter ou Gemini — todas gratuitas.';
  if (m.includes('chave') || m.includes('api') || m.includes('key') || m.includes('configurar'))
    return 'Configure em `scripts/ai-integrations.js`: Groq (console.groq.com), OpenRouter (openrouter.ai) ou Gemini (aistudio.google.com). Todas gratuitas, sem cartão.';
  if (m.includes('martis') || m.includes('quem') || m.includes('who'))
    return 'Sou a Martis AI, inspirada em Britomártis — deusa cretense das redes. Configure uma chave para conversas completas!';
  return `Modo demo ativo. Configure ao menos uma chave em \`scripts/ai-integrations.js\` para respostas reais.`;
}

/* ══════════════════════════════════════════════════════
   STATUS NA UI
══════════════════════════════════════════════════════ */

const API_STATUS = { text: { online: false, lastCheck: null } };

async function checkAllAPIs() {
  if (!anyConfigured()) {
    API_STATUS.text = { online: true, demo: true, lastCheck: Date.now() };
    updateAPIStatus();
    return true;
  }
  try {
    await callAI([{ role: 'user', content: 'OK' }]);
    API_STATUS.text = { online: true, demo: false, lastCheck: Date.now() };
    updateAPIStatus();
    return true;
  } catch (e) {
    API_STATUS.text = { online: false, demo: false, lastCheck: Date.now(), error: e.message };
    updateAPIStatus();
    return false;
  }
}

function updateAPIStatus() {
  const { online, demo } = API_STATUS.text;
  const label = demo ? 'Demo' : (online ? 'Online' : 'Offline');
  const cls   = online ? 'online' : 'offline';

  const hero = document.getElementById('heroStatusIndicator');
  if (hero) {
    hero.innerHTML = `<span class="status-dot ${cls}"></span> ${label}`;
    hero.className = `cp-online ${cls}`;
  }
  document.querySelectorAll('.tab-status').forEach(el => {
    el.textContent = label;
    el.className   = `tab-status ${cls}`;
  });
  ['textModelStatus','summaryModelStatus','codeModelStatus','thinkModelStatus',
   'writeModelStatus','visionModelStatus','voiceModelStatus'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = `<span class="status-dot ${cls}"></span> ${label}`;
      el.className = `model-status ${cls}`;
    }
  });
}

/* ══════════════════════════════════════════════════════
   UTILITÁRIOS
══════════════════════════════════════════════════════ */

function escapeHtml(t) {
  const d = document.createElement('div');
  d.textContent = t;
  return d.innerHTML;
}

function formatAIResponse(text) {
  if (!text) return '';
  let f = escapeHtml(text);
  f = f.replace(/```[\w]*\n?([\s\S]*?)```/g, '<div class="demo-code">$1</div>');
  f = f.replace(/`([^`]+)`/g, '<code style="background:var(--bg2);padding:.1rem .4rem;border-radius:4px;font-family:monospace;font-size:.85em">$1</code>');
  f = f.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  f = f.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  f = f.replace(/\n/g, '<br>');
  return f;
}

function addTyping(container, av) {
  const el = document.createElement('div');
  el.className = 'dm dm-ai typing-temp';
  el.innerHTML = `<div class="dm-av">${av}</div><div class="dm-bub typing-indicator"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
  return el;
}

/* ══════════════════════════════════════════════════════
   HERO CHAT
══════════════════════════════════════════════════════ */

const MARTIS_SYSTEM = `Você é a Martis AI, assistente de inteligência artificial da plataforma Martis.
Inspirada em Britomártis, deusa cretense das redes de pesca.
Responda de forma concisa e útil. Prefira português a menos que o usuário escreva em outro idioma.
Máximo 3 parágrafos por resposta.`;

let heroHistory = [];

async function heroSend() {
  const input   = document.getElementById('heroInput');
  const msgs    = document.getElementById('heroMessages');
  const sendBtn = document.getElementById('heroSendBtn');
  const text    = input.value.trim();
  if (!text) return;

  input.disabled = sendBtn.disabled = true;
  input.value = '';

  const uEl = document.createElement('div');
  uEl.className = 'cm cm-u';
  uEl.innerHTML = `<div class="cm-av">U</div><div class="bub">${escapeHtml(text)}</div>`;
  msgs.appendChild(uEl);

  const tEl = document.createElement('div');
  tEl.id = 'heroTyping';
  tEl.className = 'cm cm-ai';
  tEl.innerHTML = `<div class="cm-av">M</div><div class="bub typing-indicator"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
  msgs.appendChild(tEl);
  msgs.scrollTop = msgs.scrollHeight;

  try {
    heroHistory.push({ role: 'user', content: text });
    const reply = await callAI(heroHistory, MARTIS_SYSTEM);
    heroHistory.push({ role: 'assistant', content: reply });

    document.getElementById('heroTyping')?.remove();
    const aEl = document.createElement('div');
    aEl.className = 'cm cm-ai';
    aEl.innerHTML = `<div class="cm-av">M</div><div class="bub">${formatAIResponse(reply)}</div>`;
    msgs.appendChild(aEl);
    if (!API_STATUS.text.online) { API_STATUS.text.online = true; updateAPIStatus(); }

  } catch (err) {
    document.getElementById('heroTyping')?.remove();
    heroHistory.pop();
    const eEl = document.createElement('div');
    eEl.className = 'cm cm-ai';
    eEl.innerHTML = `<div class="cm-av">M</div><div class="bub" style="color:var(--rose)"><strong>Erro:</strong> ${escapeHtml(err.message)}</div>`;
    msgs.appendChild(eEl);
  }

  msgs.scrollTop = msgs.scrollHeight;
  input.disabled = sendBtn.disabled = false;
  input.focus();
}

/* ══════════════════════════════════════════════════════
   SHOWCASE CHAT
══════════════════════════════════════════════════════ */

const showcaseHistories = {};

const SHOWCASE_SYSTEMS = {
  'sc-chat70b': 'Você é o Martis-70B, especializado em raciocínio profundo e análise crítica. Responda com profundidade em português.',
  'sc-code':    'Você é o Martis-Code, especializado em programação. Forneça código limpo e bem explicado. Use blocos de código quando relevante.',
  'sc-think':   'Você é o Martis-Think, especializado em matemática e lógica. Resolva passo a passo, mostrando cada etapa.',
  'sc-write':   'Você é o Martis-Write, especializado em escrita criativa e copywriting. Escreva com estilo e impacto.',
  'sc-vision':  'Você é o Martis-Vision, especializado em análise visual. Neste demo de texto, responda como se tivesse visto a imagem descrita.',
  'sc-voice':   'Você é o Martis-Voice, especializado em áudio e transcrição. Explique capacidades com exemplos concretos.',
};

async function sendShowcaseMessage(panelId) {
  const panel   = document.getElementById(panelId);
  const input   = panel.querySelector('.showcase-input');
  const msgs    = panel.querySelector('.demo-msgs');
  const sendBtn = panel.querySelector('.showcase-send-btn');
  const text    = input.value.trim();
  if (!text) return;

  input.disabled = sendBtn.disabled = true;
  input.value = '';

  const uEl = document.createElement('div');
  uEl.className = 'dm dm-u';
  uEl.innerHTML = `<div class="dm-av">U</div><div class="dm-bub">${escapeHtml(text)}</div>`;
  msgs.appendChild(uEl);

  const tEl = addTyping(msgs, '✦');

  try {
    if (!showcaseHistories[panelId]) showcaseHistories[panelId] = [];
    showcaseHistories[panelId].push({ role: 'user', content: text });

    const sys   = SHOWCASE_SYSTEMS[panelId] || 'Você é um modelo Martis AI. Responda em português de forma útil e clara.';
    const reply = await callAI(showcaseHistories[panelId], sys);
    showcaseHistories[panelId].push({ role: 'assistant', content: reply });

    tEl.remove();
    const aEl = document.createElement('div');
    aEl.className = 'dm dm-ai';
    aEl.innerHTML = `<div class="dm-av">✦</div><div class="dm-bub">${formatAIResponse(reply)}</div>`;
    msgs.appendChild(aEl);
    if (!API_STATUS.text.online) { API_STATUS.text.online = true; updateAPIStatus(); }

  } catch (err) {
    tEl.remove();
    showcaseHistories[panelId]?.pop();
    const eEl = document.createElement('div');
    eEl.className = 'dm dm-ai';
    eEl.innerHTML = `<div class="dm-av">✦</div><div class="dm-bub" style="color:var(--rose)">Erro: ${escapeHtml(err.message)}</div>`;
    msgs.appendChild(eEl);
  }

  msgs.scrollTop = msgs.scrollHeight;
  input.disabled = sendBtn.disabled = false;
  input.focus();
}

/* ══════════════════════════════════════════════════════
   SHOWCASE SUMMARY
══════════════════════════════════════════════════════ */

async function generateShowcaseSummary() {
  const panel  = document.getElementById('sc-summary');
  const input  = panel.querySelector('.summary-input');
  const result = panel.querySelector('.summary-result');
  const btn    = panel.querySelector('.generate-summary-btn');
  const text   = input.value.trim();
  if (!text) return;

  btn.disabled    = true;
  btn.textContent = 'Resumindo...';
  result.innerHTML = `<div class="summary-loading"><div class="loading-spinner"></div><p>Analisando e resumindo...</p></div>`;

  try {
    const sys = `Você é especialista em sumarização. Crie resumos claros, concisos e informativos.
- Mantenha os pontos principais
- Use linguagem clara e direta
- Estruture em tópicos quando o texto for longo
- Responda no mesmo idioma do texto original`;

    const reply = await callAI(
      [{ role: 'user', content: `Resuma este texto:\n\n${text}` }],
      sys
    );
    result.innerHTML = `<div class="generated-summary"><div class="summary-header">Resumo gerado:</div><div class="summary-content">${formatAIResponse(reply)}</div></div>`;
    if (!API_STATUS.text.online) { API_STATUS.text.online = true; updateAPIStatus(); }

  } catch (err) {
    result.innerHTML = `<div class="summary-error"><p style="color:var(--rose)"><strong>Erro ao resumir</strong></p><p style="font-size:.8rem;color:var(--text2);margin-top:.5rem">${escapeHtml(err.message)}</p></div>`;
  }

  btn.disabled    = false;
  btn.textContent = '📝 Resumir Texto';
}

/* ══════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const ativos = PROVIDERS.filter(p => p.active()).map(p => p.name);
  if (ativos.length === 0) {
    console.warn('%c[Martis AI] Modo demo — nenhuma chave configurada.\nAdicione chaves em scripts/ai-integrations.js', 'color:#c49d4a;font-weight:bold');
  } else {
    console.log(`%c[Martis AI] Providers ativos: ${ativos.join(' → ')}`, 'color:#3ab89a;font-weight:bold');
  }
  setTimeout(checkAllAPIs, 800);
});

window.heroSend                = heroSend;
window.sendShowcaseMessage     = sendShowcaseMessage;
window.generateShowcaseSummary = generateShowcaseSummary;
window.checkAllAPIs            = checkAllAPIs;
