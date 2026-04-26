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

    const SEED = [
        { tier: 5, title: 'UN General Assembly adopts unanimous resolution on AI governance', body: 'Member states sign framework requiring open auditability for any AI system deployed in critical infrastructure. Full text and roll-call vote attached.', sources: ['UN.org primary record', 'AP', 'Reuters', 'BBC', 'Le Monde', '+7 outlets'], type: 'story', minutesAgo: 12, location: 'New York' },
        { tier: 5, title: 'Open Broadcast Protocol federation crosses 1,000 nodes', body: 'World Feed mesh now spans 47 countries. Verification consensus operating. No central server, no kill switch.', sources: ['worldfeed.org/status', 'GitHub release notes', 'Independent mirror logs'], type: 'story', minutesAgo: 47, location: 'global' },
        { tier: 4, title: 'Climate action protests in 14 cities — coordinated walkout', body: 'Eyewitness video confirmed from Berlin, Paris, Mexico City, Lagos, Bangkok. Crowd estimates between 80K–120K per location.', sources: ['Reuters wire', 'eyewitness video x6', 'local press x4'], type: 'video', minutesAgo: 95, location: 'multi-city' },
        { tier: 4, title: 'Federation node operator publishes verification methodology', body: 'How the 5-star system actually computes a tier from sourcing density, primary-document presence, and corroboration depth.', sources: ['worldfeed.org/methodology', 'GitHub spec', 'arXiv preprint'], type: 'document', minutesAgo: 140, location: 'remote' },
        { tier: 3, title: 'Reports of incident near border region — corroborating', body: 'Two independent stringers reporting; awaiting third confirmation. Imagery in queue for verification.', sources: ['stringer A', 'stringer B'], type: 'story', minutesAgo: 210, location: 'border' },
        { tier: 3, title: 'Possible major science announcement — embargo lifts soon', body: 'Multiple outlets staffing for an unconfirmed but coordinated press window. Subject area unclear.', sources: ['embargo whispers x3'], type: 'story', minutesAgo: 320, location: 'remote' },
        { tier: 2, title: 'Citizen flooding report with attached photos — local', body: 'Single eyewitness submission. Geotag plausible, no corroborating sensor or outlet yet. Looking for additional reporters.', sources: ['eyewitness submission'], type: 'image', minutesAgo: 88, location: 'local' },
        { tier: 2, title: 'Anonymous submission about corporate misconduct', body: 'Single anonymous source. No documents attached yet. Open call for evidence — submit verification at link.', sources: ['anonymous'], type: 'story', minutesAgo: 165, location: 'unknown' },
        { tier: 1, title: 'Unsupported claim about market manipulation', body: 'No evidence provided. Contradicted by published filings. Posted for transparency; reader discretion advised.', sources: ['none'], type: 'story', minutesAgo: 240, location: 'unknown' },
        { tier: 0, title: 'New submission awaiting first review', body: 'Just posted. Verification pipeline has not run yet. Help verify or refute.', sources: [], type: 'story', minutesAgo: 3, location: 'unknown' },
        { tier: 5, title: 'Public health agency releases full dataset on outbreak modeling', body: 'CSV + raw incidence files attached. Independent statisticians reproducing within hours.', sources: ['CDC', 'ECDC', 'WHO', '+5'], type: 'document', minutesAgo: 410, location: 'global' },
        { tier: 4, title: 'Energy grid stabilization milestone — solar/storage hybrid', body: 'Operator confirmed 72-hour run with renewable-only mix on regional grid. Logs published.', sources: ['grid operator', 'IEEE wire', 'two independent monitors'], type: 'story', minutesAgo: 540, location: 'regional' },
        { tier: 3, title: 'Developing — outage rumor on major social platform', body: 'Status page green, user reports rising. Either edge regional or false alarm. Tracking.', sources: ['user reports', 'down detector'], type: 'story', minutesAgo: 22, location: 'global' },
        { tier: 5, title: 'Long-form: How the Open Broadcast Protocol resists capture', body: '12,000 words on the architecture choices that make federation impossible to shut down — verification consensus, primary-source weighting, and the no-tracking floor.', sources: ['worldfeed.org/longform', 'authors x3'], type: 'story', minutesAgo: 600, location: 'remote' },
        { tier: 2, title: 'Single-witness account of unusual atmospheric event', body: 'Photos attached. Looking for second witness or sensor data.', sources: ['eyewitness'], type: 'image', minutesAgo: 700, location: 'rural' }
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

    function starsHtml(t) {
        let h = '<span class="stars" aria-label="' + t + ' of 5">';
        for (let i = 1; i <= 5; i++) {
            h += i <= t ? '<span class="filled">★</span>' : '<span class="empty">★</span>';
        }
        return h + '</span>';
    }

    function mediaHtml(type) {
        if (type === 'video') return '<div class="post-media"><span class="post-media-tag">VIDEO</span>▶ Eyewitness footage</div>';
        if (type === 'image') return '<div class="post-media"><span class="post-media-tag">IMAGE</span>📷 Submitted photo</div>';
        if (type === 'document') return '<div class="post-media"><span class="post-media-tag">DOCUMENT</span>▤ Primary source attached</div>';
        if (type === 'livestream') return '<div class="post-media"><span class="post-media-tag">LIVE</span>● Real-time broadcast</div>';
        return '';
    }

    function renderPost(p, idx) {
        const sourcesLine = p.sources && p.sources.length
            ? p.sources.map(s => '<span>● ' + escapeHtml(s) + '</span>').join('')
            : '<span style="color:var(--fg-dim)">no sources yet — open call for verification</span>';

        return `
        <article class="post" data-tier="${p.tier}" data-type="${p.type}" data-min="${p.minutesAgo}" data-idx="${idx}">
            <div class="post-head">
                ${starsHtml(p.tier)}
                <span class="tier-label tier-${p.tier}">${tierLabel[p.tier]}</span>
                <span class="post-meta">${escapeHtml(p.location || '')} · ${fmtTime(p.minutesAgo)}</span>
            </div>
            <h3 class="post-title">${escapeHtml(p.title)}</h3>
            <p class="post-body">${escapeHtml(p.body)}</p>
            ${mediaHtml(p.type)}
            <div class="post-sources">${sourcesLine}</div>
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

    let allPosts = rankFeed(SEED);
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

    // Filter chips
    filters.addEventListener('click', e => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        filters.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeFilter = chip.dataset.filter;
        paint(true);
    });

    // Sidebar nav (maps to filters)
    document.querySelectorAll('.nav-item').forEach(n => {
        n.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
            n.classList.add('active');
            const view = n.dataset.view;
            const titleMap = {
                latest: 'Latest broadcasts',
                verified: 'Verified — ★★★★★ only',
                developing: 'Developing — ★★★ and below',
                video: 'Video broadcasts',
                docs: 'Document submissions',
                federation: 'Federation status',
                saved: 'Saved broadcasts',
                about: 'About World Feed'
            };
            feedTitle.textContent = titleMap[view] || 'Latest broadcasts';
            const map = { latest: 'all', verified: '5', developing: '3', video: 'video', docs: 'docs', saved: 'saved', federation: 'federation', about: 'about' };
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
            // sync chip
            filters.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.filter === activeFilter));
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

    // Post action handling
    feed.addEventListener('click', e => {
        const btn = e.target.closest('.post-action');
        if (!btn) return;
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
        const sources = document.getElementById('postSources').value.split('\n').map(s => s.trim()).filter(Boolean);
        if (!title || !body) {
            alert('Headline and body required.');
            return;
        }
        const tier = sources.length >= 5 ? 5 : sources.length >= 3 ? 4 : sources.length >= 2 ? 3 : sources.length === 1 ? 2 : 0;
        SEED.unshift({ tier, title, body, sources, type, minutesAgo: 0, location: 'submitted' });
        allPosts = rankFeed(SEED);
        modal.classList.remove('show');
        document.getElementById('postTitle').value = '';
        document.getElementById('postBody').value = '';
        document.getElementById('postSources').value = '';
        paint(true);
    });

    // Initial paint
    paint(true);
})();
