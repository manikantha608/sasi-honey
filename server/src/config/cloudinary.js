import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file buffer or local path to the sasi-honey folder.
 * @param {string} filePathOrBuffer  Path or base64 data URI
 * @param {string} folder  Cloudinary sub-folder (e.g. 'products')
 * @returns {Promise<object>} Cloudinary upload result
 */
export const uploadImage = (filePathOrBuffer, folder = 'products') =>
  cloudinary.uploader.upload(filePathOrBuffer, {
    folder: `sasi-honey/${folder}`,
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });

/**
 * Delete an image by its public_id.
 */
export const deleteImage = (publicId) =>
  cloudinary.uploader.destroy(publicId);

export default cloudinary;
