/* Catálogos académicos · VISTA (ADR-006, MVC) · rediseño con criterios de Material Design 3.
   Estructura (patrón lista–detalle):
     · izquierda: tipos de catálogo agrupados, con ícono y conteo (en pantallas angostas pasa a una fila deslizable);
     · derecha: título y descripción del catálogo, búsqueda, chips de estado y la lista de registros.
   Solo pinta lo que recibe y avisa de los eventos; nunca toca la base ni el repositorio. Las flechas en la lista de
   tipos solo mueven el foco, por eso se resuelven aquí.
   El HTML que genera es el mismo de antes (movido sin cambios desde catalogos/index.js).
   Importante: aquí no se usa `document` (sería el de la página, no el del módulo); todo pasa por $. */
export function crearVistaCatalogos({ $, esc, stateTag, types }) {
  /* Agrupación de los tipos de catálogo (propuesta de UX; el orden dentro de cada grupo sigue el del Documento maestro §4) */
  const SECCIONES = [
    ['Estructura institucional', [['institucion', 'building-bank'], ['campus', 'building-community'], ['carreras', 'school']]],
    ['Oferta académica', [['planes', 'books'], ['materias', 'book']]],
    ['Plan de Trabajo e Informe', [['rubros', 'list-details'], ['opciones', 'list-check'], ['categorias', 'chalkboard'], ['comisiones', 'users'], ['distinciones', 'user-star']]],
    ['Reglas del sistema', [['parametros', 'adjustments']]]
  ];
  const DESC = {
    institucion: 'Identificación y estructura institucional configurable.',
    campus: 'Sedes institucionales. Conservar registros históricos al cambiar de estado.',
    carreras: 'Las carreras se relacionan con un campus y pueden conservar antecedentes de traslados o sustitución.',
    planes: 'Cada plan de estudios se relaciona con una carrera; los planes históricos deben seguir disponibles para consulta.',
    materias: 'Las asignaturas deben proceder de planes de estudio oficiales y conservar su vigencia.',
    rubros: 'Estos rubros alimentan los formularios de Plan de Trabajo e Informe de Actividades.',
    opciones: 'Listas utilizadas por los formularios académicos, organizadas por tipo de dato y documento.',
    categorias: 'Distingue las categorías de Profesor Investigador y Profesor sin esa denominación.',
    comisiones: 'Comisiones y actividades académicas administradas como registros institucionales.',
    distinciones: 'Catálogo de tipos de distinción; la validación individual corresponde al rol institucional autorizado.',
    parametros: 'Pesos, horas y reglas configurables, sujetos a indicación institucional.'
  };
  const ICON = Object.fromEntries(SECCIONES.flatMap(s => s[1]));
  const ESTADOS = [['all', 'Todos'], ['Vigente', 'Vigentes'], ['Histórico', 'Históricos']];
  // Ícono y nombre del padre en las etiquetas de la fila (la relación misma está en el modelo).
  const PADRE = { carreras: ['building-community', 'Campus'], planes: ['school', 'Carrera'], materias: ['books', 'Plan de estudios'] };

  const sust = t => t === 'opciones' ? ['opción', 'opciones'] : ['registro', 'registros'];
  const unidad = u => ({ Porcentaje: '%', Horas: ' horas', Puntos: ' puntos' })[u] || '';

  function etiquetas(t, r, p) {                    // [ícono, texto de apoyo, valor, advertencia?]; p = padre del registro o null
    const out = [];
    if (PADRE[t]) {
      const [ic, nombre] = PADRE[t];
      out.push(p ? [ic, nombre, p.name] : ['alert-triangle', nombre, 'sin asignar', true]);
    }
    // Sin valor se muestra solo «—», sin unidad (fix/catalogos-valor-vacio; antes salía «— horas»).
    if (t === 'parametros') out.push(['adjustments', 'Valor', r.paramValue === undefined || r.paramValue === null || r.paramValue === '' ? '—' : r.paramValue + unidad(r.paramUnit)]);
    if (t === 'rubros') {
      out.push(['file-check', 'Plan', r.planSection || 'no asociado']);
      out.push(['file-description', 'Informe', r.reportSection || 'no asociado']);
    }
    if (t === 'opciones') {
      out.push(['checklist', 'Aplicable en', r.appliesTo || 'Plan de Trabajo']);
      out.push(['list-check', 'Selección', String(r.selectionMode || 'Única').toLowerCase()]);
    }
    return out;
  }

  /* ---------- piezas de pantalla ---------- */
  // t = tipo elegido; conteo(k) = cuántos registros tiene el tipo k.
  function pintarNav(t, conteo) {
    const conocidos = new Set(SECCIONES.flatMap(s => s[1].map(x => x[0])));
    const secs = SECCIONES.map(([titulo, items]) => [titulo, items.filter(([k]) => types[k])]).filter(([, i]) => i.length);
    const otros = Object.keys(types).filter(k => !conocidos.has(k));
    if (otros.length) secs.push(['Otros', otros.map(k => [k, 'folders'])]);
    // Si el foco estaba en la lista (p. ej. se eligió un tipo con Enter), vuelve al tipo elegido después de repintar
    // (fix/catalogos-foco-enter; antes se perdía, porque el botón enfocado se reemplaza).
    const nav = $('cxNav'), conFoco = nav.contains(nav.getRootNode().activeElement);
    nav.innerHTML = secs.map(([titulo, items], i) =>
      `<div class="cx-group" role="group" aria-labelledby="cxg${i}"><div class="cx-gtitle" id="cxg${i}">${esc(titulo)}</div>${items.map(([k, ic]) => {
        const n = conteo(k);
        return `<button type="button" class="cx-nav-item" data-cx-type="${esc(k)}" aria-current="${k === t}" aria-label="${esc(types[k])}, ${n} ${n === 1 ? 'registro' : 'registros'}"><i class="ti ti-${ic}" aria-hidden="true"></i><span class="cx-nav-label">${esc(types[k])}</span><span class="cx-n" aria-hidden="true">${n}</span></button>`;
      }).join('')}</div>`).join('');
    const w = $('cxNavWrap'), b = $('cxNav').querySelector('[aria-current="true"]');
    if (b && w.scrollWidth > w.clientWidth) w.scrollLeft = b.offsetLeft - (w.clientWidth - b.offsetWidth) / 2;   // fila deslizable: deja visible el elegido
    if (conFoco && b) b.focus({ preventScroll: true });
  }

  function pintarCabecera(t) {
    $('cxTitle').textContent = types[t];
    $('cxDesc').textContent = DESC[t] || '';
    $('cxTitleIc').className = 'ti ti-' + (ICON[t] || 'folders');
    $('cxGroupWrap').hidden = t !== 'opciones';
    $('cxSearch').placeholder = 'Buscar en este catálogo';
  }

  // Selector de grupo (solo en «Opciones de captura»): total = todas las opciones; grupos = [[nombre, cuántas], …].
  function pintarGrupos(total, grupos, grupo) {
    $('cxGroup').innerHTML = `<option value="all">Todos los grupos (${total})</option>` + grupos.map(([g, n]) => `<option value="${esc(g)}" ${g === grupo ? 'selected' : ''}>${esc(g)} (${n})</option>`).join('');
  }

  // cuenta(e) = cuántos registros quedan con el estado e.
  function pintarChips(estado, cuenta) {
    $('cxChips').innerHTML = ESTADOS.map(([v, et]) => `<button type="button" class="cx-fchip" data-cx-estado="${v}" aria-pressed="${v === estado}">${v === estado ? '<i class="ti ti-check" aria-hidden="true"></i>' : ''}${et}<span class="cx-fn">${cuenta(v)}</span></button>`).join('');
  }

  // total = registros del tipo; vis = los que se muestran; agrupar = con subencabezados por grupo; padreDe(r) = padre o null.
  function pintarLista(t, total, vis, agrupar, padreDe) {
    const [s1, sN] = sust(t);
    $('cxTools').hidden = !total;                                         // catálogo vacío: sin búsqueda ni filtros que no sirven
    $('cxCount').textContent = (vis.length === total ? total : vis.length + ' de ' + total) + ' ' + (total === 1 ? s1 : sN);

    if (!total) {
      $('cxList').innerHTML = vacio(ICON[t] || 'folders', 'Este catálogo aún no tiene registros', 'Crea el primero para que esté disponible en los formularios.', 'new', 'Nuevo registro', 'plus');
    } else if (!vis.length) {
      $('cxList').innerHTML = vacio('search-off', 'Sin resultados', 'Prueba con otra palabra o quita los filtros.', 'clear', 'Quitar búsqueda y filtros', 'x');
    } else if (agrupar) {                                                 // 85 opciones en 21 grupos: subencabezados
      const por = new Map(); vis.forEach(r => { const g = r.group || 'Sin grupo'; if (!por.has(g)) por.set(g, []); por.get(g).push(r); });
      $('cxList').innerHTML = [...por.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es')).map(([g, rs]) =>
        `<li class="cx-subhead" role="presentation">${esc(g)}<span>${rs.length}</span></li>` + rs.map(r => fila(t, r, padreDe(r))).join('')).join('');
    } else {
      $('cxList').innerHTML = vis.map(r => fila(t, r, padreDe(r))).join('');
    }
  }

  const vacio = (ic, titulo, texto, act, etiqueta, icBtn) =>
    `<li class="cx-empty" role="presentation"><span class="cx-empty-ic"><i class="ti ti-${ic}" aria-hidden="true"></i></span><strong>${esc(titulo)}</strong><p>${esc(texto)}</p><button type="button" class="cx-edit cx-tonal" data-cx-act="${act}"><i class="ti ti-${icBtn}" aria-hidden="true"></i>${esc(etiqueta)}</button></li>`;

  function fila(t, r, p) {
    const tags = etiquetas(t, r, p).map(([ic, et, val, aviso]) => `<span class="cx-tag${aviso ? ' cx-warn' : ''}"><i class="ti ti-${ic}" aria-hidden="true"></i><span>${esc(et)}:</span> <b>${esc(val)}</b></span>`).join('');
    return `<li class="cx-row" data-id="${r.id}"><div class="cx-main"><div class="cx-name"><strong>${esc(r.name)}</strong><span class="cx-code">${esc(r.code)}</span></div>${r.detail ? `<p class="cx-text">${esc(r.detail)}</p>` : ''}${tags ? `<div class="cx-meta">${tags}</div>` : ''}</div><div class="cx-side">${stateTag(r.status)}<button type="button" class="cx-edit" data-edit-cat="${r.id}" aria-label="Editar ${esc(r.name)}"><i class="ti ti-pencil" aria-hidden="true"></i>Editar</button></div></li>`;
  }

  // Lo escrito en la búsqueda (al limpiar o al llegar desde el buscador rápido).
  const ponerBusqueda = texto => { $('cxSearch').value = texto; };

  /* ---------- eventos (el controlador los enlaza una sola vez) ---------- */
  function alEventos({ alElegirTipo, alBuscar, alElegirEstado, alElegirGrupo, alNuevo, alLimpiar, alEditar }) {
    $('cxNav').addEventListener('click', e => { const b = e.target.closest('[data-cx-type]'); if (b) alElegirTipo(b.dataset.cxType); });
    $('cxNav').addEventListener('keydown', e => {                       // flechas: moverse entre tipos
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
      const bs = [...$('cxNav').querySelectorAll('[data-cx-type]')], i = bs.indexOf(e.target.closest('[data-cx-type]'));
      if (i < 0) return; e.preventDefault();
      const n = e.key === 'Home' ? 0 : e.key === 'End' ? bs.length - 1 : (i + (e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length;
      bs[n].focus();
    });
    $('cxSearch').addEventListener('input', e => alBuscar(e.target.value));
    $('cxChips').addEventListener('click', e => { const b = e.target.closest('[data-cx-estado]'); if (b) alElegirEstado(b.dataset.cxEstado); });
    $('cxGroup').addEventListener('change', e => alElegirGrupo(e.target.value));
    $('cxList').addEventListener('click', e => {
      const a = e.target.closest('[data-cx-act]');
      if (a) { if (a.dataset.cxAct === 'new') alNuevo(); else alLimpiar(); return; }
      const fila = e.target.closest('.cx-row'); if (fila) alEditar(+fila.dataset.id);
    });
  }

  return { pintarNav, pintarCabecera, pintarGrupos, pintarChips, pintarLista, ponerBusqueda, alEventos };
}
