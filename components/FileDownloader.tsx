'use client';

import { useState } from 'react';

interface FileDownloaderProps {
  files: any[];
  onFileSelect?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function FileDownloader({ files, onFileSelect }: FileDownloaderProps) {
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});
  const [downloading, setDownloading] = useState<{ [key: string]: boolean }>({});

  const handleDownload = async (filename: string) => {
    setDownloading({ ...downloading, [filename]: true });
    setDownloadProgress({ ...downloadProgress, [filename]: 0 });

    try {
      const response = await fetch(`${API_URL}/api/download/${filename}`);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          chunks.push(value);
          receivedLength += value.length;
          
          if (total > 0) {
            const progress = (receivedLength / total) * 100;
            setDownloadProgress({ ...downloadProgress, [filename]: progress });
          }
        }
      }

      // Combine chunks and create blob
      const allChunks = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      const blob = new Blob([allChunks]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadProgress({ ...downloadProgress, [filename]: 100 });
      setTimeout(() => {
        setDownloading({ ...downloading, [filename]: false });
        setDownloadProgress({ ...downloadProgress, [filename]: 0 });
      }, 1000);
    } catch (error) {
      console.error('Download error:', error);
      setDownloading({ ...downloading, [filename]: false });
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1rem', color: '#333' }}>File Downloader</h2>
      
      {files.length === 0 && (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          background: '#f8f9fa', 
          borderRadius: '8px' 
        }}>
          <p style={{ color: '#6c757d' }}>
            No files available for download. Add files to the /downloads directory.
          </p>
        </div>
      )}
    </div>
  );
}

