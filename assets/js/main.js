// World Feed — Open Broadcast Protocol
// Free-scrolling, anti-algorithm feed. Ranked by verification + recency.

(function () {
    'use strict';

    const tierLabel = {
        5: 'VERIFIED',
        4: 'RELIABLE',
        3: 'PLAUSIBLE',
        2: 'UNVERIFIED',
        1: 'UNRELIABLE',
        0: 'UNKNOWN'
    };

    // Live feed — April 26, 2026. Real headlines, sourced from major outlets.
    const SEED = [
        { tier: 5, cats: ['new', 'viral'], title: 'Shots fired outside White House Correspondents\' Dinner — President rushed out unharmed', body: 'Trump and First Lady evacuated from the Washington Hilton by Secret Service after a man opened fire on security personnel near the ballroom. Suspect in custody. FBI investigation underway. Full video circulating.', sources: ['CBS News', 'CNN', 'Reuters', 'AP', 'Fox News', 'BBC', '+9 outlets'], type: 'video', minutesAgo: 38, location: 'Washington DC', imageUrl: 'https://loremflickr.com/800/450/white-house,washington' },
        { tier: 5, cats: ['new', 'viral'], title: 'Trump cancels Pakistan trip for Iran peace talks: "offered a lot, but not enough"', body: 'Envoys Steve Witkoff and Jared Kushner stood down. Tehran ceasefire proposal rejected. Negotiations to continue by phone. Day 56 of the conflict.', sources: ['CBS News', 'CNN', 'The National', 'Al Jazeera', 'Reuters', '+5 outlets'], type: 'story', minutesAgo: 95, location: 'Washington DC', imageUrl: 'https://loremflickr.com/800/450/iran,flag,diplomacy' },
        { tier: 5, cats: ['viral'], title: 'Israel says it eliminated three Hezbollah operatives in vehicle "loaded with weapons"', body: 'IDF reports two projectiles launched from Lebanon, calling it a "blatant violation of ceasefire understandings." Two more armed members targeted elsewhere.', sources: ['Reuters', 'Al Jazeera', 'CNN', 'Times of Israel', '+4 outlets'], type: 'story', minutesAgo: 142, location: 'Lebanon border', imageUrl: 'https://loremflickr.com/800/450/lebanon,middle-east' },
        { tier: 5, cats: ['viral'], title: 'Sebastian Sawe becomes first human to run sub-2-hour marathon in record-sanctioned race', body: 'Kenyan distance runner crosses the line at 1:59:43 — first official sub-2 in IAAF-sanctioned conditions. Crowd erupts.', sources: ['World Athletics', 'Reuters', 'BBC Sport', 'NBC', '+6 outlets'], type: 'video', minutesAgo: 220, location: 'Vienna', imageUrl: 'https://loremflickr.com/800/450/marathon,running' },
        { tier: 5, cats: ['new'], title: 'King Charles and Queen Camilla begin four-day US state visit Monday', body: 'UK and US security services coordinating ahead of arrival. Schedule includes White House dinner, Capitol address, Mount Vernon visit. First state visit since coronation.', sources: ['BBC', 'US News', 'Reuters', 'AP', '+5 outlets'], type: 'story', minutesAgo: 180, location: 'London → Washington', imageUrl: 'https://loremflickr.com/800/450/king-charles,monarchy' },
        { tier: 5, cats: ['new'], title: 'DeepSeek unveils V4 Flash and V4 Pro — 1M-token context, hybrid attention architecture', body: 'New flagship model claims top-tier coding benchmarks plus major reasoning and agentic-task gains. Hybrid attention pushes long-context recall significantly. Open weights expected.', sources: ['Bloomberg', 'DeepSeek release notes', 'MIT Tech Review', 'arXiv preprint'], type: 'document', minutesAgo: 60, location: 'Hangzhou', imageUrl: 'https://loremflickr.com/800/450/ai,technology,chip' },
        { tier: 4, cats: ['viral'], title: 'Hungarian PM Viktor Orban returns parliamentary mandate, ending 36-year run', body: 'Step-down follows election defeat earlier this month. Orban says he will reorganize the "national side" outside formal politics. Major reshuffle of European right-wing alignment expected.', sources: ['Reuters', 'AP', 'Politico EU', 'Pravda NATO', '+3 outlets'], type: 'story', minutesAgo: 310, location: 'Budapest', imageUrl: 'https://loremflickr.com/800/450/hungary,parliament,budapest' },
        { tier: 4, cats: ['new'], title: 'Bomb attack in Cajibio, Colombia kills 7, injures 20+', body: 'Cauca department incident; armed group not yet claimed. Local hospitals on emergency footing. Government condemns and announces investigation.', sources: ['El Tiempo', 'Reuters', 'AP', 'BBC Mundo'], type: 'story', minutesAgo: 75, location: 'Cajibio, Colombia', imageUrl: 'https://loremflickr.com/800/450/colombia,emergency' },
        { tier: 4, cats: ['new'], title: 'M6.3 earthquake strikes Mongolia — depth 10 km, no immediate casualties', body: 'Felt across multiple provinces. USGS and Mongolia\'s seismic service in agreement on magnitude. Aftershock sequence beginning.', sources: ['USGS', 'VolcanoDiscovery', 'Mongolia NDMA', 'Reuters'], type: 'story', minutesAgo: 110, location: 'Mongolia', imageUrl: 'https://loremflickr.com/800/450/earthquake,seismology' },
        { tier: 5, cats: ['viral'], title: 'NASA Artemis II crew returns from lunar flyby — humans travel farther from Earth than ever recorded', body: 'Mission set new distance record at 252,757 miles (406,773 km) on far side of the Moon. First crewed beyond-LEO flight since Apollo 17 in 1972. Splashdown nominal.', sources: ['NASA', 'AP', 'Reuters', 'BBC', 'SpaceNews', '+8 outlets'], type: 'video', minutesAgo: 480, location: 'Pacific Ocean', imageUrl: 'https://loremflickr.com/800/450/nasa,moon,spaceflight' },
        { tier: 5, cats: [], title: 'Curiosity rover detects seven previously unknown organic molecules on Mars', body: 'Sample analysis from Gale Crater released by NASA-JPL on April 21. Molecules consistent with prebiotic chemistry — not biosignatures, but extending the known organic inventory. Full dataset published.', sources: ['NASA-JPL', 'Science', 'Nature News', 'arXiv'], type: 'document', minutesAgo: 510, location: 'Gale Crater, Mars', imageUrl: 'https://loremflickr.com/800/450/mars,rover,space' },
        { tier: 5, cats: [], title: 'Graphene electrons observed flowing as nearly frictionless liquid — defies textbook physics', body: 'Cambridge–MIT collaboration measures electron viscosity well below the conventional Mott-Ioffe-Regel limit. Implications for ultra-low-resistance interconnects and quantum devices.', sources: ['Nature', 'Physics Today', 'Cambridge press release', 'MIT News'], type: 'document', minutesAgo: 360, location: 'Cambridge UK', imageUrl: 'https://loremflickr.com/800/450/physics,laboratory,quantum' },
        { tier: 4, cats: ['new'], title: 'Brain-mimicking hafnium-oxide chip slashes AI energy use by up to 70%', body: 'Nanoelectronic device emulates neuronal spike-and-hold dynamics. Power profile compatible with on-device foundation models. Working prototype demonstrated.', sources: ['ScienceDaily', 'Nature Electronics', 'IEEE Spectrum'], type: 'story', minutesAgo: 240, location: 'Northwestern University', imageUrl: 'https://loremflickr.com/800/450/microchip,silicon,brain' },
        { tier: 4, cats: [], title: 'PwC: 75% of AI economic gains captured by just 20% of companies', body: 'Annual AI Performance Study finds the gap between leaders and laggards widening. Leading firms reinvesting AI productivity gains into growth, not headcount cuts.', sources: ['PwC report', 'Reuters', 'WSJ', 'FT'], type: 'document', minutesAgo: 420, location: 'global', imageUrl: 'https://loremflickr.com/800/450/business,technology,boardroom' },
        { tier: 3, cats: ['new'], title: 'Developing: regional outage reports on major messaging platform — status page still green', body: 'User reports concentrated in EU and US East. Platform engineering investigating. Could be edge-CDN regional or false alarm. Tracking.', sources: ['DownDetector', 'user reports x140', 'platform status page'], type: 'story', minutesAgo: 18, location: 'global', imageUrl: 'https://loremflickr.com/800/450/server,outage,network' }
    ];

    function fmtTime(min) {
        if (min < 1) return 'just now';
        if (min < 60) return min + 'm ago';
        const h = Math.floor(min / 60);
        if (h < 24) return h + 'h ago';
        const d = Math.floor(h / 24);
        return d + 'd ago';
    }

    function escapeHtml(s) {
        const d = document.createElement('div');
        d.textContent = s == null ? '' : s;
        return d.innerHTML;
    }

    // === video link detection (paste any of these → embed inline) ===
    const VIDEO_PROVIDERS = [
        { name: 'youtube', re: /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/, embed: id => 'https://www.youtube.com/embed/' + id, thumb: id => 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg' },
        { name: 'vimeo',   re: /vimeo\.com\/(\d+)/,                                       embed: id => 'https://player.vimeo.com/video/' + id, thumb: null },
        { name: 'x',       re: /(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/,           embed: id => 'https://platform.twitter.com/embed/Tweet.html?id=' + id, thumb: null },
        { name: 'tiktok',  re: /tiktok\.com\/(?:[^/]+\/video|embed\/v2)\/(\d+)/,          embed: id => 'https://www.tiktok.com/embed/v2/' + id, thumb: null }
    ];
    function detectVideo(url) {
        if (!url) return null;
        for (const p of VIDEO_PROVIDERS) {
            const m = url.match(p.re);
            if (m) return { provider: p.name, id: m[1], embed: p.embed(m[1]), thumb: p.thumb ? p.thumb(m[1]) : null };
        }
        return null;
    }
    function videoHtml(p) {
        const v = detectVideo(p.videoUrl);
        if (!v) return '';
        if (v.thumb) {
            return `<div class="post-video has-thumb" data-embed="${v.embed}" style="background-image:url('${v.thumb}');"><div class="post-play">▶</div><span class="post-media-tag">VIDEO · ${v.provider.toUpperCase()}</span></div>`;
        }
        return `<div class="post-video"><iframe src="${v.embed}" loading="lazy" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe><span class="post-media-tag">VIDEO · ${v.provider.toUpperCase()}</span></div>`;
    }
    function sourceLinkHtml(p) {
        if (!p.link) return '';
        let host = p.link;
        try { host = new URL(p.link).hostname.replace(/^www\./, ''); } catch (_) {}
        return `<a class="post-source-link" href="${p.link}" target="_blank" rel="noopener noreferrer">Read full story at ${escapeHtml(host)} <span class="arrow">↗</span></a>`;
    }

    // === user submissions persistence (survive live-feed refresh) ===
    const USER_KEY = 'worldfeed-user-stories';
    function loadUserStories() {
        try { return JSON.parse(localStorage.getItem(USER_KEY) || '[]'); }
        catch (_) { return []; }
    }
    function saveUserStories(arr) {
        try { localStorage.setItem(USER_KEY, JSON.stringify(arr.slice(0, 100))); }
        catch (_) {}
    }
    let userStories = loadUserStories();
    function mergeFeeds(liveItems) {
        // age user posts based on stored postedAt timestamp
        const now = Date.now();
        const aged = userStories.map(s => ({ ...s, minutesAgo: Math.max(0, Math.round((now - (s.postedAt || now)) / 60000)) }));
        return rankFeed([...aged, ...(liveItems || [])]);
    }

    function starsHtml(t) {
        let h = '<span class="stars" aria-label="' + t + ' of 5">';
        for (let i = 1; i <= 5; i++) {
            h += i <= t ? '<span class="filled">★</span>' : '<span class="empty">★</span>';
        }
        return h + '</span>';
    }

    function mediaHtml(p) {
        const type = p.type;
        if (type === 'document') {
            const txt = (p.body || '').slice(0, 480);
            const more = (p.body || '').length > 480 ? '…' : '';
            return `
            <div class="post-doc">
                <span class="post-media-tag">DOCUMENT</span>
                <div class="post-doc-text">${escapeHtml(txt)}${more}</div>
                ${p.link ? `<a class="post-doc-link" href="${p.link}" target="_blank" rel="noopener noreferrer">READ FULL DOCUMENT →</a>` : ''}
            </div>`;
        }
        if (p.imageUrl) {
            const tag = type === 'video' ? 'VIDEO' : 'IMAGE';
            const overlay = type === 'video' ? '<div class="post-play">▶</div>' : '';
            const safeUrl = String(p.imageUrl).replace(/"/g, '%22');
            return `<div class="post-media has-img" style="background-image:url('${safeUrl}'); background-size:cover; background-position:center;"><span class="post-media-tag">${tag}</span>${overlay}</div>`;
        }
        if (type === 'video') return '<div class="post-media"><span class="post-media-tag">VIDEO</span>▶ Footage</div>';
        if (type === 'image') return '<div class="post-media"><span class="post-media-tag">IMAGE</span>📷 Photo</div>';
        if (type === 'livestream') return '<div class="post-media"><span class="post-media-tag">LIVE</span>● Real-time broadcast</div>';
        return '';
    }

    function catsHtml(p) {
        // Remove all tags - no color badges next to stars
        return '';
    }

    function renderPost(p, idx) {
        const sourcesLine = p.sources && p.sources.length
            ? p.sources.map(s => '<span>● ' + escapeHtml(s) + '</span>').join('')
            : '<span style="color:var(--fg-dim)">no sources yet — open call for verification</span>';

        const postLink = p.link ? p.link : '#';
        const linkAttr = p.link ? `href="${p.link}" target="_blank" rel="noopener noreferrer"` : '';

        const userClass = p.isUser ? ' is-user' : '';
        const userTag = p.isUser ? '<span class="post-user-tag">USER POST</span>' : '';
        const video = videoHtml(p);
        const media = video ? '' : mediaHtml(p);
        const srcLink = sourceLinkHtml(p);
        const titleHtml = p.link
            ? `<h3 class="post-title"><a class="post-title-link" href="${p.link}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.title)}</a></h3>`
            : `<h3 class="post-title">${escapeHtml(p.title)}</h3>`;

        return `
        <article class="post${userClass}" data-tier="${p.tier}" data-type="${p.type}" data-min="${p.minutesAgo}" data-cats="${(p.cats||[]).join(',')}" data-idx="${idx}">
            <div class="post-head">
                ${starsHtml(p.tier)}
                ${catsHtml(p)}
                ${userTag}
                <span class="post-meta">${escapeHtml(p.location || '')} · ${fmtTime(p.minutesAgo)}</span>
            </div>
            ${titleHtml}
            <p class="post-body">${escapeHtml(p.body)}</p>
            ${video}
            ${media}
            <div class="post-sources">${sourcesLine}</div>
            ${srcLink}
            <div class="post-actions">
                <button class="post-action" data-act="verify">✓ Verify</button>
                <button class="post-action" data-act="amplify">↗ Amplify</button>
                <button class="post-action" data-act="save">◇ Save</button>
                <button class="post-action" data-act="translate">⌘ Translate</button>
                <button class="post-action" data-act="share">⇪ Share</button>
            </div>
        </article>`;
    }

    // Anti-algorithm sort: verification first (desc), then recency (desc)
    function rankFeed(items) {
        return items.slice().sort((a, b) => {
            if (b.tier !== a.tier) return b.tier - a.tier;
            return a.minutesAgo - b.minutesAgo;
        });
    }

    let allPosts = mergeFeeds(SEED);
    let renderedCount = 0;
    const PAGE = 8;
    const feed = document.getElementById('feed');
    const loader = document.getElementById('loader');
    const filters = document.getElementById('filters');
    const search = document.getElementById('searchInput');
    const feedTitle = document.getElementById('feedTitle');

    let activeFilter = 'all';
    let activeQuery = '';

    function visiblePosts() {
        return allPosts.filter(p => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'recent') return p.minutesAgo <= 60;
            if (activeFilter === 'video') return p.type === 'video' || p.type === 'livestream';
            if (activeFilter === 'local') return p.location === 'local';
            if (activeFilter === 'new') return (p.cats || []).includes('new') || p.minutesAgo <= 30;
            if (activeFilter === 'viral') return (p.cats || []).includes('viral');
            const n = parseInt(activeFilter, 10);
            if (!isNaN(n)) return p.tier === n;
            return true;
        }).filter(p => {
            if (!activeQuery) return true;
            const q = activeQuery.toLowerCase();
            return (p.title + ' ' + p.body + ' ' + (p.sources || []).join(' ') + ' ' + (p.location || '')).toLowerCase().includes(q);
        });
    }

    function paint(reset) {
        if (reset) {
            feed.innerHTML = '';
            renderedCount = 0;
        }
        const list = visiblePosts();
        const slice = list.slice(renderedCount, renderedCount + PAGE);
        if (slice.length === 0 && renderedCount === 0) {
            feed.innerHTML = '<div class="loader" style="padding:60px 20px">NO BROADCASTS MATCH — TRY A DIFFERENT FILTER OR SEARCH</div>';
            loader.style.display = 'none';
            return;
        }
        const html = slice.map((p, i) => renderPost(p, renderedCount + i)).join('');
        feed.insertAdjacentHTML('beforeend', html);
        renderedCount += slice.length;
        loader.style.display = renderedCount >= list.length ? 'none' : '';
    }

    // Sort links: new / verified / viral. Click active link to clear back to all.
    filters.addEventListener('click', e => {
        const link = e.target.closest('.sort-link');
        if (!link) return;
        e.preventDefault();
        const wasActive = link.classList.contains('active');
        filters.querySelectorAll('.sort-link').forEach(l => l.classList.remove('active'));
        if (wasActive) {
            activeFilter = 'all';
        } else {
            link.classList.add('active');
            activeFilter = link.dataset.filter;
        }
        paint(true);
    });

    // Sidebar nav (maps to filters)
    document.querySelectorAll('.nav-item').forEach(n => {
        n.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
            n.classList.add('active');
            const view = n.dataset.view;
            const titleMap = {
                latest: 'WorldFeed — latest broadcasts',
                new: 'WorldFeed — new',
                verified: 'WorldFeed — verified ★★★★★',
                viral: 'WorldFeed — viral',
                developing: 'WorldFeed — developing',
                video: 'WorldFeed — video',
                docs: 'WorldFeed — documents',
                federation: 'WorldFeed — federation status',
                saved: 'WorldFeed — saved',
                about: 'WorldFeed — about'
            };
            feedTitle.textContent = titleMap[view] || 'WorldFeed — latest broadcasts';
            const map = { latest: 'all', new: 'new', verified: '5', viral: 'viral', developing: '3', video: 'video', docs: 'docs', saved: 'saved', federation: 'federation', about: 'about' };
            const next = map[view] || 'all';
            if (next === 'docs') {
                allPosts = rankFeed(SEED.filter(p => p.type === 'document'));
                activeFilter = 'all';
            } else if (next === 'saved' || next === 'federation' || next === 'about') {
                allPosts = rankFeed(SEED);
                activeFilter = 'all';
            } else {
                allPosts = rankFeed(SEED);
                activeFilter = next;
            }
            // sync sort link active state
            filters.querySelectorAll('.sort-link').forEach(l => l.classList.toggle('active', l.dataset.filter === activeFilter));
            paint(true);
        });
    });

    // Search (live)
    let searchTimer;
    search.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            activeQuery = search.value.trim();
            paint(true);
        }, 120);
    });

    // Infinite scroll
    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) paint(false);
    }, { rootMargin: '400px' });
    observer.observe(loader);

    // Click handling: video thumb → iframe swap (must run before <a> nav)
    feed.addEventListener('click', e => {
        const vid = e.target.closest('.post-video.has-thumb');
        if (vid) {
            e.preventDefault();
            e.stopPropagation();
            const embed = vid.dataset.embed + (vid.dataset.embed.includes('?') ? '&' : '?') + 'autoplay=1';
            const tag = vid.querySelector('.post-media-tag');
            const tagHtml = tag ? tag.outerHTML : '';
            vid.outerHTML = `<div class="post-video"><iframe src="${embed}" allow="autoplay; fullscreen; encrypted-media" allowfullscreen loading="lazy"></iframe>${tagHtml}</div>`;
            return;
        }
        const btn = e.target.closest('.post-action');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        btn.classList.toggle('active');
        const act = btn.dataset.act;
        if (act === 'share' && navigator.share) {
            const post = btn.closest('.post');
            const title = post.querySelector('.post-title').textContent;
            navigator.share({ title, text: title, url: location.href }).catch(() => {});
        }
    });

    // Submit modal
    const modal = document.getElementById('submitModal');
    document.getElementById('submitBtn').addEventListener('click', () => modal.classList.add('show'));
    document.getElementById('cancelSubmit').addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });
    document.getElementById('confirmSubmit').addEventListener('click', () => {
        const title = document.getElementById('postTitle').value.trim();
        const body = document.getElementById('postBody').value.trim();
        const type = document.getElementById('postType').value;
        const videoUrl = (document.getElementById('postVideo')?.value || '').trim();
        const sourcesRaw = document.getElementById('postSources').value.split('\n').map(s => s.trim()).filter(Boolean);
        if (!title || !body) {
            alert('Headline and body required.');
            return;
        }
        // first http(s) line in sources becomes the "Read full story" link
        const firstUrl = sourcesRaw.find(s => /^https?:\/\//i.test(s)) || '';
        const tier = sourcesRaw.length >= 5 ? 5 : sourcesRaw.length >= 3 ? 4 : sourcesRaw.length >= 2 ? 3 : sourcesRaw.length === 1 ? 2 : 0;
        const story = {
            id: 'u' + Date.now(),
            tier,
            cats: ['new'],
            title,
            body,
            sources: sourcesRaw,
            type: videoUrl ? 'video' : type,
            location: 'community',
            link: firstUrl,
            videoUrl,
            isUser: true,
            postedAt: Date.now(),
            minutesAgo: 0
        };
        userStories.unshift(story);
        saveUserStories(userStories);
        const liveOnly = allPosts.filter(p => !p.isUser);
        allPosts = mergeFeeds(liveOnly);
        modal.classList.remove('show');
        document.getElementById('postTitle').value = '';
        document.getElementById('postBody').value = '';
        document.getElementById('postSources').value = '';
        if (document.getElementById('postVideo')) document.getElementById('postVideo').value = '';
        paint(true);
    });

    // Initial paint with embedded fallback SEED
    paint(true);

    // === Live feed loader: data/feed.json (rebuilt hourly by GitHub Action) ===
    function loadLiveFeed(isInitial) {
        fetch('data/feed.json?t=' + Date.now(), { cache: 'no-store' })
            .then(r => r.ok ? r.json() : null)
            .then(j => {
                if (!j || !Array.isArray(j.items) || j.items.length === 0) return;
                allPosts = mergeFeeds(j.items);
                paint(true);
                if (isInitial) console.log('WorldFeed live · ' + j.items.length + ' items · updated ' + j.updatedAt);
            })
            .catch(() => { /* keep embedded SEED */ });
    }
    loadLiveFeed(true);
    setInterval(() => loadLiveFeed(false), 10 * 60 * 1000); // refresh every 10 min
})();
