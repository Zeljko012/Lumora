# Pravi JPG kopije slika proizvoda za Meta katalog (Meta traži JPEG/PNG, a sajt koristi WebP).
# Pokretanje: python scripts/gen-meta-images.py  ->  public/images/meta/<slug>-<n>.jpg
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
src = root / "public" / "images" / "products"
dst = root / "public" / "images" / "meta"
dst.mkdir(parents=True, exist_ok=True)
n = 0
for d in sorted(p for p in src.iterdir() if p.is_dir()):
    for i in (1, 2, 3):
        f = d / f"{i}-lg.webp"
        if not f.exists():
            f = d / f"{i}.webp"
        if not f.exists():
            continue
        im = Image.open(f).convert("RGB")
        im.save(dst / f"{d.name}-{i}.jpg", "JPEG", quality=86, optimize=True)
        n += 1
print(n, "slika")
