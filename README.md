# Martis AI — Plataforma de IA

> *Onde deuses teciam redes, nos tecemos inteligencia.*

Uma plataforma frontend completa para **Martis AI**, um hub de modelos de IA que permite aos usuarios conversar com modelos de IA diretamente no navegador ou baixa-los para uso local com total privacidade.

---

## Estrutura do Projeto

```
martis/
├── index.html              # Pagina principal
├── README.md               # Este arquivo
│
├── styles/
│   ├── tokens.css          # Design tokens (cores, fontes, componentes)
│   └── main.css            # Estilos de layout da pagina principal
│   └── model.css           # Estilos das paginas de modelos
│
├── scripts/
│   ├── shared.js           # JavaScript: tema, idioma, catalogo, tabs
│   └── ai-integrations.js  # Integracoes com APIs de IA (Puter.js)
│
├── pages/
│   ├── martis-model-70b.html     # Pagina do Martis-70B Instruct
│   ├── martis-model-code.html    # Pagina do Martis-Code 34B
│   ├── martis-model-think.html   # Pagina do Martis-Think 13B
│   ├── martis-model-write.html   # Pagina do Martis-Write 7B
│   ├── martis-model-vision.html  # Pagina do Martis-Vision 13B
│   ├── martis-model-voice.html   # Pagina do Martis-Voice 3B
│   ├── docs.html                 # Documentacao
│   └── login.html                # Pagina de login
│
└── assets/                 # (para futuros icones, imagens, fontes)
```

---

## Funcionalidades Principais

### 1. Chat com IA em Tempo Real
- Conversacao interativa usando **Puter.js** (API 100% gratuita)
- Suporte a multiplos modelos: GPT-4, Claude, Gemini e +400 modelos
- Sem necessidade de chaves de API ou configuracao
- Status online/offline em tempo real

### 2. Showcase de Modelos
- **Martis-70B**: Raciocinio profundo e analise complexa
- **Martis-Summary**: Resumo inteligente de textos
- **Martis-Code**: Programacao avancada (40+ linguagens)
- **Martis-Think**: Matematica e logica passo a passo
- **Martis-Write**: Escrita criativa e copywriting
- **Martis-Vision**: Analise visual e OCR
- **Martis-Voice**: Transcricao e sintese de voz

### 3. Catalogo de Modelos
- 14 modelos de IA para diferentes casos de uso
- Comparacoes com concorrentes reais (GPT-4o, Claude, Gemini, etc.)
- Filtros por categoria (Chat, Code, Vision, etc.)
- Download local para uso offline

### 4. Sistema Bilingue
- Suporte completo a Portugues e Ingles
- Preferencia salva em localStorage
- Troca instantanea de idioma

### 5. Tema Claro/Escuro
- Modo escuro (padrao): fundo navy profundo
- Modo claro: tons de pergaminho quente
- Preferencia salva em localStorage

---

## Design System

### Tipografia

| Fonte | Uso |
|-------|-----|
| **Orbitron** | Logo (futurista, tech) |
| **Rajdhani** | Slogan e subtitulos (moderno, tech) |
| **Fraunces** | Titulos e numeros (serifada elegante) |
| **DM Sans** | Corpo de texto e UI |

### Paleta de Cores

| Token | Escuro | Claro | Uso |
|-------|--------|-------|-----|
| `--bg` | `#0c0f1a` | `#f9f7f3` | Fundo da pagina |
| `--surface` | `#161b2e` | `#fefdfb` | Fundo de cards |
| `--accent` | `#4f82c4` | `#2b6ab4` | Azul primario |
| `--purple` | `#7c5cbf` | `#6040a8` | Roxo secundario |
| `--green` | `#3ab89a` | `#1b9472` | Sucesso/novo |
| `--amber` | `#c49d4a` | `#9c7624` | Alertas |
| `--rose` | `#b05f88` | `#8f3a62` | Erros |
| `--sky` | `#3d8ec4` | `#2278b0` | Codigo |

### Logo

A logo representa uma **rede neural futurista**, combinando o conceito de:
- Rede de pesca (referencia a Britomartis, deusa grega das redes)
- Rede neural (conexoes de IA)
- Forma hexagonal (tecnologia, futurismo)

Inclui animacoes sutis nos nos centrais para indicar "atividade neural".

---

## Integracoes de IA

### Puter.js (API Principal)

A plataforma usa **Puter.js** como API de IA:

- **100% gratuito** - Sem limites de uso
- **Sem chaves de API** - Nada para configurar
- **Sem problemas de CORS** - Funciona direto no navegador
- **+400 modelos** - GPT-4, Claude, Gemini, etc.

```html
<!-- Incluir no HTML -->
<script src="https://js.puter.com/v2/"></script>
```

```javascript
// Exemplo de uso
const response = await puter.ai.chat('Sua pergunta aqui', {
  model: 'gpt-4.1-nano'
});
```

---

## Como Executar

### Opcao 1: Abrir Diretamente
Simplesmente abra o `index.html` no navegador. A primeira vez que usar o chat, o Puter.js pode pedir login com Google (gratuito).

### Opcao 2: Servidor Local (Recomendado)
```bash
# Python
cd martis
python -m http.server 8000
# Acesse: http://localhost:8000

# Node.js
npx serve martis
# Acesse: http://localhost:3000

# VS Code
# Instale a extensao "Live Server" e clique em "Go Live"
```

---

## Historico de Versoes

| Versao | Mudancas |
|--------|----------|
| v1 | Site inicial "Tot AI", tema escuro, 8 modelos |
| v2 | Renomeado para Martis, logo SVG de rede de pesca |
| v3 | Logo melhorada, toggle de tema mais visivel |
| v4 | Showcase de modelos com tabs, catalogo redesenhado |
| v5 | Sistema bilingue PT/EN, paginas individuais de modelos |
| v6 | Estrutura de pastas, localStorage para preferencias |
| v7 | Integracao com Puter.js (API gratuita), remocao de chaves |
| v8 (atual) | Logo futurista (rede neural), fontes Orbitron/Rajdhani, modelo de resumo substituindo imagem, status online em tempo real |

---

## Slogan

**Portugues:** *"Onde deuses teciam redes, nos tecemos inteligencia."*  
**Ingles:** *"Where gods wove nets, we weave intelligence."*

**Referencia mitologica:** Britomartis (Βριτόμαρτις) era uma deusa cretense conhecida por inventar as redes de pesca. O nome "Martis" vem da segunda metade de seu nome.

---

## Licenca

Projeto experimental para fins educacionais.
