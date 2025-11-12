'use client';

interface VideoListProps {
  videos: any[];
  loading: boolean;
  onRefresh: () => void;
  onVideoSelect?: (filename: string) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.2.115:3001';

export default function VideoList({ videos, loading, onRefresh, onVideoSelect }: VideoListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="loading">
        <p>Loading videos...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ color: '#333' }}>Available Videos</h2>
        <button className="btn btn-secondary" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>

      {videos.length === 0 ? (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          background: '#f8f9fa', 
          borderRadius: '8px' 
        }}>
          <p style={{ color: '#6c757d' }}>
            No videos found. Add video files to the /videos directory.
          </p>
        </div>
      ) : (
        <ul className="file-list">
          {videos.map((video, index) => (
            <li key={index} className="file-item">
              <div className="file-info">
                <div className="file-name">🎬 {video.filename}</div>
                <div className="file-size">
                  {formatFileSize(video.size)} • Added: {formatDate(video.created)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {onVideoSelect && (
                  <button
                    className="btn"
                    onClick={() => onVideoSelect(video.filename)}
                    style={{ marginLeft: '1rem' }}
                  >
                    ▶️ Play
                  </button>
                )}
                <a
                  href={`${API_URL}${video.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success"
                >
                  Open in New Tab
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

