const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const multer = require('multer');
const videoStreamHandler = require('./handlers/videoStream');
const fileDownloadHandler = require('./handlers/fileDownload');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create necessary directories
const uploadsDir = path.join(__dirname, '../uploads');
const videosDir = path.join(__dirname, '../videos');
const downloadsDir = path.join(__dirname, '../downloads');

[uploadsDir, videosDir, downloadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, videosDir);
  },
  filename: (_req, file, cb) => {
    const originalExt = path.extname(file.originalname) || '.webm';
    const baseName = path.basename(file.originalname, originalExt).replace(/\s+/g, '-');
    const timestamp = Date.now();
    cb(null, `${baseName || 'recording'}-${timestamp}${originalExt}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB
  },
});

// Serve static files
app.use('/uploads', express.static(uploadsDir));
app.use('/videos', express.static(videosDir));
app.use('/downloads', express.static(downloadsDir));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Video streaming endpoint
app.get('/api/stream/:filename', videoStreamHandler);

// File download endpoint
app.get('/api/download/:filename', fileDownloadHandler);

// Upload recorded videos
app.post('/api/upload', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file received' });
    }

    const { filename, originalname, mimetype, size, path: filepath } = req.file;

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: {
        filename,
        originalName: originalname,
        mimetype,
        size,
        path: filepath,
        url: `/api/stream/${filename}`,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// List available videos
app.get('/api/videos', async (req, res) => {
  try {
    const files = await fs.readdir(videosDir);
    const videoFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'].includes(ext);
    });
    
    const videoList = await Promise.all(
      videoFiles.map(async (file) => {
        const filePath = path.join(videosDir, file);
        const stats = await fs.stat(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          url: `/api/stream/${file}`,
        };
      })
    );
    
    res.json({ videos: videoList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List available files for download
app.get('/api/files', async (req, res) => {
  try {
    const files = await fs.readdir(downloadsDir);
    
    const fileList = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(downloadsDir, file);
        const stats = await fs.stat(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          url: `/api/download/${file}`,
        };
      })
    );
    
    res.json({ files: fileList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://192.168.2.115:${PORT}`);
  console.log(`📁 Videos directory: ${videosDir}`);
  console.log(`📁 Downloads directory: ${downloadsDir}`);
});

