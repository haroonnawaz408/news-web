"""
Generate Complete XML Sitemap for PulseNews Pakistan.
Fetches all live posts from Supabase and builds a standards-compliant sitemap.xml.
"""
import os
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(".env")
load_dotenv("automation/.env")

SB_URL = os.getenv("VITE_SUPABASE_URL")
SB_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

DOMAIN = "https://pulsenews.pk"

STATIC_ROUTES = [
    {"loc": "/", "priority": "1.0", "changefreq": "always"},
    {"loc": "/category/pakistan", "priority": "0.9", "changefreq": "hourly"},
    {"loc": "/category/politics", "priority": "0.8", "changefreq": "hourly"},
    {"loc": "/category/sports", "priority": "0.8", "changefreq": "hourly"},
    {"loc": "/category/business", "priority": "0.8", "changefreq": "hourly"},
    {"loc": "/category/entertainment", "priority": "0.8", "changefreq": "hourly"},
    {"loc": "/category/technology", "priority": "0.8", "changefreq": "daily"},
    {"loc": "/category/world", "priority": "0.8", "changefreq": "daily"},
    {"loc": "/country/pk", "priority": "0.9", "changefreq": "hourly"},
    {"loc": "/about", "priority": "0.6", "changefreq": "monthly"},
    {"loc": "/contact", "priority": "0.6", "changefreq": "monthly"},
    {"loc": "/editorial-policy", "priority": "0.6", "changefreq": "monthly"},
    {"loc": "/privacy", "priority": "0.5", "changefreq": "monthly"},
    {"loc": "/terms", "priority": "0.5", "changefreq": "monthly"},
]

posts = []
if SB_URL and SB_KEY:
    try:
        r = requests.get(
            f"{SB_URL.rstrip('/')}/rest/v1/posts?select=slug,created_at,updated_at&limit=500",
            headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"},
            timeout=15,
        )
        if r.status_code == 200:
            posts = r.json()
    except Exception as e:
        print(f"[!] Supabase fetch error: {e}")

today = datetime.utcnow().strftime("%Y-%m-%d")

xml_lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">',
]

for route in STATIC_ROUTES:
    xml_lines.append(f"  <url>")
    xml_lines.append(f"    <loc>{DOMAIN}{route['loc']}</loc>")
    xml_lines.append(f"    <lastmod>{today}</lastmod>")
    xml_lines.append(f"    <changefreq>{route['changefreq']}</changefreq>")
    xml_lines.append(f"    <priority>{route['priority']}</priority>")
    xml_lines.append(f"  </url>")

for p in posts:
    slug = p.get("slug")
    if not slug:
        continue
    lastmod = (p.get("updated_at") or p.get("created_at") or today)[:10]
    xml_lines.append(f"  <url>")
    xml_lines.append(f"    <loc>{DOMAIN}/news/{slug}</loc>")
    xml_lines.append(f"    <lastmod>{lastmod}</lastmod>")
    xml_lines.append(f"    <changefreq>daily</changefreq>")
    xml_lines.append(f"    <priority>0.9</priority>")
    xml_lines.append(f"  </url>")

xml_lines.append("</urlset>")

output_path = "public/sitemap.xml"
with open(output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(xml_lines) + "\n")

print(f"[DONE] Generated sitemap with {len(STATIC_ROUTES)} static pages and {len(posts)} articles.")
