import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function uploadArticleImage(file: File): Promise<{ url: string; error: string | null }> {
  if (!file) {
    return { url: '', error: 'No file provided' };
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return { url: '', error: 'Image size must be under 5MB.' };
  }

  if (!file.type.startsWith('image/')) {
    return { url: '', error: 'Only image files (JPG, PNG, WebP) are allowed.' };
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `articles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('article-media').getPublicUrl(filePath);
      return { url: data.publicUrl, error: null };
    } catch (err: any) {
      console.warn('Supabase storage upload failed, using local reader fallback:', err);
    }
  }

  // Local fallback: convert to base64 Data URL for instant development preview
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ url: reader.result as string, error: null });
    };
    reader.onerror = () => {
      resolve({ url: '', error: 'Failed to read image file locally.' });
    };
    reader.readAsDataURL(file);
  });
}
