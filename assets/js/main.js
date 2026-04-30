// Z — Anti-Algo News & Information
// Free-scrolling, anti-algorithm feed. Ranked by verification + recency. You decide.

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
    const USER_KEY = 'z-user-stories';
    function loadUserStories() {
        try { return JSON.parse(localStorage.getItem(USER_KEY) || '[]'); }
        catch (_) { return []; }
    }
    function saveUserStories(arr) {
        try { localStorage.setItem(USER_KEY, JSON.stringify(arr.slice(0, 100))); }
        catch (_) {}
    }
    let userStories = loadUserStories();

    // === simple client-side account (no backend yet — replace when IP/server lands) ===
    const ACCOUNT_KEY = 'z-account';
    function getAccount() {
        try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || 'null'); }
        catch (_) { return null; }
    }
    function setAccount(acc) {
        if (acc) localStorage.setItem(ACCOUNT_KEY, JSON.stringify(acc));
        else localStorage.removeItem(ACCOUNT_KEY);
    }
    function isLoggedIn() { return !!getAccount(); }
    function mergeFeeds(liveItems) {
        // age user posts based on stored postedAt timestamp
        const now = Date.now();
        const aged = userStories.map(s => ({ ...s, minutesAgo: Math.max(0, Math.round((now - (s.postedAt || now)) / 60000)) }));
        return rankFeed(applyExpiry([...aged, ...(liveItems || [])]));
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
        if (p.imageUrl) {
            const tag = type === 'video' ? 'VIDEO' : 'IMAGE';
            const overlay = type === 'video' ? '<div class="post-play">▶</div>' : '';
            const safeUrl = String(p.imageUrl).replace(/"/g, '%22');
            return `<div class="post-media has-img" style="background-image:url('${safeUrl}'); background-size:cover; background-position:center;"><span class="post-media-tag">${tag}</span>${overlay}</div>`;
        }
        return '';
    }

    // Render the article body. Convert markdown image refs ![](url) → inline images.
    // Headers and links are stripped down to plain prose to match the feed style.
    function bodyHtml(p) {
        const raw = String(p.body || '');
        if (!raw.trim()) return '';
        const isLong = raw.length > 600;
        const visible = isLong && !p.expanded ? raw.slice(0, 600) + '…' : raw;
        // light markdown: paragraph breaks, inline images, bold/italic
        let html = escapeHtml(visible)
            .replace(/!\[([^\]]*)\]\((https?:[^)\s]+)\)/g, '<img class="post-inline-img" alt="$1" src="$2" loading="lazy">')
            .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            .replace(/^#{1,6}\s*(.+)$/gm, '<strong>$1</strong>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
            .replace(/\n{2,}/g, '</p><p>')
            .replace(/\n/g, '<br>');
        html = '<p>' + html + '</p>';
        const expandBtn = isLong
            ? `<button class="post-expand-btn" data-idx="${p.__idx}">${p.expanded ? '⌃ Show less' : '⌄ Read full story'}</button>`
            : '';
        return `<div class="post-body-full">${html}${expandBtn}</div>`;
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

        p.__idx = idx;
        return `
        <article class="post${userClass}" data-tier="${p.tier}" data-type="${p.type}" data-min="${p.minutesAgo}" data-cats="${(p.cats||[]).join(',')}" data-idx="${idx}">
            <div class="post-head">
                ${starsHtml(p.tier)}
                ${catsHtml(p)}
                ${userTag}
                <span class="post-meta">${p.location === 'wire' ? '<span class="feed-indicator">⟁ FEED</span>' : escapeHtml(p.location || '')} · ${fmtTime(p.minutesAgo)}</span>
            </div>
            ${titleHtml}
            ${video}
            ${media}
            ${bodyHtml(p)}
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

    // Expiry: only tier ≥4 stories persist beyond 24 hours
    const TIER_EXPIRY_MINUTES = 1440;
    function applyExpiry(items) {
        return items.filter(p => p.tier >= 4 || p.minutesAgo <= TIER_EXPIRY_MINUTES);
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
        return applyExpiry(allPosts).filter(p => {
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
                latest: 'Z — latest broadcasts',
                new: 'Z — new',
                verified: 'Z — verified ★★★★★',
                viral: 'Z — viral',
                developing: 'Z — developing',
                video: 'Z — video',
                docs: 'Z — documents',
                federation: 'Z — federation status',
                saved: 'Z — saved',
                about: 'Z — about'
            };
            feedTitle.textContent = titleMap[view] || 'Z — latest broadcasts';
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
            updateHero();
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

    // Click handling: video thumb → iframe swap; expand body; post actions
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
        const exp = e.target.closest('.post-expand-btn');
        if (exp) {
            e.preventDefault();
            e.stopPropagation();
            const idx = parseInt(exp.dataset.idx, 10);
            const post = allPosts[idx];
            if (post) {
                post.expanded = !post.expanded;
                paint(true);
            }
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

    // === Submit modal — login required ===
    const modal = document.getElementById('submitModal');
    const loginModal = document.getElementById('loginModal');
    const submitBtn = document.getElementById('submitBtn');
    const accountBadge = document.getElementById('accountBadge');

    function refreshAccountUI() {
        const acc = getAccount();
        if (accountBadge) {
            if (acc) {
                accountBadge.innerHTML = '<span class="acc-dot"></span>@' + escapeHtml(acc.username) + ' <button class="acc-logout" id="logoutBtn">logout</button>';
                const lb = document.getElementById('logoutBtn');
                if (lb) lb.addEventListener('click', (e) => { e.stopPropagation(); setAccount(null); refreshAccountUI(); });
            } else {
                accountBadge.innerHTML = '<button class="acc-login-trigger" id="loginTrigger">Sign in to post</button>';
                const lt = document.getElementById('loginTrigger');
                if (lt) lt.addEventListener('click', () => loginModal && loginModal.classList.add('show'));
            }
        }
    }
    refreshAccountUI();

    submitBtn.addEventListener('click', () => {
        if (!isLoggedIn() && loginModal) {
            loginModal.classList.add('show');
            return;
        }
        modal.classList.add('show');
    });
    document.getElementById('cancelSubmit').addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });

    // === Login modal handlers ===
    if (loginModal) {
        const close = () => loginModal.classList.remove('show');
        const cancelLogin = document.getElementById('cancelLogin');
        const confirmLogin = document.getElementById('confirmLogin');
        if (cancelLogin) cancelLogin.addEventListener('click', close);
        loginModal.addEventListener('click', e => { if (e.target === loginModal) close(); });
        if (confirmLogin) confirmLogin.addEventListener('click', () => {
            const username = (document.getElementById('loginUsername').value || '').trim().replace(/^@/, '');
            const email = (document.getElementById('loginEmail').value || '').trim();
            if (!username || username.length < 2) { alert('Choose a username (min 2 chars).'); return; }
            setAccount({ username, email, since: Date.now() });
            refreshAccountUI();
            close();
            modal.classList.add('show'); // proceed to broadcast
        });
    }

    // === Image upload helper (file → data URL) ===
    function readImageFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) return resolve('');
            if (file.size > 800 * 1024) return reject(new Error('Image too large (max 800KB).'));
            const r = new FileReader();
            r.onload = () => resolve(r.result);
            r.onerror = () => reject(new Error('Failed to read image.'));
            r.readAsDataURL(file);
        });
    }
    document.getElementById('confirmSubmit').addEventListener('click', async () => {
        if (!isLoggedIn()) { loginModal && loginModal.classList.add('show'); return; }
        const acc = getAccount();
        // Rate limit: max 4 posts per hour per user
        const oneHourAgo = Date.now() - 3600000;
        const recentPosts = userStories.filter(s => s.author === acc.username && s.postedAt > oneHourAgo);
        if (recentPosts.length >= 4) {
            alert('Rate limit: max 4 posts per hour. Please wait before submitting again.');
            return;
        }
        const title = document.getElementById('postTitle').value.trim();
        const body  = document.getElementById('postBody').value.trim();
        const type  = document.getElementById('postType').value;
        const videoUrl = (document.getElementById('postVideo')?.value || '').trim();
        const sourcesRaw = document.getElementById('postSources').value.split('\n').map(s => s.trim()).filter(Boolean);
        const fileInput = document.getElementById('postImage');
        if (!title || !body) { alert('Headline and body required.'); return; }

        let imageDataUrl = '';
        if (fileInput && fileInput.files && fileInput.files[0]) {
            try { imageDataUrl = await readImageFile(fileInput.files[0]); }
            catch (err) { alert(err.message); return; }
        }

        const firstUrl = sourcesRaw.find(s => /^https?:\/\//i.test(s)) || '';
        const tier = sourcesRaw.length >= 5 ? 5 : sourcesRaw.length >= 3 ? 4 : sourcesRaw.length >= 2 ? 3 : sourcesRaw.length === 1 ? 2 : 0;
        const story = {
            id: 'u' + Date.now(),
            tier,
            cats: ['new'],
            title,
            body,
            sources: ['@' + acc.username, ...sourcesRaw],
            type: videoUrl ? 'video' : (imageDataUrl ? 'image' : type),
            location: '@' + acc.username,
            link: firstUrl,
            videoUrl,
            imageUrl: imageDataUrl,
            isUser: true,
            author: acc.username,
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
        if (fileInput) fileInput.value = '';
        paint(true);
        updateHero();
    });

    // === Z Hero: show top verified story ===
    function updateHero() {
        const hero = document.getElementById('zHero');
        const bg = document.getElementById('zHeroBg');
        const title = document.getElementById('zHeroTitle');
        const meta = document.getElementById('zHeroMeta');
        if (!hero || !bg || !title || !meta) return;
        const top = allPosts.filter(p => p.tier >= 4).slice(0, 1)[0];
        if (!top) { hero.style.display = 'none'; return; }
        title.textContent = top.title || 'Z — Anti-Algo News';
        const loc = top.location || 'global';
        const time = fmtTime(top.minutesAgo);
        const srcCount = top.sources ? top.sources.length : 0;
        const srcs = top.sources ? top.sources.slice(0, 3).join(', ') : '';
        meta.textContent = loc + ' · ' + time + ' · ' + srcCount + ' sources · ' + srcs;
        if (top.imageUrl) {
            bg.style.backgroundImage = "url('" + String(top.imageUrl).replace(/"/g, '%22') + "')";
        }
        hero.style.display = '';
        hero.dataset.link = top.link || '';
    }
    // Click hero → open story
    document.addEventListener('click', function(e) {
        const hero = e.target.closest('.z-hero');
        if (hero && hero.dataset.link) {
            window.open(hero.dataset.link, '_blank');
        }
    });

    // Initial paint with embedded fallback SEED
    paint(true);
    updateHero();
    setInterval(updateHero, 4 * 60 * 60 * 1000);

    // === Feed validation: major news outlets only ===
    const MAJOR_SOURCES = [
        'reuters', 'ap ', 'associated press', 'bbc', 'cnn', 'nbc', 'cbs', 'abc news',
        'fox news', 'npr', 'pbs', 'wsj', 'wall street journal', 'new york times',
        'washington post', 'the guardian', 'bloomberg', 'financial times',
        'al jazeera', 'nasa', 'nature', 'science', 'newscientist',
        'politico', 'reuters', 'times of israel', 'the national',
        'el tiempo', 'usgs', 'volcanodiscovery', 'world athletics',
        'ieee spectrum', 'mit news', 'mit tech review', 'space.com',
        'sciencedaily', 'phys.org', 'science daily'
    ];
    function isMajorSource(src) {
        const s = src.toLowerCase();
        return MAJOR_SOURCES.some(m => s.includes(m));
    }
    function validateFeedItems(items) {
        if (!Array.isArray(items)) return [];
        return items.filter(item => {
            if (!item || !item.title) return false;
            if (item.tier >= 4) return true;  // always keep verified/reliable
            if (!item.sources || !item.sources.length) return false;
            return item.sources.some(isMajorSource);
        });
    }

    // === Live feed loader: data/feed.json (rebuilt hourly by GitHub Action) ===
    // Tor / dark-web news search integration point:
    // Future: fetch from onion news aggregators via proxy → validate → merge into feed
    function loadLiveFeed(isInitial) {
        fetch('data/feed.json?t=' + Date.now(), { cache: 'no-store' })
            .then(r => r.ok ? r.json() : null)
            .then(j => {
                if (!j || !Array.isArray(j.items)) return;
                const valid = validateFeedItems(j.items);
                if (valid.length === 0) {
                    if (isInitial) console.warn('Z feed: all items invalid, keeping SEED');
                    return;
                }
                allPosts = mergeFeeds(valid);
                paint(true);
                updateHero();
                updateTrending();
                if (isInitial) console.log('Z live · ' + valid.length + ' items · updated ' + j.updatedAt);
            })
            .catch(() => { /* keep embedded SEED */ });
    }
    loadLiveFeed(true);

    // Refresh on the hour every hour
    function scheduleHourlyRefresh() {
        const now = new Date();
        const next = new Date(now);
        next.setHours(now.getHours() + 1, 0, 30, 0);
        const ms = next.getTime() - now.getTime();
        setTimeout(() => {
            loadLiveFeed(false);
            scheduleHourlyRefresh();
        }, ms);
    }
    scheduleHourlyRefresh();

    // === Trending auto-rotation every 2 hours ===
    function updateTrending() {
        const cards = document.querySelectorAll('.rail-card .item');
        if (!cards || cards.length < 4) return;
        const topStories = allPosts
            .filter(p => p.tier >= 4 && !p.isUser)
            .sort((a, b) => b.minutesAgo - a.minutesAgo)
            .slice(0, 6);
        if (topStories.length < 4) return;
        const trendingData = [
            { title: topStories[0].title, meta: '★'.repeat(topStories[0].tier) + ' · ' + (topStories[0].sources?.length || 0) + ' sources · ' + fmtTime(topStories[0].minutesAgo) },
            { title: topStories[1].title, meta: '★'.repeat(topStories[1].tier) + ' · ' + (topStories[1].sources?.length || 0) + ' sources · ' + fmtTime(topStories[1].minutesAgo) },
            { title: topStories[2].title, meta: '★'.repeat(topStories[2].tier) + ' · ' + (topStories[2].sources?.length || 0) + ' sources · ' + fmtTime(topStories[2].minutesAgo) },
            { title: topStories[3].title, meta: '★'.repeat(topStories[3].tier) + ' · ' + (topStories[3].sources?.length || 0) + ' sources · ' + fmtTime(topStories[3].minutesAgo) }
        ];
        cards.forEach((card, i) => {
            if (i < trendingData.length) {
                if (card.childNodes[0]) card.childNodes[0].textContent = trendingData[i].title;
                const metaEl = card.querySelector('.item-meta');
                if (metaEl) metaEl.textContent = trendingData[i].meta;
            }
        });
    }
    updateTrending();
    setInterval(updateTrending, 4 * 60 * 60 * 1000);

    // === Tor Video Feed: populate from live video items ===
    function updateTorVideo() {
        const t1 = document.getElementById('torVideo1');
        const t2 = document.getElementById('torVideo2');
        const t3 = document.getElementById('torVideo3');
        if (!t1 || !t2 || !t3) return;
        const videos = allPosts
            .filter(p => (p.type === 'video' || p.type === 'livestream') && p.title)
            .slice(0, 3);
        if (videos.length === 0) {
            const msg = 'No video feeds active<div class="item-meta">waiting for sources</div>';
            t1.innerHTML = msg; t2.innerHTML = msg; t3.innerHTML = msg;
            return;
        }
        const slots = [t1, t2, t3];
        slots.forEach((el, i) => {
            if (i < videos.length) {
                const v = videos[i];
                const src = v.sources && v.sources[0] ? v.sources[0] : 'tor';
                const time = fmtTime(v.minutesAgo);
                const label = v.tier >= 4 ? '★' : '▶';
                el.innerHTML = v.title + '<div class="item-meta">' + label + ' · ' + src + ' · ' + time + '</div>';
                el.style.cursor = 'pointer';
                el.onclick = function() { if (v.link) window.open(v.link, '_blank'); };
            }
        });
    }
    updateTorVideo();
    setInterval(updateTorVideo, 20 * 60 * 1000);
    // Re-populate whenever feed repaints
    const origPaint = paint;
    paint = function(reset) {
        origPaint(reset);
        updateTorVideo();
    };
})();
