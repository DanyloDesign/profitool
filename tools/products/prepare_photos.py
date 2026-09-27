"""
Profitool · подготовка товарных фото под тёмную витрину.

Магазинные packshot приходят на белом фоне. На графите белый квадрат выглядит
заплаткой, поэтому фон вырезается заливкой от краёв, снимок обрезается по товару
и вписывается в один квадрат — тогда вся сетка каталога стоит ровно.

    python3 tools/products/prepare_photos.py
"""

from __future__ import annotations

import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SRC = Path("public/products/real")
DST = Path("public/products")
SIZE = 900
PADDING = 0.07  # доля стороны на поля вокруг товара
MARKER = (255, 0, 255)


def cut_background(image: Image.Image) -> Image.Image:
    """Заливка от четырёх углов: белое поле вокруг товара становится прозрачным."""
    rgb = image.convert("RGB")
    # Рамка в 2px гарантирует, что заливка обойдёт товар, даже если он касается края.
    framed = Image.new("RGB", (rgb.width + 4, rgb.height + 4), (255, 255, 255))
    framed.paste(rgb, (2, 2))

    for corner in ((0, 0), (framed.width - 1, 0), (0, framed.height - 1), (framed.width - 1, framed.height - 1)):
        ImageDraw.floodfill(framed, corner, MARKER, thresh=58)

    data = np.array(framed)
    outside = np.all(data == np.array(MARKER), axis=-1)

    alpha = np.where(outside, 0, 255).astype(np.uint8)
    alpha_img = Image.fromarray(alpha).crop((2, 2, framed.width - 2, framed.height - 2))
    # Лёгкое размытие убирает ступеньку по контуру после заливки.
    alpha_img = alpha_img.filter(ImageFilter.GaussianBlur(0.6))

    out = rgb.convert("RGBA")
    out.putalpha(alpha_img)
    return out


def fit_square(image: Image.Image, size: int = SIZE) -> Image.Image:
    box = image.getbbox()
    if box:
        image = image.crop(box)

    inner = int(size * (1 - PADDING * 2))
    scale = min(inner / image.width, inner / image.height)
    resized = image.resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))), Image.LANCZOS)

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(resized, ((size - resized.width) // 2, (size - resized.height) // 2), resized)
    return canvas


def main() -> None:
    DST.mkdir(parents=True, exist_ok=True)
    done = skipped = 0

    for path in sorted(SRC.iterdir()):
        if path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        try:
            source = Image.open(path)
        except Exception as exc:  # noqa: BLE001 — битый файл просто пропускаем
            print(f"[photos] не открылось {path.name}: {exc}")
            skipped += 1
            continue

        result = fit_square(cut_background(source))
        target = DST / f"{path.stem}-photo.png"
        result.save(target, optimize=True)

        visible = np.array(result)[:, :, 3] > 8
        share = visible.mean()
        flag = "  ← мало содержимого" if share < 0.04 else ""
        print(f"[photos] {target.name}: {share * 100:.1f}% кадра{flag}")
        done += 1

    print(f"[photos] готово {done}, пропущено {skipped}")


if __name__ == "__main__":
    main()
