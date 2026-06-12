/* 45 Digital Noticias — barra de compartir autocontenida.
   Se inserta sola antes del <footer> (o al final del <body>) y comparte la
   URL y el título de la página actual. Colores neutros: hereda el tono de
   cada página, funcione en fondo claro u oscuro. */
(function () {
  if (document.querySelector('.share45')) return;

  var css = [
    '.share45{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:10px;margin:42px auto 30px;padding:0 16px;max-width:980px;}',
    '.share45-lbl{font-family:Inter,system-ui,sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;opacity:.62;margin-right:6px;}',
    '.share45 a,.share45 button{display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;border:1px solid rgba(128,128,128,.4);background:rgba(128,128,128,.08);color:inherit;cursor:pointer;transition:.2s;text-decoration:none;}',
    '.share45 a:hover,.share45 button:hover{border-color:#cca15a;color:#cca15a;transform:translateY(-2px);}',
    '.share45 svg{width:19px;height:19px;fill:currentColor;}',
    '.share45 .ok{background:#cca15a;border-color:#cca15a;color:#101418;}'
  ].join('');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var url = encodeURIComponent(location.href);
  var ttl = encodeURIComponent((document.title || '45 Digital Noticias').split('—')[0].trim());
  var P = {
    wa: '<path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.529 5.273l-.999 3.648 3.74-.98a9.892 9.892 0 003.219.36zm5.965-6.687c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>',
    fb: '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>',
    x: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',
    tg: '<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>',
    copy: '<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>'
  };
  var NETS = [
    ['WhatsApp', 'https://wa.me/?text=' + ttl + '%20' + url, P.wa],
    ['Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + url, P.fb],
    ['X', 'https://twitter.com/intent/tweet?text=' + ttl + '&url=' + url, P.x],
    ['Telegram', 'https://t.me/share/url?url=' + url + '&text=' + ttl, P.tg],
    ['Copiar enlace', 'copy', P.copy]
  ];

  var bar = document.createElement('div');
  bar.className = 'share45';
  bar.setAttribute('aria-label', 'Compartir esta página');
  var lbl = document.createElement('span');
  lbl.className = 'share45-lbl';
  lbl.textContent = 'Compartir esta página';
  bar.appendChild(lbl);

  NETS.forEach(function (n) {
    var isCopy = n[1] === 'copy';
    var el = document.createElement(isCopy ? 'button' : 'a');
    el.setAttribute('aria-label', n[0]);
    el.title = n[0];
    el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + n[2] + '</svg>';
    if (isCopy) {
      el.type = 'button';
      el.addEventListener('click', function () {
        navigator.clipboard.writeText(location.href).then(function () {
          el.classList.add('ok');
          setTimeout(function () { el.classList.remove('ok'); }, 1500);
        });
      });
    } else {
      el.href = n[1];
      el.target = '_blank';
      el.rel = 'noopener';
    }
    bar.appendChild(el);
  });

  var f = document.querySelector('footer');
  if (f && f.parentNode) { f.parentNode.insertBefore(bar, f); }
  else { document.body.appendChild(bar); }
})();
