// WorldFeed — RSS aggregator. Runs hourly via GitHub Actions.
// Pulls from major outlets, normalizes to feed.json. No external deps.

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';

const SOURCES = [
  // Text wires
  { name: 'BBC',           url: 'https://feeds.bbci.co.uk/news/world/rss.xml',                tier: 5, kind: 'text' },
  { name: 'NPR',           url: 'https://feeds.npr.org/1004/rss.xml',                         tier: 5, kind: 'text' },
  { name: 'Al Jazeera',    url: 'https://www.aljazeera.com/xml/rss/all.xml',                  tier: 5, kind: 'text' },
  { name: 'CBS News',      url: 'https://www.cbsnews.com/latest/rss/world',                   tier: 5, kind: 'text' },
  { name: 'CNN World',     url: 'http://rss.cnn.com/rss/edition_world.rss',                   tier: 4, kind: 'text' },
  { name: 'Guardian',      url: 'https://www.theguardian.com/world/rss',                      tier: 5, kind: 'text' },
  { name: 'NYT World',     url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',     tier: 5, kind: 'text' },
  { name: 'NASA',          url: 'https://www.nasa.gov/news-release/feed/',                    tier: 5, kind: 'text' },
  { name: 'Sci News',      url: 'https://www.sciencedaily.com/rss/top/science.xml',           tier: 5, kind: 'text' },
  { name: 'Bloomberg Tech',url: 'https://feeds.bloomberg.com/technology/news.rss',            tier: 4, kind: 'text' },
  // Video — YouTube channel RSS for the majors
  { name: 'BBC News (video)',     url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC16niRr50-MSBwiO3YDb3RA', tier: 5, kind: 'video' },
  { name: 'CNN (video)',          url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCupvZG-5ko_eiXAupbDfxWw', tier: 4, kind: 'video' },
  { name: 'Al Jazeera (video)',   url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCNye-wNBqNL5ZzHSJj3l8Bg', tier: 5, kind: 'video' },
  { name: 'Reuters (video)',      url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UChqUTb7kYRX8-EiaN3XFrSQ', tier: 5, kind: 'video' },
  { name: 'DW (video)',           url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCknLrEdhRCp1aegoMqRaCZg', tier: 4, kind: 'video' },
  { name: 'AP (video)',           url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC52X5wxOL_s5yw0dQk7NtgA', tier: 5, kind: 'video' },
  { name: 'NBC News (video)',     url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCeY0bbntWzzVIaj2z3QigXg', tier: 4, kind: 'video' },
  { name: 'Sky News (video)',     url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCoMdktPbSTixAyNGwb-UYkQ', tier: 4, kind: 'video' }
];

const KEYWORDS_VIRAL = /\b(breaking|exclusive|massive|crisis|protest|attack|shooting|killed|war|record|historic|wins?|elected|resigns?|launches?|crashes?|leaks?)\b/i;

async function fetchRSS(src, timeoutMs = 10000) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(src.url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'WorldFeed-bot/1.0 (+https://oroboroslabs-ai.github.io/world-feed/)' }
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseRSS(xml, src);
  } catch (e) {
    console.error(`[skip] ${src.name}: ${e.message}`);
    return [];
  }
}

function parseRSS(xml, src) {
  const items = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/g)
                || xml.match(/<entry[\s\S]*?<\/entry>/g) || [];
  for (const b of blocks.slice(0, 8)) {
    const title = pick(b, 'title');
    const desc  = pick(b, 'description') || pick(b, 'summary') || pick(b, 'content');
    const link  = pickLink(b);
    const pub   = pick(b, 'pubDate') || pick(b, 'published') || pick(b, 'updated') || pick(b, 'dc:date');
    const img   = extractImage(b);
    const vid   = extractVideo(b);
    if (!title) continue;
    items.push({
      title: title.slice(0, 220),
      body:  (desc || '').slice(0, 320),
      link,
      pub,
      source: src.name,
      tier: src.tier,
      imageUrl: img,
      videoUrl: vid,
      sourceKind: src.kind || 'text'
    });
  }
  return items;
}

function pick(block, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = block.match(re);
  return m ? cleanText(m[1]) : '';
}
function pickLink(block) {
  const m1 = block.match(/<link[^>]*>([^<]+)<\/link>/i);
  if (m1 && m1[1].trim()) return m1[1].trim();
  const m2 = block.match(/<link[^>]*href=["']([^"']+)["']/i);
  return m2 ? m2[1] : '';
}
function extractImage(block) {
  const patterns = [
    /<media:content[^>]*medium=["']image["'][^>]*url=["']([^"']+)["']/i,
    /<media:content[^>]*url=["']([^"']+\.(?:jpg|jpeg|png|webp|avif)[^"']*)["']/i,
    /<media:thumbnail[^>]*url=["']([^"']+)["']/i,
    /<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image\//i,
    /<enclosure[^>]*type=["']image\/[^"']+["'][^>]*url=["']([^"']+)["']/i,
    /<itunes:image[^>]*href=["']([^"']+)["']/i,
    /<image>\s*<url>([^<]+)<\/url>/i,
    /<img[^>]*src=["']([^"']+)["']/i,
    /url=["'](https?:[^"']+\.(?:jpg|jpeg|png|webp|avif)[^"']*)["']/i
  ];
  for (const p of patterns) {
    const m = block.match(p);
    if (m && m[1]) return m[1].replace(/&amp;/g, '&');
  }
  return '';
}

function extractVideo(block) {
  // Look for explicit video media first
  const explicit = [
    /<media:content[^>]*medium=["']video["'][^>]*url=["']([^"']+)["']/i,
    /<media:content[^>]*url=["']([^"']+)["'][^>]*medium=["']video["']/i,
    /<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']video\//i,
    /<enclosure[^>]*type=["']video\/[^"']+["'][^>]*url=["']([^"']+)["']/i
  ];
  for (const p of explicit) {
    const m = block.match(p);
    if (m && m[1]) return m[1].replace(/&amp;/g, '&');
  }
  // Then look for YouTube / Vimeo / TikTok / X URLs in any content
  const services = [
    /(https?:\/\/(?:www\.)?youtube\.com\/watch\?[^"'\s<>]*v=[a-zA-Z0-9_-]{11}[^"'\s<>]*)/i,
    /(https?:\/\/(?:www\.)?youtube\.com\/(?:embed|shorts)\/[a-zA-Z0-9_-]{11})/i,
    /(https?:\/\/youtu\.be\/[a-zA-Z0-9_-]{11})/i,
    /(https?:\/\/(?:www\.|player\.)?vimeo\.com\/(?:video\/)?\d+)/i,
    /(https?:\/\/(?:www\.)?tiktok\.com\/[^"'\s<>]+\/video\/\d+)/i,
    /(https?:\/\/(?:twitter\.com|x\.com)\/[^/\s"']+\/status\/\d+)/i
  ];
  for (const p of services) {
    const m = block.match(p);
    if (m && m[1]) return m[1].replace(/&amp;/g, '&');
  }
  // iframe src to a known video host
  const iframe = block.match(/<iframe[^>]*src=["']([^"']+)["']/i);
  if (iframe && /youtube\.com\/embed|player\.vimeo\.com|tiktok\.com\/embed|platform\.twitter\.com\/embed/i.test(iframe[1])) {
    return iframe[1].replace(/&amp;/g, '&');
  }
  return '';
}
function cleanText(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function categorize(item, minutesAgo) {
  const cats = [];
  if (minutesAgo <= 60) cats.push('new');
  if (KEYWORDS_VIRAL.test(item.title)) cats.push('viral');
  return cats;
}

function classifyType(item) {
  if (item.videoUrl) return 'video';
  if (/\b(video|footage|watch|broadcast)\b/i.test(item.title + ' ' + item.body)) return 'video';
  if (item.imageUrl) return 'image';
  if (/\b(report|study|paper|filing|document|dataset|preprint)\b/i.test(item.title)) return 'document';
  return 'story';
}

// Fetch full article text via jina.ai/r/ (free, no key, returns markdown)
async function fetchFullText(url, timeoutMs = 14000) {
  if (!url || !/^https?:/.test(url)) return '';
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch('https://r.jina.ai/' + url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'WorldFeed-bot/1.0', 'X-Return-Format': 'markdown' }
    });
    clearTimeout(t);
    if (!res.ok) return '';
    let md = await res.text();
    // strip jina's leading metadata lines so we get just the article body
    md = md.replace(/^Title:[^\n]*\n/m, '')
           .replace(/^URL Source:[^\n]*\n/m, '')
           .replace(/^Markdown Content:\s*\n?/m, '')
           .replace(/^Warning:[^\n]*\n/gm, '')
           .replace(/!\[\]\([^)]*\)/g, '')
           .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '')
           .trim();
    // reject only the unmistakable bot challenges (not generic UI words)
    const head = md.slice(0, 500);
    const blockers = /(Just a moment\.\.\.|Are you a robot|We've detected unusual activity|Verify you are human|Cloudflare Ray ID|Access Denied)/i;
    if (blockers.test(head)) return '';
    if (md.length < 120) return '';
    return md.slice(0, 4000);
  } catch (_) {
    return '';
  }
}

// limited concurrency runner (jina free tier is friendly to small bursts)
async function withConcurrency(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const idx = i++;
      try { out[idx] = await fn(items[idx], idx); }
      catch (_) { out[idx] = items[idx]; }
    }
  }));
  return out;
}

async function main() {
  const all = [];
  await Promise.all(SOURCES.map(async (s) => {
    const items = await fetchRSS(s);
    all.push(...items);
  }));

  // dedupe by normalized title prefix
  const seen = new Set();
  const unique = all.filter((i) => {
    const k = i.title.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 70);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // sort newest first
  unique.sort((a, b) => {
    const da = a.pub ? new Date(a.pub).getTime() : 0;
    const db = b.pub ? new Date(b.pub).getTime() : 0;
    return db - da;
  });

  // Fetch full article text for the top text items (videos don't need it)
  const top = unique.slice(0, 60);
  const textTop = top.filter(i => i.sourceKind !== 'video');
  console.log(`Fetching full content for ${textTop.length} text items via jina…`);
  await withConcurrency(textTop, 4, async (it) => {
    const full = await fetchFullText(it.link);
    if (full && full.length > (it.body || '').length) it.fullContent = full;
    return it;
  });

  const now = Date.now();
  const items = top.map((it) => {
    const pubMs = it.pub ? new Date(it.pub).getTime() : now;
    const minutesAgo = Math.max(0, Math.round((now - pubMs) / 60000));
    return {
      tier: it.tier,
      cats: categorize(it, minutesAgo),
      title: it.title,
      body: it.fullContent || it.body,
      summary: it.body, // keep RSS summary separately
      sources: [it.source],
      type: classifyType(it),
      minutesAgo,
      location: 'wire',
      imageUrl: it.imageUrl || '',
      videoUrl: it.videoUrl || '',
      link: it.link || '',
      hasFullText: !!it.fullContent
    };
  });

  if (items.length < 5) {
    console.error(`Only got ${items.length} items — refusing to overwrite feed.json`);
    process.exit(0); // exit clean so workflow doesn't fail
  }

  const out = {
    updatedAt: new Date().toISOString(),
    sourcesTried: SOURCES.length,
    itemCount: items.length,
    items
  };

  mkdirSync('data', { recursive: true });
  writeFileSync('data/feed.json', JSON.stringify(out, null, 2));
  console.log(`Wrote ${items.length} items at ${out.updatedAt}`);
}

main().catch((e) => {
  console.error('build-feed failed:', e);
  process.exit(0); // don't break the workflow
});
