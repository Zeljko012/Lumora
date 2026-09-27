import csv, json, re, sys, html, os

SRC = r"C:\Users\Zeljko\Desktop\products_export_1.csv"
OUT = os.path.join(os.path.dirname(__file__), "products-source.json")

def clean_text_from_html(h):
    if not h:
        return []
    parts = re.split(r"</p>", h)
    blocks = []
    for p in parts:
        t = p
        t = re.sub(r"<br\s*/?>", "\n", t, flags=re.I)
        t = re.sub(r"<[^>]+>", "", t)
        t = html.unescape(t)
        t = t.replace("\r", "")
        lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in t.split("\n")]
        t = "\n".join([ln for ln in lines]).strip()
        if t:
            blocks.append(t)
    return blocks

products = {}
order = []

with open(SRC, encoding="utf-8-sig", newline="") as f:
    r = csv.DictReader(f)
    for row in r:
        h = (row.get("Handle") or "").strip()
        if not h:
            continue
        if h not in products:
            products[h] = {
                "handle": h,
                "title": (row.get("Title") or "").strip(),
                "body_blocks": clean_text_from_html(row.get("Body (HTML)") or ""),
                "category_raw": (row.get("Product Category") or "").strip(),
                "type": (row.get("Type") or "").strip(),
                "tags": (row.get("Tags") or "").strip(),
                "seo_title": (row.get("SEO Title") or "").strip(),
                "seo_description": (row.get("SEO Description") or "").strip(),
                "price": (row.get("Variant Price") or "").strip(),
                "compare_at": (row.get("Variant Compare At Price") or "").strip(),
                "status": (row.get("Status") or "").strip(),
                "option1_name": (row.get("Option1 Name") or "").strip(),
                "colors": [],
                "images": [],
                "inventory": [],
            }
            order.append(h)
        p = products[h]
        opt1 = (row.get("Option1 Value") or "").strip()
        if opt1 and opt1 not in p["colors"]:
            p["colors"].append(opt1)
        qty = (row.get("Variant Inventory Qty") or "").strip()
        if opt1:
            p["inventory"].append({"color": opt1, "qty": qty})
        img = (row.get("Image Src") or "").strip()
        if img:
            p["images"].append({
                "src": img,
                "pos": (row.get("Image Position") or "").strip(),
                "alt": (row.get("Image Alt Text") or "").strip(),
            })
        cp = (row.get("Color (product.metafields.shopify.color-pattern)") or "").strip()
        if cp and not p.get("color_pattern"):
            p["color_pattern"] = [c.strip() for c in cp.split(";") if c.strip()]

result = [products[h] for h in order]

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"Wrote {len(result)} products -> {OUT}")
