import unittest

import parse
import scrape

YT_HTML = (
    '<link rel="canonical" href="https://www.youtube.com/channel/UCBR8-60-B28hp2BmDPdntcQ">'
    '"title":{"content":"‎⁨@YouTube⁩ • ⁨46.3M subscribers⁩"}'
    '"content":"‎⁨@YouTubeBrasil⁩ • ⁨3.45M subscribers⁩"'
)

# Two richItemRenderer blocks, shaped like the current (lockupViewModel-based) channel
# /videos page -- trimmed to just the fields the parser reads. Real pages repeat
# "videoId" several times per block (thumbnail, watch command, add-to-queue, ...);
# the second block's title text is deliberately absent from here to prove the parser
# doesn't need it -- the real title comes from the watch page, not the listing.
YT_VIDEOS_PAGE = (
    '"richItemRenderer":{"content":{"lockupViewModel":{"contentImage":'
    '{"thumbnailViewModel":{"image":{"sources":[{"url":"https://i.ytimg.com/vi/w2ry0G8wLW0/hq720.jpg"}]}}}}}},'
    '"richItemRenderer":{"content":{"lockupViewModel":{"contentId":"bEwKiLsjEBg",'
    '"metadata":{"lockupMetadataViewModel":{"metadata":{"contentMetadataViewModel":'
    '{"metadataRows":[{"metadataParts":[{"text":{"content":"channel name"}}]},'
    '{"metadataParts":[{"text":{"content":"240 views"}},{"text":{"content":"1 month ago"}}]}]}}}}}},'
    '"videoId":"bEwKiLsjEBg"}}}'
)

YT_WATCH_PAGE = (
    '<meta property="og:title" content="This Train Journey Turned Into a Nightmare">'
    '"viewCount":"243",'
    '<meta itemprop="datePublished" content="2026-08-10T09:00:00-07:00">'
)

# og:title is an HTML attribute value, so a literal "&" arrives HTML-escaped.
YT_WATCH_PAGE_ESCAPED_TITLE = (
    '<meta property="og:title" content="Guess the Player | Spin &amp; Swing">'
    '"viewCount":"100",'
    '<meta itemprop="datePublished" content="2026-05-28T09:00:00-07:00">'
)

# Shorts never appear on /videos -- separate tab, separate renderer. Its view count
# is prose inside an accessibility-text string, not a "N views" short form.
YT_SHORTS_PAGE = (
    '{"shortsLockupViewModel":{"entityId":"shorts-shelf-item-aLzViKNysEQ",'
    '"accessibilityText":"Guess the Squad of Indian team Pt - 2, 235 thousand views - play Short",'
    'garbage},'
    '{"shortsLockupViewModel":{"entityId":"shorts-shelf-item-U-Kw8RA5Dlw",'
    '"accessibilityText":"What does DPL mean to you ?, 666 views - play Short",'
    'garbage}'
)


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

    def test_reels_tab_extracts_views_likes_code_and_thumb(self):
        # Trimmed to the fields the parser reads; a real page repeats several other
        # keys per node (comment_count, clips_tab_pinned_user_ids, ...) in between.
        html = (
            '"__typename":"XIGPolarisVideoMedia","pk":"1","like_count":3,"play_count":11183407,'
            '"clips_tab_pinned_user_ids":[],"code":"DW84LM4y4Fr","seo_canonical_url":null,'
            '"display_uri":"https:\\/\\/scontent.cdninstagram.com\\/img.jpg?a=1\\u00253D2"}},'
            '{"node":{"__typename":"XIGPolarisVideoMedia","pk":"2","like_count":8860,"play_count":119608,'
            '"code":"Dcs1bhEoeTf","seo_canonical_url":null,"display_uri":"https:\\/\\/x.test\\/b.jpg"'
        )
        self.assertEqual(
            parse.parse_instagram_reels_tab(html),
            [
                {"id": "DW84LM4y4Fr", "views": 11_183_407, "likes": 3,
                 "thumbUrl": "https://scontent.cdninstagram.com/img.jpg?a=1%3D2"},
                {"id": "Dcs1bhEoeTf", "views": 119_608, "likes": 8860,
                 "thumbUrl": "https://x.test/b.jpg"},
            ],
        )

    def test_reels_tab_empty_when_no_items(self):
        self.assertEqual(parse.parse_instagram_reels_tab("<html></html>"), [])

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

    def test_post_meta_no_caption(self):
        # Instagram omits the ": caption" part entirely for a post with no caption text.
        og = "abhishekpandey_26 on July 9, 2026"
        self.assertEqual(parse.parse_instagram_post(og), {"account": "abhishekpandey_26", "likes": None, "caption": ""})


class YouTube(unittest.TestCase):
    def test_channel_page_picks_own_handle(self):
        self.assertEqual(
            parse.parse_youtube_channel(YT_HTML, "youtube"),
            {"channelId": "UCBR8-60-B28hp2BmDPdntcQ", "followers": 46_300_000},
        )

    def test_channel_page_missing_bits(self):
        self.assertEqual(parse.parse_youtube_channel("<html></html>", "x"), {"channelId": None, "followers": None})

    def test_videos_page_skips_blocks_with_no_videoid_and_parses_the_rest(self):
        self.assertEqual(parse.parse_youtube_videos_page(YT_VIDEOS_PAGE), [{"id": "bEwKiLsjEBg", "views": 240}])

    def test_videos_page_dedupes_repeated_videoid(self):
        html = YT_VIDEOS_PAGE + YT_VIDEOS_PAGE
        self.assertEqual(parse.parse_youtube_videos_page(html), [{"id": "bEwKiLsjEBg", "views": 240}])

    def test_watch_page(self):
        self.assertEqual(
            parse.parse_youtube_watch_page(YT_WATCH_PAGE),
            {"title": "This Train Journey Turned Into a Nightmare",
             "views": 243, "publishedAt": "2026-08-10T09:00:00-07:00"},
        )

    def test_shorts_page_parses_word_scale_views(self):
        self.assertEqual(
            parse.parse_youtube_shorts_page(YT_SHORTS_PAGE),
            [{"id": "aLzViKNysEQ", "views": 235_000}, {"id": "U-Kw8RA5Dlw", "views": 666}],
        )

    def test_shorts_page_tolerates_en_dash_separator(self):
        # The "Popular" sort's continuation response uses "–" (en dash) here where the
        # page's own initial render uses a plain hyphen -- both must parse the same way.
        html = (
            '{"shortsLockupViewModel":{"entityId":"shorts-shelf-item-DxgBGpUzZ08",'
            '"accessibilityText":"Gt fan vs Mi fan, 18 million views – play Short",'
            'garbage}}'
        )
        self.assertEqual(parse.parse_youtube_shorts_page(html), [{"id": "DxgBGpUzZ08", "views": 18_000_000}])

    def test_shorts_popular_request_extracts_key_version_and_token(self):
        html = (
            '"INNERTUBE_API_KEY":"AIzaFake123",'
            '"INNERTUBE_CONTEXT_CLIENT_VERSION":"2.20260911.01.00",'
            '"text":"Latest","selected":false,"...":"...","token":"latest-token",'
            '"text":"Popular","selected":false,"...":"...","token":"popular-token-abc"'
        )
        self.assertEqual(
            parse.parse_youtube_shorts_popular_request(html),
            {"apiKey": "AIzaFake123", "clientVersion": "2.20260911.01.00", "token": "popular-token-abc"},
        )

    def test_shorts_popular_request_missing_bits_is_none(self):
        self.assertIsNone(parse.parse_youtube_shorts_popular_request("<html></html>"))

    def test_watch_page_unescapes_html_entities_in_title(self):
        self.assertEqual(
            parse.parse_youtube_watch_page(YT_WATCH_PAGE_ESCAPED_TITLE)["title"],
            "Guess the Player | Spin & Swing",
        )

    def test_watch_page_missing_bits(self):
        self.assertEqual(
            parse.parse_youtube_watch_page("<html></html>"),
            {"title": None, "views": None, "publishedAt": None},
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


class CheckNotWiped(unittest.TestCase):
    def test_raises_when_videos_wiped(self):
        with self.assertRaises(RuntimeError):
            scrape.check_not_wiped({"videos": [{"id": "a"}]}, videos=[], posts=[])

    def test_raises_when_posts_wiped(self):
        with self.assertRaises(RuntimeError):
            scrape.check_not_wiped({"posts": [{"shortcode": "a"}]}, videos=[{"id": "a"}], posts=[])

    def test_allows_empty_when_previous_was_also_empty(self):
        scrape.check_not_wiped({}, videos=[], posts=[])

    def test_allows_a_real_scrape_through(self):
        scrape.check_not_wiped({"videos": [{"id": "a"}], "posts": [{"shortcode": "a"}]},
                                videos=[{"id": "b"}], posts=[{"shortcode": "b"}])


class MergeCurated(unittest.TestCase):
    def test_fresh_counts_win(self):
        got = scrape.merge_curated(["a"], {"a": {"views": 1, "likes": 1}}, {"a": {"views": 5, "likes": 2}})
        self.assertEqual(got, {"a": {"views": 5, "likes": 2}})

    def test_missing_or_zero_fresh_keeps_previous(self):
        # A bot-check page parses to None/0 -- it must never overwrite a real count.
        got = scrape.merge_curated(["a"], {"a": {"views": 9, "likes": 3}}, {"a": {"views": 0, "likes": None}})
        self.assertEqual(got, {"a": {"views": 9, "likes": 3}})

    def test_new_id_is_nulls_and_uncurated_ids_drop(self):
        got = scrape.merge_curated(["b"], {"a": {"views": 9, "likes": 3}}, {})
        self.assertEqual(got, {"b": {"views": None, "likes": None}})


if __name__ == "__main__":
    unittest.main()
