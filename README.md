# 🦄 Chihuacornio · Chihuahua Tech Week 2026

Sitio para personalizar al **Chihuacornio**, la mascota oficial de Chihuahua Tech Week 2026.
Cualquier persona puede subir su logo, acomodarlo en la playera del Chihuacornio y descargar
su versión personalizada en alta resolución.

## ✨ Cómo funciona

1. **Sube tu logo** — arrástralo al Chihuacornio o elígelo desde tu dispositivo (PNG, JPG, SVG, WebP).
2. **Acomódalo** — mueve, escala, gira y ajusta opacidad sobre la playera.
3. **Descarga** — obtén un PNG de 1080×1350 listo para redes.

Todo el procesamiento ocurre **en el navegador del usuario**. Ningún logo se sube a un servidor.

## 🔐 Acceso por invitación (códigos de aliado)

El sitio está cerrado: cada persona necesita un **código** para entrar. Sirve para dar
acceso solo a los aliados aprobados de la Tech Week.

- Los códigos válidos viven **hasheados** (SHA-256) en `codes.js` — no se ven en texto plano.
- La lista de códigos en texto plano está en `codigos-aliados.txt`, que **no se sube a git**
  (está en `.gitignore`). Ahí anotas a quién le diste cada código.
- Una vez que un aliado entra, su dispositivo lo recuerda (no se le vuelve a pedir).

Es una "puerta suave": da exclusividad y control, pero no es seguridad criptográfica fuerte
(el contenido es un editor de imágenes, no datos sensibles).

### Generar / regenerar el lote de códigos

```bash
python3 tools/gen-codigos.py        # crea codes.js + codigos-aliados.txt
```

Para **revocar** un código: borra su hash de `codes.js` y vuelve a desplegar.
Para **añadir** más: regenera el lote o agrega a mano el hash de un código nuevo.

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
