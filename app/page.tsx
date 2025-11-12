'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import FileDownloader from '@/components/FileDownloader';
import VideoList from '@/components/VideoList';
import FileList from '@/components/FileList';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'player' | 'downloader'>('player');
  const [videos, setVideos] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
    fetchFiles();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/videos`);
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/files`);
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center', color: '#333' }}>
          🎬 Live Streaming & File Downloader
        </h1>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <button
            className={`btn ${activeTab === 'player' ? '' : 'btn-secondary'}`}
            onClick={() => setActiveTab('player')}
          >
            📺 Video Player
          </button>
          <button
            className={`btn ${activeTab === 'downloader' ? '' : 'btn-secondary'}`}
            onClick={() => setActiveTab('downloader')}
          >
            📥 File Downloader
          </button>
        </div>

        {activeTab === 'player' && (
          <div>
            <VideoPlayer 
              videos={videos} 
              selectedVideo={selectedVideo}
              onVideoSelect={setSelectedVideo}
            />
            <VideoList 
              videos={videos} 
              loading={loading} 
              onRefresh={fetchVideos}
              onVideoSelect={setSelectedVideo}
            />
          </div>
        )}

        {activeTab === 'downloader' && (
          <div>
            <FileDownloader files={files} onFileSelect={fetchFiles} />
            <FileList files={files} loading={loading} onRefresh={fetchFiles} />
          </div>
        )}
      </div>
    </div>
  );
}

