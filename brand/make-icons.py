# Pravi sve ikone (aplikacija + sajt) iz brand/logo-source.jpg. Pokretanje: python brand/make-icons.py
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
src = Image.open(root / "brand" / "logo-source.jpg").convert("RGB")
W, H = src.size
px = src.load()

# okvir zlatnog znaka (bez natpisa ispod i bez vodenog žiga)
xs, ys = [], []
for y in range(0, int(H * 0.62)):
    for x in range(0, W):
        r, g, b = px[x, y]
        if r > 150 and r - b > 70:
            xs.append(x)
            ys.append(y)
x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
bg = px[40, 40]
print("znak:", x0, y0, x1, y1, "pozadina:", bg)

# znak izrezan i zalepljen na čistu pozadinu (da nema ivica fotografije)
mark = src.crop((x0 - 6, y0 - 6, x1 + 7, y1 + 7))


def icon(size: int, fill: float) -> Image.Image:
    """fill = koliki deo ikone zauzima znak (maskable ikona traži manje, zbog isecanja ivica)"""
    canvas = Image.new("RGB", (size, size), bg)
    mw, mh = mark.size
    scale = size * fill / max(mw, mh)
    m = mark.resize((max(1, round(mw * scale)), max(1, round(mh * scale))), Image.LANCZOS)
    canvas.paste(m, ((size - m.width) // 2, (size - m.height) // 2))
    return canvas


def save(img: Image.Image, rel: str):
    p = root / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    img.save(p, optimize=True)


# aplikacija (admin)
a = "admin/public/"
save(icon(64, 0.66), a + "pwa-64x64.png")
save(icon(192, 0.66), a + "pwa-192x192.png")
save(icon(512, 0.66), a + "pwa-512x512.png")
save(icon(512, 0.5), a + "maskable-icon-512x512.png")
save(icon(180, 0.62), a + "apple-touch-icon-180x180.png")
save(icon(256, 0.7), a + "favicon.png")
icon(256, 0.78).save(root / a / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

# sajt
save(icon(512, 0.66), "public/icon.png")
save(icon(180, 0.62), "public/apple-touch-icon.png")
icon(256, 0.78).save(root / "public/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
save(icon(48, 0.8), "public/favicon-48.png")
