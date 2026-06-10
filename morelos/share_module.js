/* ============================================================
 * share_module.js — 45 Digital Noticias · Morelos Seguridad
 * FAB de compartir que detecta sección visible y construye URL
 * con anchor para que cualquier red social lleve al usuario al
 * punto exacto del dashboard.
 * ============================================================ */
(function () {
  const DASHBOARD_URL = "https://45digitalnoticias.github.io/Inseguridad-Morelos";
  const BRAND = "45 Digital Noticias · Morelos · Seguridad";

  // ---------- Detectar sección visible (scroll) ----------
  function currentSectionId() {
    const sections = document.querySelectorAll("section[id], div.map-hub[id]");
    let best = { id: "", top: -Infinity };
    const viewMid = window.innerHeight / 2;
    sections.forEach(s => {
      const r = s.getBoundingClientRect();
      if (r.top < viewMid && r.bottom > 0 && r.top > best.top) {
        best = { id: s.id, top: r.top };
      }
    });
    return best.id || "";
  }

  function buildShareURL() {
    const id = currentSectionId();
    return id ? `${DASHBOARD_URL}/#${id}` : DASHBOARD_URL;
  }

  function buildShareText() {
    const sectionId = currentSectionId();
    const editorial = {
      sHero:  "Radiografía de seguridad municipal en los 36 municipios de Morelos — investigación de 45 Digital Noticias.",
      sNAC1:  "Morelos en el ranking nacional decenal — la trayectoria desacoplada del país.",
      sNAC6:  "T1 2026 — Morelos es #1 nacional en feminicidio, extorsión y robo de vehículo por tasa per cápita.",
      sNAC7:  "832 desapariciones en Morelos bajo confidencialidad total — el 40.7% del padrón.",
      sNAC8:  "El −62% de Harfuch en Morelos: mientras el homicidio baja, feminicidio +79%, extorsión +116% y 835 desapariciones bloqueadas.",
      sAC:    "El Ángulo Conveniente — el método del titular oficial Harfuch −62.8%, desmontado con SESNSP + INEGI + RNPDNO y marco teórico citado.",
      sCOL:   "Lo que Harfuch celebra y lo que oculta — columna editorial sobre el −62.8% anunciado, la Ley de Campbell y los cinco datos que no se mencionaron.",
      sME:    "Banderas rojas T1 2026 — la radiografía de Morelos por municipio.",
      sQ1:    "Q1 2026 — actualización SESNSP de incidencia delictiva en Morelos.",
    };
    return editorial[sectionId] || "Morelos · Seguridad municipal — investigación 45 Digital Noticias";
  }

  // ---------- Acciones ----------
  function shareWhatsApp() {
    const url = buildShareURL();
    const text = `${buildShareText()}\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }
  function shareTwitter() {
    const url = buildShareURL();
    const text = buildShareText();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  }
  function shareFacebook() {
    const url = buildShareURL();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
  }
  function shareTelegram() {
    const url = buildShareURL();
    const text = buildShareText();
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
  }
  function copyLink() {
    const url = buildShareURL();
    navigator.clipboard?.writeText(url).then(
      () => showToast("Enlace copiado"),
      () => prompt("Copia este enlace:", url)
    );
  }
  function shareInstagram() {
    // Instagram no tiene share intent web — copiamos el enlace y guiamos al usuario.
    const url = buildShareURL();
    navigator.clipboard?.writeText(url).then(
      () => showToast("Enlace copiado · pégalo en tu Story, DM o bio de Instagram"),
      () => prompt("Copia este enlace y pégalo en Instagram:", url)
    );
  }
  function nativeShare() {
    if (navigator.share) {
      navigator.share({
        title: BRAND,
        text: buildShareText(),
        url: buildShareURL(),
      }).catch(() => {});
    } else {
      copyLink();
    }
  }

  // ---------- Toast ----------
  function showToast(msg) {
    const t = document.createElement("div");
    t.className = "rb-share-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 320);
    }, 1800);
  }

  // ---------- CSS ----------
  const css = `
  .rb-share-fab {
    position: fixed; z-index: 9000;
    bottom: 22px; right: 22px;
    display: flex; flex-direction: column-reverse; align-items: flex-end;
    gap: 10px; font-family: 'Inter', system-ui, sans-serif;
  }
  .rb-share-main {
    width: 56px; height: 56px; border-radius: 50%;
    background: linear-gradient(135deg, #fbbf24, #f85149);
    color: #0d1117; border: 0; cursor: pointer;
    box-shadow: 0 12px 28px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(251,191,36,0.5);
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.18s cubic-bezier(0.2,0.9,0.3,1);
  }
  .rb-share-main:hover { transform: scale(1.05); }
  .rb-share-main:active { transform: scale(0.96); }
  .rb-share-main svg { width: 24px; height: 24px; }
  .rb-share-menu {
    display: none; flex-direction: column; gap: 8px;
    background: rgba(13,17,23,0.96);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 14px; padding: 10px;
    box-shadow: 0 18px 40px rgba(0,0,0,0.6);
    min-width: 220px; backdrop-filter: blur(8px);
  }
  .rb-share-fab.open .rb-share-menu { display: flex; }
  .rb-share-btn {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px; border: 0; background: transparent;
    color: #e6edf3; font-size: 14px; cursor: pointer;
    border-radius: 8px; text-align: left; font-family: inherit;
    transition: background 0.12s;
  }
  .rb-share-btn:hover { background: rgba(255,255,255,0.06); }
  .rb-share-btn .ico {
    width: 28px; height: 28px; border-radius: 7px;
    display: inline-flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .rb-share-btn .ico svg { width: 16px; height: 16px; fill: #fff; }
  .rb-wa  .ico { background: #25D366; }
  .rb-tw  .ico { background: #000;     }
  .rb-fb  .ico { background: #1877F2; }
  .rb-ig  .ico { background: linear-gradient(135deg, #f9ce34, #ee2a7b 50%, #6228d7); }
  .rb-tg  .ico { background: #229ED9; }
  .rb-cp  .ico { background: #6b7280; }

  /* ---------- Barra inline (botones grandes dentro de la página) ---------- */
  .rb-inline-share {
    display: flex; flex-wrap: wrap; align-items: center; gap: 12px;
    margin: 36px auto 8px; max-width: 760px;
    padding: 18px 22px;
    background: rgba(13,17,23,0.55);
    border: 1px solid rgba(251,191,36,0.20);
    border-radius: 14px;
    font-family: 'Inter', system-ui, sans-serif;
  }
  .rb-inline-share .rb-inline-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase;
    color: #fbbf24; font-weight: 700;
    flex: 0 0 auto; margin-right: 6px;
  }
  .rb-inline-share-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 14px; border: 0; border-radius: 999px;
    background: rgba(255,255,255,0.06);
    color: #e6edf3; font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: inherit;
    transition: transform 0.12s, background 0.12s, box-shadow 0.18s;
    border: 1px solid rgba(255,255,255,0.10);
  }
  .rb-inline-share-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(0,0,0,0.4);
  }
  .rb-inline-share-btn[data-rb-share="wa"]:hover { background: #25D366; color: #0d1117; border-color: #25D366; }
  .rb-inline-share-btn[data-rb-share="ig"]:hover { background: linear-gradient(135deg, #f9ce34, #ee2a7b 50%, #6228d7); color: #fff; border-color: transparent; }
  .rb-inline-share-btn[data-rb-share="fb"]:hover { background: #1877F2; color: #fff; border-color: #1877F2; }
  .rb-inline-share-btn[data-rb-share="tw"]:hover { background: #000; color: #fff; border-color: #fff; }
  .rb-inline-share-btn[data-rb-share="cp"]:hover { background: #fbbf24; color: #0d1117; border-color: #fbbf24; }
  .rb-inline-share-btn svg { width: 16px; height: 16px; }
  @media (max-width: 600px) {
    .rb-inline-share { padding: 14px 14px; gap: 8px; }
    .rb-inline-share .rb-inline-label { flex-basis: 100%; margin-bottom: 4px; }
    .rb-inline-share-btn { padding: 8px 12px; font-size: 12px; }
  }
  .rb-share-toast {
    position: fixed; left: 50%; bottom: 90px; transform: translateX(-50%) translateY(20px);
    background: rgba(13,17,23,0.96); color: #fbbf24;
    border: 1px solid rgba(251,191,36,0.4);
    padding: 12px 20px; border-radius: 10px;
    font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 1px;
    opacity: 0; transition: opacity 0.25s, transform 0.25s; z-index: 9999;
    pointer-events: none;
  }
  .rb-share-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  @media (max-width: 600px) {
    .rb-share-fab { bottom: 16px; right: 16px; }
    .rb-share-main { width: 50px; height: 50px; }
  }
  `;

  function injectUI() {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    const fab = document.createElement("div");
    fab.className = "rb-share-fab";
    fab.innerHTML = `
      <div class="rb-share-menu" role="menu" aria-label="Compartir esta sección">
        <button class="rb-share-btn rb-wa" data-action="wa">
          <span class="ico"><svg viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163A11.867 11.867 0 0 1 .163 11.892C.163 5.335 5.498 0 12.052 0c3.181 0 6.167 1.24 8.413 3.488A11.821 11.821 0 0 1 23.945 11.9c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.371-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.695.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg></span>
          WhatsApp
        </button>
        <button class="rb-share-btn rb-tw" data-action="tw">
          <span class="ico"><svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></span>
          Twitter / X
        </button>
        <button class="rb-share-btn rb-fb" data-action="fb">
          <span class="ico"><svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></span>
          Facebook
        </button>
        <button class="rb-share-btn rb-ig" data-action="ig">
          <span class="ico"><svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></span>
          Instagram
        </button>
        <button class="rb-share-btn rb-tg" data-action="tg">
          <span class="ico"><svg viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg></span>
          Telegram
        </button>
        <button class="rb-share-btn rb-cp" data-action="cp">
          <span class="ico"><svg viewBox="0 0 24 24"><path d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12V1z"/></svg></span>
          Copiar enlace
        </button>
      </div>
      <button class="rb-share-main" aria-label="Compartir esta sección" title="Compartir">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </button>
    `;
    document.body.appendChild(fab);

    const main = fab.querySelector(".rb-share-main");
    const menu = fab.querySelector(".rb-share-menu");
    main.addEventListener("click", e => {
      e.stopPropagation();
      if (navigator.share && /Mobi|Android|iPhone/.test(navigator.userAgent) && !fab.classList.contains("open")) {
        nativeShare();
      } else {
        fab.classList.toggle("open");
      }
    });
    document.addEventListener("click", e => {
      if (!fab.contains(e.target)) fab.classList.remove("open");
    });
    const actions = {
      wa: shareWhatsApp,
      tw: shareTwitter,
      fb: shareFacebook,
      ig: shareInstagram,
      tg: shareTelegram,
      cp: copyLink,
    };
    menu.addEventListener("click", e => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      fab.classList.remove("open");
      actions[btn.dataset.action]?.();
    });

    // Botones inline embebidos en la página: <button data-rb-share="wa|tw|fb|ig|cp">…</button>
    document.addEventListener("click", e => {
      const btn = e.target.closest("[data-rb-share]");
      if (!btn) return;
      e.preventDefault();
      actions[btn.dataset.rbShare]?.();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectUI);
  } else {
    injectUI();
  }
})();
