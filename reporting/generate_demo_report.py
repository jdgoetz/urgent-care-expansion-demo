from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "reporting" / "demo_report_data.json"
OUTPUT = ROOT / "docs" / "sample" / "urgent_care_expansion_demo_report.docx"
ASSET_DIR = ROOT / "reporting" / "output"
NAVY = "173047"
TEAL = "136F63"
BLUE = "1F6F8B"
LIGHT = "E8EEF2"
GRAY = "607183"


def shade(cell, fill: str):
    properties = cell._tc.get_or_add_tcPr()
    node = OxmlElement("w:shd")
    node.set(qn("w:fill"), fill)
    properties.append(node)


def add_table(document: Document, headers, rows, widths=None):
    table = document.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    header_properties = table.rows[0]._tr.get_or_add_trPr()
    header_marker = OxmlElement("w:tblHeader")
    header_marker.set(qn("w:val"), "true")
    header_properties.append(header_marker)
    for index, header in enumerate(headers):
        cell = table.rows[0].cells[index]
        shade(cell, LIGHT)
        run = cell.paragraphs[0].add_run(str(header))
        run.bold = True
        run.font.size = Pt(8)
    for row in rows:
        cells = table.add_row().cells
        for index, value in enumerate(row):
            cells[index].text = str(value)
            for run in cells[index].paragraphs[0].runs:
                run.font.size = Pt(8)
    if widths:
        for row in table.rows:
            for index, width in enumerate(widths):
                row.cells[index].width = Inches(width)
    return table


def add_map(market_name: str, rank: int) -> Path:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    path = ASSET_DIR / ("map_" + str(rank) + ".png")
    image = Image.new("RGB", (900, 360), "#edf2f4")
    draw = ImageDraw.Draw(image)
    outline = [(90, 90), (220, 55), (500, 70), (760, 125), (810, 245), (640, 300), (300, 285), (120, 220)]
    draw.polygon(outline, fill="#dce7eb", outline="#8ca5b4", width=4)
    for index in range(24):
        x = 130 + ((index * 107) % 620)
        y = 100 + ((index * 53) % 155)
        draw.ellipse((x - 4, y - 4, x + 4, y + 4), fill="#9cb3bf")
    x = 220 + rank * 145
    y = 155 + rank * 24
    draw.ellipse((x - 14, y - 14, x + 14, y + 14), fill="#136f63", outline="white", width=4)
    draw.text((x + 20, y - 8), market_name, fill="#173047")
    image.save(path)
    return path


def configure(document: Document):
    section = document.sections[0]
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(0.8)
    section.right_margin = Inches(0.8)
    normal = document.styles["Normal"]
    normal.font.name = "Arial"
    normal.font.size = Pt(10)
    normal.font.color.rgb = RGBColor.from_string(NAVY)
    for name, size in (("Heading 1", 18), ("Heading 2", 14), ("Heading 3", 11)):
        style = document.styles[name]
        style.font.name = "Arial"
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor.from_string(BLUE)


def build_report():
    payload = json.loads(DATA.read_text(encoding="utf-8"))
    document = Document()
    configure(document)

    title = document.add_paragraph()
    title.paragraph_format.space_before = Pt(100)
    title_run = title.add_run("Urgent Care Expansion\nIntelligence Demo")
    title_run.font.name = "Arial"
    title_run.font.size = Pt(28)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor.from_string(NAVY)
    subtitle = document.add_paragraph("Synthetic public portfolio report")
    subtitle.runs[0].font.size = Pt(15)
    subtitle.runs[0].font.color.rgb = RGBColor.from_string(TEAL)
    note = document.add_paragraph()
    note.paragraph_format.space_before = Pt(30)
    note.add_run("Boundary: ").bold = True
    note.add_run("All markets, organizations, metrics, and opportunities are fictional. Scoring is illustrative.")
    document.add_page_break()

    document.add_heading("Executive Methodology", level=1)
    document.add_paragraph("A compact public demonstration of the decision workflow:")
    add_table(document, ["Stage", "Decision question"], [
        ["Market fundamentals", "Is the synthetic market structurally attractive?"],
        ["Demo Expansion Score", "How do five transparent normalized components compare?"],
        ["Entry opportunities", "Is there an illustrative listed, off-market, or real-estate path?"],
        ["Entry Feasibility", "How strong is the best available demo path?"],
        ["Near-Term Priority", "Where should fictional diligence happen first?"],
    ], [2.0, 5.0])
    document.add_paragraph()
    document.add_heading("Ranked Markets", level=2)
    add_table(document, ["Rank", "Market", "Metro", "Near-Term", "Expansion", "Entry"], [
        [market["rank"], market["name"], market["metro"], market["near_term"], market["expansion"], market["entry"]]
        for market in payload["markets"]
    ])
    document.add_paragraph("Public model: demo_expansion_score_v1. This report does not reproduce production weights or opportunity logic.")

    for market in payload["markets"]:
        document.add_page_break()
        document.add_heading(str(market["rank"]) + ". " + market["name"], level=1)
        document.add_paragraph(market["metro"] + " | " + market["state"] + " | Synthetic market")
        score_table = add_table(document, ["Near-Term Priority", "Demo Expansion Score", "Entry Feasibility"], [[market["near_term"], market["expansion"], market["entry"]]])
        for cell in score_table.rows[1].cells:
            cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in cell.paragraphs[0].runs:
                run.bold = True
                run.font.size = Pt(15)
                run.font.color.rgb = RGBColor.from_string(TEAL)
        map_path = add_map(market["name"], market["rank"])
        paragraph = document.add_paragraph()
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        map_image = paragraph.add_run().add_picture(str(map_path), width=Inches(5.9))
        map_image._inline.docPr.set("title", "Synthetic market map")
        map_image._inline.docPr.set("descr", "Fictional market context for " + market["name"])
        caption = document.add_paragraph("Fictional market context", style=None)
        caption.alignment = WD_ALIGN_PARAGRAPH.CENTER
        caption.runs[0].italic = True
        caption.runs[0].font.size = Pt(8)

        document.add_heading("Market Overview", level=2)
        add_table(document, ["Indicator", "Value"], market["kpis"], [4.6, 2.4])
        document.add_heading("Competitors", level=2)
        add_table(document, ["Competitor", "Rating", "Reviews", "Weekly hours", "Operator / type"], market["competitors"])
        document.add_heading("Entry Opportunities", level=2)
        add_table(document, ["Path", "Illustrative opportunity", "Score", "Confidence"], market["opportunities"])
        document.add_heading("Metric Scoring", level=2)
        add_table(document, ["Metric", "Normalized", "Weight", "Contribution"], market["metrics"])
        document.add_paragraph("Source lineage: deterministic synthetic generator. No production source records are included.")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document.save(OUTPUT)
    return OUTPUT


if __name__ == "__main__":
    print(build_report())
