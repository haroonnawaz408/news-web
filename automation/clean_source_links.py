import os
import re
import requests
from dotenv import load_dotenv

load_dotenv(".env")
load_dotenv("automation/.env")

SB_URL = os.getenv("VITE_SUPABASE_URL")
SB_KEY = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

if not SB_URL or not SB_KEY:
    print("[!] Missing Supabase credentials")
    exit(1)

endpoint = SB_URL.rstrip("/") + "/rest/v1/posts"
headers = {
    "apikey": SB_KEY,
    "Authorization": f"Bearer {SB_KEY}",
    "Content-Type": "application/json",
}

res = requests.get(f"{endpoint}?select=id,title,content&limit=300", headers=headers, timeout=20)
if res.status_code != 200:
    print(f"[!] Failed to fetch posts: {res.status_code}")
    exit(1)

posts = res.json()
print(f"[*] Total posts scanned: {len(posts)}")

cleaned = 0
source_pattern = re.compile(r"(\s*---\s*)?\*?Source:\s*https?://\S+\*?", re.IGNORECASE)

for post in posts:
    content = post.get("content") or ""
    if "Source:" in content or "source:" in content or source_pattern.search(content):
        new_content = source_pattern.sub("", content).strip()
        new_content = re.sub(r"\n---\s*$", "", new_content).strip()
        if new_content != content:
            pid = post["id"]
            for attempt in range(3):
                try:
                    r = requests.patch(f"{endpoint}?id=eq.{pid}", headers=headers, json={"content": new_content}, timeout=25)
                    if r.status_code in (200, 204):
                        cleaned += 1
                        print(f"  [+] Cleaned: {post['title'][:50]}")
                        break
                except Exception as e:
                    if attempt == 2:
                        print(f"  [!] Skipped {pid}: {e}")

print(f"\n[DONE] Successfully cleaned source links from {cleaned} posts.")
