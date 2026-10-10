"""Maakt DEMO-bestanden (testtonen en een voorbeeld-PDF) in public/content.

Dit is GEEN echte inhoud: geen recitatie en geen lesmateriaal. Vervang deze
bestanden door goedgekeurde IGMG-inhoud (zie README.md, 'Inhoud vervangen').
"""
import json
import math
import struct
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / "public" / "content" / "audio"
PDF = ROOT / "public" / "content" / "pdf"
RATE = 16000


def tone(path, freqs, seconds_each):
    frames = bytearray()
    for f in freqs:
        n = int(RATE * seconds_each)
        for i in range(n):
            fade = min(1.0, i / 400, (n - i) / 400)
            frames += struct.pack("<h", int(9000 * fade * math.sin(2 * math.pi * f * i / RATE)))
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(bytes(frames))


def make_audio():
    AUDIO.mkdir(parents=True, exist_ok=True)
    letters = json.loads((ROOT / "src" / "content" / "letters.json").read_text("utf8"))
    for i, letter in enumerate(letters):
        tone(AUDIO / f"demo-{letter['id']}.wav", [330 + i * 30], 0.7)
    tone(AUDIO / "demo-recitatie-1.wav", [262, 294, 330, 349, 392, 349, 330, 294], 0.5)
    tone(AUDIO / "demo-recitatie-2.wav", [392, 440, 392, 349, 330], 0.6)


def make_pdf():
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.pdfgen import canvas

    pdfmetrics.registerFont(TTFont("DejaVu", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
    PDF.mkdir(parents=True, exist_ok=True)
    letters = json.loads((ROOT / "src" / "content" / "letters.json").read_text("utf8"))
    c = canvas.Canvas(str(PDF / "demo-lesboek.pdf"), pagesize=A4)
    c.setTitle("DEMO - voorbeeld-lesboek")
    width, height = A4
    pages = [letters[i:i + 4] for i in range(0, len(letters), 4)]
    for number, group in enumerate(pages, start=1):
        c.setFont("DejaVu", 12)
        c.drawString(40, height - 40, "DEMO – voorbeeld-PDF, geen officieel lesmateriaal")
        c.setFont("DejaVu", 22)
        c.drawString(40, height - 90, f"Pagina {number}")
        for j, letter in enumerate(group):
            y = height - 200 - j * 150
            c.setFont("DejaVu", 72)
            c.drawString(80, y, letter["char"])
            c.setFont("DejaVu", 28)
            c.drawString(220, y + 20, letter["name"])
        c.setFont("DejaVu", 10)
        c.drawString(40, 30, f"{number} / {len(pages)}")
        c.showPage()
    c.save()


if __name__ == "__main__":
    make_audio()
    make_pdf()
    print("Demo-bestanden gemaakt in", ROOT / "public" / "content")
