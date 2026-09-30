# Portfolio fonts

Chinese reading and headings use TsangerJinKai02 W04 (400) and W05 (500), from
[tw93/Kami](https://github.com/tw93/Kami/tree/main/assets/fonts). English uses
the visitor's Charter or Georgia. Metadata uses JetBrains Mono from
[Kami's website assets](https://github.com/tw93/Kami/tree/main/site/assets/fonts).

The two Chinese WOFF2 files contain characters used by the current `src/` files.
Missing characters use the declared CJK serif fallbacks. After adding new Chinese
copy, regenerate both subsets with the installed FontTools `pyftsubset` command:

```powershell
# PowerShell 7; keep full source TTFs and this temporary text file outside the repo.
$charactersPath = Join-Path $env:TEMP 'kenny-font-characters.txt'
$sourceText = foreach ($sourcePath in (rg --files src)) { Get-Content -Raw -LiteralPath $sourcePath }
($sourceText -join "`n") | Set-Content -LiteralPath $charactersPath -Encoding utf8
pyftsubset /path/to/TsangerJinKai02-W04.ttf --flavor=woff2 --layout-features='*' "--text-file=$charactersPath" --output-file=public/assets/fonts/TsangerJinKai02-Regular.woff2
pyftsubset /path/to/TsangerJinKai02-W05.ttf --flavor=woff2 --layout-features='*' "--text-file=$charactersPath" --output-file=public/assets/fonts/TsangerJinKai02-Medium.woff2
```

Font terms are separate from Kami's MIT code license. Kami's README identifies
TsangerJinKai02 as free for personal use; commercial use requires a license from
[Tsanger](https://tsanger.cn). Preserve that distinction when reusing these assets.
JetBrains Mono is under the SIL Open Font License; see `OFL-JetBrainsMono.txt`.
