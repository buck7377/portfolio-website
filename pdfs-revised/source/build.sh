#!/usr/bin/env bash
# Rebuild every PDF in pdfs-revised/ from the markup in this folder.
# Needs: python-reportlab, ttf-carlito
set -euo pipefail
cd "$(dirname "$0")"
for f in [0-9][0-9]_*.txt; do
  python3 render.py "$f" "../${f%.txt}.pdf"
done
