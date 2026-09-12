"""One-time seed scrape -> src/data/social.json + src/assets/social/*.jpg.

Run from the repo root:  scraper/.venv/bin/python scraper/scrape.py
Public pages only, logged out, no credentials. Re-running keeps `featured` flags.
"""
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from scrapling.fetchers import Fetcher

import parse

ROOT = Path(__file__).resolve().parent.parent
OUT_JSON = ROOT / "src/data/social.json"
THUMBS = ROOT / "src/assets/social"
OVERRIDE = ROOT / "scraper/instagram_posts.txt"
IG_ACCOUNTS = ["abhishekpandey_26", "spinandswing26"]
YT_CHANNELS = ["spinandswing26", "abhishekunseen26"]
LINKEDIN = "abhishek-pandey-26sep03"


def get(url, **kw):
    time.sleep(2)  # ponytail: fixed politeness delay; ~30 requests total, no need for a rate limiter
    page = Fetcher.get(url, impersonate="chrome", stealthy_headers=True, timeout=30, **kw)
    if page.status != 200:
        raise RuntimeError(f"HTTP {page.status} for {url}")
    return page


def meta(page, prop):
    return page.css(f'meta[property="{prop}"]::attr(content)').get()


def save_image(url, name):
    (THUMBS / name).write_bytes(get(url).body)
    return name


def profile_row(platform, handle, url):
    return {"platform": platform, "handle": handle, "url": url,
            "followers": None, "postCount": None, "name": None, "headline": None}


def scrape_instagram(featured):
    profiles, candidates = [], []
    for handle in IG_ACCOUNTS:
        url = f"https://www.instagram.com/{handle}/"
        row = profile_row("instagram", handle, url)
        try:
            page = get(url)
            row.update(parse.parse_instagram_profile(meta(page, "og:description")))
            candidates += parse.parse_instagram_shortcodes(page.body.decode("utf-8", "ignore"))
        except Exception as err:
            print("WARN IG profile", err)
        profiles.append(row)

    if OVERRIDE.exists():
        urls = [line.strip() for line in OVERRIDE.read_text().splitlines() if line.strip()]
        candidates = [c for c in map(parse.parse_instagram_post_url, urls) if c]

    posts = []
    for c in candidates:
        kind = "reel" if c["isReel"] else "p"
        url = f"https://www.instagram.com/{kind}/{c['shortcode']}/"
        try:
            page = get(url)
            image = meta(page, "og:image")
            if not image:
                raise RuntimeError(f"no og:image for {url}")
            info = parse.parse_instagram_post(meta(page, "og:description"))
            thumb = save_image(image, f"ig-{c['shortcode']}.jpg")
        except Exception as err:
            print("WARN IG post", err)
            continue
        posts.append({"platform": "instagram", "account": info["account"] or "unknown",
                      "shortcode": c["shortcode"], "url": url, "caption": info["caption"],
                      "likes": info["likes"], "isReel": c["isReel"], "thumb": thumb,
                      "featured": c["shortcode"] in featured})
    return profiles, posts


def youtube_thumb(video_id):
    for size in ("maxresdefault", "hqdefault"):
        try:
            return save_image(f"https://i.ytimg.com/vi/{video_id}/{size}.jpg", f"yt-{video_id}.jpg")
        except Exception:
            continue
    return None


def scrape_youtube(featured):
    profiles, videos = [], []
    for handle in YT_CHANNELS:
        url = f"https://www.youtube.com/@{handle}"
        row = profile_row("youtube", handle, url)
        try:
            page = get(url, headers={"Accept-Language": "en-US,en;q=0.9"})
            info = parse.parse_youtube_channel(page.body.decode("utf-8", "ignore"), handle)
            row["followers"] = info["followers"]
            if not info["channelId"]:
                raise RuntimeError(f"no channel id on {url}")
            feed = get(f"https://www.youtube.com/feeds/videos.xml?channel_id={info['channelId']}")
            for v in parse.parse_youtube_feed(feed.body):
                thumb = youtube_thumb(v["id"])
                if thumb:
                    videos.append({"platform": "youtube", "channel": handle, **v,
                                   "thumb": thumb, "featured": v["id"] in featured})
        except Exception as err:
            print("WARN YT", err)
        profiles.append(row)
    return profiles, videos


def scrape_linkedin():
    url = f"https://www.linkedin.com/in/{LINKEDIN}"
    row = profile_row("linkedin", LINKEDIN, url)
    try:
        row.update(parse.parse_linkedin(meta(get(url), "og:title")))
    except Exception as err:
        print("WARN LinkedIn", err, "- LinkedIn falls back to a plain link")
    return row


def main():
    THUMBS.mkdir(parents=True, exist_ok=True)
    previous = json.loads(OUT_JSON.read_text()) if OUT_JSON.exists() else {}
    featured = {r["id"] for r in previous.get("videos", []) if r.get("featured")} | \
               {r["shortcode"] for r in previous.get("posts", []) if r.get("featured")}

    ig_profiles, posts = scrape_instagram(featured)
    yt_profiles, videos = scrape_youtube(featured)

    data = {
        "scrapedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "profiles": ig_profiles + yt_profiles + [scrape_linkedin()],
        "videos": videos,
        "posts": posts,
    }
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"profiles={len(data['profiles'])} videos={len(videos)} posts={len(posts)} -> {OUT_JSON.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
