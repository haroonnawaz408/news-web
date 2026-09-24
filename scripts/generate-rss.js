/**
 * TechPulse Dynamic RSS 2.0 Generator
 * Run with: node scripts/generate-rss.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://pulsenews.pk';

const ARTICLES = [
  {
    title: 'CDF Munir says armed forces remain resolute in defeating terrorism, ensuring lasting peace: ISPR',
    slug: 'cdf-munir-says-armed-forces-remain-resolute-defeating-terrorism',
    category: 'Pakistan',
    excerpt: 'Chief of Army Staff Field Marshal General Asim Munir reaffirmed the armed forces determination to eliminate militancy and ensure socio-economic stability across Pakistan.',
    date: new Date().toUTCString(),
  },
  {
    title: 'Pakistan Stock Exchange KSE-100 Benchmark Surges Following Bilateral Investment Frameworks',
    slug: 'pakistan-stock-exchange-kse100-surges-investment-frameworks',
    category: 'Pakistan',
    excerpt: 'The benchmark KSE-100 index gained over 950 points during early morning trading at the Pakistan Stock Exchange as institutional investors welcomed macroeconomic indicators.',
    date: new Date().toUTCString(),
  },
  {
    title: 'Next-Generation Frontier Models: How Autonomous Reasoning Transforms Software Engineering',
    slug: 'next-generation-frontier-models-autonomous-reasoning',
    category: 'AI',
    excerpt: 'A deep technical dive into how chain-of-thought inference scaling and agentic verification are shifting software development from code syntax writing to architecture orchestration.',
    date: 'Sun, 20 Sep 2026 10:00:00 GMT',
  },
  {
    title: 'Silicon Photonics & 2nm Process Nodes: The Hardware Race Powering Hyper-Scale Datacenters',
    slug: 'silicon-photonics-2nm-process-nodes-datacenter-hardware',
    category: 'Technology',
    excerpt: 'Semiconductor foundries push the physical limits of extreme ultraviolet lithography while optical interconnects replace copper wires to alleviate thermal bottlenecks.',
    date: 'Sun, 20 Sep 2026 06:00:00 GMT',
  },
  {
    title: 'Zero-Knowledge Proofs in Enterprise Finance: Privacy Meets Regulatory Compliance',
    slug: 'zero-knowledge-proofs-enterprise-finance-privacy',
    category: 'Crypto',
    excerpt: 'Cryptographic proofs of solvency and identity are enabling institutional capital to transact across public and private ledgers without leaking proprietary trade strategies.',
    date: 'Sun, 20 Sep 2026 00:00:00 GMT',
  },
  {
    title: 'Commercial Nuclear Fusion: Magnetic Confinement Sets New Plasma Stability Record',
    slug: 'commercial-nuclear-fusion-magnetic-confinement-plasma-record',
    category: 'Science',
    excerpt: 'High-temperature superconducting magnets maintain steady-state fusion conditions for over twenty minutes, accelerating the commercialization timeline for limitless clean baseload energy.',
    date: 'Sat, 19 Sep 2026 12:00:00 GMT',
  },
  {
    title: 'Autonomous AI Agents in Enterprise Operations: Moving Past the Pilot Phase',
    slug: 'autonomous-ai-agents-enterprise-operations',
    category: 'Business',
    excerpt: 'Enterprises are transitioning from exploratory conversational chatbots to orchestrated multi-agent workflows handling compliance, procurement, and logistics.',
    date: 'Sat, 19 Sep 2026 08:00:00 GMT',
  },
  {
    title: 'Zero-Day Mitigation in Critical Infrastructure: The Shift to Memory-Safe Systems',
    slug: 'zero-day-mitigation-critical-infrastructure-memory-safe',
    category: 'Cybersecurity',
    excerpt: 'National security directives and open-source foundations coordinate the migration of industrial SCADA and networking stacks to memory-safe languages like Rust.',
    date: 'Fri, 18 Sep 2026 16:00:00 GMT',
  },
  {
    title: 'Spatial Computing & Micro-OLED Displays: Dissecting the Optics of Next-Gen Headsets',
    slug: 'spatial-computing-micro-oled-displays-next-gen-headsets',
    category: 'Gadgets',
    excerpt: 'A rigorous teardown of pancake lens assemblies, foveated rendering pipelines, and eye-tracking sensors redefining mixed reality immersion.',
    date: 'Fri, 18 Sep 2026 10:00:00 GMT',
  },
  {
    title: 'The Bootstrapped Hardware Renaissance: How Rapid Prototyping Made Physical Startups Agile',
    slug: 'bootstrapped-hardware-renaissance-rapid-prototyping',
    category: 'Startups',
    excerpt: 'Low-cost SLA 3D printing, turnkey PCBA fabrication, and automated global supply chains allow three-person hardware startups to ship consumer electronics in months instead of years.',
    date: 'Thu, 17 Sep 2026 14:00:00 GMT',
  },
];

function generateRSS() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
  xml += `  <channel>\n`;
  xml += `    <title>PulseNews Pakistan — 24/7 Live Breaking News, Politics, Cricket &amp; Economy</title>\n`;
  xml += `    <link>${BASE_URL}</link>\n`;
  xml += `    <description>Pakistan premier digital news wire for national breaking headlines, politics, PSX economy, cricket, and global updates.</description>\n`;
  xml += `    <language>en-us</language>\n`;
  xml += `    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />\n`;
  xml += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;

  ARTICLES.forEach((item) => {
    xml += `    <item>\n`;
    xml += `      <title><![CDATA[${item.title}]]></title>\n`;
    xml += `      <link>${BASE_URL}/news/${item.slug}</link>\n`;
    xml += `      <guid isPermaLink="true">${BASE_URL}/news/${item.slug}</guid>\n`;
    xml += `      <pubDate>${item.date}</pubDate>\n`;
    xml += `      <description><![CDATA[${item.excerpt}]]></description>\n`;
    xml += `      <category>${item.category}</category>\n`;
    xml += `    </item>\n`;
  });

  xml += `  </channel>\n`;
  xml += `</rss>\n`;

  const outputPath = path.resolve(__dirname, '../public/rss.xml');
  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`✅ RSS feed generated at: ${outputPath}`);
}

generateRSS();
