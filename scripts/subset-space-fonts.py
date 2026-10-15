"""Rebuild local JinKai subsets after changing copy. Full fonts are supplied locally."""
import argparse
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

parser=argparse.ArgumentParser()
parser.add_argument('--regular',type=Path,required=True)
parser.add_argument('--medium',type=Path,required=True)
args=parser.parse_args()
root=Path(__file__).resolve().parent.parent
characters=set()
for file in (root/'src').rglob('*'):
    if file.suffix in ['.jsx','.astro','.js','.ts','.json','.css']:
        characters.update(file.read_text(encoding='utf-8'))
for weight,source in [('Regular',args.regular),('Medium',args.medium)]:
    output=root/f'public/assets/space/JinKai-{weight}.woff2'
    baseline=set(TTFont(output).getBestCmap())
    font=TTFont(source)
    cmap=font.getBestCmap()
    wanted=baseline|{ord(c) for c in characters if ord(c) in cmap}
    sub=subset.Subsetter(options=subset.Options())
    sub.populate(unicodes=wanted)
    sub.subset(font)
    font.flavor='woff2'
    font.save(output)
    missing=[c for c in characters if '\u3400'<=c<='\u9fff' and ord(c) not in font.getBestCmap()]
    if missing:raise RuntimeError(f'Missing CJK glyphs: {missing}')
    print(f'{weight}: {len(font.getBestCmap())} glyphs, {output.stat().st_size} bytes; no missing CJK glyphs')
