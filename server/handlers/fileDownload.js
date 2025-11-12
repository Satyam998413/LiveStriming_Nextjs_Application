const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');

const fileDownloadHandler = async (req, res) => {
  try {
    const filename = req.params.filename;
    const downloadsDir = path.join(__dirname, '../../downloads');
    const filePath = path.join(downloadsDir, filename);

    // Check if file exists
    if (!(await fs.pathExists(filePath))) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stat = await fs.stat(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Get MIME type
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    if (range) {
      // Parse Range header for chunked download
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      
      // Use createReadStream for better performance with range requests
      const stream = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      };

      res.writeHead(206, head);
      stream.pipe(res);
    } else {
      // Send entire file with download headers
      const head = {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Accept-Ranges': 'bytes',
      };

      res.writeHead(200, head);
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = fileDownloadHandler;

