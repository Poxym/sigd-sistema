import { esc } from '../core/utilidades.js';

/* Crea la función notify() ligada al DOM (Shadow DOM) del módulo. */
export const crearNotify = ($, document) => (msg)=>{let n=document.createElement('div');n.className='toast';n.innerHTML='<i class="ti ti-circle-check"></i><span>'+esc(msg)+'</span>'; $('toasts').append(n);setTimeout(()=>n.remove(),4300)};
