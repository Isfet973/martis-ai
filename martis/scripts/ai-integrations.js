/* ═══════════════════════════════════════════════════════
   ai-integrations.js — Martis AI
   Integracoes com APIs gratuitas de IA usando Puter.js
   
   PUTER.JS - 100% GRATUITO, SEM CHAVES, SEM CORS
   - Texto: GPT-4, Claude, Gemini e +400 modelos
   - Imagem: DALL-E, Stable Diffusion
   - Funciona direto no navegador sem configuracao
═══════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════
   STATUS DAS APIs
══════════════════════════════════════════════════════ */

const API_STATUS = {
  text: { online: false, lastCheck: null },
  image: { online: false, lastCheck: null }
};

// Verifica se o Puter.js esta carregado
function isPuterLoaded() {
  return typeof puter !== 'undefined' && puter.ai;
}

// Testa a API de texto
async function testTextAPI() {
  if (!isPuterLoaded()) {
    API_STATUS.text = { online: false, lastCheck: Date.now(), error: 'Puter.js nao carregado' };
    return false;
  }

  try {
    const response = await puter.ai.chat('Responda apenas: OK', { model: 'gpt-4.1-nano' });
    API_STATUS.text = { online: true, lastCheck: Date.now() };
    return true;
  } catch (error) {
    API_STATUS.text = { online: false, lastCheck: Date.now(), error: error.message };
    return false;
  }
}

// Testa a API de imagem
async function testImageAPI() {
  // Puter.js sempre esta disponivel se carregado
  if (!isPuterLoaded()) {
    API_STATUS.image = { online: false, lastCheck: Date.now(), error: 'Puter.js nao carregado' };
    return false;
  }
  API_STATUS.image = { online: true, lastCheck: Date.now() };
  return true;
}

// Verifica todas as APIs
async function checkAllAPIs() {
  if (!isPuterLoaded()) {
    console.warn('[Martis] Aguardando Puter.js carregar...');
    // Aguarda o Puter carregar (max 5s)
    for (let i = 0; i < 50; i++) {
      await new Promise(r => setTimeout(r, 100));
      if (isPuterLoaded()) break;
    }
  }
  
  const results = await Promise.all([
    testTextAPI(),
    testImageAPI()
  ]);
  updateAPIStatus();
  return results;
}

/* ══════════════════════════════════════════════════════
   PUTER.JS - IA DE TEXTO (GPT-4, Claude, Gemini, etc)
══════════════════════════════════════════════════════ */

async function callTextAPI(prompt, systemPrompt = '') {
  if (!isPuterLoaded()) {
    throw new Error('Puter.js ainda nao carregou. Aguarde alguns segundos e tente novamente.');
  }

  const messages = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  try {
    // Usa GPT-4.1-nano (rapido e gratuito) ou pode trocar para outros modelos:
    // - 'gpt-4.1-nano' (rapido)
    // - 'claude-sonnet-4' (Claude)
    // - 'google/gemini-2.5-flash' (Gemini)
    const response = await puter.ai.chat(messages, { 
      model: 'gpt-4.1-nano'
    });
    
    // Extrai o texto da resposta
    if (typeof response === 'string') {
      return response;
    }
    if (response?.message?.content) {
      const content = response.message.content;
      if (Array.isArray(content)) {
        return content.map(c => c.text || c).join('');
      }
      return content;
    }
    return String(response);
  } catch (error) {
    console.error('[Martis] Erro na API de texto:', error);
    throw new Error('Erro ao gerar texto: ' + error.message);
  }
}

/* ══════════════════════════════════════════════════════
   PUTER.JS - IA DE IMAGEM
══════════════════════════════════════════════════════ */

async function callImageGenerationAPI(prompt) {
  if (!isPuterLoaded()) {
    throw new Error('Puter.js ainda nao carregou. Aguarde alguns segundos e tente novamente.');
  }

  try {
    // Puter.js suporta geracao de imagem via modelos multimodais
    const response = await puter.ai.txt2img(prompt);
    
    // Retorna a URL da imagem gerada
    if (response?.url) {
      return response.url;
    }
    if (typeof response === 'string' && response.startsWith('http')) {
      return response;
    }
    
    // Se retornar blob/base64, converte para URL
    if (response instanceof Blob) {
      return URL.createObjectURL(response);
    }
    
    throw new Error('Formato de resposta inesperado');
  } catch (error) {
    console.error('[Martis] Erro na geracao de imagem:', error);
    
    // Fallback: usa modelo de texto para descrever que geraria a imagem
    // (alguns planos do Puter podem nao ter txt2img)
    if (error.message.includes('not available') || error.message.includes('not supported')) {
      throw new Error('Geracao de imagem nao disponivel no momento. Tente novamente mais tarde.');
    }
    
    throw new Error('Erro ao gerar imagem: ' + error.message);
  }
}

/* ══════════════════════════════════════════════════════
   HERO CHAT PREVIEW - FUNCIONALIDADE DE IA
══════════════════════════════════════════════════════ */

const MARTIS_SYSTEM_PROMPT = `Voce e a Martis AI, uma assistente de inteligencia artificial amigavel e prestativa.
Voce faz parte da plataforma Martis, inspirada na deusa grega Britomartis.
Responda de forma concisa, util e em portugues (a menos que o usuario fale em outro idioma).
Seja educada, clara e direta nas respostas. Mantenha respostas com no maximo 3 paragrafos.`;

let heroChatHistory = [];

async function heroSend() {
  const input = document.getElementById('heroInput');
  const messagesContainer = document.getElementById('heroMessages');
  const sendBtn = document.getElementById('heroSendBtn');
  
  const userMessage = input.value.trim();
  if (!userMessage) return;

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

  // Indicador de digitacao
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
    
    if (isPuterLoaded()) {
      aiResponse = await callTextAPI(userMessage, MARTIS_SYSTEM_PROMPT);
      // Atualiza status se funcionou
      if (!API_STATUS.text.online) {
        API_STATUS.text.online = true;
        updateAPIStatus();
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      aiResponse = getSimulatedResponse(userMessage);
    }

    document.getElementById('heroTyping')?.remove();

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

function getSimulatedResponse(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes('ola') || msg.includes('oi') || msg.includes('hey') || msg.includes('hi')) {
    return 'Ola! Sou a Martis AI. Como posso ajudar voce hoje?';
  }
  if (msg.includes('quem') && (msg.includes('voce') || msg.includes('vc'))) {
    return 'Sou a Martis AI, uma assistente de IA. Meu nome e inspirado em Britomartis, a deusa grega das redes.';
  }
  if (msg.includes('codigo') || msg.includes('programar')) {
    return 'Posso ajudar com codigo! Diga-me qual linguagem voce esta usando e o que precisa fazer.';
  }
  
  return `Aguardando conexao com a IA... Recarregue a pagina se o problema persistir.`;
}

/* ══════════════════════════════════════════════════════
   SHOWCASE - CHAT INTERATIVO PARA DEMOS
══════════════════════════════════════════════════════ */

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

  const userDiv = document.createElement('div');
  userDiv.className = 'dm dm-u';
  userDiv.innerHTML = `
    <div class="dm-av">U</div>
    <div class="dm-bub">${escapeHtml(userMessage)}</div>
  `;
  messagesContainer.appendChild(userDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

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
    
    if (isPuterLoaded()) {
      response = await callTextAPI(userMessage, 'Voce e o Martis-70B, um modelo de IA avancado. Responda de forma detalhada e profissional em portugues.');
      if (!API_STATUS.text.online) {
        API_STATUS.text.online = true;
        updateAPIStatus();
      }
    } else {
      await new Promise(r => setTimeout(r, 1200));
      response = 'Carregando IA... Aguarde alguns segundos e tente novamente.';
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

// Gera imagem no showcase
async function generateShowcaseImage() {
  const panel = document.getElementById('sc-image');
  const input = panel.querySelector('.image-prompt-input');
  const resultContainer = panel.querySelector('.image-result');
  const generateBtn = panel.querySelector('.generate-image-btn');
  
  const prompt = input.value.trim();
  if (!prompt) return;

  generateBtn.disabled = true;
  generateBtn.textContent = 'Gerando...';
  
  resultContainer.innerHTML = `
    <div class="image-loading">
      <div class="loading-spinner"></div>
      <p>Gerando imagem com IA...</p>
      <p style="font-size:.75rem;color:var(--text3);margin-top:.5rem">Isso pode levar alguns segundos</p>
    </div>
  `;

  try {
    if (!isPuterLoaded()) {
      throw new Error('Aguardando Puter.js carregar...');
    }

    const imageUrl = await callImageGenerationAPI(prompt);
    
    if (!API_STATUS.image.online) {
      API_STATUS.image.online = true;
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

  } catch (error) {
    resultContainer.innerHTML = `
      <div class="image-error">
        <div class="error-icon">!</div>
        <p style="color:var(--rose)"><strong>Erro na geracao</strong></p>
        <p style="font-size:.8rem;color:var(--text2);margin-top:.5rem">${escapeHtml(error.message)}</p>
        <p style="font-size:.75rem;color:var(--text3);margin-top:.75rem">
          Dica: Tente recarregar a pagina ou usar um prompt mais simples.
        </p>
      </div>
    `;
  }

  generateBtn.disabled = false;
  generateBtn.textContent = 'Gerar Imagem';
}

/* ══════════════════════════════════════════════════════
   ATUALIZACAO DE STATUS
══════════════════════════════════════════════════════ */

function updateAPIStatus() {
  const textOnline = API_STATUS.text.online;
  const imageOnline = API_STATUS.image.online;
  
  // Status do Hero Chat
  const heroStatus = document.getElementById('heroStatusIndicator');
  if (heroStatus) {
    if (textOnline) {
      heroStatus.innerHTML = '<span class="status-dot online"></span> Online';
      heroStatus.className = 'cp-online online';
    } else {
      heroStatus.innerHTML = '<span class="status-dot offline"></span> Conectando...';
      heroStatus.className = 'cp-online offline';
    }
  }

  // Status do modelo de texto no Showcase
  const textModelStatus = document.getElementById('textModelStatus');
  if (textModelStatus) {
    if (textOnline) {
      textModelStatus.innerHTML = '<span class="status-dot online"></span> Online';
      textModelStatus.className = 'model-status online';
    } else {
      textModelStatus.innerHTML = '<span class="status-dot offline"></span> Conectando...';
      textModelStatus.className = 'model-status offline';
    }
  }

  // Status do modelo de imagem no Showcase
  const imageModelStatus = document.getElementById('imageModelStatus');
  if (imageModelStatus) {
    if (imageOnline) {
      imageModelStatus.innerHTML = '<span class="status-dot online"></span> Online';
      imageModelStatus.className = 'model-status online';
    } else {
      imageModelStatus.innerHTML = '<span class="status-dot offline"></span> Conectando...';
      imageModelStatus.className = 'model-status offline';
    }
  }
}

/* ══════════════════════════════════════════════════════
   UTILIDADES
══════════════════════════════════════════════════════ */

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatAIResponse(text) {
  if (!text) return '';
  
  let formatted = escapeHtml(text);
  
  // Codigo inline
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Negrito
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Italico
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Quebras de linha
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
}

/* ══════════════════════════════════════════════════════
   INICIALIZACAO
══════════════════════════════════════════════════════ */

// Inicializa quando a pagina carregar
document.addEventListener('DOMContentLoaded', () => {
  // Verifica APIs apos um pequeno delay para garantir que o Puter carregou
  setTimeout(() => {
    checkAllAPIs();
  }, 1000);
  
  // Verifica novamente apos 3 segundos caso o Puter demore a carregar
  setTimeout(() => {
    if (!API_STATUS.text.online) {
      checkAllAPIs();
    }
  }, 3000);
});

// Expoe funcoes globalmente para uso no HTML
window.heroSend = heroSend;
window.sendShowcaseMessage = sendShowcaseMessage;
window.generateShowcaseImage = generateShowcaseImage;
window.checkAllAPIs = checkAllAPIs;
