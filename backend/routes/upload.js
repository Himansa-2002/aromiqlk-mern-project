import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

// Files are held in memory only long enough to stream them to Cloudinary —
// nothing is saved to this server's local disk, so any teammate's browser
// can load the resulting URL, not just yours.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

const router = express.Router();

// POST /api/upload/admin — accepts one file under the field name "image",
// uploads it to Cloudinary, and returns the public URL to store on a
// Product/Banner/Brand/Category record.
router.post('/admin', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const stream = cloudinary.uploader.upload_stream(
    { folder: 'aromiq' },
    (error, result) => {
      if (error) return res.status(500).json({ error: error.message });
      res.json({ url: result.secure_url });
    }
  );
  stream.end(req.file.buffer);
});

export default router;