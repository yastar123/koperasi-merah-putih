import { v2 as cloudinary } from "cloudinary";

function initCloudinary() {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary tidak dikonfigurasi. Set CLOUDINARY_URL atau CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
}

initCloudinary();

export async function uploadImageBuffer(
  buffer: Buffer,
  options: { folder?: string; filename?: string } = {},
): Promise<{ url: string; publicId: string }> {
  const folder = options.folder ?? "koperasi-merah-putih";

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        public_id: options.filename,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload ke Cloudinary gagal"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );

    upload.end(buffer);
  });
}
