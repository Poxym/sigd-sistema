// Genera el diagrama relacional (notación pata de gallo / IE) a partir de ../schema.json
// Uso: node generar.cjs [ruta-a-@viz-js/viz]
const fs = require('node:fs');
const path = require('node:path');
const VIZ = process.argv[2] || process.env.VIZ_JS ||
  'C:/Users/ALFONSO/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@viz-js/viz';
const { instance } = require(VIZ);

const here = __dirname;
const schema = JSON.parse(fs.readFileSync(path.join(here, '..', 'schema.json'), 'utf8'));
const tables = schema.tables;
const byName = Object.fromEntries(tables.map(t => [t.name, t]));

const GROUPS = [
  ['Estructura', 'Estructura académica', '#1F5F7A', '#E8F1F5'],
  ['Identidad', 'Identidad docente', '#2E6B4F', '#EAF3EE'],
  ['Seguridad', 'Seguridad, roles y auditoría', '#7A3B3B', '#F6ECEC'],
  ['Catálogos', 'Catálogos configurables por periodo', '#6B4E9B', '#F0ECF6'],
  ['Documentos', 'Plan de trabajo, informe y evidencias', '#9A5B12', '#FAF0E4'],
  ['Revisión', 'Versionado y revisión', '#2D4F8F', '#EAEFF8'],
  ['Reportes', 'Indicadores y paneles', '#4F5D66', '#EEF1F3'],
];
const G = Object.fromEntries(GROUPS.map(([k, title, c, bg]) => [k, { title, c, bg }]));
const FONT = 'Arial';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const uniqueSingle = (t, col) => t.unique.some(u => u.length === 1 && u[0] === col);
const inComposite = (t, col) => t.unique.some(u => u.length > 1 && u.includes(col));

// Todas las relaciones FK
const rels = [];
for (const t of tables) for (const c of t.columns) if (c.ref) {
  rels.push({ child: t.name, col: c.name, parent: c.ref, required: c.required, one: uniqueSingle(t, c.name) });
}

function badge(text, bg) {
  return `<FONT COLOR="${bg}" POINT-SIZE="9"><B>${text}</B></FONT>`;
}

// mode: 'full' (todas las columnas), 'keys' (solo PK/FK), 'ref' (tabla de otro dominio: solo PK)
function tableLabel(t, mode) {
  const g = G[t.group];
  const ext = mode === 'ref';
  const head = ext ? '#9AA5AD' : g.c;
  const cols = mode === 'full' ? t.columns : mode === 'keys' ? t.columns.filter(c => c.name === 'id' || c.ref) : t.columns.filter(c => c.name === 'id');
  let rows = `<TR><TD COLSPAN="4" BGCOLOR="${head}" CELLPADDING="6" ALIGN="CENTER"><FONT COLOR="#FFFFFF" POINT-SIZE="13"><B>${esc(t.name)}</B></FONT><BR/><FONT COLOR="#FFFFFF" POINT-SIZE="9">${esc(t.label)}${ext ? ' · ' + esc(G[t.group].title) : ''}</FONT></TD></TR>`;
  for (const c of cols) {
    const pk = c.name === 'id';
    const marks = [];
    if (pk) marks.push(badge('PK', '#B8860B'));
    if (c.ref) marks.push(badge('FK', '#3D6E91'));
    if (!pk && (uniqueSingle(t, c.name) || inComposite(t, c.name))) marks.push(badge(uniqueSingle(t, c.name) ? 'UQ' : 'UQ*', '#6B7C86'));
    const markCell = marks.length ? marks.join(' ') : ' ';
    const name = pk ? `<B><U>${esc(c.name)}</U></B>` : c.ref ? `<I>${esc(c.name)}</I>` : esc(c.name);
    const nul = c.required ? 'NOT NULL' : 'NULL';
    rows += `<TR>` +
      `<TD ALIGN="LEFT" CELLPADDING="3" PORT="${c.name}_w">${markCell}</TD>` +
      `<TD ALIGN="LEFT" CELLPADDING="3"><FONT POINT-SIZE="11" COLOR="#1D2B33">${name}</FONT></TD>` +
      `<TD ALIGN="LEFT" CELLPADDING="3"><FONT POINT-SIZE="10" COLOR="#55656F">${esc(c.type)}</FONT></TD>` +
      `<TD ALIGN="RIGHT" CELLPADDING="3" PORT="${c.name}_e"><FONT POINT-SIZE="8" COLOR="${c.required ? '#55656F' : '#A0ACB3'}">${nul}</FONT></TD>` +
      `</TR>`;
  }
  const comp = t.unique.filter(u => u.length > 1);
  if (mode === 'full' && comp.length) {
    rows += `<TR><TD COLSPAN="4" ALIGN="LEFT" BGCOLOR="#F3F5F6" CELLPADDING="4"><FONT POINT-SIZE="8.5" COLOR="#55656F">UQ* ${comp.map(u => '(' + u.join(', ') + ')').join('  ')}</FONT></TD></TR>`;
  }
  if (mode === 'keys' && t.columns.length > cols.length) {
    rows += `<TR><TD COLSPAN="4" ALIGN="LEFT" CELLPADDING="3"><FONT POINT-SIZE="8.5" COLOR="#8A979F">+ ${t.columns.length - cols.length} atributos</FONT></TD></TR>`;
  }
  return `<<TABLE BORDER="1" COLOR="${ext ? '#B7C0C6' : g.c}" CELLBORDER="0" CELLSPACING="0" BGCOLOR="${ext ? '#F7F8F9' : '#FFFFFF'}">${rows}</TABLE>>`;
}

function edge(r, shown) {
  // padre --> hijo. Extremo padre: || (obligatorio) o |o (opcional). Extremo hijo: >o (0..N) o |o (0..1)
  const parentEnd = r.required ? 'teetee' : 'teeodot';
  const childEnd = r.one ? 'teeodot' : 'crowodot';
  const self = r.child === r.parent;
  const p = self ? `"${r.parent}":id_e:e` : `"${r.parent}":id_e:e`;
  const c = self ? `"${r.child}":${r.col}_e:e` : `"${r.child}":${r.col}_w:w`;
  const style = r.required ? 'solid' : 'dashed';
  return `${p} -> ${c} [dir=both, arrowtail=${parentEnd}, arrowhead=${childEnd}, style=${style}, color="#4A5B66", penwidth=1.3, arrowsize=0.9, tooltip="${r.child}.${r.col} → ${r.parent}.id"];`;
}

function dot({ title, subtitle, nodes, mode, clusters }) {
  const set = new Set(nodes);
  const own = rels.filter(r => set.has(r.child) || set.has(r.parent));
  const ext = new Set();
  for (const r of own) { if (!set.has(r.child)) ext.add(r.child); if (!set.has(r.parent)) ext.add(r.parent); }
  // En láminas de dominio sólo se muestran las tablas externas a las que el dominio apunta (padres),
  // y las hijas externas que dependen del dominio se listan en el pie para no saturar la lámina.
  const extParents = new Set(own.filter(r => set.has(r.child) && !set.has(r.parent)).map(r => r.parent));
  const extChildren = [...ext].filter(n => !extParents.has(n));
  const shownRels = own.filter(r => (set.has(r.child) || extParents.has(r.child)) && (set.has(r.parent) || extParents.has(r.parent)) && set.has(r.child));
  let out = `digraph G {
  graph [rankdir=LR,${clusters ? ' pack=30, packmode="array_2",' : ''} splines=spline, nodesep=0.45, ranksep=1.1, pad=0.4, fontname="${FONT}", bgcolor="#FFFFFF", labelloc=t, labeljust=l,
         label=<<FONT POINT-SIZE="24" COLOR="#13242E"><B>${esc(title)}</B></FONT><BR ALIGN="LEFT"/><FONT POINT-SIZE="6"> </FONT><BR ALIGN="LEFT"/><FONT POINT-SIZE="12" COLOR="#55656F">${esc(subtitle)}</FONT><BR ALIGN="LEFT"/> >];
  node [shape=plaintext, fontname="${FONT}", margin=0];
  edge [fontname="${FONT}"];\n`;
  // Vista general: cada referencia a una tabla de OTRO dominio se dibuja contra una réplica gris
  // de esa tabla dentro del dominio hijo (técnica de "tabla fantasma"); así ninguna línea cruza dominios.
  const ghost = (p, g) => `${p}__${g}`;
  const generalRels = rels.map(r => (byName[r.parent].group !== byName[r.child].group)
    ? { ...r, parent: ghost(r.parent, byName[r.child].group), real: r.parent } : r);
  if (clusters) {
    for (const [k, gt, c, bg] of GROUPS) {
      const members = nodes.filter(n => byName[n].group === k);
      if (!members.length) continue;
      out += `  subgraph "cluster_${k}" { label=<<FONT POINT-SIZE="16" COLOR="${c}"><B>${esc(gt)}</B></FONT>>; style="rounded,filled"; color="${c}"; fillcolor="${bg}"; penwidth=1.5; margin=18;\n`;
      for (const n of members) out += `    "${n}" [label=${tableLabel(byName[n], mode)}];\n`;
      for (const real of new Set(generalRels.filter(r => r.real && byName[r.child].group === k).map(r => r.real))) {
        const lbl = tableLabel({ ...byName[real], label: '↗ ' + G[byName[real].group].title }, 'ref').replace(' · ' + esc(G[byName[real].group].title), '');
        out += `    "${ghost(real, k)}" [label=${lbl}];\n`;
      }
      out += `  }\n`;
    }
  } else {
    for (const n of nodes) out += `  "${n}" [label=${tableLabel(byName[n], mode)}];\n`;
    for (const n of extParents) out += `  "${n}" [label=${tableLabel(byName[n], 'ref')}];\n`;
  }
  for (const r of (clusters ? generalRels : shownRels)) out += '  ' + edge(r) + '\n';
  out += '}\n';
  return { dot: out, rels: clusters ? rels.length : shownRels.length, extChildren };
}

const outDir = path.join(here, 'svg');
fs.mkdirSync(outDir, { recursive: true });
const sheets = [];
(async () => {
  const viz = await instance();
  const render = (id, title, subtitle, spec, note) => {
    const d = dot({ title, subtitle, ...spec });
    fs.writeFileSync(path.join(outDir, id + '.dot'), d.dot);
    const svg = viz.renderString(d.dot, { format: 'svg', engine: 'dot' });
    fs.writeFileSync(path.join(outDir, id + '.svg'), svg);
    const m = svg.match(/viewBox="0\.00 0\.00 ([\d.]+) ([\d.]+)"/);
    sheets.push({ id, title, subtitle, w: +m[1], h: +m[2], rels: d.rels, extChildren: d.extChildren, note });
    console.log(id.padEnd(16), Math.round(m[1]) + 'x' + Math.round(m[2]), d.rels + ' relaciones');
  };
  render('00_general', 'SIGD · Modelo relacional general', `${tables.length} tablas · ${rels.length} claves foráneas · vista de claves (PK/FK) agrupada por dominio`,
    { nodes: tables.map(t => t.name), mode: 'keys', clusters: true });
  GROUPS.forEach(([k, gt], i) => {
    const nodes = tables.filter(t => t.group === k).map(t => t.name);
    render(String(i + 1).padStart(2, '0') + '_' + k.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(),
      `SIGD · ${gt}`, `${nodes.length} tablas del dominio (detalle completo) · en gris, tablas de otros dominios a las que se hace referencia`,
      { nodes, mode: 'full', clusters: false });
  });
  fs.writeFileSync(path.join(here, 'laminas.json'), JSON.stringify(sheets, null, 2));
})();
