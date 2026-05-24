'use client';

import { useRef, useState } from 'react';
import axios from 'axios';
import { api } from '../../lib/api-axios';

type Props = {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export default function ProductImageField({ value, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be 5 MB or smaller.');
      return;
    }

    setUploadError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post<{ url: string }>(
        '/uploads/product-image',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      onChange(data.url);
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? Array.isArray(err.response.data.message)
            ? err.response.data.message.join(', ')
            : String(err.response.data.message)
          : 'Upload failed. Try again or paste an image URL.';
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  }

  const previewSrc = value.trim() || null;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-arctic-deep">Product image</label>

      {previewSrc && (
        <div className="relative w-full max-w-xs aspect-square rounded-xl overflow-hidden border border-white/15 bg-femme-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewSrc} alt="Product preview" className="w-full h-full object-cover" />
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => onChange('')}
            className="absolute top-2 right-2 px-2 py-1 text-xs rounded-lg bg-black/70 text-white hover:bg-black/90 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={disabled || uploading}
          onChange={onFileSelected}
        />
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2.5 rounded-xl border border-femme-champagne/50 text-arctic-deep text-sm font-semibold hover:bg-femme-champagne/10 disabled:opacity-50 flex items-center gap-2"
        >
          {uploading ? (
            <>
              <span className="w-4 h-4 border-2 border-femme-champagne border-t-transparent rounded-full animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Upload from gallery
            </>
          )}
        </button>
      </div>

      <div>
        <p className="text-xs text-arctic-light mb-1.5">Or paste an image URL</p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || uploading}
          placeholder="https://images.unsplash.com/... or /api/uploads/..."
          className="w-full auth-input"
        />
      </div>

      {uploadError && (
        <p className="text-sm text-rose-400" role="alert">
          {uploadError}
        </p>
      )}
    </div>
  );
}
