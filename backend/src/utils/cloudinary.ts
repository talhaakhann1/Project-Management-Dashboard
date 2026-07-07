import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadAtCloudinary = async (
  localPath: string,
): Promise<UploadApiResponse|null> => {
  try {
    if (!localPath) return null;
    const response = await cloudinary.uploader.upload(localPath, {
      resource_type: "image",
    });
    fs.unlink(localPath);
    return response;
  } catch (error:unknown) {
    fs.unlink(localPath);
    return null;
  }
};
