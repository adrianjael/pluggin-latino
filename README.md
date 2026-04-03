# Nuvio Latino Providers 🚀

Colección de proveedores de streaming en español latino para la aplicación Nuvio. 

## 📲 Instalación en la App Nuvio

Para disfrutar de estos proveedores, sigue estos pasos:

1.  Abre la App **Nuvio** > **Ajustes** > **Extensiones**
2.  Pulsa en **"Añadir nuevo repositorio"**
3.  Pega la siguiente URL:
    ```text
    https://raw.githubusercontent.com/adrianjael/pluggin-latino/main/manifest.json
    ```
4.  Pulsa en **"Actualizar"** y asegúrate de que **PelisPlusHD** esté activado.

---

## 🛠️ Desarrollo Local

Si quieres modificar los proveedores o añadir nuevos:

### Estructura del Proyecto
*   `src/`: Código fuente original (index, extractor, http).
*   `providers/`: Archivos compilados listos para la app.
*   `manifest.json`: Registro de todos los proveedores.

### Comandos Útiles

**Instalar dependencias:**
```powershell
npm install
```

**Compilar el plugin (Hermes Compatibility):**
```powershell
node build.js pelisplus
```

**Probar el funcionamiento en consola:**
```powershell
node test-pelisplus.js
```

**Iniciar servidor de desarrollo (para Plugin Tester):**
```powershell
npm start
```
*(Usa la URL `http://TU_IP:3000/manifest.json` en el Plugin Tester de Nuvio).*

---

## 📺 Proveedores Disponibles

| ID | Nombre | Idioma | Estado |
|---|---|---|---|
| `pelisplus` | PelisPlusHD | Latino | ✅ Activo |

---

## ⚖️ Disclaimer

Este repositorio no aloja ningún contenido de video. Los proveedores son scripts de scraping que obtienen enlaces públicos de terceros. El uso de este software es responsabilidad del usuario final.
