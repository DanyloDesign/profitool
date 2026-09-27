"""
Profitool · per-model product photos (task 013).

Category+brand photos (prepare_photos.py) put several models behind one picture.
This script adds a second, additive path: a product can have its own photo keyed
by `slug` (its id in src/data/products.ts), stored as `/products/{slug}-photo.png`.
`imageOf()` in src/lib/shop.ts is expected to prefer this file when it exists and
fall back to the category+brand photo otherwise.

Sources are listed in `rozetka-ids-by-slug.json` ({ "makita-dhr243z": <rozetka
product id> | null }). When a source jpg is missing, this script tries to fetch
the rozetka packshot for that id first (best effort — rozetka.com.ua sits behind
a Cloudflare bot check that a plain HTTP client cannot pass, so this usually just
logs a miss). Actual sourcing for task 013 was done by hand: a real packshot for
each model was found on the manufacturer's site or a retailer that was reachable,
saved to `public/products/real/{slug}.jpg`, and is picked up here unchanged.

Processing (background cut + crop + fit into a 760×760-ish square, same recipe as
prepare_photos.py) is imported from prepare_photos.py, not duplicated, so both
scripts stay visually identical. Running this script never touches the existing
`{category}-{brand}-photo.png` files — only `{slug}-photo.png` files are written.

    python3 tools/products/prepare_slug_photos.py
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from prepare_photos import cut_background, fit_square  # noqa: E402

try:
    import requests
except ImportError:  # optional — only needed for the rozetka fetch attempt
    requests = None

from PIL import Image

ROOT = Path(__file__).parent
SRC = Path("public/products/real")
DST = Path("public/products")
MAP_FILE = ROOT / "rozetka-ids-by-slug.json"
# CLAUDE.md documents the catalog square as 760x760; prepare_photos.py's own
# SIZE constant has drifted to 900 (the already-committed category+brand photos
# on disk are 760x760), so this is passed explicitly rather than imported.
SIZE = 760


def try_fetch_from_rozetka(slug: str, product_id: int, target: Path) -> bool:
    """Best-effort download of a rozetka packshot by product id.

    rozetka.com.ua is behind Cloudflare's bot check, which a plain HTTP client
    cannot solve (and this pipeline must not try to bypass bot detection). This
    is here so the map is wired up end-to-end for whoever runs it from a session
    that already has a rozetka clearance cookie; it fails soft otherwise.
    """
    if requests is None:
        return False
    api = f"https://xl-catalog-api.rozetka.com.ua/v4/goods/get?goods_id={product_id}&lang=ua"
    try:
        resp = requests.get(api, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        image_url = data.get("data", {}).get("images", {}).get("main")
        if not image_url:
            return False
        img_resp = requests.get(image_url, timeout=10)
        img_resp.raise_for_status()
        target.write_bytes(img_resp.content)
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"[slug-photos] rozetka fetch failed for {slug} ({product_id}): {exc}")
        return False


def find_source(slug: str) -> Path | None:
    for ext in (".jpg", ".jpeg", ".png", ".webp"):
        candidate = SRC / f"{slug}{ext}"
        if candidate.exists():
            return candidate
    return None


def main() -> None:
    if not MAP_FILE.exists():
        print(f"[slug-photos] no {MAP_FILE.name}, nothing to do")
        return

    mapping: dict[str, int | None] = json.loads(MAP_FILE.read_text(encoding="utf-8"))
    DST.mkdir(parents=True, exist_ok=True)

    done = skipped = 0
    for slug, product_id in sorted(mapping.items()):
        source = find_source(slug)
        if source is None and product_id:
            candidate = SRC / f"{slug}.jpg"
            if try_fetch_from_rozetka(slug, product_id, candidate):
                source = candidate

        if source is None:
            print(f"[slug-photos] {slug}: no source in {SRC}/ and no usable rozetka id — skipped")
            skipped += 1
            continue

        try:
            image = Image.open(source)
        except Exception as exc:  # noqa: BLE001
            print(f"[slug-photos] {slug}: could not open {source.name}: {exc}")
            skipped += 1
            continue

        result = fit_square(cut_background(image), SIZE)
        target = DST / f"{slug}-photo.png"
        result.save(target, optimize=True)
        done += 1
        print(f"[slug-photos] {target.name}: ok (source {source.name})")

    print(f"[slug-photos] done {done}, skipped {skipped}")


if __name__ == "__main__":
    main()
