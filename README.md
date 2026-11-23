# SIGD

Sistema unificado con frontend basado en el prototipo v17 y API de dominio. El diseño de acceso, marco, tipografía y estilos del Plan se conserva. El Plan incorpora navegación a cualquier sección desde la barra lateral; las secciones pendientes muestran un indicador de advertencia. Informe, Administración y Reportes usan los componentes y tokens existentes con datos del servidor.

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

Se comprobaron 24 casos de dominio y persistencia local, y un recorrido de navegador que incluyó alta de plan, navegación lateral, envío, bloqueo, aprobación, informe, evidencia, Administración, Reportes y ausencia de desborde horizontal a 768 y 390 px. Las capturas y el registro están en la auditoría del espacio de trabajo.

## Proveedores de base de datos

`DB_PROVIDER=postgres` usa `src/postgres.mjs` y requiere instalar `pg`, definir `DATABASE_URL` y ejecutar las migraciones del proyecto `sigd-postgres`. `DB_PROVIDER=firebase` usa `src/firebase.mjs`, requiere `firebase-admin` y un emulador o credencial IAM válida. Las variantes comparten el mismo esquema y servicio; sus pruebas de integración están condicionadas a disponer del proveedor real.

El modelo corregido y su diccionario están en `modelo/`. Las fuentes privadas, chat exportado y reuniones no se incluyen en este proyecto.

## Límites de esta entrega

La implementación local y los recorridos descritos fueron ejecutados. No se ha desplegado a producción ni validado con usuarios institucionales. Los adaptadores PostgreSQL y Firebase requieren comprobación con sus servicios reales; Docker no estaba iniciado y no había credenciales Firebase disponibles en este entorno. Los valores de 14 semanas, tutoría de 50 minutos y nominal de 40 horas proceden de los ejemplos del prototipo y son configurables; requieren ratificación institucional.

Los controladores operativos de Informe, Administración y Reportes se reconstruyeron usando los estilos existentes. Esto conserva la identidad visual, pero no garantiza equivalencia de cada pantalla con todos los prototipos históricos; la revisión funcional e institucional de esas diferencias sigue siendo necesaria. El sistema todavía no implementa todos los procesos administrativos dibujados, por ejemplo autorización escalonada de solicitudes, edición completa de grados y distinciones, recuperación de contraseña y configuración persistente de paneles.

El repositorio central lee el estado del conjunto de tablas por transacción. Es una implementación verificable del contrato para este tamaño de proyecto, con exclusión de escrituras concurrentes. Su coste y rendimiento deben medirse antes de usarla con cargas institucionales. No se afirma haber probado 114 usuarios concurrentes ni rendimiento en la nube.
