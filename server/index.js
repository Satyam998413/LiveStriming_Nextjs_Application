const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const videoStreamHandler = require('./handlers/videoStream');
const fileDownloadHandler = require('./handlers/fileDownload');

const app = express();
const PORT = process.env.PORT || 3020;

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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Videos directory: ${videosDir}`);
  console.log(`📁 Downloads directory: ${downloadsDir}`);
});

