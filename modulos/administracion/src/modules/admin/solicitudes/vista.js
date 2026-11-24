/* Solicitudes de cambio · VISTA (ADR-006, MVC) · lista y detalle (patrón lista–detalle, Material Design 3).
   Solo pinta lo que recibe y avisa de los clics; nunca toca la base ni el repositorio.
   El HTML que genera es el mismo de antes (movido sin cambios desde solicitudes/index.js).
   Importante: aquí no se usa `document` (sería el de la página, no el del módulo); todo pasa por $. */
export function crearVistaSolicitudes({ $, esc, stateTag, displayDate }) {
  const PASOS = [['pendiente', 'Pendiente'], ['autorizada', 'Autorizada'], ['aplicada', 'Aplicada']];

  const fact = (k, v, wide) => v ? `<div class="rq-fact${wide ? ' wide' : ''}"><small>${k}</small><strong>${esc(v)}</strong></div>` : '';

  function stepper(r) {
    if (r.status === 'rechazada') return `<div class="rq-banner bad"><i class="ti ti-x" aria-hidden="true"></i><span>Solicitud rechazada. No se aplicó ningún cambio.</span></div>`;
    const cur = PASOS.findIndex(p => p[0] === r.status);
    return `<ol class="rq-steps" aria-label="Avance de la solicitud">${PASOS.map((p, i) => `<li class="${i < cur ? 'done' : i === cur ? 'now' : ''}"${i === cur ? ' aria-current="step"' : ''}><span class="rq-dot">${i < cur ? '<i class="ti ti-check" aria-hidden="true"></i>' : i + 1}</span>${p[1]}</li>`).join('')}</ol>`;
  }

  /* Lo que la persona escribió en la búsqueda y eligió en el filtro. */
  const leerFiltros = () => ({ q: $('requestSearch').value, f: $('requestFilter').value });

  /* Pinta el detalle de «r» (o el mensaje de «Selecciona una solicitud»). «alAbrir(id)» se llama con «Gestionar»/«Ver detalle». */
  function pintarDetalle(r, alAbrir) {
    const el = $('requestDetail');
    if (!r) { el.innerHTML = `<div class="rq-empty"><i class="ti ti-inbox" aria-hidden="true"></i><strong>Selecciona una solicitud</strong><span>Aquí verás su justificación, vigencia y avance.</span></div>`; return; }
    const fin = ['aplicada', 'rechazada'].includes(r.status);
    const vig = r.schedule + (r.effectiveDate ? ' · desde ' + displayDate(r.effectiveDate) : '');
    el.innerHTML = `<div class="rq-dhead"><div><h2 class="rq-title" id="rqTitle">${esc(r.title)}</h2><p class="rq-sub">${esc(r.type)}</p></div>${stateTag(r.status)}</div>
      ${stepper(r)}
      <div class="rq-facts">${fact('Autoridad solicitante', r.authority)}${fact('Vigencia solicitada', vig)}${fact('Justificación y alcance', r.detail, true)}${fact('Referencia documental', r.evidence, true)}${fact('Autoridad que emitió instrucción', r.authorizationBy)}${fact('Fecha de instrucción', r.authorizationDate)}${fact('Fecha de ejecución', r.appliedAt)}${fact('Registro de ejecución', r.executionNote, true)}</div>
      <div class="rq-actions">${fin
        ? `<span class="rq-final"><i class="ti ti-lock-check" aria-hidden="true"></i>Solicitud finalizada. El historial se conserva en la bitácora.</span><button class="btn" type="button" data-rq-open="${r.id}">Ver detalle</button>`
        : `<button class="btn primary" type="button" data-rq-open="${r.id}"><i class="ti ti-arrow-right" aria-hidden="true"></i>Gestionar solicitud</button>`}</div>`;
    el.querySelectorAll('[data-rq-open]').forEach(b => b.onclick = () => alAbrir(Number(b.dataset.rqOpen)));
  }

  /* Pinta la lista marcando la elegida. «alElegir(id)» se llama al hacer clic en una solicitud. */
  function pintarLista(list, selId, alElegir) {
    $('requestRows').innerHTML = list.map(r => `<li><button type="button" class="rq-item${r.id === selId ? ' on' : ''}" data-rq="${r.id}"${r.id === selId ? ' aria-current="true"' : ''}><span class="rq-item-top"><b>${esc(r.title)}</b>${stateTag(r.status)}</span><span class="rq-item-sub">${esc(r.authority)} · ${esc(r.schedule)}${r.effectiveDate ? ' · ' + esc(displayDate(r.effectiveDate)) : ''}</span></button></li>`).join('')
      || `<li class="rq-none"><i class="ti ti-search-off" aria-hidden="true"></i><strong>No hay solicitudes con ese filtro</strong><span>Prueba otro estado o borra la búsqueda.</span></li>`;
    $('requestRows').querySelectorAll('[data-rq]').forEach(b => b.onclick = () => alElegir(Number(b.dataset.rq)));
  }

  /* Anuncio oculto para el lector de pantalla: solo dice el título de la solicitud que la persona eligió.
     (El panel de detalle no lleva aria-live: se repinta en cada tecla de la búsqueda y en cada guardado.) */
  const anunciarSeleccion = (r) => { $('requestAnnounce').textContent = r ? 'Solicitud seleccionada: ' + r.title : ''; };

  /* Acerca el detalle a la vista (en pantallas angostas queda debajo de la lista). */
  const enfocarDetalle = () => { $('requestDetail').scrollIntoView?.({ block: 'nearest' }); };

  return { leerFiltros, pintarLista, pintarDetalle, anunciarSeleccion, enfocarDetalle };
}
