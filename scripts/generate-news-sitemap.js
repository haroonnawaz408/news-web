import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://techpulse.dev';

// Recent news items formatted specifically for Google News Publisher Center
const RECENT_NEWS = [
  {
    slug: 'next-generation-frontier-models-autonomous-reasoning',
    title: 'Next-Generation Frontier Models: How Autonomous Reasoning Transforms Software Engineering',
    pubDate: '2026-09-20T10:00:00Z',
    category: 'AI',
  },
  {
    slug: 'silicon-photonics-2nm-process-nodes-datacenter-hardware',
    title: 'Silicon Photonics & 2nm Process Nodes: The Hardware Race Powering Hyper-Scale Datacenters',
    pubDate: '2026-09-20T06:00:00Z',
    category: 'Technology',
  },
  {
    slug: 'commercial-nuclear-fusion-magnetic-confinement-plasma',
    title: 'Commercial Nuclear Fusion: Magnetic Confinement Sets New Plasma Stability Record',
    pubDate: '2026-09-19T14:30:00Z',
    category: 'Science',
  },
  {
    slug: 'autonomous-ai-agents-enterprise-operations',
    title: 'Autonomous AI Agents in Enterprise Operations: Moving Past the Pilot Phase',
    pubDate: '2026-09-19T09:15:00Z',
    category: 'AI',
  },
];

function generateNewsSitemap() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${RECENT_NEWS.map((article) => `  <url>
    <loc>${BASE_URL}/news/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>TechPulse</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${article.pubDate}</news:publication_date>
      <news:title><![CDATA[${article.title}]]></news:title>
    </news:news>
  </url>`).join('\n')}
</urlset>`;

  const outputPath = path.resolve(__dirname, '../public/sitemap-news.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`✓ Generated Google News XML sitemap at: ${outputPath}`);
}

generateNewsSitemap();
