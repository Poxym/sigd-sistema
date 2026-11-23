# Modelado de la base de datos SIGD

La entrega corregida es `SIGD_Modelado_BD_CORREGIDO_v2.pdf`. También se actualizó `SIGD_Modelado_BD.pdf`, para que el nombre original abra el resultado corregido. El PDF conserva texto y conexiones vectoriales.

El archivo contiene una vista conceptual del negocio y catorce láminas del modelo relacional. El conjunto cubre las 58 tablas y las 90 claves foráneas de `schema.json`. La separación en láminas permite mantener el texto de los campos a tamaño legible. Las tablas grises son referencias a entidades definidas en otra lámina; una autorreferencia se dibuja como una referencia adicional a la misma tabla, para evitar bucles que atraviesen otras entidades.

`SIGD_Relacional_CORREGIDO_v2.pdf` contiene solamente las láminas relacionales. `ABRIR_MODELO.html` permite cambiar de lámina, ajustar el ancho y consultar a tamaño real. `SIGD_relacional.drawio` permite editar las tablas y relaciones en quince pestañas. En `laminas/` están los SVG vectoriales y las fuentes DOT de cada vista.

Las conexiones unen la PK `id` de la tabla padre con la fila de la FK en la tabla hija. `1`, `0..1` y `0..N` expresan cardinalidad; `?` indica que la FK o atributo admite NULL. `UQ` identifica restricciones de unicidad. Las relaciones N:M se resuelven mediante tablas puente. Las restricciones temporales y reglas que no caben en una cardinalidad se aplican en SQL o en el servicio de dominio.

El periodo académico es compartido por todos los módulos. El semestre de un plan de estudio es otra entidad y no sustituye al periodo. Carrera pertenece a un campus; las adscripciones docentes conservan historial. El número de empleado es modificable y no es la identidad del docente.

Los catálogos publicados y las versiones enviadas son inmutables. Cada documento conserva su catálogo y el informe referencia la versión aprobada de su plan. Las evidencias guardan metadatos y una ruta; los archivos se almacenan fuera de las tablas.

Los identificadores se representan como cadenas estables en ambas implementaciones. Esto sigue la versión `SIGD_Diagrama_general_3.pdf` que el grupo indicó como base el 22/11. El chat también contiene una propuesta anterior de IDs enteros: se documenta como discrepancia y no como un acuerdo simultáneo. `auth_uid` distingue la identidad de Firebase Auth del ID de negocio.

La carga nominal y un máximo obligatorio son políticas distintas. La semilla usa 40 horas nominales como ejemplo; el bloqueo de un máximo debe activarse como política institucional. No se usa la expresión estricta `< 40` de un diagrama anterior como si fuera un requisito confirmado.

Verificación realizada: cobertura de todas las tablas y FK contra el esquema; comprobación de solapes de tablas; renderización del PDF final a quince imágenes y revisión visual individual. Las capturas y los resultados se conservan en `AUDITORIA/pdf-final-v2/` y `AUDITORIA/diagramas-v2/` en el espacio de trabajo.
