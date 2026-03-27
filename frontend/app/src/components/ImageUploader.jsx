import { useCallback, useRef, useState } from 'react';
import { uploadToCloudinary, validateImage } from '../services/cloudinary';

const MAX_IMAGES = 5;

export default function ImageUploader({ value = [], onChange, minCount = 2 }) {
  const [uploading, setUploading] = useState({});
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const images = Array.isArray(value) ? value : value ? [value] : [];

  const handleFiles = useCallback(
    async (fileList) => {
      const files = Array.from(fileList);
      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) {
        setError(`Maximum ${MAX_IMAGES} images allowed.`);
        return;
      }

      const toUpload = files.slice(0, remaining);
      const errors = toUpload.map((f) => validateImage(f)).filter(Boolean);
      if (errors.length) {
        setError(errors[0]);
        return;
      }

      setError(null);

      for (const file of toUpload) {
        const tempId = `${Date.now()}-${Math.random()}`;
        setUploading((prev) => ({ ...prev, [tempId]: { preview: URL.createObjectURL(file), progress: 0 } }));

        try {
          const url = await uploadToCloudinary(file, (pct) => {
            setUploading((prev) => ({ ...prev, [tempId]: { ...prev[tempId], progress: pct } }));
          });
          onChange((prev) => [...prev, url]);
        } catch (err) {
          setError(err.message);
        } finally {
          setUploading((prev) => {
            const next = { ...prev };
            delete next[tempId];
            return next;
          });
        }
      }
    },
    [images.length, onChange],
  );

  const onFileChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  const removeImage = (idx) => {
    onChange((prev) => prev.filter((_, i) => i !== idx));
  };

  const onDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const onDragLeave = (e) => { e.preventDefault(); setDragActive(false); };
  const onDrop = (e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); };

  const uploadingEntries = Object.entries(uploading);
  const canAddMore = images.length + uploadingEntries.length < MAX_IMAGES;
  const hasImages = images.length > 0 || uploadingEntries.length > 0;

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={onFileChange}
        className="hidden"
      />

      {hasImages && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((url, idx) => (
            <div key={url} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square">
              <img src={url} alt={`Tree ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="px-2.5 py-1.5 bg-red-500 rounded-lg text-xs font-medium text-white shadow-sm hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}

          {uploadingEntries.map(([id, { preview, progress }]) => (
            <div key={id} className="relative rounded-xl overflow-hidden border border-gray-200 aspect-square">
              <img src={preview} alt="Uploading" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                <div className="w-3/4 h-1.5 bg-white/40 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-white text-xs font-semibold drop-shadow">{progress}%</span>
              </div>
            </div>
          ))}

          {canAddMore && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-[11px] text-gray-400 font-medium">Add more</span>
            </button>
          )}
        </div>
      )}

      {!hasImages && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-2 py-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <p className="text-sm text-gray-500 font-medium">
            Drop images here, or <span className="text-primary">browse</span>
          </p>
          <p className="text-xs text-gray-400">JPG, PNG or WebP &middot; Max 5 MB each &middot; Upload {minCount}–{MAX_IMAGES} images</p>
        </div>
      )}

      {images.length > 0 && images.length < minCount && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5">
          Please upload at least {minCount} images ({images.length}/{minCount})
        </p>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">{error}</p>
      )}
    </div>
  );
}
