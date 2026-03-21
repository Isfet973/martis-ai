/* ═══════════════════════════════════════════════════════
   shared.js — Martis AI
   Theme toggle · Language switcher (with localStorage)
   · Catalog show-more · Showcase tabs
═══════════════════════════════════════════════════════ */

/* ── CONSTANTS ── */
const STORAGE_LANG  = 'martis_lang';
const STORAGE_THEME = 'martis_theme';

/* ── LANGUAGE ── */
let currentLang = 'en';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem(STORAGE_LANG, lang);
  document.documentElement.setAttribute('data-lang', lang);

  const btnPT = document.getElementById('btnPT');
  const btnEN = document.getElementById('btnEN');
  if (btnPT) btnPT.classList.toggle('active', lang === 'pt');
  if (btnEN) btnEN.classList.toggle('active', lang === 'en');

  document.querySelectorAll('[data-pt]').forEach(el => {
    const val = el.getAttribute('data-' + lang);
    if (val) el.textContent = val;
  });

  // keep show-more button label in sync
  const showMoreLabel = document.getElementById('showMoreLabel');
  if (showMoreLabel) {
    const extras = document.querySelectorAll('.lcard-extra');
    const anyHidden = Array.from(extras).some(el => el.style.display === 'none');
    showMoreLabel.textContent = anyHidden
      ? (lang === 'pt' ? 'Ver mais modelos' : 'Show more models')
      : (lang === 'pt' ? 'Ver menos' : 'Show less');
  }

  syncThemeLabel();
}

/* ── THEME ── */
function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem(STORAGE_THEME, next);
  const orb = document.getElementById('toggleOrb');
  if (orb) orb.textContent = next === 'light' ? '☀' : '☽';
  syncThemeLabel();
}

function syncThemeLabel() {
  const lbl     = document.getElementById('toggleLabel');
  if (!lbl) return;
  const isDark  = document.documentElement.getAttribute('data-theme') === 'dark';
  const lang    = currentLang;
  if (isDark) lbl.textContent = lang === 'pt' ? 'Modo Escuro' : 'Dark Mode';
  else        lbl.textContent = lang === 'pt' ? 'Modo Claro'  : 'Light Mode';
}

/* ── CATALOG SHOW MORE ── */
function showMoreModels() {
  const extras = document.querySelectorAll('.lcard-extra');
  const icon   = document.getElementById('showMoreIcon');
  const label  = document.getElementById('showMoreLabel');
  const hidden = Array.from(extras).filter(el => el.style.display === 'none');

  if (hidden.length > 0) {
    hidden.forEach(el => { el.style.display = ''; });
    if (icon)  icon.textContent  = '▴';
    if (label) label.textContent = currentLang === 'pt' ? 'Ver menos' : 'Show less';
  } else {
    extras.forEach(el => { el.style.display = 'none'; });
    if (icon)  icon.textContent  = '▾';
    if (label) label.textContent = currentLang === 'pt' ? 'Ver mais modelos' : 'Show more models';
  }
}

/* ── SHOWCASE TABS (model demo section) ── */
function showModel(id) {
  document.querySelectorAll('.sc-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sc-tab').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById('sc-' + id);
  const tab   = document.querySelector('.sc-tab[data-model="' + id + '"]');
  if (panel) panel.classList.add('active');
  if (tab)   tab.classList.add('active');
}

/* ── INIT on DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', () => {

  /* restore saved theme */
  const savedTheme = localStorage.getItem(STORAGE_THEME) || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const orb = document.getElementById('toggleOrb');
  if (orb) orb.textContent = savedTheme === 'light' ? '☀' : '☽';

  /* restore saved language (default: 'en') */
  const savedLang = localStorage.getItem(STORAGE_LANG) || 'en';
  setLang(savedLang);

});
