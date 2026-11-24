/* nxChips(env, ids): convierte los <select> de filtro (estado, rol, acción) en chips de filtro de Material Design 3.
   El <select> sigue existiendo (oculto) y es quien manda; los chips solo lo leen y lo cambian.
   Importante: aquí no se usa `document`; todo pasa por env.$ */
export function nxChips(env, ids) {
  const { $ } = env;
  ids.forEach(id => {
    const sel = $(id); if (!sel) return;
    let g = $(id + 'Chips');
    if (!g) { g = sel.ownerDocument.createElement('div'); g.id = id + 'Chips'; g.className = 'm3-chips'; g.setAttribute('role', 'group'); g.setAttribute('aria-label', sel.getAttribute('aria-label') || 'Filtro'); sel.parentNode.insertBefore(g, sel); sel.classList.add('m3-sel-hidden'); sel.setAttribute('tabindex', '-1'); sel.setAttribute('aria-hidden', 'true'); }
    g.innerHTML = [...sel.options].map(o => { const v = o.value || o.text, on = sel.value === v; return `<button type="button" class="m3-chip${on ? ' on' : ''}" data-v="${String(v).replace(/"/g, '&quot;')}" aria-pressed="${on}">${on ? '<i class="ti ti-check" aria-hidden="true"></i>' : ''}${o.text}</button>`; }).join('');
    g.querySelectorAll('button').forEach(b => b.onclick = () => { sel.value = b.dataset.v; sel.dispatchEvent(new Event('change', { bubbles: true })); const v = b.dataset.v; nxChips(env, [id]); [...g.querySelectorAll('button')].find(x => x.dataset.v === v)?.focus(); });
  });
}
