import { useState, useRef } from 'react';
import { postOrderUpdate } from '../services/api';
import {
  uploadToCloudinary,
  uploadVideoToCloudinary,
  validateImage,
  validateVideo,
} from '../services/cloudinary';

export default function PostUpdateModal({ orderId, weekNumber, treeName, onClose, onPosted }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);

    const isVideo = f.type.startsWith('video/');
    const isImage = f.type.startsWith('image/');

    if (isImage) {
      const err = validateImage(f);
      if (err) { setError(err); return; }
      setMediaType('image');
    } else if (isVideo) {
      const err = validateVideo(f);
      if (err) { setError(err); return; }
      setMediaType('video');
    } else {
      setError('Please select an image (JPG, PNG, WebP) or video (MP4, WebM).');
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file) { setError('Please select a file'); return; }
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      let mediaUrl;
      let durationSeconds = null;

      if (mediaType === 'video') {
        const result = await uploadVideoToCloudinary(file, setProgress);
        mediaUrl = result.url;
        durationSeconds = result.duration;
      } else {
        mediaUrl = await uploadToCloudinary(file, setProgress);
      }

      await postOrderUpdate(orderId, {
        media_url: mediaUrl,
        media_type: mediaType,
        caption: caption.trim() || null,
        duration_seconds: durationSeconds,
      });

      onPosted?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Post Weekly Update</h2>
            <p className="text-sm text-gray-500">
              Week {weekNumber} &middot; {treeName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* File picker */}
          {!preview ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-green-400 hover:bg-green-50/50 transition-colors"
            >
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-gray-500">Click to upload a photo or video</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5 MB &middot; MP4, WebM up to 50 MB (max 1 min)</p>
            </button>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-gray-100">
              {mediaType === 'video' ? (
                <video src={preview} controls className="w-full max-h-64 object-contain" />
              ) : (
                <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
              )}
              <button
                onClick={() => { setFile(null); setPreview(null); setMediaType(null); }}
                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Caption */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption (optional)"
            rows={3}
            maxLength={500}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 resize-none"
          />

          {/* Progress */}
          {uploading && (
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? `Uploading ${progress}%...` : 'Post Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
