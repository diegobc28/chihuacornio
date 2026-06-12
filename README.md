# 🦄 Chihuacornio · Chihuahua Tech Week 2026

Sitio para personalizar al **Chihuacornio**, la mascota oficial de Chihuahua Tech Week 2026.
Cualquier persona puede subir su logo, acomodarlo en la playera del Chihuacornio y descargar
su versión personalizada en alta resolución.

## ✨ Cómo funciona

1. **Sube tu logo** — arrástralo al Chihuacornio o elígelo desde tu dispositivo (PNG, JPG, SVG, WebP).
2. **Acomódalo** — mueve, escala, gira y ajusta opacidad sobre la playera.
3. **Descarga** — obtén un PNG de 1080×1350 listo para redes.

Todo el procesamiento ocurre **en el navegador del usuario**. Ningún logo se sube a un servidor.

## 🛠️ Stack

HTML + CSS + JavaScript puro, sin dependencias ni build. El compositing se hace con `<canvas>`.

- `index.html` — estructura y secciones
- `styles.css` — estilos y branding
- `app.js` — editor (carga, arrastrar/escalar/rotar, descarga)
- `assets/chihuacornio-blank.png` — base con playera blanca
- `assets/chihuacornio-sample.png` — versión de muestra con el logo del evento

## 🚀 Correr localmente

Es estático, así que basta con servir la carpeta:

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

## 🌐 Deploy (GitHub Pages)

1. Settings → Pages → Source: `Deploy from a branch` → `main` / `root`.
2. En unos minutos queda en `https://diegobc28.github.io/chihuacornio/`.

---

Hecho con cariño en Chihuahua 🌵 para celebrar la comunidad tech de la ciudad.
