import React, { useState } from 'react';
import { uploadArticleImage } from '@/services/storage';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  currentUrl: string;
  onImageUploaded: (url: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ currentUrl, onImageUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const { url, error: uploadErr } = await uploadArticleImage(files[0]);
    setUploading(false);

    if (uploadErr) {
      setError(uploadErr);
    } else if (url) {
      onImageUploaded(url);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-dashed border-blue-500/60 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-xs font-semibold cursor-pointer hover:bg-blue-100/50 transition-colors">
          <UploadCloud className="w-4 h-4" />
          <span>{uploading ? 'Uploading...' : 'Upload Image from Computer'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <span className="text-[11px] text-neutral-400">or paste direct image URL below</span>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {currentUrl && (
        <div className="relative w-36 h-20 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
          <img src={currentUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
          <div className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </div>
  );
};
