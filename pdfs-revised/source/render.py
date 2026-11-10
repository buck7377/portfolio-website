"""Render portfolio writing-sample markup to PDF, matching the original ReportLab template.

Markup: blocks separated by blank lines.
  @kicker TEXT     category line + navy rule
  @title TEXT      H1 (deck: slide title)
  @h2 / @h3 TEXT   headings
  @label TEXT      small gray caps label (SLIDE 1, HERO, ...)
  @rule            section divider
  @page            page break
  @quote TEXT      italic indented paragraph
  @img PATH WIDTH_PT
  - TEXT           bullet
  TEXT             body paragraph (inline <b>, <i> allowed)
First line may be "@deck" for landscape slide layout.
"""
import sys
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.colors import HexColor, black
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                                PageBreak, Image, KeepTogether, Spacer, Table, TableStyle)
from reportlab.platypus.flowables import HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.fonts import addMapping

FD = "/usr/share/fonts/carlito/"
for name, f in [("Carlito", "Carlito-Regular"), ("Carlito-Bold", "Carlito-Bold"),
                ("Carlito-Italic", "Carlito-Italic"), ("Carlito-BoldItalic", "Carlito-BoldItalic")]:
    pdfmetrics.registerFont(TTFont(name, FD + f + ".ttf"))
addMapping("Carlito", 0, 0, "Carlito"); addMapping("Carlito", 1, 0, "Carlito-Bold")
addMapping("Carlito", 0, 1, "Carlito-Italic"); addMapping("Carlito", 1, 1, "Carlito-BoldItalic")

NAVY = HexColor("#1f3a5f")
GRAY = HexColor("#5a6472")
MARGIN = 61.2


def styles(deck):
    body_sz, body_ld = (15, 21) if deck else (11, 15.5)
    S = {}
    S["kicker"] = ParagraphStyle("kicker", fontName="Carlito", fontSize=9.5, leading=12,
                                 textColor=GRAY, keepWithNext=1)
    S["title"] = ParagraphStyle("title", fontName="Carlito-Bold", fontSize=26 if deck else 22,
                                leading=31 if deck else 27, textColor=NAVY,
                                spaceBefore=10, spaceAfter=4, keepWithNext=1)
    S["body"] = ParagraphStyle("body", fontName="Carlito", fontSize=body_sz, leading=body_ld,
                               textColor=black, spaceAfter=7)
    S["h2"] = ParagraphStyle("h2", fontName="Carlito-Bold", fontSize=15, leading=19,
                             textColor=NAVY, spaceBefore=12, spaceAfter=4, keepWithNext=1)
    S["h3"] = ParagraphStyle("h3", fontName="Carlito-Bold", fontSize=12.5, leading=16,
                             textColor=black, spaceBefore=8, spaceAfter=2, keepWithNext=1)
    S["label"] = ParagraphStyle("label", fontName="Carlito-Bold", fontSize=8.5, leading=11,
                                textColor=GRAY, spaceBefore=8, spaceAfter=0, keepWithNext=1)
    S["bullet"] = ParagraphStyle("bullet", parent=S["body"], leftIndent=14, bulletIndent=0,
                                 bulletFontName="Helvetica", bulletFontSize=9)
    S["lead"] = ParagraphStyle("lead", parent=S["body"], keepWithNext=1)
    S["quote"] = ParagraphStyle("quote", parent=S["body"], fontName="Carlito-Italic",
                                leftIndent=14, rightIndent=14)
    return S


def doc_width(page):
    return page[0] - 2 * MARGIN - 12


def parse(path):
    raw = open(path, encoding="utf-8").read().strip()
    blocks = [b.strip() for b in raw.split("\n\n") if b.strip()]
    deck = blocks and blocks[0] == "@deck"
    if deck:
        blocks = blocks[1:]
    return deck, blocks


def build(src, out):
    deck, blocks = parse(src)
    page = landscape(letter) if deck else letter
    S = styles(deck)
    story, title, kicker = [], None, None
    for b in blocks:
        b = " ".join(b.split("\n"))
        if b.startswith("@kicker "):
            kicker = b[8:]
            story.append(Paragraph(kicker, S["kicker"]))
            story.append(HRFlowable(width="100%", thickness=0.8, color=NAVY, lineCap="round",
                                    spaceBefore=3, spaceAfter=0))
        elif b == "@rule":
            story.append(HRFlowable(width="100%", thickness=0.8, color=NAVY, lineCap="round",
                                    spaceBefore=6.6, spaceAfter=0))
        elif b == "@page":
            story.append(PageBreak())
        elif b.startswith("@img "):
            _, p, w = b.split()
            img = Image(p)
            w = float(w)
            img.drawHeight = img.imageHeight * w / img.imageWidth
            img.drawWidth = w
            img.hAlign = "LEFT"
            story.append(Spacer(1, 4)); story.append(img); story.append(Spacer(1, 10))
        elif b.startswith("@imgrow "):
            paths = b.split()[1:]
            gap = 12
            imgs = [Image(p) for p in paths]
            # equal heights, widths proportional to aspect ratio, filling the text width
            aspect_sum = sum(im.imageWidth / im.imageHeight for im in imgs)
            h = (doc_width(page) - gap * (len(imgs) - 1)) / aspect_sum
            widths = []
            for im in imgs:
                im.drawHeight = h
                im.drawWidth = h * im.imageWidth / im.imageHeight
                widths.append(im.drawWidth)
            row, cols = [], []
            for i, im in enumerate(imgs):
                row.append(im); cols.append(widths[i])
                if i < len(imgs) - 1:
                    row.append(""); cols.append(gap)
            t = Table([row], colWidths=cols)
            t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                                   ("LEFTPADDING", (0, 0), (-1, -1), 0),
                                   ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                                   ("TOPPADDING", (0, 0), (-1, -1), 0),
                                   ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))
            t.hAlign = "LEFT"
            story.append(Spacer(1, 4)); story.append(t); story.append(Spacer(1, 10))
        elif b.startswith("- "):
            story.append(Paragraph(b[2:], S["bullet"], bulletText="•"))
        elif b.startswith("@"):
            tag, _, text = b.partition(" ")
            tag = tag[1:]
            if tag == "title" and title is None:
                title = text
            story.append(Paragraph(text, S[tag]))
        else:
            # scene directions stay with the narration that follows them
            st = S["lead"] if b.startswith("<b>Visual:</b>") else S["body"]
            story.append(Paragraph(b, st))

    def footer(c, d):
        c.saveState()
        c.setFont("Carlito", 8.5)
        c.setFillColor(GRAY)
        c.drawString(MARGIN, 32.4, "Writing sample by Zachary Clark")
        c.drawRightString(page[0] - MARGIN, 32.4, str(d.page))
        c.restoreState()

    doc = BaseDocTemplate(out, pagesize=page, leftMargin=MARGIN, rightMargin=MARGIN,
                          topMargin=54, bottomMargin=54,
                          title=title or "", author="Zachary Clark",
                          subject=kicker or "", creator="Zachary Clark")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="f")
    doc.addPageTemplates([PageTemplate(id="p", frames=[frame], onPage=footer)])
    doc.build(story)


if __name__ == "__main__":
    build(sys.argv[1], sys.argv[2])
