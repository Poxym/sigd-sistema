# SIGD

Sistema unificado con frontend basado en el prototipo v17 y API de dominio. El diseño de acceso, marco, tipografía y estilos del Plan se conserva. Informe, Administración y Reportes usan los componentes y tokens existentes con datos del servidor.

## Cambios de la minuta 29/10/2026 (Minuta29102026A)

| Sugerencia | Implementación |
|---|---|
| Regresar a partes anteriores de la captura | Botón **Anterior** al pie de cada sección y acceso a cualquier sección desde la barra lateral; el avance guardado se conserva. |
| Mostrar con color las secciones con pendientes | Indicador rojo en la barra lateral y etiqueta ámbar «Pendiente» en el resumen; el nombre accesible del botón indica «sección con pendientes». |
| Mover las opciones a la barra lateral (como el módulo de NextCode) | Las secciones del plan, el resumen, el historial y la ayuda están en la barra lateral. |

## Otros acuerdos aplicados

- **Sinodal de examen** (reunión 05/11 y pizarrón del 09/11): el catálogo de ejemplo incluye la actividad de Docencia «Sinodal de examen» (Extraordinario 1, Extraordinario 2, Especial). Administración puede agregarla o retirarla al publicar el catálogo de un periodo; los planes anteriores conservan su catálogo congelado.
- **Máximo de 40 horas** (chat 22/11): el periodo semilla bloquea el envío de un plan que supere 40 h semanales. El borrador sí puede guardarse; el resumen explica el motivo antes de enviar. Administración puede cambiar el máximo o desactivarlo por periodo.

## Ejecutar en local

Requiere Node.js 24 o posterior. La demostración local funciona sin instalar paquetes:

```powershell
npm.cmd run demo
```

Abre `http://127.0.0.1:4200`. Cuentas sintéticas: `209` docente, `118` docente y jefatura, `001` Administración, `100` Vicerrectoría. Contraseña de demostración: `Unistmo#2026`. Los correos terminados en `.example` no son cuentas institucionales reales.

Los datos persisten en `data/sigd.sqlite`. Los archivos adjuntos quedan en `data/evidence/`; se guardan en las tablas únicamente sus metadatos, hash y ruta. SQLite es el proveedor local de comprobación; no reemplaza las variantes PostgreSQL y Firebase solicitadas.

## Flujo comprobable

1. Administración publica un catálogo por periodo y configura materias, grupos, asignaciones y ventanas de captura.
2. El docente crea su plan. Las asignaciones institucionales se incorporan una sola vez y el resto del formulario procede del catálogo congelado.
3. Puede volver a cualquier sección y guardar borradores. Los datos incompletos impiden el envío definitivo.
4. Jefatura revisa todas las secciones de la versión enviada y aprueba o devuelve con comentario. No se permite autoaprobar.
5. Con el plan aprobado se crea el informe del mismo periodo. El informe referencia exactamente la versión aprobada.
6. Las evidencias se suben fuera de las tablas. Reportes calcula indicadores sobre los documentos autorizados.

La API comprueba permisos y ámbito, fechas de captura, revisión de concurrencia, idempotencia y validaciones. El frontend no decide la autorización. Las contraseñas locales se almacenan con scrypt y salt; las sesiones usan cookies HttpOnly y SameSite Strict.

## Pruebas

```powershell
npm.cmd test
```

Resultados del 23/11/2026:

| Prueba | SQLite | PostgreSQL 17 | Firestore (emulador) |
|---|---|---|---|
| Dominio y persistencia (`npm test`) | 26/26 | 26/26 | 26/26 |
| Proveedor real (`test:provider`) | — | 1/1 | 1/1 |
| Recorrido en navegador: alta de plan, navegación lateral, envío, bloqueo, aprobación, informe, evidencia, Administración, Reportes, sin desborde a 768 y 390 px | 11/11 | 11/11 | 11/11 |

Además se comprobaron solo con clics los cambios de la minuta (Anterior, barra lateral, indicador de pendientes, envío bloqueado con pendientes) y el bloqueo de 40 h en el resumen. Con Firestore cada petición tarda entre 0.7 y 2.3 s en el emulador, por lo que el recorrido requiere tiempos de espera amplios.

## Proveedores de base de datos

`DB_PROVIDER=postgres` usa `src/postgres.mjs` y requiere instalar `pg`, definir `DATABASE_URL` y ejecutar las migraciones del proyecto `sigd-postgres`. `DB_PROVIDER=firebase` usa `src/firebase.mjs`, requiere `firebase-admin` y un emulador o credencial IAM válida. Las variantes comparten el mismo esquema y servicio; sus pruebas de integración están condicionadas a disponer del proveedor real.

El modelo y su diccionario están en `modelo/`; el diagrama relacional oficial es `modelo/diagrama_relacional/SIGD_Diagrama_Relacional.pdf` (las láminas `*_CORREGIDO_v2.pdf` son una versión anterior). Las fuentes privadas, chat exportado y reuniones no se incluyen en este proyecto.

## Límites de esta entrega

La implementación local y los recorridos descritos fueron ejecutados. No se ha desplegado a producción ni validado con usuarios institucionales. Los adaptadores PostgreSQL y Firebase se probaron con PostgreSQL 17 en Docker y con Firebase Emulator Suite; no con un proyecto Firebase real en la nube. Los valores de 14 semanas y tutoría de 50 minutos proceden de los ejemplos del prototipo, son configurables y requieren ratificación institucional.

Los controladores operativos de Informe, Administración y Reportes se reconstruyeron usando los estilos existentes. Esto conserva la identidad visual, pero no garantiza equivalencia de cada pantalla con todos los prototipos históricos; la revisión funcional e institucional de esas diferencias sigue siendo necesaria. El sistema todavía no implementa todos los procesos administrativos dibujados, por ejemplo autorización escalonada de solicitudes, edición completa de grados y distinciones, recuperación de contraseña y configuración persistente de paneles. Del módulo de Auditoría y consulta (pizarrón del 09/11) faltan las reglas de incidencia (entrega pendiente, discrepancia de carga), el semáforo por umbrales, las consultas y vistas guardadas, y las comparaciones contra periodo anterior, por carrera y entre campus; Reportes hoy calcula carga, cumplimiento y reprobación del periodo.

El repositorio central lee el estado del conjunto de tablas por transacción. Es una implementación verificable del contrato para este tamaño de proyecto, con exclusión de escrituras concurrentes. Su coste y rendimiento deben medirse antes de usarla con cargas institucionales. No se afirma haber probado 114 usuarios concurrentes ni rendimiento en la nube.
