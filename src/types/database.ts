export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          category: string;
          tags: string[];
          featured_image: string | null;
          status: 'published' | 'draft';
          views: number;
          meta_title: string | null;
          meta_description: string | null;
          source_url: string | null;
          source_name: string | null;
          author_id: string | null;
          author_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          content: string;
          category: string;
          tags?: string[];
          featured_image?: string | null;
          status?: 'published' | 'draft';
          views?: number;
          meta_title?: string | null;
          meta_description?: string | null;
          source_url?: string | null;
          source_name?: string | null;
          author_id?: string | null;
          author_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string;
          category?: string;
          tags?: string[];
          featured_image?: string | null;
          status?: 'published' | 'draft';
          views?: number;
          meta_title?: string | null;
          meta_description?: string | null;
          source_url?: string | null;
          source_name?: string | null;
          author_id?: string | null;
          author_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
      };
      post_views: {
        Row: {
          id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          created_at?: string;
        };
      };
      authors: {
        Row: {
          id: string;
          name: string;
          role: string | null;
          bio: string | null;
          avatar: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role?: string | null;
          bio?: string | null;
          avatar?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string | null;
          bio?: string | null;
          avatar?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      increment_post_views: {
        Args: { target_post_id: string };
        Returns: void;
      };
    };
  };
}
