"""Maakt een tijdelijk app-icoon (build/icon.png en build/icon.ico).

Vervang build/icon.png (minstens 512x512) door het officiële IGMG-logo en
draai dit script niet meer, of pas het aan.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "node_modules/@fontsource/amiri/files/amiri-arabic-700-normal.woff"
SIZE = 1024

img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.rounded_rectangle([40, 40, SIZE - 40, SIZE - 40], radius=200, fill=(15, 107, 92, 255))
font = ImageFont.truetype(str(FONT), 400)
draw.text((SIZE / 2, SIZE / 2 - 30), "ا ب", font=font, fill=(255, 255, 255, 255), anchor="mm")

out = ROOT / "build"
out.mkdir(exist_ok=True)
img.resize((512, 512), Image.LANCZOS).save(out / "icon.png")
img.save(out / "icon.ico", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print("Icoon gemaakt in", out)
