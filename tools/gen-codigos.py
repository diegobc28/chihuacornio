#!/usr/bin/env python3
"""Genera el lote de códigos de acceso del Chihuacornio.

Crea dos archivos en la raíz del proyecto:
  - codes.js             -> solo hashes SHA-256 (SÍ se sube a git)
  - codigos-aliados.txt  -> códigos en texto plano para repartir (NO se sube)

Uso:
    python3 tools/gen-codigos.py [cantidad]

Normalización (debe coincidir con gate.js): quitar espacios + mayúsculas.
"""
import hashlib
import secrets
import json
import sys
import datetime
import os

ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"  # sin I O L 0 1 (ambiguos)
PREFIX = "CHTW26-"
BODY_LEN = 5

N = int(sys.argv[1]) if len(sys.argv) > 1 else 50
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def normalize(s: str) -> str:
    return "".join(s.split()).upper()


def main() -> None:
    codes = set()
    while len(codes) < N:
        body = "".join(secrets.choice(ALPHABET) for _ in range(BODY_LEN))
        codes.add(PREFIX + body)
    codes = sorted(codes)

    hashes = [hashlib.sha256(normalize(c).encode()).hexdigest() for c in codes]

    js = (
        "/* Códigos de acceso del Chihuacornio — SOLO hashes SHA-256.\n"
        " * Los códigos en texto plano NO viven aquí (mira codigos-aliados.txt, no versionado).\n"
        " * Para añadir/quitar accesos, edita esta lista o regenera con tools/gen-codigos.py\n"
        " */\n"
        "window.CHIHUACORNIO_CODES = " + json.dumps(hashes, indent=2) + ";\n"
    )
    with open(os.path.join(ROOT, "codes.js"), "w") as f:
        f.write(js)

    ts = datetime.date.today().isoformat()
    lines = [
        "CÓDIGOS DE ACCESO — CHIHUACORNIO (Chihuahua Tech Week 2026)",
        f"Generado: {ts}  ·  {N} códigos",
        "Reparte UNO por aliado aprobado. Anota a quién se lo diste.",
        "Este archivo NO se sube a GitHub.",
        "=" * 48,
        "",
    ]
    for i, c in enumerate(codes, 1):
        lines.append(f"{i:>2}. {c}    → aliado: ____________________")
    with open(os.path.join(ROOT, "codigos-aliados.txt"), "w") as f:
        f.write("\n".join(lines) + "\n")

    print(f"OK — {N} códigos generados.")
    print("  codes.js (hashes) y codigos-aliados.txt (texto plano) actualizados.")


if __name__ == "__main__":
    main()
