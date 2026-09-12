import unittest

import parse

YT_HTML = (
    '<link rel="canonical" href="https://www.youtube.com/channel/UCBR8-60-B28hp2BmDPdntcQ">'
    '"title":{"content":"‎⁨@YouTube⁩ • ⁨46.3M subscribers⁩"}'
    '"content":"‎⁨@YouTubeBrasil⁩ • ⁨3.45M subscribers⁩"'
)

YT_FEED = """<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
 <title>YouTube</title>
 <entry>
  <yt:videoId>DfECjUL9ZvU</yt:videoId>
  <title>a creator award almost as beautiful as your art</title>
  <published>2026-09-10T20:00:18+00:00</published>
  <media:group>
   <media:thumbnail url="https://i1.ytimg.com/vi/DfECjUL9ZvU/hqdefault.jpg" width="480" height="360"/>
   <media:community>
    <media:starRating count="1091" average="5.00" min="1" max="5"/>
    <media:statistics views="147443"/>
   </media:community>
  </media:group>
 </entry>
</feed>"""


class ParseCount(unittest.TestCase):
    def test_suffixes_and_commas(self):
        self.assertEqual(parse.parse_count("46.3M"), 46_300_000)
        self.assertEqual(parse.parse_count("394K"), 394_000)
        self.assertEqual(parse.parse_count("8,584"), 8584)
        self.assertEqual(parse.parse_count("1.2B"), 1_200_000_000)

    def test_garbage_is_none(self):
        self.assertIsNone(parse.parse_count(None))
        self.assertIsNone(parse.parse_count("lots"))


class Instagram(unittest.TestCase):
    def test_profile_counts(self):
        og = "687M Followers, 292 Following, 8,584 Posts - See Instagram photos and videos from Instagram (@instagram)"
        self.assertEqual(parse.parse_instagram_profile(og), {"followers": 687_000_000, "postCount": 8584})

    def test_profile_login_wall_is_nulls(self):
        self.assertEqual(parse.parse_instagram_profile(None), {"followers": None, "postCount": None})

    def test_shortcodes_dedupe_and_kind(self):
        html = 'href="/p/DdHNbqDJusb/" x href="/reel/DdGyUtFsnRO/" y href="/p/DdHNbqDJusb/"'
        self.assertEqual(
            parse.parse_instagram_shortcodes(html),
            [{"shortcode": "DdHNbqDJusb", "isReel": False}, {"shortcode": "DdGyUtFsnRO", "isReel": True}],
        )

    def test_post_url(self):
        self.assertEqual(
            parse.parse_instagram_post_url("https://www.instagram.com/reel/DdGyUtFsnRO/?igsh=abc"),
            {"shortcode": "DdGyUtFsnRO", "isReel": True},
        )
        self.assertIsNone(parse.parse_instagram_post_url("https://example.com/"))

    def test_post_meta(self):
        og = '394K likes, 8,279 comments - instagram on September 10, 2026: "Every room is its own world \U0001f58a️⁣\n⁣\n@draw_vengers"'
        got = parse.parse_instagram_post(og)
        self.assertEqual(got["account"], "instagram")
        self.assertEqual(got["likes"], 394_000)
        self.assertTrue(got["caption"].startswith("Every room is its own world"))
        self.assertFalse(got["caption"].endswith('"'))

    def test_post_meta_hidden_likes(self):
        og = '12 comments - spinandswing26 on March 3, 2026: "Nets session"'
        self.assertEqual(parse.parse_instagram_post(og), {"account": "spinandswing26", "likes": None, "caption": "Nets session"})


class YouTube(unittest.TestCase):
    def test_channel_page_picks_own_handle(self):
        self.assertEqual(
            parse.parse_youtube_channel(YT_HTML, "youtube"),
            {"channelId": "UCBR8-60-B28hp2BmDPdntcQ", "followers": 46_300_000},
        )

    def test_channel_page_missing_bits(self):
        self.assertEqual(parse.parse_youtube_channel("<html></html>", "x"), {"channelId": None, "followers": None})

    def test_feed(self):
        self.assertEqual(
            parse.parse_youtube_feed(YT_FEED),
            [{"id": "DfECjUL9ZvU", "title": "a creator award almost as beautiful as your art",
              "publishedAt": "2026-09-10T20:00:18+00:00", "views": 147443}],
        )


class LinkedIn(unittest.TestCase):
    def test_title(self):
        self.assertEqual(
            parse.parse_linkedin("Bill Gates - Chair, Gates Foundation and Founder, Breakthrough Energy | LinkedIn"),
            {"name": "Bill Gates", "headline": "Chair, Gates Foundation and Founder, Breakthrough Energy"},
        )

    def test_authwall_title_is_nulls(self):
        self.assertEqual(parse.parse_linkedin("Sign Up | LinkedIn"), {"name": None, "headline": None})
        self.assertEqual(parse.parse_linkedin(None), {"name": None, "headline": None})


if __name__ == "__main__":
    unittest.main()
