# Guía: Cómo Agregar un Nuevo Proveedor a Nuvio

Sigue estos pasos para integrar un nuevo sitio de streaming de forma correcta y asegurar que sea compatible con la aplicación.

---

## 1. Investigación Previa (Scraping)
Antes de escribir código, debes analizar el sitio del proveedor:
- **Extraer Enlaces**: El objetivo es obtener enlaces directos `.mp4` o `.m3u8`. Nuvio **solo** acepta estos dos formatos. No sirven iframes directos que requieran interacción manual del usuario en el reproductor.
- **Identificadores**: Verifica si el sitio usa IDs de **TMDB** o **IMDB** en sus URLs o metadatos, lo cual facilita mucho la integración.
- **Buscador**: Identifica cómo funciona la búsqueda del sitio (ej: `/search?s=query`).

## 2. Definición en manifest.json
Registra el nuevo proveedor en el archivo raíz `manifest.json`.
- Copia y pega un objeto de scraper existente.
- Asegúrate de que el `id` sea único.
- El `filename` debe apuntar a `providers/nombre_proveedor.js`.

## 3. Desarrollo en src/
Crea una carpeta para el código fuente:
- `src/nombre_proveedor/index.js`: Lógica de búsqueda y punto de entrada. Debe exportar la función `getStreams`.
- `src/nombre_proveedor/extractor.js`: Lógica para procesar el HTML de la página de destino y extraer los servidores.

## 4. Empaquetado (Build)
Nuvio no lee directamente de `src/`. Debes empaquetar el código en un solo archivo:
- Ejecuta el comando en la terminal:
  ```powershell
  node build.js nombre_proveedor
  ```
- Esto generará el archivo final en `providers/nombre_proveedor.js`.

## 5. Pruebas y Validación
Usa `test-issue.js` para verificar que todo funcione:
- Importa la nueva función `getStreams`.
- Ejecuta pruebas para una película y una serie.
- **IMPORTANTE**: Verifica que el `url` retornado termine en `.mp4` o `.m3u8` (o que el resolver como Embed69, Voe o Filemoon sea el correcto).

## 6. Subida a GitHub
Dado que usas **GitHub Desktop**, utiliza el ejecutable de Git que este proporciona para hacer los commits y pushes si la consola estándar no tiene Git en el PATH.

### Comandos útiles:
```powershell
# Localizar Git de GitHub Desktop (ejemplo)
$git = "C:\Users\adria\AppData\Local\GitHubDesktop\app-3.5.7\resources\app\git\cmd\git.exe"

# Hacer Pull
& $git pull

# Agregar cambios
& $git add .

# Hacer Commit
& $git commit -m "feat: agregar proveedor X"

# Hacer Push
& $git push origin main
```
