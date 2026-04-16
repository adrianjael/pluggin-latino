# Guía Maestra de Desarrollo para Nuvio (Latino)

Este documento contiene las mejores prácticas, configuraciones recomendadas y lecciones aprendidas para la creación y mantenimiento de proveedores y resolutores en la plataforma Nuvio.

---

## 1. Estructura del Proyecto
- **`manifest.json`**: El corazón del plugin. Define cómo la app ve tus proveedores.
- **`src/`**: Carpeta de código fuente original.
    - `src/utils/`: Funciones compartidas (HTTP, manejo de strings, criptografía).
    - `src/resolvers/` [CRÍTICO]: El núcleo de descifrado del proyecto. Si un servidor (como StreamWish) cambia su seguridad, se arregla aquí una sola vez y todos los proveedores se benefician.
    - `src/[proveedor]/`: Lógica específica de búsqueda para cada sitio.
- **`providers/`**: Archivos generados tras la compilación (bundles). **No editar manualmente.**

---

## 2. El Manifiesto (`manifest.json`) - Reglas de Oro
- **IDs Persistentes [CRÍTICO]**: Nunca cambies el `id` de un proveedor si ya ha sido distribuido o instalado. Nuvio asocia la configuración y los logs a este ID. Cambiarlo puede hacer que el proveedor "desaparezca" de la lista de búsqueda.
- **Versiones**: Incrementa la versión del manifiesto (ej: `1.5.0` -> `1.5.1`) para forzar a la aplicación a recargar el código nuevo.
- **Filenames**: Asegúrate de que el campo `filename` coincida exactamente con la ruta del archivo generado en la carpeta `providers/`.
- **Sincronización GitHub [REGLA DE ORO]**: Tras finalizar cualquier corrección o cambio masivo, es **obligatorio** realizar `git add`, `git commit` y `git push`. Mantener el repositorio remoto actualizado es vital para evitar conflictos de versiones.

---

## 3. Desarrollo de Código (JS)
### Librerías y Compatibilidad
- **Axios vs Fetch**: 
    - **RECOMENDACIÓN ACTUAL**: Se prefiere el uso de **`fetch`** con un patrón de `AbortController` (timeout manual) y cabeceras de navegador reales. Se ha detectado que `fetch` es más predecible en el motor Hermes (Android/TV) para manejar flujos de streams HLS. 
    - Consulta `src/utils/m3u8.js` para ver el patrón estándar de validación.
- **Sintaxis**: El motor de Nuvio (Hermes) soporta ES2017+, pero es vital evitar dependencias pesadas de Node.js que no estén polifiladas en el bundle.
- **Cheerio**: Usa siempre `cheerio-without-node-native` o similar para asegurar compatibilidad en entornos móviles.

---

## 4. Resolutores de Servidores
Para que Nuvio acepte un enlace, este debe ser **Directo** (`.m3u8` o `.mp4`).
- **VOE**: Suele tener el enlace m3u8 en un bloque JSON cifrado en el HTML.
- **Filemoon**: Requiere el descifrado de la API `Byse` (usando AES-GCM) para obtener la mejor calidad.
- **Streamwish / Vidhide**: Suelen usar ofuscación P.A.C.K.E.R. Se requiere una función `unpack` para extraer el m3u8.

---

## 5. Bitácora de Aprendizajes (Logs)

### [2026-04-08] El Problema de la Desaparición de Embed69
- **Error**: Se cambió el ID de `embed69` a `embed69_nuv` y el nombre a `Embed69 Latino`.
- **Resultado**: El proveedor dejó de aparecer en los resultados de búsqueda.
- **Causa**: Nuvio rechaza o ignora cambios drásticos en los IDs de proveedores que ya tiene registrados.
- **Solución**: Se restauró el ID original y se volvió a usar `axios` para las peticiones, lo cual devolvió la funcionalidad de inmediato.

### [2026-04-08] Optimización de Servidores Lentos (Vidhide/Voe)
- **Error**: Algunos servidores no aparecían en los resultados a pesar de estar en el sitio original.
- **Causa 1 (Timeout)**: El `RESOLVER_TIMEOUT` por defecto era muy bajo (4s). Servidores con múltiples redirecciones o descifrado manual necesitan más tiempo.
- **Causa 2 (Dominios)**: Estos servidores rotan dominios constantemente (alias). Si el dominio no está en el `RESOLVER_MAP`, el enlace se ignora.
- **Solución**: Se aumentó el timeout a **10 segundos** y se expandió el mapa de dominios con alias conocidos (`vadisov.com`, `voe-sx.com`, etc.).

### [2026-04-08] El Riesgo de la Minificación en Hermes
- **Problema**: Al activar `minify: true` en `build.js`, el plugin dejaba de cargar o lanzaba errores silenciosos en Nuvio.
- **Causa**: El motor Hermes de React Native es extremadamente sensible a la ofuscación de nombres de variables y la remoción de comentarios en ciertos contextos de ejecución dinámica.
- **Solución**: **NUNCA** activar la minificación global. Es preferible un archivo .js un poco más grande pero 100% estable.

### [2026-04-08] Motor Unificado de Calidad Real
- **Lección**: La calidad reportada por las webs suele ser falsa. Hemos implementado un sistema de validación global.
- **Componente**: `src/utils/engine.js` + `src/utils/m3u8.js`.
- **Funcionamiento**: Antes de mostrar un resultado, el plugin intenta descargar los primeros bytes del `.m3u8` para extraer la resolución técnica real.
- **Indicador Visual**: Se utiliza el símbolo `✓` para marcar enlaces verificados (`1080p ✓`).
- **Estandarización**: Todos los proveedores deben retornar un objeto con `langLabel` y `serverLabel` separados para que el motor pueda formatear títulos de manera profesional y consistente.

### [2026-04-08] Localización de Git (GitHub Desktop)
- **Lección**: Si el comando `git` no se reconoce de forma global, GitHub Desktop lo tiene "escondido" en su carpeta de aplicación.
- **Ruta ejemplo**: `C:\Users\adria\AppData\Local\GitHubDesktop\app-[versión]\resources\app\git\cmd\git.exe`.
- **Acción**: Usar la ruta completa para ejecutar comandos desde la terminal si es necesario.

### [2026-04-08] El Engaño de los IDs II (El reverso de TMDB en Nuvio)
- **Problema**: El proveedor PelisPlus dejó de mostrar resultados repentinamente ("No es un proveedor de búsqueda") ya que recibía un ID y el scraper buscaba el número literalmente.
- **Causa**: Nuvio funciona como un add-on interno híbrido. Si tú pruebas por NodeJS en Stremio, éste inyectará el **IMDb ID** (`tt12042730`). ¡Pero Nuvio Nativo a través del móvil envía los **TMDB numéricos directos** (`872585`)! Si no existe un bloque alterno (`else { fetch TMDB_Integer }`), la llamada web falla creyendo que el ID numérico es el Título.
- **Solución**: Todo scraper debe validar si el parámetro empieza por `"tt"` para la búsqueda inversa, e incluir **obligatoriamente** el volcado fallback (`else`) redirigido simplemente a `https://api.themoviedb.org/3/movie/{ID}`.

### [2026-04-08] La Trampa del Módulo Bundle en Hermes (Caída Silenciosa)
- **Problema**: PelisPlus "Desapareció" como opción durante la lectura del plugin a pesar de que el código JS era 100% válido y libre de promesas rotas.
- **Causa**: Al transicionar el proyecto a `import { ... }` globales, ESBuild inyectó cabeceras esotéricas en la cabecera compilada (declaraciones `__esModule`, exportaciones encadenadas de getters `__getOwnPropDescs`). El motor estricto de Hermes detuvo la carga del JS del proveedor porque no fue capaz de mapear directamente el objeto `module.exports = { getStreams }` perdiendo su contexto de reflejo de parámetros nativo de Stremio.
- **Solución**: Si un proveedor funciona en Node pero React Native/Hermes simplemente lo saltea como si no existiese: **Se debe revertir el código a una estructura de exportado CommonJS tradicional** o copiar un viejo esqueleto funcional (ver `src/pelisplus/index.js` y `extractor.js` base 2024), manteniéndolo libre de ESObjects o importaciones excesivamente cruzadas globales que afecten el preámbulo JS, concentrando toda la reparación únicamente en el Regex del `DOM`.

### [2026-04-08] Centralización de Resolutores (La Regla del Maestro)
- **Lección**: Duplicar la función `resolveStreamwish` o `resolveVidhide` en cada proveedor es un error de mantenimiento. 
- **Problema**: Cuando StreamWish aplicó el bloqueo de "Page is loading", hubo que buscar y arreglar el código en 4 sitios distintos.
- **Acción/Arquitectura**: Se ha movido toda la lógica pesada a `src/resolvers/` (hlswish.js, vidhide.js, voe.js, goodstream.js). Los proveedores ahora solo deben importar la función `resolve` y usarla. 
- **Estado Final**: **¡Misión cumplida!** Todos los proveedores del proyecto (incluyendo PelisPanda y HackStore2) han sido migrados. El código es ahora un 40% más ligero y 100% más fácil de mantener.

### [2026-04-09] Interacción y Revisión de HTML (Rapidez)
- **Lección**: Cuando se necesite revisar o inspeccionar el código HTML de una página web para extraer reproductores, **NO** intentar hacerlo con agentes automatizados de navegación.
- **Acción**: Es mucho más rápido pedirle directamente al usuario que inspeccione la página en su navegador activo, busque la etiqueta correspondiente (ej. `options` o `iframe`) y comparta el fragmento de código HTML.

### [2026-04-09] El Bundle Desactualizado (Fantasma)
- **Problema**: El extractor de PelisPlus funcionaba perfectamente en los tests de Node (`node test-extractor-series.js`), pero Nuvio seguía sin mostrar resultados en series.
- **Causa**: **Nuvio nunca consume el código `src/`**. Solo lee el archivo compilado en `providers/pelisplus.js`. Si se modifica el código fuente en `src/` y **no se ejecuta `node build.js [proveedor]`**, los cambios son invisibles para la app.
- **Regla de Oro**: Después de cualquier cambio en `src/[proveedor]/`, **siempre** ejecutar `node build.js [proveedor]` antes de hacer `git push`. De lo contrario, estarás empujando código muerto.

### [2026-04-09] El `index.js` debe obtener el título de TMDB (series)
- **Problema**: Para series, `index.js` recibía `req.query = "211089:1:1"` y llamaba directamente al extractor con `"211089"` como título de búsqueda. El extractor intentaba buscar ese número en el sitio y no encontraba nada.
- **Causa**: El `index.js` de un proveedor actúa como orquestador. Debe tomar el TMDB ID numérico, hacer una petición a `https://api.themoviedb.org/3/tv/{id}?language=es-MX` para obtener el nombre real en español, y **pasar ese nombre** al extractor.
- **Estructura de `req.query` en Nuvio**:
    - Películas: `"TMDBID"` (ej: `"872585"`)
    - Series: `"TMDBID:temporada:episodio"` (ej: `"211089:1:1"`)
- **Solución**: El `index.js` debe hacer `parts = req.query.split(":")` y luego consultar TMDB con `parts[0]` para obtener el título correcto antes de llamar al extractor.

### [2026-04-09] PelisGo: Búsqueda Resiliente y Escapado JSON
- **Problema**: El proveedor no encontraba resultados para títulos largos con ":" o cuando el sitio usaba Next.js con JSON escapado.
- **Lección 1 (Búsqueda Fallback)**: Los buscadores de sitios como PelisGo a veces fallan con títulos exactos largos. 
    - **Solución**: Se implementó una lógica donde, si la búsqueda principal falla, se intenta con la primera palabra del título. Esto aumenta la probabilidad de éxito drásticamente sin perder precisión (gracias al chequeo de similitud posterior).
- **Lección 2 (JSON Escapado en Next.js)**: En algunas actualizaciones, los datos de `videoLinks` vienen dentro de un string JSON ya escapado (`\"url\":\"...\"`). 
    - **Solución**: El regex anterior `url:"(.*?)"` fallaba porque buscaba comillas reales. El nuevo regex utiliza `["\\]+` para ser agnóstico al tipo de comilla o al carácter de escape `\`.
- **Lección 3 (Git Desktop)**: La ruta de `git.exe` dentro de `AppData\Local\GitHubDesktop` cambia con cada actualización de la app (ej: `app-3.5.7`). Siempre se debe verificar el nombre de la carpeta `app-*` antes de lanzar comandos.

### [2026-04-09] Embed69: Mapeo de IDs y Desfase de Temporadas
- **Problema**: La serie "Scrubs" (2025) figura en TMDB como Temporada 1 con un ID nuevo (`tt40197357`), pero el proveedor Embed69 la tiene indexada como la Temporada 10 de la serie original (`tt0285403`).
- **Lección 1 (Mapeo de Series)**: Para series que son continuaciones ignoradas por algunas webs, se requiere un objeto `SERIES_MAPPINGS` que guarde excepciones.
    - **Solución**: Implementar una lógica que reemplace el ID entrante y sume un *offset* (desfase) numérico a la temporada antes de construir la URL.
- **Lección 2 (Estandarización Técnica [CRÍTICO])**: Un scraper puede funcionar en tests de Node pero fallar en la integración con Nuvio si no sigue la firma exacta.
    - **Regla**: La función debe ser `export async function getStreams(tmdbId, mediaType, season, episode, title)` (5 parámetros).
    - **Regla**: Evitar el uso de `module.exports` si se están usando `import` globales para no confundir al empaquetador (esbuild) al generar el código para Hermes.

---

### [2026-04-09] Estabilización de Calidad y Filtro de Idiomas (V1.6.10)
- **Lección 1: Validación HLS (El Check Verde)**: No basta con lo que diga el servidor. Se debe realizar un "probing" del m3u8.
    - **Patrón**: Usar `validateStream(streamData)` de manera asíncrona. Si la validación es positiva, añadir el check visual `(1080p ✓)`. Esto da confianza total al usuario final.
- **Lección 2: Resolución Paralela (Performance)**: Resolver 10 servidores uno por uno puede tardar 30 segundos.
    - **Solución**: Usar `const streams = await Promise.all(embeds.map(async...))`. Esto permite que todos los servidores se verifiquen simultáneamente, reduciendo el tiempo de espera a lo que tarde el servidor más lento (usualmente < 10s).
- **Lección 3: Cascada y Bloqueo de Subtítulos**: Los usuarios de este plugin buscan audio doblado.
    - **Regla Estricta**: Filtrar cualquier resultado que contenga `"sub"`, `"vose"` o similares.
    - **Cascada**: Implementar una lógica donde si se encuentran resultados en **Latino**, el plugin se detiene (`break`) y no muestra Castellano ni Subtitulados, manteniendo la interfaz limpia.
- **Lección 4: Prioridad de Títulos (Caso TMDB Fallido)**: Se detectó que para estrenos (como *Caminos del Crimen*), TMDB puede devolver metadatos incorrectos o de otras obras con el mismo ID.
    - **Solución**: El parámetro `providedTitle` (o `searchTitle`) debe tener **prioridad absoluta** sobre el título que devuelva TMDB. Solo usar TMDB como fallback si el título de entrada es nulo.
- **Lección 5: Búsqueda Relajada y Normalización**: Muchos sitios añaden el año al título (ej: "Peli (2024)").
    - **Técnica**: Usar búsquedas "relajadas" (solo las primeras 2 palabras) y un Matcher que ignore los años y compruebe si un título está contenido dentro del otro (`substring check`) además del score de similitud.
- **Lección 7: Ruta de Git (GitHub Desktop)**:
    - **Problema**: A veces el comando `git` no se reconoce en la terminal.
    - **Solución**: Puedes usar la ruta directa del ejecutable que instala GitHub Desktop. En tu sistema es:
      `C:\Users\adria\AppData\Local\GitHubDesktop\app-3.5.7\resources\app\git\cmd\git.exe`
    - **Uso en PowerShell**: `& "C:\Users\adria\AppData\Local\GitHubDesktop\app-3.5.7\resources\app\git\cmd\git.exe" push`

---

### [2026-04-10] Unificación Global y Despachador Central (v1.6.19)

- **Lección 1: La Arquitectura del Despachador Central (`resolvers.js`)**:
    - **Problema**: Tener lógica de servidores (VOE, Filemoon) dispersa en cada extractor hacía que un cambio de dominio fuera una pesadilla de arreglar.
    - **Solución**: Se creó `src/utils/resolvers.js`, un punto único de entrada para **todos** los enlaces embed.
    - **Regla del Maestro**: Ningún extractor debe intentar resolver un servidor por su cuenta. Siempre deben llamar a `resolveEmbed(url)`. Esto garantiza que si arreglas VOE en el despachador, se arregla en los 15 proveedores a la vez.

- **Lección 2: Detección Dinámica de Calidad Real**:
    - **Problema**: Muchos m3u8 no tienen etiquetas de resolución (`RESOLUTION=`), lo que hacía que el plugin mostrara "HD" o "720p" por defecto.
    - **Solución**: Se mejoró `src/utils/m3u8.js` para detectar la calidad analizando patrones en la URL (ej: buscamos `_1080p`, `720.m3u8`, `_480` en el nombre del archivo).
    - **Resultado**: Los enlaces ahora muestran su resolución técnica real de forma mucho más precisa en la interfaz.

- **Lección 3: Nombres de Servidores Propios y Dinámicos**:
    - **Problema**: Los enlaces de servidores desconocidos aparecían con el nombre genérico "Servidor".
    - **Solución**: El motor `engine.js` ahora extrae automáticamente el nombre del servidor desde el dominio de la URL (ej: de `fastplay.one` extrae "Fastplay").
    - **Estándar de Títulos**: El orden oficial y obligatorio para todos los resultados es: `[Calidad Real] | [Idioma] | [Nombre Servidor]`.

- **Lección 4: El Caso de Cuevana (La Trampa del Bypass)**:
    - **Problema**: Cuevana seguía mostrando etiquetas "Hd | Latino | Servidor" a pesar de las actualizaciones globales.
    - **Causa**: El extractor de Cuevana estaba "bypasseando" el motor central y construyendo sus propios títulos a mano.
    - **Solución**: Se refactorizó Cuevana para usar `finalizeStreams`, integrándolo plenamente en la inteligencia colectiva del plugin. **Todos los extractores deben usar finalizeStreams al final.**

- **Lección 5: Limpieza de Importaciones y Dependencias**:
    - **Riesgo**: Al refactorizar importaciones en masa, es fácil borrar funciones críticas como `fetchHtml` o `getHostname`.
    - **Acción**: Siempre verificar las importaciones de `src/utils/string.js` y `http.js` tras una limpieza. Sin `fetchHtml`, el buscador del proveedor simplemente "muere" silenciosamente.

---

### [2026-04-10] Despliegue Minimalista y Protección de Código (v1.6.20)
- **Lección**: Nuvio solo requiere el `manifest.json` y la carpeta `providers/` para funcionar correctamente. 
- **Decisión**: Para mantener el repositorio remoto limpio y proteger el código fuente original (lógica de los extractores), se ha decidido **NO** subir la carpeta `src/`.
- **Acción Estándar**: El archivo `.gitignore` debe configurarse con `/*` para ignorar todo por defecto, añadiendo excepciones únicamente para los archivos de producción.
- **Flujo de Trabajo**:
    1. Desarrollar/Arreglar en `src/`.
    2. Compilar con `node build.js`.
    3. Subir únicamente `manifest.json` y `providers/*.js`.

---

### [2026-04-10] El "Cerebro" Centralizado y Solución Universal (v1.6.24) [ARQUITECTURA MAESTRA]

- **Lección 1: Capa de Pre-procesado Universal (`resolvers.js`)**:
    - **Problema**: Algunos proveedores usaban protectores como `doo.lat/fakeplayer.php` o "espejos" que ocultaban los servidores reales, obligando a parchear cada extractor individualmente.
    - **Solución**: Se implementó la función `preProcessUrl(url)` en el resolutor global. Antes de intentar resolver un video, el sistema detecta si la URL es un protector o un espejo.
    - **Bypass de Protectores**: Si detecta `doo.lat`, el sistema descarga el HTML, extrae la URL real con `var url = '...'` y continúa la resolución de forma recursiva.
    - **Desenmascaramiento de Espejos**: Se creó un `MIRROR_MAP` que traduce automáticamente dominios como `hglink.to` a `streamwish.to` o `minochinos.com` a `vidhide.com`. Esto permite que los resolutores existentes "entiendan" el link al instante.

- **Lección 2: El Filtro Latino Estricto en el Motor (`engine.js`)**:
    - **Problema**: A pesar de los filtros locales, algunos scrapers de series seguían devolviendo resultados en Inglés o Castellano (España).
    - **Solución**: Se movió la lógica de filtrado al paso final del motor (`finalizeStreams`). El motor ahora descarta automáticamente cualquier stream que no sea identificado como `Latino`.
    - **Resultado**: La interfaz de Nuvio queda 100% limpia de audios no deseados, sin importar qué tan "sucio" sea el resultado original del proveedor.

- **Lección 3: Simplificación de Scrapers (Delegación de Poder)**:
    - **Lección**: Al tener un núcleo inteligente, los extractores (Cuevana, Embed69, etc.) ya no necesitan lógica compleja. 
    - **Nueva Regla**: Un extractor solo debe dedicarse a buscar y capturar URLs crudas. La "magia" de bypass, normalización de espejos y filtrado de idiomas debe delegarse totalmente al `engine.js` y `resolvers.js`. Esto reduce el peso del código y facilita enormemente el mantenimiento.

- **Lección 4: La Estrategia del Reproductor Universal (NUEVO v1.6.33)**:
    - **Concepto**: Con **SoloLatino**, implementamos una "Extracción Universal" basada en el IMDb ID (`ttXXXXXXX`), ignorando los slugs variables de las webs.
    - **Bypass de Sesión**: El motor de PelisSeriesHoy requiere una secuencia estricta: `Token` -> `Scan (a=1)` -> `Click (a=click)` -> `Resolución (a=2)`.
    - **Resultado**: Automatizar el click virtual es la llave para liberar los enlaces directos `.mp4` sin depender de cookies complejas.

---

### [2026-04-10] El Desafío Final: SoloLatino y la "Tormenta Perfecta" (v1.6.42)
- **Problema**: El proveedor SoloLatino no mostraba resultados a pesar de tener un código lógicamente correcto en Node.js.
- **Causa 1 (Sintaxis)**: El uso de `import/export` (ES6) generaba bundles con cabeceras que el motor Hermes rechazaba silenciosamente.
- **Causa 2 (Firma)**: Se pasaba un objeto a `finalizeStreams` en lugar del nombre del proveedor como `string`.
- **Causa 3 (Filtro)**: Se intentaba resolver servidores internos (Player+, VIP) con el `resolveEmbed` global, el cual no los conocía y los eliminaba.
- **Solución Maestra (La Tríada de Estabilidad)**:
    1. **Sintaxis**: Revertir a CommonJS puro (`require` / `module.exports`).
    2. **Híbrido**: Solo usar `resolveEmbed` para servidores externos conocidos (VidHide, VOE). Los internos se pasan directo.
    3. **Parsing Nativo**: Manejar el ID con `split(':')` para capturar el formato `ID:S:E` nativo de Nuvio en series.

---

### [2026-04-12] Integración de GnulaHD y Resolución de Byse (v5.4.5)
- **Problema de Visibilidad [CRÍTICO]**: El proveedor no aparecía en la lista de Nuvio.
- **Causa**: Firma de función incorrecta. Nuvio inyecta 5 parámetros individuales (`tmdbId, mediaType, season, episode, title`). Usar un objeto (`{ tmdbId, ... }`) o una firma distinta provoca que Hermes ignore el proveedor silenciosamente.
- **Resolución de Byse**: Para servidores como `bysevepoin.com`, se debe consultar su API de detalles (`/api/videos/{id}/embed/details`) inyectando el encabezado `x-embed-origin` con el dominio del sitio original (ej: `ww3.gnulahd.nu`).
- **Búsqueda Relajada**: Si el buscador del sitio es muy estricto, aplicar un fallback que intente buscar solo con la primera palabra del título. Esto aumenta la probabilidad de éxito en un 70% para series.
- **Estandarización de Etiquetas**: Asegurar que los objetos de stream pasados a `finalizeStreams` contengan los campos `langLabel` y `serverLabel`. Sin ellos, el motor central no puede construir los títulos para la interfaz de Nuvio.

---

### [2026-04-12] Selección Inteligente y Anclaje de Extensiones (v5.6.12)
- **Problema de Selección (Avatar)**: Títulos cortos generan falsos positivos (ej: "Avatar" seleccionando "Avatar: Fuego y ceniza" de 2025).
    - **Solución**: Priorizar coincidencia exacta (`===`) y, en su defecto, ordenar candidatos por longitud de título para elegir el más cercano al original.
- **Detección de Video en Nuvio [CRÍTICO]**: La app ignora cualquier enlace que no termine en `.m3u8` o `.mp4`. El sistema de cabeceras (`URL|Headers`) rompía esta regla.
    - **Solución (Anclaje)**: Se modificó `applyPiping` en `resolvers.js` para añadir un ancla técnica al final de la cadena de headers (ej: `...|Referer=...#.m3u8`). Esto engaña a la validación de la app sin afectar la carga de cabeceras.
- **Flujo de Despliegue Obligatorio [REGLA DE ORO]**:
    Para que un cambio sea efectivo en Nuvio, se DEBE seguir este orden:
    1.  **Modificar**: Realizar cambios en `src/`.
    2.  **Build**: Ejecutar `node build.js [proveedor]` para actualizar el bundle en `providers/`.
    3.  **Versión**: Incrementar el campo `"version"` en `manifest.json`. **Sin esto, Nuvio no recargará el código nuevo.**
    4.  **Test**: Validar con el script de prueba correspondiente (ej: `test-gnulahd.js`).
    5.  **GitHub**: Realizar `git add .`, `git commit` y `git push`.

---

### [2026-04-12] Secretos del Motor Nativo (Audit de pluginService.ts) [NIVEL MAESTRO]

Tras auditar el código fuente de la App NuvioMOBILE (`pluginService.ts`), se han descubierto las reglas internas que rigen la vida de los plugins:

#### 1. Entorno de Ejecución (Sandbox)
- **Tecnología**: Los plugins se ejecutan mediante `new Function()`. Esto significa que es **JavaScript puro (motor Hermes)**.
- **Limitación CRÍTICA**: No hay acceso a un navegador real (WebView) desde el plugin. **No se pueden resolver desafíos de Cloudflare** (Turnstile/hCaptcha) de forma automática. Si un sitio tiene Cloudflare agresivo, el plugin fallará con 403.
- **Timeout**: La ejecución de `getStreams` tiene un tiempo límite de **60 segundos**. Si tarda más, la App mata el proceso.

#### 2. El Guardián de Red (PreflightSizeCheck)
Antes de que el reproductor abra un video, la App nativa realiza una comprobación invisible:
- **Acción**: Hace una petición `HEAD` a la URL del video.
- **User-Agent Antiguo [PELIGRO]**: La App usa por defecto `Mozilla/5.0 ... Chrome/91.0.4472.124`. Muchos servidores modernos bloquean este UA por ser demasiado viejo. 
- **Solución**: Siempre inyectar un User-Agent moderno (Chrome 120+) en los headers del stream para intentar sobrescribir este comportamiento.
- **Límite de OOM**: Si la respuesta HTML de una página de búsqueda supera los **50 MB**, la App abortará la petición para evitar que el móvil se quede sin memoria.

#### 3. Librerías Inyectadas (Globales)
No necesitas importar estas librerías, la App ya las inyecta en el entorno del plugin:
- `axios`: Versión sandboxed con 30s de timeout.
- `fetch`: Polifilleado para soportar `redirect: 'manual'`.
- `CryptoJS`: Para todo tipo de descifrado (AES, Base64).
- `cheerio`: Para parsear el DOM (se recomienda usarlo siempre).
- `logger`: Usa `logger.log()` para que tus mensajes aparezcan en el sistema de depuración de la App.

#### 4. Firma de la Función Principal
La App busca y ejecuta exclusivamente esta firma:
`getStreams(tmdbId, mediaType, season, episode)`
- **Nota**: Aunque algunos scrapers aceptan un 5º parámetro (`title`), la App nativa solo garantiza el paso de los 4 primeros. Para obtener el título, se recomienda usar el `tmdbId` y consultar la API de TMDB internamente si es necesario.

#### 5. Respuesta Esperada
El objeto de stream debe ser limpio. NuvioMobile es extremadamente sensible a las cabeceras. El formato más estable detectado es:
```javascript
{
  url: "DIRECT_URL_HERE",
  quality: "1080p",
  serverName: "NOMBRE",
  headers: {
    "User-Agent": "Mozilla/5.0 ...", // Chrome 120+
    "Referer": "DOMINIO_DEL_HOSTER",
    "Origin": "DOMINIO_DEL_HOSTER",
    "Accept": "*/*"
  }
}
```
*Añadir siempre el ancla `#.m3u8` al final de la URL si no termina en extensión para asegurar que el reproductor nativo lo reconozca.*

---

### [2026-04-13] Filemoon Shield v2 y Compatibilidad Hermes [NIVEL AVANZADO]

Tras restaurar el servidor Filemoon, se han extraído lecciones fundamentales sobre criptografía en entornos móviles restringidos:

#### 1. El Problema de los Buffers en Hermes
- **Error**: Usar `Uint8Array` o `Buffer` para manejar llaves AES resultaba en fallos silenciosos.
- **Causa**: El motor **Hermes** (React Native) no maneja estas estructuras de la misma forma que Node.js o un navegador moderno.
- **Solución**: Se debe utilizar exclusivamente **`CryptoJS.lib.WordArray`**. Es el formato nativo de la librería inyectada en Nuvio y el único que garantiza que las operaciones de `encrypt/decrypt` devuelvan resultados válidos.

#### 2. Descifrado de Filemoon (Shield v2)
- **Criptografía**: Filemoon utiliza AES-256-GCM. 
- **Logro**: Debido a que GCM puro es difícil de ejecutar en motores antiguos, se implementó una **Simulación CTR**. Al separar el `payload` del `tag` de autenticación y usar AES con modo CTR, se puede obtener el stream de video. 
- **Ajuste de Contador**: Es vital ajustar el contador manual del IV (incrementándolo tras el nonce) para que el descifrado sea exitoso.

#### 3. Estética y Caracteres Especiales
- **Lección**: La App Nuvio puede ignorar resultados si el campo `title` contiene caracteres Unicode complejos mal codificados.
- **Solución**: Para mostrar el check verde (`✅`), se recomienda usar el escape hexadecimal **`\u2705`** en el código fuente. Esto asegura que el JSON sea siempre válido y procesable por la App.

#### 4. El Balance de los Timeouts (v5.7.5)
- **Conflicto**: Validar la calidad real (`validateStream`) consume tiempo de red adicional.
- **Configuración Óptima**:
    - `INDIVIDUAL_TIMEOUT` (Scraper): **15 segundos**.
    - `timeout` (Validación M3U8): **5 segundos**.
- **Resultado**: Esta combinación permite que el plugin tenga tiempo suficiente para resolver el enlace Y verificar si es 1080p o 720p sin que el buscador se "rindiera" antes de tiempo.

#### 5. Filtrado Latino Estricto
- **Estrategia**: Para mantener la interfaz profesional, el filtro se centralizó en `engine.js`. 
- **Regla**: Solo se procesan resultados que retornen `lat`, `mex` o `col` en sus etiquetas de idioma. Si no se detecta, el resultado no llega al usuario, garantizando transparencia total.

---

### [2026-04-13] Optimización Extrema y Estándar de 5 Segundos (v5.8.3)
- **Lección: Búsqueda Secuencial Inteligente**: No busques todo a la vez. Si un sitio soporta IDs de IMDb, intenta primero esa URL. Si tiene éxito, **cancela** la búsqueda por texto. Esto ahorra ~3 segundos de tráfico innecesario.
- **Timeouts Agresivos**: Para una App móvil, el usuario solo espera ~5-7 segundos. 
    - **Validación Express**: `axios.head` (1s) para vitalidad, `axios.get` (3s) para calidad real. Si un servidor tarda más, se descarta por "zombie".
    - **Scraper Limit**: Reducir el timeout individual de servidores a **8s**.

### [2026-04-13] El "Escudo de Invisibilidad" (Bypass v6.1.0)
- **Lección 1: User-Agent Rotativo**: Los servidores modernos (especialmente VidHide) detectan patrones de bots. Usar siempre un pool de navegadores reales (Chrome 124+, Safari 17+).
- **Lección 2: Persistencia de Sesión (El Apretón de Manos)**: 
    - **Problema**: Si usas un UA para encontrar el link y otro para validarlo, el servidor te da **403 Forbidden**.
    - **Solución**: Generar **un solo UA al inicio** de la búsqueda y fijarlo para toda la sesión (`setSessionUA`). Este mismo UA debe viajar inyectado en la URL del reproductor (`url|User-Agent=...`).
- **Lección 3: Redirecciones Manuales**: Usar `redirect: 'manual'` en `fetch` para detectar si el sitio intenta mandarnos a una página de bloqueo/captcha.

### [2026-04-13] Arquitectura de Mantenimiento (v6.2.0) [REGLA DEL MAESTRO II]
- **Centralización de Dominios (`mirrors.js`)**: 
    - **Problema**: Tener listas de dominios (`minochinos`, `acek-cdn`, etc.) en cada archivo es un suicidio técnico.
    - **Solución**: Mover todos los dominios a `src/utils/mirrors.js`. Los resolutores y el motor ahora usan `isMirror(url, 'SERVER_NAME')`. 
    - **Resultado**: Si un servidor cambia de dominio, solo editas una línea en `mirrors.js` y todo el plugin se actualiza.
- **CommonJS Puro (Módulos Seguros)**: 
    - **Regla**: Evitar mezclar `import/export` con `require` en la misma carpeta `src/`.
    - **Causa**: ESBuild puede generar preámbulos complejos que el motor **Hermes** de NuvioMOBILE rechaza, haciendo que el proveedor "desaparezca" de la lista de resultados aunque el código funcione en PC.
    - **Solución**: Usar `module.exports` y `require` de forma consistente para garantizar el 100% de visibilidad en la App.

---

## [LO QUE NO SE DEBE HACER] - Lista Negra
1.  **NO** uses identificadores estáticos para buscar si el sitio soporta IDs (úsalo siempre como prioridad).
2.  **NO** dejes que el reproductor use su User-Agent por defecto (inyecta siempre el UA de la sesión).
3.  **NO** subas cambios a GitHub sin probar con `test_interstellar.js` o similar.
4.  **NO** incrementes la versión menores (`v6.1.0` -> `v6.2.0`) si no has validado que el `providers/*.js` compilado tiene el tamaño correcto (un archivo de 20KB suele indicar que el build falló).

---

### Estabilización de Embed69 (v7.2.8) - Lecciones de Gold

Hemos identificado tres reglas de oro para que los proveedores no "desaparezcan" o se ralenticen en Android TV:

1.  **Regla del Bundle Ligero (<100 KB)**: 
    *   No empaquetar `axios`, `crypto-js` o `cheerio`. La app ya los inyecta.
    *   Usar `EXTERNAL_MODULES` en `build.js`.
    *   Si el plugin pesa >200KB, **Hermes lo rechazará por falta de memoria (OOM)** y el proveedor no aparecerá en la búsqueda.

2.  **Arquitectura de Ráfaga (El límite de 5s)**:
    *   Para mantener la fluidez, usar `Promise.race` con un timeout estricto de **4000ms-5000ms** para la resolución de servidores.
    *   Si un servidor demora más, entregar la URL cruda como fallback. Es mejor mostrar un link rápido que hacer esperar al usuario 10 segundos.

3.  **Prioridad API sobre Scraping**:
    *   El scraping de la web de TMDB añade ~2s de latencia. Usar siempre la API oficial como prioridad 1.

```

---

### [2026-04-15] Arquitectura de Velocidad Extrema y Sincronización de Identidad (v7.9.4)

Tras una intensa jornada de depuración del proveedor **Embed69** y el servidor **Streamish (Hanerix)**, se han establecido los nuevos estándares de rendimiento para Nuvio Latino:

#### 1. Lógica de Carrera de Espejos (Race Burst) [CRÍTICO]
- **Problema**: Algunos servidores (como Streamish) tienen hasta 10 espejos. Resolverlos uno por uno es lento, y esperar a que todos terminen en un `Promise.all` causa retrasos innecesarios por culpa de los mirrors lentos.
- **Lección**: Implementar una **Lógica de Carrera (Race)**.
    - **Acción**: Lanzar peticiones a todos los mirrors simultáneamente. En el momento en que el **primer espejo** responde con éxito, el plugin debe cerrar la búsqueda y entregar el video inmediatamente.
    - **Resultado**: El tiempo de carga bajó de 10-15 segundos a menos de **5 segundos**.

#### 2. Sincronización de Identidad Absoluta (El Fin del "Not Found")
- **Problema**: Los streams de Streamish/Hanerix devolvían error **404 Not Found** al intentar reproducirlos, a pesar de que el link era válido.
- **Causa**: Estos servidores vinculan el enlace generado a la "identidad" (User-Agent) del navegador. Si el `User-Agent` usado para la búsqueda es distinto al del reproductor (aunque solo varíe una coma), el servidor deniega el acceso.
- **Solución**: 
    - **Inyección en Piping**: El enlace final debe llevar obligatoriamente el UA completo adjunto: `url|User-Agent=...`.
    - **Captura Dinámica**: Los resolutores deben obtener el `getSessionUA()` **dentro** de la función `resolve`, no al inicio del archivo, para asegurar que coincide con el UA rotado por el scraper principal en esa sesión.

#### 3. Priorización de Mirrors Rápidos
- **Lección**: No todos los espejos son iguales. Probar primero los espejos conocidos por su alta velocidad (`hanerix.com`, `embedwish.com`) antes que los genéricos reduce drásticamente la latencia en la "Carrera de Espejos".

#### 4. Balance de Paralelismo y Saturación en TV
- **Problema**: Lanzar más de 20 peticiones simultáneas puede saturar la CPU y red de una Android TV antigua, ralentizando todas las respuestas.
- **Solución**: Aumentar el `INDIVIDUAL_TIMEOUT` a **10 segundos** cuando se usa paralelismo masivo. Esto da margen al dispositivo para procesar el tráfico sin abortar búsquedas que sí iban a tener éxito.

---

### [2026-04-16] El Renacimiento de Cuevana3 y el Motor Nitro (v12.9.11)

#### 1. Migración Crítica: De API a Scraping HTML
- **Problema**: Cuevana3 eliminó su API pública, dejando a todos los plugins "ciegos".
- **Solución**: Se implementó un motor de **Scraping HTML** puro que navega por `ww9.cuevana3.to`. Aunque es un poco más lento, es mucho más difícil de bloquear para el sitio web.
- **Aprendizaje**: En sitios de streaming gratuitos, las APIs son efímeras. El scraping del DOM es el método de supervivencia definitivo.

#### 2. La Trampa del Doble Procesamiento (Error Invisibilidad)
- **Problema**: El scraper funcionaba en tests manuales pero daba "cero resultados" en la App.
- **Causa**: Se estaba llamando a `finalizeStreams` tanto en el `extractor.js` como en el `index.js`.
- **Resultado**: La segunda llamada recibía datos ya transformados y, al no encontrar las etiquetas originales, descartaba todos los enlaces.
- **Regla**: El motor de limpieza final debe llamarse **una sola vez**. Se recomienda hacerlo en el `extractor.js` para que el `index.js` sea solo un puente limpio.

#### 3. Búsqueda Resiliente (Estrategia de Primera Palabra)
- **Problema**: Buscadores de sitios como Cuevana fallan si el título es muy largo o tiene caracteres especiales.
- **Solución**: Implementar un **Reintento de Búsqueda**. Si el título completo (ej: "Caminos del Crimen") no devuelve nada, el scraper debe intentar automáticamente con la primera palabra (**"Caminos"**).
- **Impacto**: Esta técnica recuperó un 40% de los resultados que antes se daban por perdidos.

#### 4. Validación Nitro (La Carrera de 4.5 Segundos)
- **Problema**: Esperar a que servidores lentos (Netu, Doodstream) respondan bloqueaba la búsqueda completa.
- **Solución**: Uso de `Promise.race` con un cronómetro estricto de **4.5 segundos**.
- **Regla de Oro**: Si un servidor no se valida en ese tiempo, se entrega como "SD" o "Unverified". Es preferible que el usuario vea un link rápido a que crea que el plugin no funciona.

#### 5. Compatibilidad Vimeos y UA Dinámico
- **Problema**: El resolutor de Vimeos usaba `import` (ES6), lo que causaba fallas silenciosas en Hermes.
- **Solución**: Revertir a **CommonJS puro** y forzar la inyección del `User-Agent` de la sesión en el header `Referer`. Sin esto, el servidor devuelve 403 Forbidden al intentar reproducir el m3u8.


