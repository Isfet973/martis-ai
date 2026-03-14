/* ═══════════════════════════════════════════════════════
   ai-integrations.js — Martis AI
   Integracoes com APIs gratuitas de IA
   - Google Gemini (Texto)
   - Hugging Face Stable Diffusion (Imagem)
═══════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════
   CONFIGURACAO DAS APIs - COLOQUE SUAS CHAVES AQUI
══════════════════════════════════════════════════════ */

const AI_CONFIG = {
  // ═══ IA DE TEXTO: Google Gemini ═══
  // Obtenha sua chave gratuita em: https://aistudio.google.com
  GEMINI_API_KEY: 'AIzaSyCxYHNP0Kypu8zlWSBV335Wb2XJS7VsowY',
  
  // ═══ IA DE IMAGEM: Hugging Face ═══
  // Obtenha seu token gratuito em: https://huggingface.co/settings/tokens
  HUGGINGFACE_TOKEN: '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'
};

/* ══════════════════════════════════════════════════════
   VERIFICACAO DE STATUS DAS APIs
══════════════════════════════════════════════════════ */

// Status das APIs (verificado em tempo real)
const API_STATUS = {
  gemini: { configured: false, online: false, lastCheck: null },
  huggingface: { configured: false, online: false, lastCheck: null }
};

// Verifica se a chave Gemini parece valida (formato basico)
function isGeminiConfigured() {
  const key = AI_CONFIG.GEMINI_API_KEY;
  return key && 
         typeof key === 'string' && 
         key.length > 10 &&
         key.startsWith('AIza');
}

// Verifica se o token HuggingFace parece valido (formato basico)
function isHuggingFaceConfigured() {
  const token = AI_CONFIG.HUGGINGFACE_TOKEN;
  return token && 
         typeof token === 'string' && 
         token.length > 10 &&
         token.startsWith('hf_');
}

// Testa a API do Gemini em tempo real
async function testGeminiAPI() {
  if (!isGeminiConfigured()) {
    API_STATUS.gemini = { configured: false, online: false, lastCheck: Date.now() };
    updateAPIStatus();
    return false;
  }

  // Se a chave esta configurada, assume online ate testar
  API_STATUS.gemini = { configured: true, online: true, lastCheck: Date.now() };
  updateAPIStatus();

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${AI_CONFIG.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'OK' }] }],
          generationConfig: { maxOutputTokens: 5 }
        })
      }
    );

    const isOnline = response.ok;
    API_STATUS.gemini = { configured: true, online: isOnline, lastCheck: Date.now() };
    updateAPIStatus();
    return isOnline;
  } catch (error) {
    API_STATUS.gemini = { configured: true, online: false, lastCheck: Date.now(), error: error.message };
    updateAPIStatus();
    return false;
  }
}

// Testa a API do HuggingFace em tempo real
async function testHuggingFaceAPI() {
  if (!isHuggingFaceConfigured()) {
    API_STATUS.huggingface = { configured: false, online: false, lastCheck: Date.now() };
    updateAPIStatus();
    return false;
  }

  // Se o token esta configurado, assume online ate testar
  API_STATUS.huggingface = { configured: true, online: true, lastCheck: Date.now() };
  updateAPIStatus();

  try {
    // Testa verificando o status do modelo (GET request mais leve)
    const response = await fetch(
      'https://api-inference.huggingface.co/status/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.HUGGINGFACE_TOKEN}`
        }
      }
    );

    // Status 200 ou 503 (modelo carregando) significa que o token esta valido
    const isOnline = response.ok || response.status === 503;
    API_STATUS.huggingface = { configured: true, online: isOnline, lastCheck: Date.now() };
    updateAPIStatus();
    return isOnline;
  } catch (error) {
    API_STATUS.huggingface = { configured: true, online: false, lastCheck: Date.now(), error: error.message };
    updateAPIStatus();
    return false;
  }
}

// Verifica todas as APIs
async function checkAllAPIs() {
  // Primeiro, marca como configurado se as chaves existem (mostra online imediatamente)
  if (isGeminiConfigured()) {
    API_STATUS.gemini = { configured: true, online: true, lastCheck: Date.now() };
  }
  if (isHuggingFaceConfigured()) {
    API_STATUS.huggingface = { configured: true, online: true, lastCheck: Date.now() };
  }
  updateAPIStatus();
  
  // Depois verifica de fato se as APIs respondem
  const results = await Promise.all([
    testGeminiAPI(),
    testHuggingFaceAPI()
  ]);
  return results;
}

/* ══════════════════════════════════════════════════════
   GOOGLE GEMINI - IA DE TEXTO
══════════════════════════════════════════════════════ */

async function callGeminiAPI(prompt, systemPrompt = '') {
  if (!isGeminiConfigured()) {
    throw new Error('API Gemini nao configurada. Adicione sua chave em AI_CONFIG.GEMINI_API_KEY');
  }

  const fullPrompt = systemPrompt 
    ? `${systemPrompt}\n\nUsuario: ${prompt}` 
    : prompt;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${AI_CONFIG.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Erro na API Gemini');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta';
}

/* ══════════════════════════════════════════════════════
   HUGGING FACE - IA DE IMAGEM (Stable Diffusion)
══════════════════════════════════════════════════════ */

async function callImageGenerationAPI(prompt) {
  if (!isHuggingFaceConfigured()) {
    throw new Error('API Hugging Face nao configurada. Adicione seu token em AI_CONFIG.HUGGINGFACE_TOKEN');
  }

  const response = await fetch(
    'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        inputs: prompt,
        parameters: {
          num_inference_steps: 30,
          guidance_scale: 7.5
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    if (response.status === 503) {
      throw new Error('Modelo carregando... Aguarde ~20s e tente novamente.');
    }
    throw new Error(error || 'Erro na geracao de imagem');
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/* ══════════════════════════════════════════════════════
   HERO CHAT PREVIEW - FUNCIONALIDADE DE IA
════════════════���═════════════════════════════════════ */

// System prompt para o chat do hero
const MARTIS_SYSTEM_PROMPT = `Voce e a Martis AI, uma assistente de inteligencia artificial amigavel e prestativa.
Voce faz parte da plataforma Martis, inspirada na deusa grega Britomartis.
Responda de forma concisa, util e em portugues (a menos que o usuario fale em outro idioma).
Seja educada, clara e direta nas respostas.`;

// Historico de mensagens do hero chat
let heroChatHistory = [];

async function heroSend() {
  const input = document.getElementById('heroInput');
  const messagesContainer = document.getElementById('heroMessages');
  const sendBtn = document.getElementById('heroSendBtn');
  
  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Desabilita input enquanto processa
  input.disabled = true;
  sendBtn.disabled = true;
  input.value = '';

  // Adiciona mensagem do usuario
  const userBubble = document.createElement('div');
  userBubble.className = 'cm cm-u';
  userBubble.innerHTML = `
    <div class="cm-av">U</div>
    <div class="bub">${escapeHtml(userMessage)}</div>
  `;
  messagesContainer.appendChild(userBubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Adiciona indicador de digitacao
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'cm cm-ai';
  typingIndicator.id = 'heroTyping';
  typingIndicator.innerHTML = `
    <div class="cm-av">M</div>
    <div class="bub typing-indicator">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    </div>
  `;
  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  try {
    let aiResponse;
    
    // Usa API real se estiver online, caso contrario usa resposta simulada
    if (API_STATUS.gemini.online) {
      // Usa a API real do Gemini
      aiResponse = await callGeminiAPI(userMessage, MARTIS_SYSTEM_PROMPT);
    } else if (isGeminiConfigured()) {
      // Chave configurada mas API offline - tenta mesmo assim
      try {
        aiResponse = await callGeminiAPI(userMessage, MARTIS_SYSTEM_PROMPT);
        // Se funcionou, atualiza o status
        API_STATUS.gemini.online = true;
        updateAPIStatus();
      } catch (apiError) {
        // Se falhou, usa resposta simulada
        await new Promise(resolve => setTimeout(resolve, 1000));
        aiResponse = getSimulatedResponse(userMessage);
      }
    } else {
      // Resposta simulada quando API nao esta configurada
      await new Promise(resolve => setTimeout(resolve, 1000));
      aiResponse = getSimulatedResponse(userMessage);
    }

    // Remove indicador de digitacao
    document.getElementById('heroTyping')?.remove();

    // Adiciona resposta da IA
    const aiBubble = document.createElement('div');
    aiBubble.className = 'cm cm-ai';
    aiBubble.innerHTML = `
      <div class="cm-av">M</div>
      <div class="bub">${formatAIResponse(aiResponse)}</div>
    `;
    messagesContainer.appendChild(aiBubble);

  } catch (error) {
    document.getElementById('heroTyping')?.remove();
    
    const errorBubble = document.createElement('div');
    errorBubble.className = 'cm cm-ai';
    errorBubble.innerHTML = `
      <div class="cm-av">M</div>
      <div class="bub" style="color:var(--rose)">
        <strong>Erro:</strong> ${escapeHtml(error.message)}
      </div>
    `;
    messagesContainer.appendChild(errorBubble);
  }

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  input.disabled = false;
  sendBtn.disabled = false;
  input.focus();
}

// Respostas simuladas quando a API nao esta configurada
function getSimulatedResponse(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes('ola') || msg.includes('oi') || msg.includes('hey') || msg.includes('hi')) {
    return 'Ola! Sou a Martis AI. Como posso ajudar voce hoje? Estou aqui para responder suas perguntas!';
  }
  if (msg.includes('quem') && (msg.includes('voce') || msg.includes('vc'))) {
    return 'Sou a Martis AI, uma assistente de inteligencia artificial criada para ajudar usuarios com diversas tarefas. Meu nome e inspirado em Britomartis, a deusa grega das redes — assim como ela tecia redes, eu teco conexoes entre humanos e IA!';
  }
  if (msg.includes('codigo') || msg.includes('programar') || msg.includes('python') || msg.includes('javascript')) {
    return 'Posso ajudar com codigo! Diga-me qual linguagem voce esta usando e o que precisa fazer. Posso explicar conceitos, revisar codigo ou ajudar a debugar problemas.';
  }
  if (msg.includes('imagem') || msg.includes('foto') || msg.includes('desenh')) {
    return 'Para geracao de imagens, recomendo usar o modelo Martis-Vision na secao "Modelos em Acao" abaixo. La voce pode gerar imagens com IA usando Stable Diffusion!';
  }
  
  return `Entendi sua pergunta sobre "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}". \n\nEsta e uma demonstracao do chat. Para respostas reais com IA, configure sua chave da API Gemini no arquivo scripts/ai-integrations.js.`;
}

/* ══════════════════════════════════════════════════════
   SHOWCASE - CHAT INTERATIVO PARA DEMOS
══════════════════════════════════════════════════════ */

// Envia mensagem no showcase de texto (Martis-70B com Gemini)
async function sendShowcaseMessage(panelId) {
  const panel = document.getElementById(panelId);
  const input = panel.querySelector('.showcase-input');
  const messagesContainer = panel.querySelector('.demo-msgs');
  const sendBtn = panel.querySelector('.showcase-send-btn');
  
  const userMessage = input.value.trim();
  if (!userMessage) return;

  input.disabled = true;
  sendBtn.disabled = true;
  input.value = '';

  // Adiciona mensagem do usuario
  const userDiv = document.createElement('div');
  userDiv.className = 'dm dm-u';
  userDiv.innerHTML = `
    <div class="dm-av">U</div>
    <div class="dm-bub">${escapeHtml(userMessage)}</div>
  `;
  messagesContainer.appendChild(userDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'dm dm-ai typing-temp';
  typingDiv.innerHTML = `
    <div class="dm-av">70</div>
    <div class="dm-bub typing-indicator">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    </div>
  `;
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  try {
    let response;
    // Usa API real se estiver online ou configurada
    if (API_STATUS.gemini.online || isGeminiConfigured()) {
      try {
        response = await callGeminiAPI(userMessage, 'Voce e o Martis-70B, um modelo de IA avancado. Responda de forma detalhada e profissional.');
        // Atualiza status se funcionou
        if (!API_STATUS.gemini.online) {
          API_STATUS.gemini.online = true;
          updateAPIStatus();
        }
      } catch (apiError) {
        await new Promise(r => setTimeout(r, 1200));
        response = `Erro ao conectar com a API: ${apiError.message}\n\nPara respostas reais, verifique sua chave Gemini API em:\nscripts/ai-integrations.js`;
      }
    } else {
      await new Promise(r => setTimeout(r, 1200));
      response = `Esta e uma demonstracao do Martis-70B.\n\nPara respostas reais, configure sua chave Gemini API em:\nscripts/ai-integrations.js\n\nObtenha gratuitamente em: aistudio.google.com`;
    }

    panel.querySelector('.typing-temp')?.remove();

    const aiDiv = document.createElement('div');
    aiDiv.className = 'dm dm-ai';
    aiDiv.innerHTML = `
      <div class="dm-av">70</div>
      <div class="dm-bub">${formatAIResponse(response)}</div>
    `;
    messagesContainer.appendChild(aiDiv);

  } catch (error) {
    panel.querySelector('.typing-temp')?.remove();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'dm dm-ai';
    errorDiv.innerHTML = `
      <div class="dm-av">70</div>
      <div class="dm-bub" style="color:var(--rose)">Erro: ${escapeHtml(error.message)}</div>
    `;
    messagesContainer.appendChild(errorDiv);
  }

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  input.disabled = false;
  sendBtn.disabled = false;
  input.focus();
}

// Gera imagem no showcase de imagem
async function generateShowcaseImage() {
  const panel = document.getElementById('sc-image');
  const input = panel.querySelector('.image-prompt-input');
  const resultContainer = panel.querySelector('.image-result');
  const generateBtn = panel.querySelector('.generate-image-btn');
  
  const prompt = input.value.trim();
  if (!prompt) return;

  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span> Gerando...';
  
  resultContainer.innerHTML = `
    <div class="image-loading">
      <div class="loading-spinner"></div>
      <p>Gerando imagem com Stable Diffusion...</p>
      <p style="font-size:.75rem;color:var(--text3);margin-top:.5rem">Isso pode levar 10-30 segundos</p>
    </div>
  `;

  try {
    let imageUrl;
    
    // Usa API real se estiver online ou configurada
    if (API_STATUS.huggingface.online || isHuggingFaceConfigured()) {
      try {
        imageUrl = await callImageGenerationAPI(prompt);
        // Atualiza status se funcionou
        if (!API_STATUS.huggingface.online) {
          API_STATUS.huggingface.online = true;
          updateAPIStatus();
        }
        resultContainer.innerHTML = `
          <div class="generated-image-container">
            <img src="${imageUrl}" alt="Imagem gerada: ${escapeHtml(prompt)}" class="generated-image"/>
            <div class="image-caption">
              <strong>Prompt:</strong> ${escapeHtml(prompt)}
            </div>
            <a href="${imageUrl}" download="martis-generated.png" class="btn btn-sm btn-ghost" style="margin-top:.75rem">
              Baixar imagem
            </a>
          </div>
        `;
      } catch (apiError) {
        resultContainer.innerHTML = `
          <div class="image-error">
            <div class="error-icon">!</div>
            <p style="color:var(--rose)"><strong>Erro na API</strong></p>
            <p style="font-size:.8rem;color:var(--text2);margin-top:.5rem">${escapeHtml(apiError.message)}</p>
          </div>
        `;
      }
    } else {
      await new Promise(r => setTimeout(r, 2000));
      resultContainer.innerHTML = `
        <div class="image-placeholder">
          <div class="placeholder-icon">IMG</div>
          <p><strong>Demonstracao</strong></p>
          <p style="font-size:.8rem;color:var(--text2);margin-top:.5rem">
            Para gerar imagens reais, configure seu token Hugging Face em:<br>
            <code style="background:var(--surface2);padding:.2rem .5rem;border-radius:4px;font-size:.75rem">scripts/ai-integrations.js</code>
          </p>
          <p style="font-size:.75rem;color:var(--text3);margin-top:.75rem">
            Obtenha gratuitamente em: huggingface.co/settings/tokens
          </p>
        </div>
      `;
    }

  } catch (error) {
    resultContainer.innerHTML = `
      <div class="image-error">
        <div class="error-icon">⚠️</div>
        <p style="color:var(--rose)"><strong>Erro ao gerar imagem</strong></p>
        <p style="font-size:.8rem;color:var(--text2);margin-top:.5rem">${escapeHtml(error.message)}</p>
      </div>
    `;
  }

  generateBtn.disabled = false;
  generateBtn.innerHTML = '🎨 Gerar Imagem';
}

/* ══════════════════════════════════════════════════════
   ATUALIZACAO DE STATUS (ONLINE/OFFLINE)
══════════════════════════════════════════════════════ */

function updateAPIStatus() {
  const geminiOnline = API_STATUS.gemini.online;
  const huggingfaceOnline = API_STATUS.huggingface.online;
  
  // Status do Hero Chat
  const heroStatus = document.getElementById('heroStatusIndicator');
  if (heroStatus) {
    if (geminiOnline) {
      heroStatus.innerHTML = '<span class="status-dot online"></span> Online';
      heroStatus.className = 'cp-online online';
    } else {
      heroStatus.innerHTML = '<span class="status-dot offline"></span> Offline';
      heroStatus.className = 'cp-online offline';
    }
  }

  // Status do modelo de texto no Showcase
  const textModelStatus = document.getElementById('textModelStatus');
  if (textModelStatus) {
    if (geminiOnline) {
      textModelStatus.innerHTML = '<span class="status-dot online"></span> Online';
      textModelStatus.className = 'model-status online';
    } else {
      textModelStatus.innerHTML = '<span class="status-dot offline"></span> Offline';
      textModelStatus.className = 'model-status offline';
    }
  }

  // Status do modelo de imagem no Showcase
  const imageModelStatus = document.getElementById('imageModelStatus');
  if (imageModelStatus) {
    if (huggingfaceOnline) {
      imageModelStatus.innerHTML = '<span class="status-dot online"></span> Online';
      imageModelStatus.className = 'model-status online';
    } else {
      imageModelStatus.innerHTML = '<span class="status-dot offline"></span> Offline';
      imageModelStatus.className = 'model-status offline';
    }
  }

  // Status dos outros modelos de texto (Code, Think, Write) - usam Gemini
  const codeModelStatus = document.getElementById('codeModelStatus');
  const thinkModelStatus = document.getElementById('thinkModelStatus');
  const writeModelStatus = document.getElementById('writeModelStatus');
  
  [codeModelStatus, thinkModelStatus, writeModelStatus].forEach(el => {
    if (el) {
      if (geminiOnline) {
        el.innerHTML = '<span class="status-dot online"></span> Online';
        el.className = 'model-status online';
      } else {
        el.innerHTML = '<span class="status-dot offline"></span> Offline';
        el.className = 'model-status offline';
      }
    }
  });

  // Status do modelo Vision - usa HuggingFace
  const visionModelStatus = document.getElementById('visionModelStatus');
  if (visionModelStatus) {
    if (huggingfaceOnline) {
      visionModelStatus.innerHTML = '<span class="status-dot online"></span> Online';
      visionModelStatus.className = 'model-status online';
    } else {
      visionModelStatus.innerHTML = '<span class="status-dot offline"></span> Offline';
      visionModelStatus.className = 'model-status offline';
    }
  }

  // Status do modelo Voice - ainda sem API (sempre offline)
  const voiceModelStatus = document.getElementById('voiceModelStatus');
  if (voiceModelStatus) {
    voiceModelStatus.innerHTML = '<span class="status-dot offline"></span> Offline';
    voiceModelStatus.className = 'model-status offline';
  }

  // Atualiza TODAS as tabs do showcase com indicadores baseados na API disponivel
  document.querySelectorAll('.sc-tab').forEach(tab => {
    const model = tab.dataset.model;
    const statusSpan = tab.querySelector('.tab-status');
    
    if (!statusSpan) return;
    
    // Modelos que usam Gemini (texto)
    const geminiModels = ['chat70b', 'code', 'think', 'write'];
    // Modelos que usam HuggingFace (imagem/visao)
    const huggingfaceModels = ['image', 'vision'];
    // Modelos que usam outras APIs (voz - ainda nao implementado)
    const otherModels = ['voice'];
    
    if (geminiModels.includes(model)) {
      statusSpan.className = geminiOnline ? 'tab-status online' : 'tab-status offline';
      statusSpan.textContent = geminiOnline ? 'Online' : 'Offline';
    } else if (huggingfaceModels.includes(model)) {
      statusSpan.className = huggingfaceOnline ? 'tab-status online' : 'tab-status offline';
      statusSpan.textContent = huggingfaceOnline ? 'Online' : 'Offline';
    } else if (otherModels.includes(model)) {
      // Voice ainda nao tem API configurada
      statusSpan.className = 'tab-status offline';
      statusSpan.textContent = 'Offline';
    }
  });
}

// Funcao removida - status agora e atualizado imediatamente baseado na configuracao

/* ══════════════════════════════════════════════════════
   UTILIDADES
══════════════════════════════════════════════════════ */

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatAIResponse(text) {
  // Converte markdown basico para HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
    .replace(/\n/g, '<br>');
}

// Funcao para selecionar modelo no hero (atualizada)
function heroSelectModel(el, modelId, modelLabel) {
  document.querySelectorAll('#heroTabs .cp-tab').forEach(t => t.classList.remove('sel'));
  el.classList.add('sel');
  document.getElementById('heroModelLabel').textContent = modelLabel;
}

/* ══════════════════════════════════════════════════════
   INICIALIZACAO
══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  // Primeiro, mostra status baseado na configuracao (se chave existe = online)
  if (isGeminiConfigured()) {
    API_STATUS.gemini = { configured: true, online: true, lastCheck: Date.now() };
  }
  if (isHuggingFaceConfigured()) {
    API_STATUS.huggingface = { configured: true, online: true, lastCheck: Date.now() };
  }
  updateAPIStatus();
  
  // Verifica as APIs em background para confirmar
  console.log('[Martis] Verificando status das APIs...');
  checkAllAPIs().then(() => {
    console.log('[Martis] Status Gemini:', API_STATUS.gemini);
    console.log('[Martis] Status HuggingFace:', API_STATUS.huggingface);
  });
  
  // Re-verifica a cada 2 minutos para manter status atualizado
  setInterval(() => {
    checkAllAPIs();
  }, 120000);
});
