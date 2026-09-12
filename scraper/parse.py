"""Pure parsers for public Instagram, YouTube and LinkedIn pages. No network here."""
import re
import xml.etree.ElementTree as ET

_SUFFIX = {"": 1, "K": 1_000, "M": 1_000_000, "B": 1_000_000_000}
_NUM = r"[\d.,]+[KMB]?"
_POST_URL = re.compile(r"instagram\.com/(p|reel)/([A-Za-z0-9_-]{8,})")
_POST_META = re.compile(
    rf"^(?:({_NUM}) likes?, )?(?:{_NUM} comments?\s*-\s*)?(\S+) on [A-Z][a-z]+ \d{{1,2}}, \d{{4}}:\s*\"?(.*?)\"?\s*$",
    re.S,
)
_FEED_NS = {
    "a": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
    "media": "http://search.yahoo.com/mrss/",
}


def parse_count(text):
    m = re.fullmatch(r"\s*([\d.,]+)\s*([KMB]?)\s*", text or "", re.I)
    if not m:
        return None
    try:
        return int(round(float(m.group(1).replace(",", "")) * _SUFFIX[m.group(2).upper()]))
    except ValueError:
        return None


def parse_instagram_profile(og_description):
    m = re.match(rf"({_NUM}) Followers, {_NUM} Following, ({_NUM}) Posts", og_description or "", re.I)
    if not m:
        return {"followers": None, "postCount": None}
    return {"followers": parse_count(m.group(1)), "postCount": parse_count(m.group(2))}


def parse_instagram_shortcodes(html, limit=5):
    seen = {}
    for kind, code in re.findall(r"/(p|reel)/([A-Za-z0-9_-]{8,})", html):
        seen.setdefault(code, kind == "reel")
    return [{"shortcode": c, "isReel": r} for c, r in list(seen.items())[:limit]]


def parse_instagram_post_url(url):
    m = _POST_URL.search(url)
    return {"shortcode": m.group(2), "isReel": m.group(1) == "reel"} if m else None


def parse_instagram_post(og_description):
    m = _POST_META.match(og_description or "")
    if not m:
        return {"account": None, "likes": None, "caption": ""}
    return {"account": m.group(2), "likes": parse_count(m.group(1)), "caption": m.group(3).strip()}


def parse_youtube_channel(html, handle):
    cid = re.search(r'<link rel="canonical" href="https://www\.youtube\.com/channel/(UC[\w-]{22})"', html)
    subs = re.search(rf"@{re.escape(handle)}\W{{0,6}}•\W{{0,6}}({_NUM}) subscribers", html, re.I)
    return {
        "channelId": cid.group(1) if cid else None,
        "followers": parse_count(subs.group(1)) if subs else None,
    }


def parse_youtube_feed(xml):
    videos = []
    for entry in ET.fromstring(xml).findall("a:entry", _FEED_NS):
        stats = entry.find("media:group/media:community/media:statistics", _FEED_NS)
        videos.append({
            "id": entry.findtext("yt:videoId", namespaces=_FEED_NS),
            "title": entry.findtext("a:title", namespaces=_FEED_NS),
            "publishedAt": entry.findtext("a:published", namespaces=_FEED_NS),
            "views": int(stats.get("views")) if stats is not None else None,
        })
    return videos


def parse_linkedin(og_title):
    title = re.sub(r"\s*\|\s*LinkedIn\s*$", "", og_title or "")
    if " - " not in title:
        return {"name": None, "headline": None}
    name, _, headline = title.partition(" - ")
    return {"name": name.strip() or None, "headline": headline.strip() or None}
