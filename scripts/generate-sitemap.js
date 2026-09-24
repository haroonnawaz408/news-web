/**
 * TechPulse Dynamic Sitemap Generator
 * Run with: node scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://techpulse.dev';

const STATIC_ROUTES = [
  '',
  '/category/technology',
  '/category/ai',
  '/category/crypto',
  '/category/business',
  '/category/science',
  '/category/startups',
  '/category/cybersecurity',
  '/category/gadgets',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/editorial-policy',
];

// Sample slugs for sitemap generation
const SAMPLE_SLUGS = [
  'next-generation-frontier-models-autonomous-reasoning',
  'silicon-photonics-2nm-process-nodes-datacenter-hardware',
  'zero-knowledge-proofs-enterprise-finance-privacy',
  'commercial-nuclear-fusion-magnetic-confinement-plasma-record',
  'autonomous-ai-agents-enterprise-operations',
  'zero-day-mitigation-critical-infrastructure-memory-safe',
  'spatial-computing-micro-oled-displays-next-gen-headsets',
  'bootstrapped-hardware-renaissance-rapid-prototyping',
  'synthetic-biology-cell-reprogramming-ai-enzyme-folds',
  'high-frequency-trading-decentralized-mev-defense',
];

function generateSitemap() {
  const currentDate = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static Pages
  STATIC_ROUTES.forEach((route) => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${route}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${route === '' ? 'hourly' : 'daily'}</changefreq>\n`;
    xml += `    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n`;
    xml += `  </url>\n`;
  });

  // Dynamic Article Pages
  SAMPLE_SLUGS.forEach((slug) => {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/news/${slug}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;

  const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`✅ Sitemap successfully generated at: ${outputPath}`);
}

generateSitemap();
