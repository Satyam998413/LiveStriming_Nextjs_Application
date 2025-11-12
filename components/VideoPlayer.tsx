'use client';

import { useState, useRef, useEffect } from 'react';

interface VideoPlayerProps {
  videos: any[];
  selectedVideo: string | null;
  onVideoSelect?: (filename: string | null) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3020';

export default function VideoPlayer({ videos, selectedVideo: externalSelectedVideo, onVideoSelect }: VideoPlayerProps) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(externalSelectedVideo);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync with external selectedVideo prop and reset player state
  useEffect(() => {
    setSelectedVideo(externalSelectedVideo);
    if (externalSelectedVideo) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [externalSelectedVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
    };
  }, [selectedVideo]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
  };

  const handlePlaybackRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newRate = parseFloat(e.target.value);
    video.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const videoUrl = selectedVideo ? `${API_URL}/api/stream/${selectedVideo}` : null;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1rem', color: '#333' }}>Video Player</h2>
      
      {!selectedVideo && videos.length > 0 && (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
            Select a video from the list below to start playing
          </p>
        </div>
      )}

      {selectedVideo && (
        <div style={{ marginBottom: '2rem' }}>
          <video
            ref={videoRef}
            src={videoUrl || undefined}
            style={{
              width: '100%',
              maxHeight: '600px',
              borderRadius: '8px',
              backgroundColor: '#000',
            }}
            controls={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#f8f9fa', 
            borderRadius: '8px' 
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                style={{ width: '100%' }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.9rem',
                color: '#6c757d',
                marginTop: '0.25rem'
              }}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <button className="btn" onClick={handlePlayPause}>
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🔊</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  style={{ width: '100px' }}
                />
                <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                  {Math.round(volume * 100)}%
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label htmlFor="playback-rate" style={{ fontSize: '0.9rem' }}>Speed:</label>
                <select
                  id="playback-rate"
                  value={playbackRate}
                  onChange={handlePlaybackRateChange}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
              </div>

              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setSelectedVideo(null);
                  setIsPlaying(false);
                  setCurrentTime(0);
                  if (onVideoSelect) {
                    onVideoSelect(null);
                  }
                }}
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}

      {videos.length === 0 && (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          background: '#f8f9fa', 
          borderRadius: '8px' 
        }}>
          <p style={{ color: '#6c757d' }}>
            No videos available. Add videos to the /videos directory to get started.
          </p>
        </div>
      )}
    </div>
  );
}

