"""Pure parsers for public Instagram, YouTube and LinkedIn pages. No network here."""
import re
from html import unescape

_SUFFIX = {"": 1, "K": 1_000, "M": 1_000_000, "B": 1_000_000_000}
_WORD_SCALE = {"thousand": "K", "million": "M", "billion": "B"}
_NUM = r"[\d.,]+[KMB]?"
_SHORTS_ITEM = re.compile(r'"entityId":"shorts-shelf-item-([\w-]{11})"[^}]*?"accessibilityText":"(.*?)(?<!\\)"')
# The separator between "views" and "play Short" is a plain hyphen on the page's
# own initial render but an en dash ("–") on the "Popular" sort's continuation
# response -- \D* (any non-digits) bridges either without caring which.
_SHORTS_VIEWS = re.compile(r"^.*,\s*([\d.,]+)\s*(thousand|million|billion)?\s*views?\D*play Short$")
_POST_URL = re.compile(r"instagram\.com/(p|reel)/([A-Za-z0-9_-]{8,})")
# The trailing ": caption" is itself optional -- a post with no caption text leaves
# og:description as just "<account> on <date>", with no colon at all.
_POST_META = re.compile(
    rf"^(?:({_NUM}) likes?, )?(?:{_NUM} comments?\s*-\s*)?(\S+) on [A-Z][a-z]+ \d{{1,2}}, \d{{4}}(?::\s*\"?(.*?)\"?\s*)?$",
    re.S,
)


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
    return {"account": m.group(2), "likes": parse_count(m.group(1)), "caption": (m.group(3) or "").strip()}


def parse_youtube_channel(html, handle):
    cid = re.search(r'<link rel="canonical" href="https://www\.youtube\.com/channel/(UC[\w-]{22})"', html)
    subs = re.search(rf"@{re.escape(handle)}\W{{0,6}}•\W{{0,6}}({_NUM}) subscribers", html, re.I)
    return {
        "channelId": cid.group(1) if cid else None,
        "followers": parse_count(subs.group(1)) if subs else None,
    }


def parse_youtube_videos_page(html):
    """[{id, views}] from a channel's /videos listing, in whatever order YouTube served it.

    YouTube's legacy "?sort=p" popularity param no longer sorts anything on the current
    (lockupViewModel-based) channel page -- verified live: it still returns latest-first.
    So this returns the page's own order; the caller sorts by "views" itself.
    """
    seen, out = set(), []
    for chunk in html.split('"richItemRenderer"')[1:]:
        vid_m = re.search(r'"videoId":"([\w-]{11})"', chunk)
        views_m = re.search(r'"content":"([\d,.]+[KMB]?) views?"', chunk)
        if not (vid_m and views_m) or vid_m.group(1) in seen:
            continue
        seen.add(vid_m.group(1))
        out.append({"id": vid_m.group(1), "views": parse_count(views_m.group(1))})
    return out


def parse_youtube_shorts_page(html):
    """[{id, views}] from a channel's /shorts listing.

    Shorts never appear on the /videos listing at all -- a separate tab with its own
    renderer (shortsLockupViewModel) whose view count only exists as prose inside an
    accessibility-text string ("<title>, 1.4 thousand views - play Short"), spelled out
    in words ("thousand"/"million") rather than the "N views" form /videos uses.
    """
    out = []
    for vid, text in dict(_SHORTS_ITEM.findall(html)).items():
        m = _SHORTS_VIEWS.match(text)
        if not m:
            continue
        qty, scale = m.groups()
        out.append({"id": vid, "views": parse_count(qty + _WORD_SCALE.get(scale, ""))})
    return out


def parse_youtube_shorts_popular_request(html):
    """What's needed to fetch the Shorts tab's "Popular" sort: the innertube API
    key + client version (from the page's ytcfg) and the "Popular" chip's own
    continuation token.

    The chip bar (Latest / Popular / Oldest) and every chip's token are already
    present in the page's initial, un-clicked render -- sorting by popularity is
    a client-side action that POSTs this token to /youtubei/v1/browse, it doesn't
    need a real click. Confirmed live: this is a completely different, far higher-
    viewed pool than what the page shows by default (Latest) or what /videos ever
    surfaces -- spinandswing26's top Short here is 18M views vs. 12K on /videos.
    Returns None if any piece is missing (layout change, no Shorts tab, etc.) so
    the caller can fall back to the plain (recency-ordered) /shorts page instead.
    """
    api_key = re.search(r'"INNERTUBE_API_KEY":"([^"]+)"', html)
    version = re.search(r'"INNERTUBE_CONTEXT_CLIENT_VERSION":"([^"]+)"', html)
    i = html.find('"text":"Popular"')
    token = re.search(r'"token":"([^"]+)"', html[i:i + 700]) if i != -1 else None
    if not (api_key and version and token):
        return None
    return {"apiKey": api_key.group(1), "clientVersion": version.group(1), "token": token.group(1)}


def parse_youtube_watch_page(html):
    """Exact title/views/publish date for one video, read from its own watch page."""
    title_m = re.search(r'<meta property="og:title" content="([^"]*)"', html)
    views_m = re.search(r'"viewCount":"(\d+)"', html)
    date_m = re.search(r'itemprop="datePublished" content="([^"]+)"', html)
    return {
        # og:title is an HTML attribute value, so "&" arrives as "&amp;" -- unescape it.
        "title": unescape(title_m.group(1)) if title_m else None,
        "views": int(views_m.group(1)) if views_m else None,
        "publishedAt": date_m.group(1) if date_m else None,
    }


def parse_linkedin(og_title):
    title = re.sub(r"\s*\|\s*LinkedIn\s*$", "", og_title or "")
    if " - " not in title:
        return {"name": None, "headline": None}
    name, _, headline = title.partition(" - ")
    return {"name": name.strip() or None, "headline": headline.strip() or None}
