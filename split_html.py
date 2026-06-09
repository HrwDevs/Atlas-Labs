#!/usr/bin/env python3
"""
split_html.py
=============
Splits index.html and writes directly into your existing project files:

    index.html   ← cleaned up (no more inline <style> or <script>)
    style.css    ← all CSS from <style> blocks
    script.js    ← all JS from <script> blocks
    assets/
        image_001.png
        image_002.webp
        ...

Just run:  python split_html.py
"""

import os
import re
import base64

MIME_TO_EXT = {
    "image/png":     "png",
    "image/jpeg":    "jpg",
    "image/jpg":     "jpg",
    "image/gif":     "gif",
    "image/webp":    "webp",
    "image/svg+xml": "svg",
    "image/bmp":     "bmp",
    "image/ico":     "ico",
    "image/x-icon":  "ico",
}

MAGIC = [
    (b"\x89PNG",          "png"),
    (b"\xff\xd8",         "jpg"),
    (b"GIF8",             "gif"),
    (b"RIFF",             "webp"),
    (b"<svg",             "svg"),
    (b"\x00\x00\x01\x00", "ico"),
]

def ext_from_bytes(data):
    for magic, ext in MAGIC:
        if data[:len(magic)] == magic:
            return ext
    return "bin"

def ext_for_data_uri(mime, data):
    return MIME_TO_EXT.get(mime.lower().strip()) or ext_from_bytes(data)


def split():
    base = os.path.dirname(os.path.abspath(__file__))

    src_html   = os.path.join(base, "index.html")
    dst_css    = os.path.join(base, "style.css")
    dst_js     = os.path.join(base, "script.js")
    dst_assets = os.path.join(base, "assets")

    if not os.path.isfile(src_html):
        print("❌  index.html not found next to this script.")
        return

    with open(src_html, "r", encoding="utf-8", errors="replace") as fh:
        html = fh.read()

    # ── 1. Extract <style> blocks ─────────────────────────────────────────
    style_blocks = []
    def collect_style(m):
        style_blocks.append(m.group(1))
        return ""
    html = re.sub(r"<style[^>]*>(.*?)</style>", collect_style, html,
                  flags=re.DOTALL | re.IGNORECASE)
    css_text = "\n\n".join(style_blocks).strip()

    # ── 2. Extract inline <script> blocks ────────────────────────────────
    script_blocks = []
    def collect_script(m):
        content = m.group(2)
        if content.strip():
            script_blocks.append(content)
            return ""
        return m.group(0)   # keep external <script src="…">
    html = re.sub(r"<script([^>]*)>(.*?)</script>", collect_script, html,
                  flags=re.DOTALL | re.IGNORECASE)
    js_text = "\n\n".join(script_blocks).strip()

    # ── 3. Extract base64 images ──────────────────────────────────────────
    os.makedirs(dst_assets, exist_ok=True)
    assets = []
    img_counter = [0]

    def replace_data_uri(m):
        mime    = m.group(1)
        b64data = re.sub(r"\s+", "", m.group(2))
        try:
            raw = base64.b64decode(b64data)
        except Exception:
            return m.group(0)
        img_counter[0] += 1
        ext   = ext_for_data_uri(mime, raw)
        fname = f"image_{img_counter[0]:03d}.{ext}"
        assets.append((fname, raw))
        return f"assets/{fname}"

    html = re.sub(
        r'data:([a-zA-Z0-9/+.\-]+);base64,([A-Za-z0-9+/=]+)',
        replace_data_uri, html, flags=re.DOTALL
    )

    # ── 4. Add <link> and <script> tags to index.html ────────────────────
    link_tag   = '<link rel="stylesheet" href="style.css">'
    script_tag = '<script src="script.js"></script>'

    if css_text:
        if re.search(r"</head>", html, re.IGNORECASE):
            html = re.sub(r"(</head>)", f"{link_tag}\n\\1", html, count=1,
                          flags=re.IGNORECASE)
        else:
            html = link_tag + "\n" + html

    if js_text:
        if re.search(r"</body>", html, re.IGNORECASE):
            html = re.sub(r"(</body>)", f"{script_tag}\n\\1", html, count=1,
                          flags=re.IGNORECASE)
        else:
            html += "\n" + script_tag

    # ── 5. Write files ────────────────────────────────────────────────────
    with open(src_html, "w", encoding="utf-8") as fh:
        fh.write(html)

    if css_text:
        with open(dst_css, "w", encoding="utf-8") as fh:
            fh.write(css_text)

    if js_text:
        with open(dst_js, "w", encoding="utf-8") as fh:
            fh.write(js_text)

    for fname, raw in assets:
        with open(os.path.join(dst_assets, fname), "wb") as fh:
            fh.write(raw)

    # ── 6. Summary ────────────────────────────────────────────────────────
    print("\n✅  Done!")
    print(f"   index.html  updated  ({len(html):,} chars)")
    print(f"   style.css   written  ({len(css_text):,} chars)" if css_text else "   ⚠  No CSS found")
    print(f"   script.js   written  ({len(js_text):,} chars)"  if js_text  else "   ⚠  No JS found")
    print(f"   assets/     {len(assets)} image(s)")


if __name__ == "__main__":
    split()
