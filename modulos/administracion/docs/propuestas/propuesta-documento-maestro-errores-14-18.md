# Propuesta de cambio al Documento maestro · errores 14 a 18 corregidos

**Módulo:** Administración del sistema (Nexora Technologies)
**Fecha:** 21 de noviembre de 2026
**Estado:** **aprobada** por el usuario el 21 de noviembre de 2026 (los 5 cambios) y **aplicada** a la copia `docs/Documento_Maestro_Proyecto_Plan_Informe.md`.

**Por qué:** los errores 14 a 18 de la sección 10 se corrigieron, cada uno en su rama, con prueba de sabotaje y `npm test` en verde (PR #74, #75, #77, #78 y #80). Solo cambia la columna «Estado» de esas cinco filas.

Cada cambio se aprueba por separado (tabla al final).

---

## Cambio 1 · Fila 14 («Valor: — horas»)

**Estado actual:** Abierto

**Estado propuesto:**
> **Corregido** (PR #74): sin valor se muestra solo «—», sin unidad

---

## Cambio 2 · Fila 15 (foco con Enter en la lista de tipos)

**Estado actual:** Abierto

**Estado propuesto:**
> **Corregido** (PR #75): después de elegir un tipo con Enter, el foco vuelve al tipo elegido

---

## Cambio 3 · Fila 16 (campo vacío `groupCustom`)

**Estado actual:** Abierto, sin impacto para el usuario

**Estado propuesto:**
> **Corregido** (PR #77): ese campo ya no se guarda, ni al dar de alta ni al editar

---

## Cambio 4 · Fila 17 (estado «Cerrado» con el formulario forzado)

**Estado actual:** Abierto, solo con el formulario forzado

**Estado propuesto:**
> **Corregido** (PR #78): aviso «Selecciona un estado válido», el mismo de Usuarios (fila 11); se acepta el estado que el registro ya tenía

---

## Cambio 5 · Fila 18 (Solicitudes con el formulario forzado)

**Estado actual:** Abierto, solo con el formulario forzado

**Estado propuesto:**
> **Corregido** (PR #80): avisos «Selecciona una acción válida» (si no es una de las 6 acciones del diálogo) y «Solo una solicitud programada para el siguiente ciclo lleva fecha de vigencia»

**Motivo de los textos:** los dos avisos de la fila 18 **no venían en ningún documento**. Se redactaron con el estilo de los que ya existían. Si el equipo o el cliente prefieren otra redacción, se cambia.

---

## Decisiones

| Cambio | Sección | Tipo | Decisión |
|---|---|---|---|
| 1 | 10 · fila 14 | Actualizar estado | ☑ Aprobado (21-nov-2026) |
| 2 | 10 · fila 15 | Actualizar estado | ☑ Aprobado (21-nov-2026) |
| 3 | 10 · fila 16 | Actualizar estado | ☑ Aprobado (21-nov-2026) |
| 4 | 10 · fila 17 | Actualizar estado | ☑ Aprobado (21-nov-2026) |
| 5 | 10 · fila 18 | Actualizar estado | ☑ Aprobado (21-nov-2026) |
