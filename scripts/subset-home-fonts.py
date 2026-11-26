"""Update the Chinese homepage fonts after `npm run build`.

Requires FontTools with WOFF2 support. Run `npm run build` again after this
script to copy the regenerated fonts from public/ into dist/. The existing
JinKai fonts remain the fallback for characters added between subset updates.
"""
from html.parser import HTMLParser
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont


class PageText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.in_code = False

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style"}:
            self.in_code = True

    def handle_endtag(self, tag):
        if tag in {"script", "style"}:
            self.in_code = False

    def handle_data(self, data):
        if not self.in_code:
            self.parts.append(data)


def main():
    root = Path(__file__).resolve().parent.parent
    page = PageText()
    page.feed((root / "dist/zh/index.html").read_text(encoding="utf-8"))
    # Include labels that only appear after changing rooms or comparison modes.
    for component in ("StudioHome", "StudioShell"):
        page.parts.append((root / f"src/components/space/{component}.jsx").read_text(encoding="utf-8"))
    characters = {ord(c) for text in page.parts for c in text if ord(c) >= 0x2E80}
    folder = root / "public/assets/space"
    for weight in ("Regular", "Medium"):
        with TTFont(folder / f"JinKai-{weight}.woff2", recalcTimestamp=False) as font:
            glyphs = characters.intersection(font.getBestCmap())
            options = subset.Options(layout_features=["*"])
            subsetter = subset.Subsetter(options=options)
            subsetter.populate(unicodes=glyphs)
            subsetter.subset(font)
            output = folder / f"JinKai-Home-{weight}.woff2"
            font.save(output)
            print(f"{output.name}: {len(glyphs)} characters, {output.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
