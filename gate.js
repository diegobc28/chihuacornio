/* Puerta de acceso del Chihuacornio.
 * Valida un código contra la lista de hashes (codes.js) y recuerda el
 * dispositivo. Es una "puerta suave" client-side: da exclusividad y
 * control, no es seguridad criptográfica fuerte.
 */
(() => {
  "use strict";

  const STORAGE_KEY = "chihuacornio_access_v1";
  const VALID = new Set((window.CHIHUACORNIO_CODES || []).map((h) => h.toLowerCase()));

  const normalize = (s) => s.replace(/\s+/g, "").toUpperCase();

  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function unlock() {
    document.documentElement.classList.add("unlocked");
    const gate = document.getElementById("gate");
    if (gate) {
      gate.classList.add("gate--hidden");
      setTimeout(() => gate.remove(), 450);
    }
  }

  // ¿Ya validado en este dispositivo?
  function alreadyUnlocked() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved && VALID.has(saved.toLowerCase());
    } catch (_) {
      return false;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (alreadyUnlocked()) { unlock(); return; }

    const form = document.getElementById("gateForm");
    const input = document.getElementById("gateInput");
    const error = document.getElementById("gateError");
    const submit = document.getElementById("gateSubmit");
    if (!form) { unlock(); return; } // sin puerta, no bloquear

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      error.textContent = "";
      const code = normalize(input.value);
      if (!code) { error.textContent = "Escribe tu código."; return; }

      submit.disabled = true;
      submit.textContent = "Verificando…";
      const hash = await sha256(code);
      submit.disabled = false;
      submit.textContent = "Entrar";

      if (VALID.has(hash)) {
        try { localStorage.setItem(STORAGE_KEY, hash); } catch (_) {}
        unlock();
      } else {
        error.textContent = "Código no válido. Revísalo o pídelo a la organización.";
        input.focus();
        input.select();
      }
    });
  });
})();
