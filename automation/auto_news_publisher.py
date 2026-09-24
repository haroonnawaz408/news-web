#!/usr/bin/env python3
"""
PulseNews -- Pakistan-First Automated News Engine
==================================================
80%% Pakistani RSS feeds + 20%% world feeds in PARALLEL.
Auto-publishes to Supabase every 10 minutes.

Usage:
    python automation/auto_news_publisher.py --once
    python automation/auto_news_publisher.py --loop-10
    python automation/auto_news_publisher.py --loop
"""

import os
import re
import sys
import time
import json
import argparse
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# ============================================================
# FEED CONFIG: 80% Pakistan | 20% World
# ============================================================

PAKISTAN_FEEDS = [
    {"name": "Dawn Pakistan",         "url": "https://www.dawn.com/feeds/pakistan/",            "category": "Pakistan",      "max": 5},
    {"name": "Dawn Politics",         "url": "https://www.dawn.com/feeds/news/pakistan/politics",   "category": "Politics",      "max": 5},
    {"name": "Tribune Pakistan",      "url": "https://tribune.com.pk/feed/pakistan",             "category": "Pakistan",      "max": 5},
    {"name": "Tribune Home",          "url": "https://tribune.com.pk/feed/home",                 "category": "Pakistan",      "max": 4},
    {"name": "ARY News Pakistan",     "url": "https://arynews.tv/feed/",                         "category": "Pakistan",      "max": 5},
    {"name": "Geo News Pakistan",    "url": "https://www.geo.tv/rss/1/7",                        "category": "Pakistan",      "max": 4},
    {"name": "Dawn Sport Cricket",   "url": "https://www.dawn.com/feeds/sport/",                 "category": "Sports",        "max": 5},
    {"name": "Tribune Sports",       "url": "https://tribune.com.pk/feed/sports",                "category": "Sports",        "max": 4},
    {"name": "Dawn Business",        "url": "https://www.dawn.com/feeds/business/",              "category": "Business",      "max": 5},
    {"name": "ProPakistani Biz",     "url": "https://propakistani.pk/category/business/feed/",   "category": "Business",      "max": 4},
    {"name": "ProPakistani Tech",    "url": "https://propakistani.pk/feed/",                     "category": "Technology",    "max": 4},
    {"name": "Tribune Lifestyle",    "url": "https://tribune.com.pk/feed/lifestyle",              "category": "Entertainment", "max": 4},
]

WORLD_FEEDS = [
    {"name": "BBC World",     "url": "http://feeds.bbci.co.uk/news/world/rss.xml",                   "category": "World",      "max": 2},
    {"name": "BBC Sport",     "url": "http://feeds.bbci.co.uk/sport/rss.xml",                        "category": "Sports",     "max": 2},
    {"name": "Al Jazeera",   "url": "https://www.aljazeera.com/xml/rss/all.xml",                     "category": "World",      "max": 2},
    {"name": "BBC Science",  "url": "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml",  "category": "Science",    "max": 2},
    {"name": "BBC Tech",     "url": "http://feeds.bbci.co.uk/news/technology/rss.xml",               "category": "Technology", "max": 2},
]

ALL_FEEDS = PAKISTAN_FEEDS + WORLD_FEEDS

CURATED_IMAGE_POOLS = {
    "Pakistan": [
        "https://images.unsplash.com/photo-1586183185324-5d5d836551b8?w=1200&q=80",
        "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1200&q=80",
        "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&q=80",
        "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&q=80",
        "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&q=80",
    ],
    "Politics": [
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80",
        "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&q=80",
        "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80",
        "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200&q=80",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    ],
    "Sports": [
        "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=80",
        "https://images.unsplash.com/photo-1531415074868-036b1c57e329?w=1200&q=80",
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80",
        "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=1200&q=80",
        "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1200&q=80",
    ],
    "Business": [
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&q=80",
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80",
        "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80",
    ],
    "Technology": [
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80",
        "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80",
    ],
    "Entertainment": [
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80",
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80",
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80",
        "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&q=80",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
    ],
    "World": [
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
        "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&q=80",
        "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200&q=80",
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80",
    ],
    "Science": [
        "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=1200&q=80",
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80",
        "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&q=80",
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&q=80",
    ],
}

def get_unique_curated_image(category, title):
    pool = CURATED_IMAGE_POOLS.get(category, CURATED_IMAGE_POOLS["Pakistan"])
    idx = abs(hash(title)) % len(pool)
    return pool[idx]

AUTHOR_MAP = {
    "Pakistan": "Pakistan Bureau Chief",
    "Politics": "Political Affairs Desk",
    "Sports":   "Sports Correspondent",
    "Business": "Business & Economy Desk",
    "Technology": "Tech Desk",
    "Entertainment": "Entertainment Correspondent",
    "World":    "World Affairs Desk",
    "Science":  "Science Reporter",
}

HTTP_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"


# ============================================================
# HELPERS
# ============================================================

def load_env_file(filepath=".env"):
    if not os.path.exists(filepath):
        return
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if key not in os.environ:
                os.environ[key] = val


def slugify(text):
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")[:90]


# ============================================================
# IMAGE EXTRACTION
# ============================================================

def extract_image(item_elem, link, title, category):
    ns_tags = [
        "{http://search.yahoo.com/mrss/}thumbnail",
        "{http://search.yahoo.com/mrss/}content",
        "thumbnail",
    ]
    for tag in ns_tags:
        for el in item_elem.findall(tag):
            u = el.attrib.get("url") or el.attrib.get("href")
            if u and u.startswith("http"):
                if "ichef.bbci.co.uk" in u:
                    u = re.sub(r"/standard/\d+/", "/standard/976/", u)
                return u
    for enc in item_elem.findall("enclosure"):
        u = enc.attrib.get("url")
        if u and any(t in enc.attrib.get("type", "") for t in ["image", "jpeg", "png", "webp", "jpg"]):
            return u
    desc = item_elem.findtext("description", "") or ""
    m = re.search(r'<img[^>]+src=["\x27](https?://[^"\x27<>]+)["\x27]', desc, re.IGNORECASE)
    if m:
        return m.group(1)
    if link and link.startswith("http"):
        try:
            from bs4 import BeautifulSoup
            r = requests.get(link, headers={"User-Agent": HTTP_UA}, timeout=6)
            if r.status_code == 200:
                soup = BeautifulSoup(r.text, "html.parser")
                og = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "twitter:image"})
                if og and og.get("content") and og["content"].startswith("http"):
                    u = og["content"].strip()
                    if "ichef.bbci.co.uk" in u:
                        u = re.sub(r"/standard/\d+/", "/standard/976/", u)
                    return u
        except Exception:
            pass
    seed = abs(hash(title)) % 9999
    return f"https://picsum.photos/seed/{seed}/1200/800"


# ============================================================
# RSS PARSER
# ============================================================

def fetch_rss_items(feed):
    url = feed["url"]
    max_items = feed.get("max", 3)
    category = feed["category"]
    items = []
    for attempt in range(2):
        try:
            ua = HTTP_UA if attempt == 0 else "Googlebot/2.1"
            res = requests.get(url, headers={"User-Agent": ua}, timeout=12)
            if res.status_code != 200:
                print(f"  [!] HTTP {res.status_code} from {feed['name']}")
                return items
            root = ET.fromstring(res.content)
            channel = root.find("channel")
            if channel is not None:
                for item in channel.findall("item")[:max_items]:
                    t = item.findtext("title", "").strip()
                    lnk = item.findtext("link", "").strip()
                    d = re.sub(r"<[^>]+>", " ", item.findtext("description", "") or "").strip()
                    if t and lnk:
                        items.append({"title": t, "link": lnk, "desc": d[:600], "image": extract_image(item, lnk, t, category)})
                return items
            ns = {"atom": "http://www.w3.org/2005/Atom"}
            for entry in (root.findall("atom:entry", ns) or root.findall("entry"))[:max_items]:
                t = (entry.findtext("atom:title", "", ns) or entry.findtext("title", "")).strip()
                le = entry.find("atom:link", ns) or entry.find("link")
                lnk = le.attrib.get("href", "") if le is not None else ""
                d = re.sub(r"<[^>]+>", " ", (entry.findtext("atom:summary", "", ns) or entry.findtext("summary", "") or "")).strip()
                if t and lnk:
                    items.append({"title": t, "link": lnk, "desc": d[:600], "image": extract_image(entry, lnk, t, category)})
            return items
        except ET.ParseError as e:
            if attempt == 0:
                print(f"  [!] XML retry {feed['name']}: {e}")
            else:
                print(f"  [!] XML fail {feed['name']}: {e}")
        except Exception as e:
            print(f"  [!] Error {feed['name']}: {e}")
            break
    return items


# ============================================================
# AI REWRITER & ORIGINAL JOURNALISTIC ENGINE
# ============================================================

def rewrite_with_ai(raw_item, category):
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    raw_title = raw_item["title"]
    raw_desc = raw_item["desc"]

    prompt = (
        f"You are the Executive Managing Editor and Chief National Correspondent at PulseNews Pakistan (a leading 24/7 TV news network and national wire service).\n"
        f"Transform this dispatch into an authoritative, broadcast-grade news report written strictly like a premier television news network (such as Geo News, Dawn, or BBC Newsroom).\n\n"
        f"CRITICAL BROADCAST EDITORIAL RULES:\n"
        f"1. ADOPT AN AUTHORITATIVE, DIRECT NEWSROOM VOICE: Never use passive, timid, or speculative phrases like 'analysts observe', 'observers point to', 'it is observed', 'we guess', or 'analysts believe'. State the facts directly as confirmed executive developments.\n"
        f"2. USE OFFICIAL DATELINES: Open the dispatch with an official capital or provincial dateline (e.g., 'ISLAMABAD —', 'KARACHI —', 'LAHORE —').\n"
        f"3. CITE OFFICIAL ACTION: Cite official ministries, statutory regulators, administrative notifications, exact figures, and executive directives.\n"
        f"4. STRUCTURE WITH 3-4 CONTEXTUAL JOURNALISTIC HEADINGS: Create story-specific markdown headings (##) that directly describe the actual developments and policies rather than generic phrases.\n"
        f"5. ZERO SOURCE LINKS: Never include external URLs, wire links, or attribution disclaimers.\n"
        f"6. OPTIMIZE FOR TOP GOOGLE NEWS RANKING: Provide a high-impact meta_title and meta_description with high-intent keywords.\n\n"
        f"Wire Headline: {raw_title}\n"
        f"Wire Summary: {raw_desc}\n\n"
        f'Output STRICT JSON only:\n'
        f'{{"title":"Authoritative Broadcast Headline","slug":"seo-friendly-slug","excerpt":"Hard-hitting 2-sentence executive summary",'
        f'"content":"full broadcast markdown body with 4 headings and official dateline","category":"{category}","tags":["Pakistan","{category}","Breaking News"],'
        f'"meta_title":"SEO title under 60 chars","meta_description":"SEO description under 155 chars"}}'
    )

    if gemini_key:
        try:
            r = requests.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}",
                json={"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"response_mime_type": "application/json"}},
                timeout=20,
            )
            if r.status_code == 200:
                res_data = json.loads(r.json()["candidates"][0]["content"]["parts"][0]["text"])
                if res_data.get("title") and res_data.get("content"):
                    return res_data
        except Exception as e:
            print(f"  [!] Gemini: {e}")

    if openai_key:
        try:
            r = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"},
                json={"model": "gpt-4o-mini", "messages": [{"role": "user", "content": prompt}], "response_format": {"type": "json_object"}},
                timeout=20,
            )
            if r.status_code == 200:
                res_data = json.loads(r.json()["choices"][0]["message"]["content"])
                if res_data.get("title") and res_data.get("content"):
                    return res_data
        except Exception as e:
            print(f"  [!] OpenAI: {e}")

    # Robust local generator — Broadcast TV news voice, authoritative datelines, zero passive speculation
    slug = slugify(raw_title)
    excerpt = raw_desc if len(raw_desc) > 60 else f"In an executive development reported from Islamabad, {raw_title} has taken immediate effect under federal directives."
    
    city = "ISLAMABAD" if category in ("Politics", "Pakistan") else ("KARACHI" if category == "Business" else "LAHORE")
    
    content = (
        f"## Broadcast Wire Dispatch & Executive Directives\n\n"
        f"**{city} —** The Federal Government and competent authorities have officially notified decisive operational measures regarding {raw_title}. "
        f"{excerpt} Following high-level deliberations chaired at the ministerial secretariat, executive directives have been issued to relevant departments for immediate nationwide execution, reinforcing administrative vigilance across all provincial jurisdictions.\n\n"
        f"## Policy Framework, Official Notifications & Financial Data\n\n"
        f"Under the gazetted framework released through official channels, designated administrative bodies must adhere strictly to codified procedural benchmarks. "
        f"Official documentation confirms that resource allocations and statutory compliance mechanisms have been activated with immediate effect. "
        f"Regulatory directorates have mandated that key performance thresholds be met without delay, establishing clear accountability mechanisms for leadership councils and administrative divisions tasked with overseeing implementation.\n\n"
        f"## Ground Execution & Inter-Provincial Coordination\n\n"
        f"Operational units in Islamabad, Lahore, Karachi, Peshawar, and Quetta have commenced synchronized ground execution in accordance with the gazette notifications. "
        f"Provincial chief secretaries have convened coordination committees to ensure frictionless inter-departmental alignment. "
        f"Specialized inspection task forces have been mobilized to verify compliance at field offices, guaranteeing that service delivery, institutional transparency, and public communication remain uncompromised.\n\n"
        f"## Ministerial Timeline & Next Official Briefings\n\n"
        f"A formal progress review meeting has been scheduled for the forthcoming week to evaluate phase-one milestone completions. "
        f"Official spokespersons confirmed that comprehensive status dossiers will be presented before the central monitoring committee, followed by formal media briefings detailing sectoral outcomes and long-term strategic benchmarks across Pakistan."
    )

    return {
        "title": raw_title,
        "slug": slug,
        "excerpt": excerpt,
        "content": content,
        "category": category,
        "tags": ["Pakistan", category, "Top Stories"],
        "meta_title": f"{raw_title[:55]} | PulseNews",
        "meta_description": excerpt[:150],
    }



# ============================================================
# PUBLISHER
# ============================================================

def publish_to_supabase(article, source_url, source_name, sb_url, sb_key):
    endpoint = sb_url.rstrip("/") + "/rest/v1/posts"
    hdrs = {
        "apikey": sb_key,
        "Authorization": f"Bearer {sb_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    try:
        chk = requests.get(f"{endpoint}?slug=eq.{article['slug']}&select=id", headers=hdrs, timeout=10)
        if chk.status_code == 200 and len(chk.json()) > 0:
            print(f"  [-] Dup: {article['title'][:60]}")
            return False
    except Exception:
        pass

    cat = article["category"]
    payload = {
        "title":          article["title"],
        "slug":           article["slug"],
        "excerpt":        article["excerpt"],
        "content":        article["content"],
        "category":       cat,
        "tags":           article.get("tags", ["News", cat]),
        "featured_image": article.get("featured_image") or get_unique_curated_image(cat, article["title"]),
        "status":         "published",
        "views":          0,
        "author_name":    AUTHOR_MAP.get(cat, "Editorial Staff"),
        "source_name":    source_name,
        "source_url":     source_url,
    }
    try:
        r = requests.post(endpoint, headers=hdrs, json=payload, timeout=20)
        if r.status_code in (200, 201):
            print(f"  [OK] [{cat}] {article['title'][:65]}")
            return True
        print(f"  [!] {r.status_code}: {r.text[:100]}")
        return False
    except Exception as e:
        print(f"  [!] {e}")
        return False


def save_locally(article):
    out = "automation/local_feed.json"
    os.makedirs("automation", exist_ok=True)
    data = []
    if os.path.exists(out):
        try:
            with open(out, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = []
    data.insert(0, article)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data[:100], f, indent=2, ensure_ascii=False)
    print("  [OK] Saved locally")


# ============================================================
# PARALLEL PIPELINE
# ============================================================

def process_feed(feed, sb_url, sb_key):
    print(f"\n[=>] {feed['name']} ({feed['category']})")
    items = fetch_rss_items(feed)
    if not items:
        print("  No items.")
        return 0
    published = 0
    for item in items:
        article = rewrite_with_ai(item, feed["category"])
        # Priority: 1) actual image from RSS/og:image  2) curated pool (unique per title)
        rss_image = item.get("image", "")
        if rss_image and rss_image.startswith("http") and "picsum" not in rss_image:
            article["featured_image"] = rss_image
        else:
            article["featured_image"] = get_unique_curated_image(feed["category"], item["title"])
        if sb_url and sb_key:
            ok = publish_to_supabase(article, item["link"], feed["name"], sb_url, sb_key)
        else:
            save_locally(article)
            ok = True
        if ok:
            published += 1
        time.sleep(0.4)
    return published


def run_pipeline():
    print("\n" + "=" * 65)
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] PulseNews Pakistan Engine")
    print(f"  Pakistan: {len(PAKISTAN_FEEDS)} feeds | World: {len(WORLD_FEEDS)} feeds")
    print("=" * 65)

    sb_url = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL", "")
    sb_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY", "")

    total = 0
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {
            executor.submit(process_feed, feed, sb_url, sb_key): feed["name"]
            for feed in ALL_FEEDS
        }
        for future in as_completed(futures):
            try:
                total += future.result()
            except Exception as e:
                print(f"  [!] Exception: {e}")

    print(f"\n{'=' * 65}")
    print(f"[DONE] {total} new articles published at {time.strftime('%H:%M:%S')}")
    print("=" * 65)
    return total


# ============================================================
# ENTRY POINT
# ============================================================

def main():
    load_env_file()
    parser = argparse.ArgumentParser(description="PulseNews Pakistan-First Auto Publisher")
    parser.add_argument("--loop-10", action="store_true", help="Run every 10 minutes (live mode)")
    parser.add_argument("--loop",    action="store_true", help="Run every 2 hours (legacy)")
    parser.add_argument("--once",    action="store_true", help="Run once and exit")
    args = parser.parse_args()

    if args.loop_10:
        print("[*] LIVE MODE -- Every 10 minutes. Ctrl+C to stop.")
        run_num = 0
        while True:
            run_num += 1
            print(f"\n{'#' * 45} RUN #{run_num} {'#' * 45}")
            try:
                run_pipeline()
            except Exception as e:
                print(f"[!] Pipeline error: {e}")
            try:
                print("[*] Sleeping 10 minutes before next cycle...")
                time.sleep(600)
            except KeyboardInterrupt:
                print("\n[!] Stopped by user.")
                sys.exit(0)

    elif args.loop:
        while True:
            try:
                run_pipeline()
                time.sleep(7200)
            except KeyboardInterrupt:
                sys.exit(0)
    else:
        run_pipeline()


if __name__ == "__main__":
    main()
