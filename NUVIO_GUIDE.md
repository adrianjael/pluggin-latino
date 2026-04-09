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
    - Se recomienda usar **Axios** para peticiones complejas a servidores de video (Streamwish, Vidhide, etc.) ya que maneja mejor las redirecciones y cabeceras por defecto.
    - Usa **Fetch** para peticiones simples o cuando necesites un control total y minimalista de la petición.
- **Sintaxis**: Contrario a lo que se pensaba inicialmente, el motor de Nuvio (Hermes) **SOPORTA** ES2017+ (`Object.entries`, `Promise.allSettled`, `async/await`). 
    - **No es necesario** degradar el código a ES2016 a menos que se detecte un crash específico.
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

---

*(Actualizar con cada nuevo descubrimiento)*
