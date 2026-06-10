/**
 * section-loader.js · 45 Digital Noticias · v1.0
 *
 * Carga una seccion del index.html maestro en una pagina independiente.
 * - Fetch del index.html
 * - Extrae todas las <style> del head (para que la seccion tenga su estilo)
 * - Extrae el <section id="..."> solicitado
 * - Extrae los <script> que esten cerca de esa seccion y los ejecuta
 *
 * Uso en cada pagina:
 *   <body>
 *     <div id="section-mount"></div>
 *     <script src="../_partials/section-loader.js"></script>
 *     <script>loadSection('sR');</script>
 *   </body>
 */
(function(global) {
  'use strict';

  async function loadSection(sectionId, opts) {
    opts = opts || {};
    const indexURL = opts.indexURL || '../index.html';
    const mountId = opts.mountId || 'section-mount';
    const onReady = opts.onReady || null;

    const mount = document.getElementById(mountId);
    if (!mount) {
      console.error('loadSection: no se encontro #' + mountId);
      return;
    }

    mount.innerHTML = '<div style="text-align:center;padding:80px 24px;color:#8b949e;font-family:Inter,sans-serif;">' +
      '<div style="font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:2px;color:#a78bfa;margin-bottom:14px;">CARGANDO SECCION...</div>' +
      '<div style="opacity:0.6;font-size:13px;">obteniendo ' + sectionId + ' del dashboard maestro</div>' +
      '</div>';

    try {
      const resp = await fetch(indexURL);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const html = await resp.text();

      // Parsear el HTML completo del index
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // 1. Buscar la seccion solicitada
      const section = doc.getElementById(sectionId);
      if (!section) {
        mount.innerHTML = '<div style="text-align:center;padding:80px 24px;color:#f85149;">No se encontro la seccion ' + sectionId + ' en el index.</div>';
        return;
      }

      // 2. Inyectar TODOS los <style> del head del index (para que la seccion herede estilo)
      const styles = doc.querySelectorAll('head style, body style');
      styles.forEach(s => {
        const clone = document.createElement('style');
        clone.textContent = s.textContent;
        document.head.appendChild(clone);
      });

      // 3. Limpiar mount, agregar la seccion
      mount.innerHTML = '';
      mount.appendChild(section.cloneNode(true));

      // 4. Recolectar TODOS los <script> del body del index y ejecutarlos
      //    (necesario porque la seccion puede usar datos/funciones de scripts externos
      //    o de scripts inline en cualquier parte del index)
      const scripts = doc.querySelectorAll('body script');
      const inlineScripts = [];
      const externalScripts = [];
      scripts.forEach(s => {
        if (s.src) externalScripts.push(s.src);
        else inlineScripts.push(s.textContent);
      });

      // Cargar primero los externos en orden
      for (const src of externalScripts) {
        await new Promise((res, rej) => {
          const tag = document.createElement('script');
          tag.src = src;
          tag.onload = res;
          tag.onerror = () => { console.warn('script externo fallo:', src); res(); };
          document.body.appendChild(tag);
        });
      }

      // Despues ejecutar los inline (orden importante)
      for (const code of inlineScripts) {
        try {
          const tag = document.createElement('script');
          tag.textContent = code;
          document.body.appendChild(tag);
        } catch (e) {
          // continuar con los demas
          console.warn('script inline error:', e.message);
        }
      }

      // 5. Forzar repintado (algunos charts requieren resize event)
      window.dispatchEvent(new Event('resize'));

      if (typeof onReady === 'function') onReady(section);
    } catch (e) {
      console.error('loadSection error:', e);
      mount.innerHTML = '<div style="text-align:center;padding:80px 24px;color:#f85149;font-family:Inter,sans-serif;">' +
        '<div style="font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:2px;color:#f85149;margin-bottom:14px;">ERROR DE CARGA</div>' +
        '<div style="opacity:0.8;font-size:13px;">' + e.message + '</div>' +
        '<div style="margin-top:24px;font-size:12px;opacity:0.6;">Esta pagina requiere ejecutarse desde un servidor web (no abrir el archivo directo con file://). En produccion (GitHub Pages) funciona normal.</div>' +
        '</div>';
    }
  }

  global.loadSection = loadSection;
})(window);
