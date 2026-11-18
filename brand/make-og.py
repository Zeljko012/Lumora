# Pravi public/og-default.jpg (slika koja se vidi kad se link sajta pošalje na Instagram, WhatsApp, Facebook...)
# iz pravog Lumora loga (brand/logo-source.jpg). Pokretanje: python brand/make-og.py
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

root = Path(__file__).resolve().parent.parent
src = Image.open(root / "brand" / "logo-source.jpg").convert("RGB")
bg = src.getpixel((40, 40))

# znak + natpis LUMORA (bez Gemini vodenog žiga u donjem desnom uglu)
logo = src.crop((250, 290, 790, 800))

W, H = 1200, 630
canvas = Image.new("RGB", (W, H), bg)
lh = 420
lw = round(logo.width * lh / logo.height)
logo = logo.resize((lw, lh), Image.LANCZOS)
# mekani rubovi, da se ne vidi ivica isečka fotografije loga
mask = Image.new("L", logo.size, 0)
ImageDraw.Draw(mask).rectangle([36, 36, logo.width - 36, logo.height - 36], fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(24))
canvas.paste(logo, ((W - lw) // 2, 30), mask)

# slogan ispod loga, zlatnom bojom iz logoa
gold = (214, 170, 62)
d = ImageDraw.Draw(canvas)
font = None
for f in (r"C:\Windows\Fonts\segoeui.ttf", r"C:\Windows\Fonts\arial.ttf"):
    try:
        font = ImageFont.truetype(f, 34)
        break
    except OSError:
        pass
text = "Skulpturalne 3D dekoracije, izrađene u Srbiji"
tw = d.textlength(text, font=font)
d.text(((W - tw) / 2, 505), text, font=font, fill=gold)

out = root / "public" / "og-default.jpg"
canvas.save(out, "JPEG", quality=90, optimize=True)
print("✓", out, canvas.size)
