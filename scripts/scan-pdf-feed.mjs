// WorldFeed PDF Scanner — Scans Q drive for PDF files and adds to feed
// Integrates with Q5 system and WorldFeed network

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const PDF_BASE_PATH = '/q';
const WORLD_FEED_API = 'http://localhost:8100';

// Categories for PDF classification
const CATEGORIES = {
  'math-library': 'Mathematics',
  'human-enrichment': 'Human Studies',
  'science': 'Science',
  'technology': 'Technology',
  'philosophy': 'Philosophy',
  'consciousness': 'Consciousness Studies'
};

async function scanPDFs() {
  console.log('Scanning Q drive for PDF files...');

  try {
    // Find all PDF files on Q drive
    const pdfFiles = execSync(
      `find "${PDF_BASE_PATH}" -type f -iname "*.pdf" 2>/dev/null | head -50`,
      { encoding: 'utf-8' }
    ).trim().split('\n').filter(f => f);

    console.log(`Found ${pdfFiles.length} PDF files`);

    const feedItems = [];

    for (const pdfPath of pdfFiles.slice(0, 20)) {
      const fileName = pdfPath.split('/').pop();
      const category = categorizePDF(pdfPath);
      const title = fileName.replace(/\.pdf$/i, '').replace(/_/g, ' ').replace(/-/g, ' ');

      feedItems.push({
        tier: 4,
        cats: ['new'],
        title: title,
        body: `Document from ${category}. Full PDF available for download and analysis.`,
        sources: ['Q Drive Library', 'WorldFeed Network'],
        type: 'document',
        minutesAgo: Math.floor(Math.random() * 1440),
        location: category,
        imageUrl: '',
        link: `/pdf/${encodeURIComponent(fileName)}`,
        pdfPath: pdfPath
      });
    }

    // Write to feed.json
    const feedData = {
      updatedAt: new Date().toISOString(),
      itemCount: feedItems.length,
      items: feedItems
    };

    writeFileSync('data/feed.json', JSON.stringify(feedData, null, 2));
    console.log(`Wrote ${feedItems.length} PDF items to feed.json`);

    return feedItems;
  } catch (error) {
    console.error('Error scanning PDFs:', error.message);
    return [];
  }
}

function categorizePDF(path) {
  for (const [key, name] of Object.entries(CATEGORIES)) {
    if (path.includes(key)) return name;
  }
  return 'General';
}

// Run the scan
scanPDFs().then(items => {
  console.log(`Scan complete. ${items.length} PDF items added to feed.`);
});