import { Router } from "express";
import multer from "multer";
import { uploadImageBuffer } from "../lib/cloudinary";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Hanya file gambar yang diperbolehkan"));
  },
});

// POST /upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "File gambar wajib diunggah" });
      return;
    }

    const folder = typeof req.body.folder === "string" ? req.body.folder : "koperasi-merah-putih";
    const result = await uploadImageBuffer(req.file.buffer, {
      folder,
      filename: req.file.originalname.replace(/\.[^.]+$/, ""),
    });

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload gagal";
    res.status(500).json({ error: message });
  }
});

export default router;
