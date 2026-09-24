import { getAllPostsAdmin } from './posts';
import { slugify } from '@/lib/utils';
import { Post } from '@/types/article';

export interface IngestionPayload {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags?: string[];
  featured_image?: string;
  source_url?: string;
  source_name?: string;
  author_name?: string;
}

export interface IngestionValidationResult {
  isValid: boolean;
  errors: string[];
  isDuplicate: boolean;
  duplicateReason?: string;
  sanitizedPost?: Partial<Post>;
}

/**
 * Calculates simple Jaccard string similarity between two texts based on word shingles
 */
function calculateSimilarity(textA: string, textB: string): number {
  const wordsA = new Set(textA.toLowerCase().split(/\s+/));
  const wordsB = new Set(textB.toLowerCase().split(/\s+/));
  const intersection = new Set([...wordsA].filter((x) => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Automation-ready duplicate detection and quality validator.
 * Designed for n8n, AI Agent cron jobs, and external News API crawlers.
 */
export async function validateAndDeduplicate(payload: IngestionPayload): Promise<IngestionValidationResult> {
  const errors: string[] = [];

  if (!payload.title || payload.title.trim().length < 10) {
    errors.push('Article title must be at least 10 characters long.');
  }

  if (!payload.content || payload.content.trim().length < 100) {
    errors.push('Article content must be at least 100 characters long to maintain editorial depth.');
  }

  if (!payload.category) {
    errors.push('Article must specify a valid category.');
  }

  if (errors.length > 0) {
    return { isValid: false, errors, isDuplicate: false };
  }

  const generatedSlug = slugify(payload.title);
  const existingPosts = await getAllPostsAdmin();

  // 1. Exact slug or exact title match
  const exactMatch = existingPosts.find(
    (p) => p.slug === generatedSlug || p.title.trim().toLowerCase() === payload.title.trim().toLowerCase()
  );

  if (exactMatch) {
    return {
      isValid: false,
      errors: ['Duplicate article detected by title/slug.'],
      isDuplicate: true,
      duplicateReason: `Matches existing article: "${exactMatch.title}"`,
    };
  }

  // 2. Source URL check
  if (payload.source_url) {
    const urlMatch = existingPosts.find((p) => p.source_url && p.source_url === payload.source_url);
    if (urlMatch) {
      return {
        isValid: false,
        errors: ['Duplicate article detected by source URL.'],
        isDuplicate: true,
        duplicateReason: `Already ingested from source: ${payload.source_url}`,
      };
    }
  }

  // 3. Shingle text similarity check (> 75% similarity)
  for (const existing of existingPosts) {
    const similarity = calculateSimilarity(payload.title, existing.title);
    if (similarity > 0.75) {
      return {
        isValid: false,
        errors: ['High semantic similarity to an existing article.'],
        isDuplicate: true,
        duplicateReason: `High similarity (${Math.round(similarity * 100)}%) with "${existing.title}"`,
      };
    }
  }

  return {
    isValid: true,
    errors: [],
    isDuplicate: false,
    sanitizedPost: {
      title: payload.title.trim(),
      slug: generatedSlug,
      excerpt: payload.excerpt || payload.content.slice(0, 160).trim() + '...',
      content: payload.content.trim(),
      category: payload.category,
      tags: payload.tags || [payload.category],
      featured_image: payload.featured_image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
      source_url: payload.source_url,
      source_name: payload.source_name || 'Automated News Wire',
      author_name: payload.author_name || 'TechPulse AI Editor',
      status: 'published',
    },
  };
}
