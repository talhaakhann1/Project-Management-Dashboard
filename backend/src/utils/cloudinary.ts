import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const safeUnlink = async (localPath: string): Promise<void> => {
  try {
    await fs.unlink(localPath);
  } catch {
    // File already removed or never existed — ignore ENOENT and other errors
  }
};

export const uploadAtCloudinary = async (
  localPath: string,
): Promise<UploadApiResponse | null> => {
  if (!localPath) return null;
  try {
    const response = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto",
    });
    await safeUnlink(localPath);
    return response;
  } catch {
    await safeUnlink(localPath);
    return null;
  }
};

