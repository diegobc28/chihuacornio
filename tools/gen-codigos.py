#!/usr/bin/env python3
"""Genera o amplía el lote de códigos de acceso del Chihuacornio.

Archivos en la raíz del proyecto:
  - codes.js             -> solo hashes SHA-256 (SÍ se sube a git; es lo que valida la puerta)
  - codigos-aliados.txt  -> códigos en texto plano para repartir (NO se sube; son tus notas)

Uso:
    python3 tools/gen-codigos.py                 # crea un lote NUEVO de 50 (reemplaza todo)
    python3 tools/gen-codigos.py 80              # crea un lote NUEVO de 80 (reemplaza todo)
    python3 tools/gen-codigos.py add 10          # AÑADE 10 códigos nuevos, conserva los existentes
    python3 tools/gen-codigos.py add CHTW26-FIESTA   # AÑADE un código específico que tú eliges

Importante: una vez que repartiste códigos, usa SIEMPRE 'add' para no invalidarlos.
Normalización (debe coincidir con gate.js): quitar espacios + mayúsculas.
"""
import hashlib
import secrets
import json
import sys
import datetime
import os
import re

ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"  # sin I O L 0 1 (ambiguos)
PREFIX = "CHTW26-"
BODY_LEN = 5

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CODES_JS = os.path.join(ROOT, "codes.js")
CODES_TXT = os.path.join(ROOT, "codigos-aliados.txt")


def normalize(s: str) -> str:
    return "".join(s.split()).upper()


def h(code: str) -> str:
    return hashlib.sha256(normalize(code).encode()).hexdigest()


def random_code() -> str:
    return PREFIX + "".join(secrets.choice(ALPHABET) for _ in range(BODY_LEN))


def load_hashes() -> list:
    if not os.path.exists(CODES_JS):
        return []
    txt = open(CODES_JS).read()
    return re.findall(r'"([a-f0-9]{64})"', txt)


def write_js(hashes: list) -> None:
    js = (
        "/* Códigos de acceso del Chihuacornio — SOLO hashes SHA-256.\n"
        " * Los códigos en texto plano NO viven aquí (mira codigos-aliados.txt, no versionado).\n"
        " * Para añadir/quitar accesos: tools/gen-codigos.py add ...  (o edita esta lista).\n"
        " */\n"
        "window.CHIHUACORNIO_CODES = " + json.dumps(hashes, indent=2) + ";\n"
    )
    open(CODES_JS, "w").write(js)


def txt_header(n: int) -> str:
    ts = datetime.date.today().isoformat()
    return (
        "CÓDIGOS DE ACCESO — CHIHUACORNIO (Chihuahua Tech Week 2026)\n"
        f"Generado: {ts}  ·  {n} códigos\n"
        "Reparte UNO por aliado aprobado. Anota a quién se lo diste.\n"
        "Este archivo NO se sube a GitHub.\n"
        + "=" * 48 + "\n\n"
    )


def txt_lines(codes: list, start: int = 1) -> str:
    out = ""
    for i, c in enumerate(codes, start):
        out += f"{i:>2}. {c}    → aliado: ____________________\n"
    return out


def existing_txt_count() -> int:
    if not os.path.exists(CODES_TXT):
        return 0
    return len(re.findall(r"CHTW26-[A-Z0-9]{5,}", open(CODES_TXT).read()))


def cmd_new(n: int) -> None:
    codes = set()
    while len(codes) < n:
        codes.add(random_code())
    codes = sorted(codes)
    write_js([h(c) for c in codes])
    open(CODES_TXT, "w").write(txt_header(n) + txt_lines(codes))
    print(f"OK — lote NUEVO de {n} códigos. (Reemplazó cualquier lote anterior.)")


def cmd_add(args: list) -> None:
    existing = load_hashes()
    existing_set = set(existing)

    # ¿pidieron N códigos aleatorios, o códigos específicos?
    new_codes = []
    if len(args) == 1 and args[0].isdigit():
        n = int(args[0])
        seen = set()
        while len(new_codes) < n:
            c = random_code()
            if h(c) not in existing_set and c not in seen:
                seen.add(c)
                new_codes.append(c)
    else:
        for raw in args:
            c = normalize(raw)
            if not c:
                continue
            if h(c) in existing_set:
                print(f"  (ya existía, se omite: {c})")
                continue
            new_codes.append(c)

    if not new_codes:
        print("Nada que añadir.")
        return

    merged = existing + [h(c) for c in new_codes if h(c) not in existing_set]
    write_js(merged)

    start = existing_txt_count() + 1
    block = ("" if os.path.exists(CODES_TXT) else txt_header(len(new_codes)))
    block += txt_lines(new_codes, start)
    with open(CODES_TXT, "a") as f:
        f.write(block)

    print(f"OK — {len(new_codes)} código(s) AÑADIDO(S). Total ahora: {len(merged)}.")
    for c in new_codes:
        print("   +", c)


def main() -> None:
    args = sys.argv[1:]
    if args and args[0] == "add":
        if len(args) < 2:
            print("Uso: python3 tools/gen-codigos.py add <cantidad | CODIGO ...>")
            return
        cmd_add(args[1:])
    else:
        n = int(args[0]) if args and args[0].isdigit() else 50
        cmd_new(n)


if __name__ == "__main__":
    main()
