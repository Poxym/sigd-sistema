// Arma SIGD_Diagrama_Relacional.html (portada + leyenda + láminas) y lo imprime a PDF con Chrome.
// Uso: node pdf.cjs   (requiere haber corrido generar.cjs)
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const here = __dirname;
const sheets = JSON.parse(fs.readFileSync(path.join(here, 'laminas.json'), 'utf8'));
const schema = JSON.parse(fs.readFileSync(path.join(here, '..', 'schema.json'), 'utf8'));
const nFk = schema.tables.reduce((n, t) => n + t.columns.filter(c => c.ref).length, 0);
const PT = 96 / 72; // los SVG de Graphviz están en pt
const M = 24;

const legendSvg = (tail, head, dashed, label, meaning) => `
<div class="lg"><svg style="flex:none" width="170" height="34" viewBox="0 0 170 34">
 <line x1="10" y1="17" x2="160" y2="17" stroke="#4A5B66" stroke-width="1.6" ${dashed ? 'stroke-dasharray="6 4"' : ''}/>
 ${tail}${head}</svg><div><b>${label}</b><br><span>${meaning}</span></div></div>`;
const tee = x => `<line x1="${x}" y1="8" x2="${x}" y2="26" stroke="#4A5B66" stroke-width="1.6"/>`;
const odot = x => `<circle cx="${x}" cy="17" r="5" fill="#fff" stroke="#4A5B66" stroke-width="1.6"/>`;
const crow = () => `<path d="M146 17 L160 8 M146 17 L160 26 M146 17 L160 17" stroke="#4A5B66" stroke-width="1.6" fill="none"/>`;

const pages = [];
pages.push({ name: 'cover', w: 1100, h: 850, html: `
<div class="cover">
 <div class="kicker">SIGD · Sistema Integral de Gestión Docente</div>
 <h1>Modelo de base de datos relacional</h1>
 <p class="lead">${schema.tables.length} tablas · ${nFk} claves foráneas · 7 dominios. Notación de Ingeniería de la Información (pata de gallo). Generado desde <code>modelo/schema.json</code>, la misma fuente que usan las migraciones PostgreSQL y el mapeo Firestore.</p>
 <div class="cols">
  <div>
   <h2>Cardinalidad</h2>
   ${legendSvg('', tee(146) + tee(152), false, 'Uno y solo uno', 'FK obligatoria (NOT NULL) del lado padre')}
   ${legendSvg('', crow() + odot(136), false, 'Cero o muchos', 'lado hijo de una FK sin restricción UNIQUE')}
   ${legendSvg('', tee(152) + odot(140), true, 'Cero o uno', 'FK opcional (NULL) o FK con UNIQUE propio (1:1)')}
   <p class="note">Línea continua: FK obligatoria. Línea discontinua: FK opcional. Cada línea sale de la PK <code>id</code> del padre y llega a la columna FK exacta del hijo.</p>
  </div>
  <div>
   <h2>Marcas de columna</h2>
   <table class="mk">
    <tr><td><b style="color:#B8860B">PK</b></td><td>Clave primaria (<u>subrayada</u>). Identificadores de texto (UUID/clave).</td></tr>
    <tr><td><b style="color:#3D6E91">FK</b></td><td>Clave foránea (<i>cursiva</i>).</td></tr>
    <tr><td><b style="color:#6B7C86">UQ</b></td><td>Única por sí sola.</td></tr>
    <tr><td><b style="color:#6B7C86">UQ*</b></td><td>Forma parte de una restricción única compuesta, detallada al pie de la tabla.</td></tr>
    <tr><td>NOT NULL / NULL</td><td>Obligatoriedad de la columna.</td></tr>
    <tr><td><span class="gray">tabla gris</span></td><td>Tabla de otro dominio a la que se hace referencia (se muestra solo su PK).</td></tr>
   </table>
   <h2>Contenido</h2>
   <ol class="toc">${sheets.map(s => `<li>${s.title.replace('SIGD · ', '')} <span>· ${s.rels} relaciones</span></li>`).join('')}</ol>
  </div>
 </div>
</div>` });
for (const s of sheets) {
  const svg = fs.readFileSync(path.join(here, 'svg', s.id + '.svg'), 'utf8').replace(/^[\s\S]*?(<svg)/, '$1');
  const w = Math.ceil(s.w * PT) + 2 * M, h = Math.ceil(s.h * PT) + 2 * M;
  const foot = s.extChildren && s.extChildren.length
    ? `<div class="foot">También dependen de este dominio (ver sus láminas): ${s.extChildren.join(', ')}</div>` : '';
  pages.push({ name: 'p' + s.id, w, h: h + (foot ? 30 : 0), html: `<div class="sheet">${svg.replace(/width="[\d.]+pt" height="[\d.]+pt"/, `width="${Math.ceil(s.w * PT)}" height="${Math.ceil(s.h * PT)}"`)}${foot}</div>` });
}

const css = `
*{box-sizing:border-box} body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#13242E;background:#fff}
${pages.map(p => `@page ${p.name}{size:${p.w}px ${p.h}px;margin:0} .pg-${p.name}{page:${p.name};width:${p.w}px;height:${p.h}px}`).join('\n')}
.pg{break-after:page;overflow:hidden;padding:${M}px} .pg:last-child{break-after:auto}
.cover{padding:40px 56px}.kicker{font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#1F5F7A;font-weight:bold}
h1{font-size:40px;margin:10px 0 12px}.lead{font-size:16px;line-height:1.5;color:#3B4A53;max-width:900px}
h2{font-size:18px;margin:26px 0 10px;color:#1F5F7A}.cols{display:grid;grid-template-columns:1fr 1fr;gap:48px}
.lg{display:flex;align-items:center;gap:14px;margin:8px 0}.lg span{color:#55656F;font-size:13px}
.note{font-size:13px;color:#55656F;line-height:1.5}.mk{border-collapse:collapse;font-size:13px}.mk td{padding:5px 10px 5px 0;vertical-align:top}
.gray{background:#9AA5AD;color:#fff;padding:1px 6px;border-radius:3px}.toc{font-size:14px;line-height:1.8;padding-left:20px}.toc span{color:#8A979F}
code{background:#EEF1F3;padding:1px 4px;border-radius:3px;font-size:.92em}.foot{font-size:13px;color:#55656F;margin-top:6px}`;
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>SIGD · Diagrama relacional</title><style>${css}</style></head><body>
${pages.map(p => `<section class="pg pg-${p.name}">${p.html}</section>`).join('\n')}</body></html>`;
const htmlPath = path.join(here, 'SIGD_Diagrama_Relacional.html');
fs.writeFileSync(htmlPath, html);
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const pdf = path.join(here, 'SIGD_Diagrama_Relacional.pdf');
execFileSync(chrome, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, 'file:///' + htmlPath.replace(/\\/g, '/')], { stdio: 'ignore' });
console.log('PDF:', pdf, fs.statSync(pdf).size, 'bytes,', pages.length, 'páginas');
