'use client';

import { useState } from 'react';

interface FileListProps {
  files: any[];
  loading: boolean;
  onRefresh: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3020';

export default function FileList({ files, loading, onRefresh }: FileListProps) {
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});
  const [downloading, setDownloading] = useState<{ [key: string]: boolean }>({});

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const handleDownload = async (filename: string) => {
    setDownloading({ ...downloading, [filename]: true });
    setDownloadProgress({ ...downloadProgress, [filename]: 0 });

    try {
      const response = await fetch(`${API_URL}/api/download/${filename}`, {
        headers: {
          Range: 'bytes=0-',
        },
      });
      
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
        const newProgress = { ...downloadProgress };
        delete newProgress[filename];
        setDownloadProgress(newProgress);
      }, 1000);
    } catch (error) {
      console.error('Download error:', error);
      setDownloading({ ...downloading, [filename]: false });
      alert('Download failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <p>Loading files...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ color: '#333' }}>Available Files</h2>
        <button className="btn btn-secondary" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>

      {files.length === 0 ? (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          background: '#f8f9fa', 
          borderRadius: '8px' 
        }}>
          <p style={{ color: '#6c757d' }}>
            No files found. Add files to the /downloads directory.
          </p>
        </div>
      ) : (
        <ul className="file-list">
          {files.map((file, index) => (
            <li key={index} className="file-item">
              <div className="file-info">
                <div className="file-name">📄 {file.filename}</div>
                <div className="file-size">
                  {formatFileSize(file.size)} • Added: {formatDate(file.created)}
                </div>
                {downloading[file.filename] && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      background: '#e0e0e0', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${downloadProgress[file.filename] || 0}%`, 
                        height: '100%', 
                        background: '#667eea',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: '#6c757d', 
                      marginTop: '0.25rem' 
                    }}>
                      {Math.round(downloadProgress[file.filename] || 0)}% downloaded
                    </div>
                  </div>
                )}
              </div>
              <button
                className="btn btn-success"
                onClick={() => handleDownload(file.filename)}
                disabled={downloading[file.filename]}
                style={{ marginLeft: '1rem', opacity: downloading[file.filename] ? 0.6 : 1 }}
              >
                {downloading[file.filename] ? '⏳ Downloading...' : '⬇️ Download'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

