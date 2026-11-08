"""Screenshot the showcase page and the editor at desktop and phone widths.

Needs both dev servers running (site on 24045, studio on 24044) and a Python
with playwright installed. The spike used the dt_ml venv:
  C:\\Users\\Arath\\.venvs\\dt_ml\\Scripts\\python.exe studio/screenshots/capture.py
Writes showcase_1440.png, showcase_390.png, editor_1440.png, editor_390.png
next to this file and prints console errors it saw.
"""
from __future__ import annotations

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
SITE = "http://127.0.0.1:24045/showcase/studio-showcase"
STUDIO = "http://127.0.0.1:24044/?file=showcase%2Fstudio-showcase.mdx"


def shoot(browser, url: str, width: int, height: int, out: Path, full_page: bool, settle_ms: int, scroll: bool):
    page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
    errors: list[str] = []
    page.on("console", lambda m: errors.append(f"[{m.type}] {m.text}") if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: errors.append(f"[pageerror] {e}"))
    # "load", not "networkidle": the map tiles and the embedded iframe keep the network busy.
    page.goto(url, wait_until="load", timeout=120_000)
    page.wait_for_timeout(4000)
    if scroll:
        # Walk the page so lazy chunks and the scrollytelling observer fire.
        total = page.evaluate("document.body.scrollHeight")
        y = 0
        while y < total:
            page.evaluate(f"window.scrollTo(0, {y})")
            page.wait_for_timeout(150)
            y += 600
        page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(settle_ms)
    page.screenshot(path=str(out), full_page=full_page)
    print(f"wrote {out} ({out.stat().st_size} bytes) from {url} at {width}x{height}")
    for e in errors[:15]:
        print("   ", e[:300])
    if len(errors) > 15:
        print(f"    ... {len(errors) - 15} more")
    page.close()


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        shoot(browser, SITE, 1440, 900, HERE / "showcase_1440.png", True, 2500, True)
        shoot(browser, SITE, 390, 844, HERE / "showcase_390.png", True, 2500, True)
        shoot(browser, STUDIO, 1440, 900, HERE / "editor_1440.png", False, 6000, False)
        shoot(browser, STUDIO, 390, 844, HERE / "editor_390.png", False, 6000, False)
        browser.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
