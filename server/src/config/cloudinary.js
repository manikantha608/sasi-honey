import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

// ─── Upload presets ───────────────────────────────────────────────────────────

const PRESETS = {
  products: {
    folder:       'sasi-honey/products',
    // Resize to max 1000×1000, crop to fill, auto quality & format
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
  },
  categories: {
    folder:       'sasi-honey/categories',
    transformation: [
      { width: 600, height: 600, crop: 'limit' },
      { quality: 'auto:good', fetch_format: 'auto' },
    ],
  },
};

/**
 * Upload a file buffer or base64 data URI to Cloudinary.
 *
 * @param {string} source  base64 data URI  — e.g. "data:image/jpeg;base64,..."
 * @param {'products'|'categories'} folder  Upload preset to use
 * @returns {Promise<{ secure_url: string, public_id: string, width: number, height: number }>}
 */
export const uploadImage = (source, folder = 'products') => {
  const preset = PRESETS[folder] || PRESETS.products;
  return cloudinary.uploader.upload(source, {
    folder:         preset.folder,
    resource_type:  'image',
    transformation: preset.transformation,
  });
};

/**
 * Delete an image from Cloudinary by its public_id.
 * Fails silently if the image no longer exists.
 */
export const deleteImage = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn(`Cloudinary delete failed for "${publicId}":`, err.message);
    return null;
  }
};

/**
 * Quick connectivity test — verify credentials work.
 * Run: node -e "import('./src/config/cloudinary.js').then(m => m.testCloudinary())"
 */
export const testCloudinary = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅  Cloudinary connected:', result.status);
    return true;
  } catch (err) {
    console.error('❌  Cloudinary error:', err.message);
    return false;
  }
};

export default cloudinary;
