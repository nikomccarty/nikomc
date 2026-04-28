#!/usr/bin/env python3
"""Generate feed.xml from essays/*.html files.

Run: python3 generate-feed.py
Dates are read from <meta name="post-date"> in each essay, falling back
to the date shown in essays.html / shortform.html post lists.
"""

import os
import re
import html as html_mod
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

SITE_URL = "https://nikomc.com"
FEED_TITLE = "Niko McCarty"
FEED_DESCRIPTION = "Writing on biology."
AUTHOR_NAME = "Niko McCarty"
AUTHOR_EMAIL = "nsmccarty3@gmail.com"

BASE = Path(__file__).parent
ESSAYS_DIR = BASE / "essays"
FEED_PATH = BASE / "feed.xml"


def scrape_tag(content: str, tag: str, attr: Optional[str] = None, attr_val: Optional[str] = None) -> str:
    """Return first match of a tag's text content, or an attribute value."""
    if attr and attr_val:
        pattern = rf'<{tag}[^>]*{attr}=["\']([^"\']*{attr_val}[^"\']*)["\'][^>]*content=["\']([^"\']*)["\']'
        m = re.search(pattern, content, re.IGNORECASE)
        if m:
            return m.group(2)
        pattern = rf'<{tag}[^>]*content=["\']([^"\']*)["\'][^>]*{attr}=["\'][^"\']*{attr_val}[^"\']*["\']'
        m = re.search(pattern, content, re.IGNORECASE)
        if m:
            return m.group(1)
        return ""
    pattern = rf'<{tag}[^>]*>(.*?)</{tag}>'
    m = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
    return m.group(1).strip() if m else ""


def scrape_meta(content: str, name: str) -> str:
    # Try name="..." content="..." (double-quote attrs only, to avoid stopping at curly quotes)
    pattern = rf'<meta\s+name="{re.escape(name)}"\s+content="([^"]*)"'
    m = re.search(pattern, content, re.IGNORECASE)
    if m:
        return m.group(1)
    pattern = rf'<meta\s+content="([^"]*)"\s+name="{re.escape(name)}"'
    m = re.search(pattern, content, re.IGNORECASE)
    return m.group(1) if m else ""


def build_date_index() -> dict[str, str]:
    """Build slug -> YYYY.MM.DD date from essays.html and shortform.html."""
    index: dict[str, str] = {}
    for page in ["essays.html", "shortform.html"]:
        path = BASE / page
        if not path.exists():
            continue
        content = path.read_text(encoding="utf-8")
        # Match: <span class="post-date">YYYY.MM.DD</span> ... href="essays/slug.html"
        items = re.findall(
            r'<span class="post-date">(\d{4}\.\d{2}\.\d{2})</span>.*?href="essays/([^"]+\.html)"',
            content, re.DOTALL
        )
        for date_str, slug_file in items:
            slug = slug_file.replace(".html", "")
            index[slug] = date_str
    return index


def parse_date(date_str: str) -> datetime:
    """Parse YYYY.MM.DD or YYYY-MM-DD into a UTC datetime."""
    date_str = date_str.replace(".", "-")
    return datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)


def rfc822(dt: datetime) -> str:
    return dt.strftime("%a, %d %b %Y %H:%M:%S +0000")


def collect_posts(date_index: dict[str, str]) -> list[dict]:
    posts = []
    for html_file in sorted(ESSAYS_DIR.glob("*.html")):
        if html_file.name.startswith("_"):
            continue
        content = html_file.read_text(encoding="utf-8")

        title_raw = scrape_tag(content, "title")
        title = re.sub(r"\s*—\s*Niko McCarty$", "", title_raw).strip()
        if not title:
            continue

        description = scrape_meta(content, "description")
        tag = scrape_meta(content, "post-tag") or "essay"

        slug = html_file.stem
        relative_url = f"essays/{html_file.name}"
        link = f"{SITE_URL}/{relative_url}"

        # Date priority: post-date meta > date_index > file mtime
        post_date_meta = scrape_meta(content, "post-date")
        if post_date_meta:
            date_str = post_date_meta
        elif slug in date_index:
            date_str = date_index[slug]
        else:
            mtime = os.path.getmtime(html_file)
            date_str = datetime.fromtimestamp(mtime, tz=timezone.utc).strftime("%Y.%m.%d")

        dt = parse_date(date_str)
        posts.append({
            "title": title,
            "description": description,
            "link": link,
            "tag": tag,
            "date": dt,
            "slug": slug,
        })

    posts.sort(key=lambda p: p["date"], reverse=True)
    return posts


def build_feed(posts: list[dict]) -> str:
    now = rfc822(datetime.now(tz=timezone.utc))
    last_build = rfc822(posts[0]["date"]) if posts else now

    items = []
    for p in posts:
        items.append(f"""    <item>
      <title>{html_mod.escape(p['title'])}</title>
      <link>{p['link']}</link>
      <guid isPermaLink="true">{p['link']}</guid>
      <description>{html_mod.escape(p['description'])}</description>
      <category>{html_mod.escape(p['tag'])}</category>
      <pubDate>{rfc822(p['date'])}</pubDate>
    </item>""")

    items_xml = "\n".join(items)
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>{html_mod.escape(FEED_TITLE)}</title>
    <link>{SITE_URL}</link>
    <description>{html_mod.escape(FEED_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>{last_build}</lastBuildDate>
    <atom:link href="{SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>{AUTHOR_EMAIL} ({AUTHOR_NAME})</managingEditor>
    <webMaster>{AUTHOR_EMAIL} ({AUTHOR_NAME})</webMaster>
{items_xml}
  </channel>
</rss>
"""


def main():
    date_index = build_date_index()
    posts = collect_posts(date_index)
    if not posts:
        print("No posts found — feed not written.")
        return
    feed = build_feed(posts)
    FEED_PATH.write_text(feed, encoding="utf-8")
    print(f"feed.xml updated — {len(posts)} post(s)")
    for p in posts:
        print(f"  {p['date'].strftime('%Y.%m.%d')}  [{p['tag']}]  {p['title']}")


if __name__ == "__main__":
    main()
