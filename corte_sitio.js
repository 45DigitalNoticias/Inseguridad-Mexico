// ============================================================
// CORTE DEL SITIO · UNA sola fuente para el indicador visible
// ------------------------------------------------------------
// CADA CORTE NUEVO SE EDITA AQUÍ (y solo aquí para el chip):
//   mes    → etiqueta larga del corte
//   corto  → etiqueta corta (pie, tooltips)
//   actualizado → fecha en que se publicó la actualización
// El chip flotante se inyecta en toda página que cargue este
// archivo, EXCEPTO la portada (ahí vive el sello del hero).
// morelos/ NO carga este archivo: es track aparte con su corte.
// ============================================================
const CORTE_SITIO = {
  mes: "julio 2026",
  corto: "jul-2026",
  actualizado: "20-ago-2026",
};

(function () {
  // base relativa: se deriva del src de ESTE script, así el link a
  // metodología funciona igual en la raíz que en columnas/
  var base = "";
  try {
    var src = (document.currentScript && document.currentScript.getAttribute("src")) || "corte_sitio.js";
    base = src.replace(/corte_sitio\.js.*$/, "");
  } catch (e) {}

  // la PORTADA es el único index SIN prefijo ../ (ahí vive el sello del hero);
  // columnas/index.html sí lleva chip porque su src es ../corte_sitio.js
  var ruta = (location.pathname || "").toLowerCase();
  var esPortada = base === "" && /\/(index\.html)?$/.test(ruta);
  if (esPortada) return;

  function pinta() {
    if (document.getElementById("chipCorte")) return;
    var css = document.createElement("style");
    css.textContent =
      "#chipCorte{position:fixed;left:18px;bottom:18px;z-index:60;display:inline-flex;" +
      "align-items:center;gap:8px;padding:8px 14px 7px;border-radius:999px;" +
      "background:#15130E;border:1px solid #2D3139;color:#B8AD9A;text-decoration:none;" +
      "font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:11px;font-weight:600;" +
      "letter-spacing:.16em;text-transform:uppercase;box-shadow:0 8px 26px rgba(0,0,0,.55);}" +
      "#chipCorte b{color:#FBBF24;font-weight:700;}" +
      "#chipCorte .pto{width:7px;height:7px;border-radius:50%;background:#FBBF24;flex:none;}" +
      "#chipCorte:hover{color:#F2EDE3;border-color:#FBBF24;}" +
      "@media(max-width:680px){#chipCorte{left:12px;bottom:12px;font-size:10px;padding:7px 11px 6px;}}";
    document.head.appendChild(css);
    var a = document.createElement("a");
    a.id = "chipCorte";
    a.href = base + "metodologia.html";
    a.title = "Actualizado el " + CORTE_SITIO.actualizado + " · ver metodología";
    a.innerHTML = '<span class="pto"></span>Corte SESNSP · <b>' + CORTE_SITIO.mes + "</b>";
    document.body.appendChild(a);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", pinta);
  } else { pinta(); }
})();
