export type CategoryName = 
  | 'Pakistan'
  | 'World'
  | 'Politics'
  | 'Business'
  | 'Technology' 
  | 'AI' 
  | 'Sports'
  | 'Science' 
  | 'Health'
  | 'Entertainment'
  | 'Crypto' 
  | 'Startups' 
  | 'Cybersecurity' 
  | 'Gadgets';

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: CategoryName | string;
  tags: string[];
  featured_image: string;
  status: 'published' | 'draft';
  views: number;
  meta_title?: string | null;
  meta_description?: string | null;
  source_url?: string | null;
  source_name?: string | null;
  author_id?: string | null;
  author_name: string;
  scheduled_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

export interface CategoryInfo {
  name: CategoryName;
  slug: string;
  description: string;
  color: string;
}

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}
