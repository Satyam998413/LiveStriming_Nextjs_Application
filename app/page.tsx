'use client';

import { useEffect, useState } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import FileDownloader from '@/components/FileDownloader';
import VideoList from '@/components/VideoList';
import FileList from '@/components/FileList';
import CameraRecorder from '@/components/CameraRecorder';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.2.115:3001';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'live' | 'camera' | 'downloader'>('live');
  const [videos, setVideos] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
    fetchFiles();
  }, []);

  const fetchVideos = async (selectAfterFetch?: string | null) => {
    setVideosLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/videos`);
      const data = await response.json();
      setVideos(data.videos || []);
      if (selectAfterFetch) {
        setSelectedVideo(selectAfterFetch);
      } else if (data.videos?.length && !selectedVideo) {
        setSelectedVideo(data.videos[0].filename);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setVideosLoading(false);
    }
  };

  const fetchFiles = async () => {
    setFilesLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/files`);
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setFilesLoading(false);
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
            className={`btn ${activeTab === 'live' ? '' : 'btn-secondary'}`}
            onClick={() => setActiveTab('live')}
          >
            📺 Live Videos
          </button>
          <button
            className={`btn ${activeTab === 'camera' ? '' : 'btn-secondary'}`}
            onClick={() => setActiveTab('camera')}
          >
            🎥 Camera Recorder
          </button>
          <button
            className={`btn ${activeTab === 'downloader' ? '' : 'btn-secondary'}`}
            onClick={() => setActiveTab('downloader')}
          >
            📥 File Downloader
          </button>
        </div>

        {activeTab === 'live' && (
          <div>
            <VideoPlayer 
              videos={videos} 
              selectedVideo={selectedVideo}
              onVideoSelect={setSelectedVideo}
            />
            <VideoList 
              videos={videos} 
              loading={videosLoading} 
              onRefresh={fetchVideos}
              onVideoSelect={setSelectedVideo}
            />
          </div>
        )}

        {activeTab === 'camera' && (
          <CameraRecorder
            onUploadComplete={(filename) => {
              fetchVideos(filename || undefined);
              setActiveTab('live');
            }}
          />
        )}

        {activeTab === 'downloader' && (
          <div>
            <FileDownloader files={files} onFileSelect={fetchFiles} />
            <FileList files={files} loading={filesLoading} onRefresh={fetchFiles} />
          </div>
        )}
      </div>
    </div>
  );
}

