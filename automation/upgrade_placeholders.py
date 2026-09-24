import os
import requests
from dotenv import load_dotenv

load_dotenv(".env")
load_dotenv("automation/.env")

SB_URL = os.getenv("VITE_SUPABASE_URL")
SB_KEY = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

if not SB_URL or not SB_KEY:
    print("[!] Missing Supabase credentials")
    exit(1)

endpoint = f"{SB_URL.rstrip('/')}/rest/v1/posts"
headers = {
    "apikey": SB_KEY,
    "Authorization": f"Bearer {SB_KEY}",
    "Content-Type": "application/json",
}

r = requests.get(f"{endpoint}?select=id,title,category,featured_image&limit=300", headers=headers, timeout=15)
posts = r.json()
picsum_posts = [p for p in posts if "picsum.photos" in (p.get("featured_image") or "")]

CATEGORY_PHOTOS = {
    "Pakistan": "https://images.unsplash.com/photo-1586183185324-5d5d836551b8?w=1200&q=80",
    "Politics": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80",
    "Sports": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=80",
    "Business": "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80",
    "Technology": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
    "World": "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=1200&q=80",
    "Entertainment": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
    "Science": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=1200&q=80",
}

fixed = 0
for p in picsum_posts:
    cat = p.get("category") or "Pakistan"
    new_img = CATEGORY_PHOTOS.get(cat, CATEGORY_PHOTOS["Pakistan"])
    pid = p["id"]
    patch_r = requests.patch(f"{endpoint}?id=eq.{pid}", headers=headers, json={"featured_image": new_img}, timeout=10)
    if patch_r.status_code in (200, 204):
        fixed += 1
        print(f"  [+] Upgraded image for: {p['title'][:50]} ({cat})")

print(f"\n[DONE] Successfully upgraded {fixed} placeholder images.")
