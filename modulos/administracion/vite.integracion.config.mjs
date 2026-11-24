// Compila el módulo para integrarlo en el SIGD (Angular).
// Genera un solo script, ../../frontend/public/modulos/administracion/administracion.js,
// que expone window.SigdAdministracion.NX (mount, go, active, onChange).
// Uso: npm run build:sigd
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/modules/admin/host.js',
      name: 'SigdAdministracion',
      formats: ['iife'],
      fileName: () => 'administracion.js',
    },
    outDir: '../../frontend/public/modulos/administracion',
    emptyOutDir: true,
    copyPublicDir: false,
  },
});
