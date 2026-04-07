const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const IMAGE_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const VIDEO_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_VIDEO_DURATION = 60; // seconds

export function validateImage(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPG, PNG, and WebP images are allowed.';
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return 'Image must be smaller than 5 MB.';
  }
  return null;
}

export function validateVideo(file) {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return 'Only MP4 and WebM videos are allowed.';
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return 'Video must be smaller than 50 MB.';
  }
  return null;
}

export function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(Math.round(video.duration));
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Could not read video metadata'));
    };
    video.src = URL.createObjectURL(file);
  });
}

function _upload(url, file, onProgress) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return Promise.reject(
      new Error('Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.'),
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xhr.open('POST', url);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve(data);
      } else {
        let msg = 'Upload failed';
        try {
          msg = JSON.parse(xhr.responseText)?.error?.message || msg;
        } catch { /* use default */ }
        reject(new Error(msg));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

    xhr.send(formData);
  });
}

export async function uploadToCloudinary(file, onProgress) {
  const error = validateImage(file);
  if (error) throw new Error(error);

  const data = await _upload(IMAGE_UPLOAD_URL, file, onProgress);
  return data.secure_url;
}

export async function uploadVideoToCloudinary(file, onProgress) {
  const error = validateVideo(file);
  if (error) throw new Error(error);

  const duration = await getVideoDuration(file);
  if (duration > MAX_VIDEO_DURATION) {
    throw new Error(`Video must be ${MAX_VIDEO_DURATION} seconds or less (yours is ${duration}s).`);
  }

  const data = await _upload(VIDEO_UPLOAD_URL, file, onProgress);
  return { url: data.secure_url, duration };
}
