tweet2md es una extensión de Chrome de código abierto que convierte contenido de x.com en Markdown listo para producción para investigación, toma de notas, flujos de trabajo de IA y archivado offline.

¿Qué hay de nuevo?

Consulta las últimas actualizaciones y lanzamientos:
https://github.com/zendegani/tweet2md/blob/main/CHANGELOG.md

Características principales:

- Tres formas de activación: popup de la barra de herramientas, botón inline en la barra de acciones de cada tweet o menú contextual con clic derecho (Guardar / Copiar como Markdown / Añadir a Obsidian)
- Copia Markdown al portapapeles, descárgalo como archivo o envíalo a Obsidian
- Botón "Añadir a Obsidian" con un clic: abre Obsidian mediante el esquema obsidian:// con el Markdown renderizado ya rellenado; nombre de vault opcional para apuntar a un vault específico
- Subcarpeta opcional del vault para la integración con Obsidian: crea las notas dentro de una carpeta específica (ej. Tweets o Inbox/Tweets) — déjala vacía para usar la raíz del vault
- Frontmatter compatible con Obsidian (opcional): autor [[@handle]] con wikilinks para backlinks instantáneos, título generado, separación entre fecha de publicación y creación, fragmento descriptivo y array de etiquetas, además de todos los metadatos de interacción existentes para consultas Dataview
- Captura tarjetas de enlaces de tweets: título, dominio de origen e imagen Open Graph
- Compatibilidad completa con artículos largos de X (antes Notes), incluyendo encabezados, listas y bloques de código
- Extrae tweets, hilos anidados y tweets citados en Markdown limpio
- Exporta solo un tweet sin su hilo — desde el menú contextual o con Shift/Alt-clic en el botón inline
- Conserva la estructura y el contexto de publicaciones citadas, incluyendo el nombre y handle del autor original
- Popup de múltiples vistas: las acciones principales permanecen visibles y las preferencias se encuentran en un panel de Configuración detrás de un icono de engranaje
- Muestra u oculta el botón inline mediante un interruptor si entra en conflicto con otra extensión
- El botón inline puede configurarse para copiar al portapapeles en lugar de descargar
- Cierre automático opcional de pestañas nuevas abiertas mediante el botón inline o menú contextual después de exportar
- Descarga medios incrustados de X localmente junto al archivo md para evitar enlaces rotos
- Subcarpeta opcional de Descargas: los archivos Markdown y las imágenes se guardan en una subcarpeta elegida en lugar de mezclarse con el resto de Descargas
- Plantilla de nombre de archivo personalizable: arma el nombre del archivo exportado con marcadores como {date}, {datetime}, {handle}, {author}, {id}, {slug} y {type}, con vista previa en directo en los ajustes — déjalo en blanco para mantener el formato por defecto
- YAML frontmatter enriquecido con autor, handle, fecha, URL fuente, tipo de contenido y estadísticas de interacción (likes, reposts, respuestas, marcadores, vistas)
- Fila opcional de interacciones estilo X directamente en el cuerpo Markdown (likes, reposts, respuestas, marcadores, vistas), configurable independientemente del YAML frontmatter
- Expande automáticamente publicaciones truncadas y elimina botones de interacción, sugerencias de seguimiento y rastreadores
- Interfaz multilingüe: inglés, español, alemán, francés, japonés, portugués (Brasil), chino simplificado, árabe y persa. La extracción de contenido funciona en cualquier idioma independientemente de la traducción de la interfaz
- Popup en modo claro y oscuro, adaptado a las preferencias del sistema

Ideal para:

- Importar contenido de X en Obsidian, Notion, Logseq, Hugo o cualquier sistema PKM basado en Markdown
- Exportar texto limpio para prompts LLM, pipelines RAG o flujos de trabajo de entrenamiento de IA
- Archivar offline hilos de investigación, referencias de noticias y artículos largos
- Construir un Second Brain buscable a partir de tu actividad en Twitter/X
- Preparar material fuente para escritura, traducción o resúmenes

Por qué usarlo:

- Flujo de trabajo de un clic desde cualquier tweet, hilo o artículo mediante popup, icono inline o menú contextual
- Integración de primera clase con Obsidian: pulsa "Añadir a Obsidian" y la nota aparece en tu vault sin plugins ni sincronización
- Salida Markdown limpia y bien estructurada, fácil de editar e indexar
- Archivado local de imágenes para evitar enlaces rotos
- Arquitectura sin API: funciona directamente en el navegador sin claves API ni cuentas
- Todo se procesa localmente en tu dispositivo. Sin analíticas, sin seguimiento y sin transmisión de datos.

Limitaciones actuales:

- Enfocado en la extracción de contenido de x.com
- Los videos y GIFs no se exportan como archivos multimedia reproducibles
- Requiere recargar la página si la extensión fue instalada o actualizada después de abrir la pestaña. Esto evita fallos silenciosos y garantiza una extracción fiable.
- Parte del contenido puede dejar de funcionar si x.com cambia significativamente su estructura

Este es un proyecto de código abierto.
tweet2md es una herramienta independiente y no está afiliada a X ni x.com.
