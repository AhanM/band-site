#!/usr/bin/env python3
"""Regenerate grain textures (fine specks + cracks from photo source)."""

from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
SOURCE = ASSETS / "grain-source.jpg"
CRACKS_OUT = ASSETS / "grain-cracks.png"
CRACK_THRESH = 178
CRACK_FALLOFF = 22


def make_fine(path: Path) -> None:
    rng = random.Random(31)
    lum = Image.effect_noise((128, 128), 52.0)
    size = 400
    lum = lum.resize((size, size), Image.Resampling.NEAREST)
    lp = lum.load()
    rgba = Image.new("RGBA", (size, size))
    px = rgba.load()
    for y in range(size):
        for x in range(size):
            if rng.random() < 0.985:
                continue
            if lp[x, y] < 135:
                continue
            a = min(255, 210 + (lp[x, y] - 135) // 2)
            px[x, y] = (255, 255, 255, a)
    rgba.save(path, optimize=True, compress_level=9)


def make_cracks_from_photo(path: Path) -> None:
    if not SOURCE.is_file():
        raise FileNotFoundError(f"Missing photo source: {SOURCE}")

    img = Image.open(SOURCE).convert("L")
    img = ImageOps.autocontrast(img, cutoff=1)
    w, h = img.size
    lp = img.load()
    rgba = Image.new("RGBA", (w, h))
    px = rgba.load()
    for y in range(h):
        for x in range(w):
            v = lp[x, y]
            if v >= CRACK_THRESH:
                a = min(255, int((v - CRACK_THRESH) * 5) + 100)
                px[x, y] = (255, 255, 255, a)
            elif v >= CRACK_THRESH - CRACK_FALLOFF:
                a = int((v - (CRACK_THRESH - CRACK_FALLOFF)) * 3.5)
                if a >= 30:
                    px[x, y] = (255, 255, 255, a)

    rgba.save(path, optimize=True, compress_level=9)


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    make_fine(ASSETS / "grain-fine.png")
    make_cracks_from_photo(CRACKS_OUT)
    print("Wrote grain-fine.png and grain-cracks.png")


if __name__ == "__main__":
    main()
