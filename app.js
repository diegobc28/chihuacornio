/* Chihuacornio · Chihuahua Tech Week 2026
 * Editor de logo 100% client-side sobre la playera del Chihuacornio.
 */
(() => {
  "use strict";

  const CANVAS_W = 1080;
  const CANVAS_H = 1350;

  // Zona "imprimible" de la playera (en coordenadas del canvas 1080x1350).
  // Centro y tope de tamaño por defecto del logo.
  const SHIRT = {
    cx: 540,        // centro horizontal de la playera
    cy: 890,        // centro vertical del pecho
    baseW: 330,     // ancho de referencia del logo (escala = 1)
  };

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const stage = document.getElementById("stage");
  const fileInput = document.getElementById("fileInput");
  const sampleBtn = document.getElementById("sampleBtn");
  const adjustCard = document.getElementById("adjustCard");
  const scaleEl = document.getElementById("scale");
  const rotateEl = document.getElementById("rotate");
  const opacityEl = document.getElementById("opacity");
  const blendToggle = document.getElementById("blendToggle");
  const resetBtn = document.getElementById("resetBtn");
  const removeBtn = document.getElementById("removeBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const shareBtn = document.getElementById("shareBtn");

  const baseImg = new Image();
  baseImg.src = "assets/chihuacornio-blank.png";

  // Estado del logo
  const logo = {
    img: null,
    x: SHIRT.cx,   // centro en coords del canvas
    y: SHIRT.cy,
    scale: 1,
    rotation: 0,   // grados
    opacity: 1,
    multiply: false,
  };

  let baseReady = false;
  baseImg.onload = () => { baseReady = true; render(); };

  /* ---------- Render ---------- */
  function render() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    if (baseReady) ctx.drawImage(baseImg, 0, 0, CANVAS_W, CANVAS_H);

    if (logo.img) {
      const { w, h } = logoDims();
      ctx.save();
      ctx.globalAlpha = logo.opacity;
      ctx.globalCompositeOperation = logo.multiply ? "multiply" : "source-over";
      ctx.translate(logo.x, logo.y);
      ctx.rotate((logo.rotation * Math.PI) / 180);
      ctx.drawImage(logo.img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
  }

  function logoDims() {
    const ar = logo.img ? logo.img.naturalWidth / logo.img.naturalHeight : 1;
    const w = SHIRT.baseW * logo.scale;
    const h = w / ar;
    return { w, h };
  }

  /* ---------- Carga de logo ---------- */
  function loadLogoFromSrc(src) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      logo.img = img;
      resetTransform();
      stage.classList.add("has-logo");
      adjustCard.hidden = false;
      if (shareBtn && navigator.canShare) shareBtn.hidden = false;
      render();
    };
    img.onerror = () => alert("No se pudo cargar la imagen. Prueba con un PNG o JPG.");
    img.src = src;
  }

  function loadLogoFromFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      alert("Por favor sube un archivo de imagen (PNG, JPG, SVG o WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => loadLogoFromSrc(e.target.result);
    reader.readAsDataURL(file);
  }

  function resetTransform() {
    logo.x = SHIRT.cx;
    logo.y = SHIRT.cy;
    logo.scale = 1;
    logo.rotation = 0;
    logo.opacity = 1;
    logo.multiply = false;
    scaleEl.value = "1";
    rotateEl.value = "0";
    opacityEl.value = "1";
    blendToggle.checked = false;
  }

  /* ---------- Controles ---------- */
  fileInput.addEventListener("change", (e) => {
    if (e.target.files[0]) loadLogoFromFile(e.target.files[0]);
    fileInput.value = "";
  });

  sampleBtn.addEventListener("click", () => {
    // Logo de ejemplo: el lockup de Chihuahua Tech Week, dibujado en un canvas.
    loadLogoFromSrc(makeSampleLogo());
  });

  scaleEl.addEventListener("input", () => { logo.scale = parseFloat(scaleEl.value); render(); });
  rotateEl.addEventListener("input", () => { logo.rotation = parseFloat(rotateEl.value); render(); });
  opacityEl.addEventListener("input", () => { logo.opacity = parseFloat(opacityEl.value); render(); });
  blendToggle.addEventListener("change", () => { logo.multiply = blendToggle.checked; render(); });

  resetBtn.addEventListener("click", () => { resetTransform(); render(); });
  removeBtn.addEventListener("click", () => {
    logo.img = null;
    stage.classList.remove("has-logo");
    adjustCard.hidden = true;
    if (shareBtn) shareBtn.hidden = true;
    render();
  });

  /* ---------- Drag & drop sobre el escenario ---------- */
  ["dragenter", "dragover"].forEach((ev) =>
    stage.addEventListener(ev, (e) => { e.preventDefault(); stage.classList.add("dragover"); })
  );
  ["dragleave", "drop"].forEach((ev) =>
    stage.addEventListener(ev, (e) => { e.preventDefault(); stage.classList.remove("dragover"); })
  );
  stage.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files[0];
    if (file) loadLogoFromFile(file);
  });

  /* ---------- Arrastrar el logo en el canvas ---------- */
  let dragging = false;
  let dragOffset = { x: 0, y: 0 };

  function toCanvasCoords(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((clientY - rect.top) / rect.height) * CANVAS_H,
    };
  }

  function hitTest(px, py) {
    if (!logo.img) return false;
    // Transformar el punto al espacio local del logo (deshacer rotación).
    const dx = px - logo.x;
    const dy = py - logo.y;
    const a = (-logo.rotation * Math.PI) / 180;
    const lx = dx * Math.cos(a) - dy * Math.sin(a);
    const ly = dx * Math.sin(a) + dy * Math.cos(a);
    const { w, h } = logoDims();
    return Math.abs(lx) <= w / 2 && Math.abs(ly) <= h / 2;
  }

  function onPointerDown(e) {
    if (!logo.img) return;
    const p = toCanvasCoords(e.clientX, e.clientY);
    if (!hitTest(p.x, p.y)) return;
    dragging = true;
    dragOffset.x = p.x - logo.x;
    dragOffset.y = p.y - logo.y;
    canvas.classList.add("dragging");
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
  }
  function onPointerMove(e) {
    if (!dragging) return;
    const p = toCanvasCoords(e.clientX, e.clientY);
    logo.x = clamp(p.x - dragOffset.x, 0, CANVAS_W);
    logo.y = clamp(p.y - dragOffset.y, 0, CANVAS_H);
    render();
  }
  function onPointerUp(e) {
    dragging = false;
    canvas.classList.remove("dragging");
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
  }
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);

  // Rueda del mouse = escalar cuando el cursor está sobre el logo
  canvas.addEventListener("wheel", (e) => {
    if (!logo.img) return;
    const p = toCanvasCoords(e.clientX, e.clientY);
    if (!hitTest(p.x, p.y)) return;
    e.preventDefault();
    const next = clamp(logo.scale - Math.sign(e.deltaY) * 0.06, 0.2, 2.5);
    logo.scale = next;
    scaleEl.value = String(next);
    render();
  }, { passive: false });

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  /* ---------- Descargar ---------- */
  downloadBtn.addEventListener("click", () => {
    if (!logo.img) {
      alert("Primero sube tu logo 🦄");
      document.getElementById("estudio").scrollIntoView({ behavior: "smooth" });
      return;
    }
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mi-chihuacornio.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  });

  /* ---------- Compartir (Web Share API) ---------- */
  if (shareBtn) {
    shareBtn.addEventListener("click", () => {
      canvas.toBlob(async (blob) => {
        const file = new File([blob], "mi-chihuacornio.png", { type: "image/png" });
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "Mi Chihuacornio",
              text: "Mi Chihuacornio para #ChihuahuaTechWeek 2026 🦄",
            });
          }
        } catch (_) { /* cancelado por el usuario */ }
      }, "image/png");
    });
  }

  /* ---------- Logo de ejemplo (placeholder dibujado) ---------- */
  function makeSampleLogo() {
    const c = document.createElement("canvas");
    c.width = 600; c.height = 360;
    const g = c.getContext("2d");
    g.fillStyle = "#2f6b3a";
    g.font = "700 64px Poppins, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("TU", 300, 130);
    g.fillStyle = "#9b7fd4";
    g.fillText("LOGO", 300, 210);
    g.fillStyle = "#2b7fc4";
    g.font = "600 28px Poppins, sans-serif";
    g.fillText("aquí 🦄", 300, 280);
    return c.toDataURL("image/png");
  }
})();
