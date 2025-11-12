'use client';

import { useEffect, useRef, useState } from 'react';

interface CameraRecorderProps {
  onUploadComplete?: (filename?: string) => void;
}

type StatusType = 'success' | 'error' | 'info';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.2.115:3001';

type PermissionState =
  | 'unknown'
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'unsupported'
  | 'insecure';

export default function CameraRecorder({ onUploadComplete }: CameraRecorderProps) {
  const previewRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<{ type: StatusType; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState>('unknown');

  useEffect(() => {
    evaluatePermission();
    return () => {
      stopStream();
    };
  }, []);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
    if (previewRef.current) {
      previewRef.current.srcObject = null;
    }
  };

  const evaluatePermission = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!window.isSecureContext) {
      setPermissionState('insecure');
      setStatus({
        type: 'error',
        message:
          'Camera access requires HTTPS. Please open this app using https:// or via localhost.',
      });
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionState('unsupported');
      setStatus({
        type: 'error',
        message:
          'Camera access is not supported in this browser. Please try a modern browser like Chrome, Edge, or Safari.',
      });
      return;
    }

    try {
      if ('permissions' in navigator && (navigator.permissions as any)?.query) {
        const result = await (navigator.permissions as any).query({ name: 'camera' as PermissionName });
        setPermissionState(result.state as PermissionState);
        return;
      }
      setPermissionState('prompt');
    } catch (error) {
      console.warn('Permission query not supported:', error);
      setPermissionState('prompt');
    }
  };

  const requestPermission = async () => {
    if (permissionState === 'insecure') {
      setStatus({
        type: 'error',
        message:
          'Camera permissions cannot be granted because this page is not served over HTTPS. Please reload the app using https://.',
      });
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus({
        type: 'error',
        message: 'Camera access is not supported in this browser.',
      });
      setPermissionState('unsupported');
      return;
    }

    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      tempStream.getTracks().forEach((track) => track.stop());
      setPermissionState('granted');
      setStatus({
        type: 'success',
        message: 'Camera permission granted. Click "Enable Camera" to start the preview.',
      });
    } catch (error) {
      console.error('Permission error:', error);
      setPermissionState('denied');
      setStatus({
        type: 'error',
        message:
          'Camera permission was denied. Please allow access in your browser settings and try again.',
      });
    }
  };

  const requestCameraAccess = async () => {
    try {
      if (permissionState === 'insecure') {
        setStatus({
          type: 'error',
          message: 'Camera access requires HTTPS. Please reload the app using https://.',
        });
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus({ type: 'error', message: 'Camera access is not supported in this browser.' });
        setPermissionState('unsupported');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        previewRef.current.play().catch(() => {
          /* Ignore autoplay errors */
        });
      }
      setCameraReady(true);
      setStatus({ type: 'info', message: 'Camera ready. Click "Start Recording" to begin.' });
      setPermissionState('granted');
    } catch (error) {
      console.error('Camera access error:', error);
      setStatus({ type: 'error', message: 'Unable to access camera. Please allow camera permissions.' });
      setPermissionState('denied');
    }
  };

  const startRecording = async () => {
    if (!cameraReady || !streamRef.current) {
      await requestCameraAccess();
    }

    if (!streamRef.current) {
      setStatus({ type: 'error', message: 'Camera stream is not available.' });
      return;
    }

    try {
      chunksRef.current = [];
      const options: MediaRecorderOptions = {};
      const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
      const supportedMimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type));
      if (supportedMimeType) {
        options.mimeType = supportedMimeType;
      }

      const recorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const type = options.mimeType || 'video/webm';
        const blob = new Blob(chunksRef.current, { type });
        setRecordedBlob(blob);

        if (playbackRef.current) {
          const url = URL.createObjectURL(blob);
          playbackRef.current.src = url;
          playbackRef.current.load();
        }

        stopStream();
        setStatus({ type: 'info', message: 'Recording complete. Preview your video below.' });
      };

      recorder.start();
      setRecording(true);
      setRecordedBlob(null);
      setStatus({ type: 'info', message: 'Recording... Click "Stop Recording" to finish.' });
    } catch (error) {
      console.error('Recording error:', error);
      setStatus({ type: 'error', message: 'Failed to start recording. Please try again.' });
    }
  };

  const stopRecording = () => {
    if (permissionState === 'insecure') {
      setStatus({
        type: 'error',
        message: 'Camera access requires HTTPS. Please reload the app using https://.',
      });
      return;
    }

    if (!mediaRecorderRef.current) {
      return;
    }

    if (mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const uploadRecording = async () => {
    if (!recordedBlob) {
      setStatus({ type: 'error', message: 'Please record a video before uploading.' });
      return;
    }

    try {
      setIsUploading(true);
      setStatus({ type: 'info', message: 'Uploading video...' });

      const formData = new FormData();
      const extension = recordedBlob.type.includes('mp4') ? '.mp4' : '.webm';
      const safeName = fileName.trim().replace(/[^\w\-]+/g, '_');
      const uploadName = safeName ? `${safeName}${extension}` : `recording-${Date.now()}${extension}`;

      formData.append('video', recordedBlob, uploadName);
      if (safeName) {
        formData.append('title', safeName);
      }

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setStatus({ type: 'success', message: 'Video uploaded successfully!' });
      setRecordedBlob(null);
      setFileName('');

      if (onUploadComplete) {
        onUploadComplete(result?.video?.filename);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setStatus({ type: 'error', message: 'Failed to upload video. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setStatus(null);
    setFileName('');
    if (playbackRef.current) {
      playbackRef.current.pause();
      playbackRef.current.removeAttribute('src');
      playbackRef.current.load();
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1rem', color: '#333' }}>Camera Recorder</h2>

      {status && (
        <div className={status.type === 'error' ? 'error' : status.type === 'success' ? 'success' : 'info'} style={{ marginBottom: '1rem' }}>
          {status.message}
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.5rem', color: '#555' }}>Camera Preview</h3>
          <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
            <video
              ref={previewRef}
              style={{ width: '100%', maxHeight: '400px' }}
              playsInline
              muted
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button className="btn" onClick={requestPermission} disabled={permissionState === 'granted'}>
            {permissionState === 'granted' ? 'Permission Granted' : '🔐 Ask Camera Permission'}
          </button>

          <button className="btn" onClick={requestCameraAccess} disabled={recording || cameraReady}>
            {cameraReady ? 'Camera Ready' : '🎥 Enable Camera'}
          </button>

          <button className="btn btn-success" onClick={startRecording} disabled={recording}>
            ⏺️ Start Recording
          </button>

          <button className="btn btn-danger" onClick={stopRecording} disabled={!recording}>
            ⏹️ Stop Recording
          </button>

          <button className="btn btn-secondary" onClick={resetRecording} disabled={recording && !recordedBlob}>
            🔁 Reset
          </button>
        </div>

        <div>
          <h3 style={{ marginBottom: '0.5rem', color: '#555' }}>Recorded Video</h3>
          {recordedBlob ? (
            <div>
              <video ref={playbackRef} controls style={{ width: '100%', borderRadius: '8px' }} />

              <div style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
                <input
                  className="input"
                  placeholder="Optional file name (without extension)"
                  value={fileName}
                  onChange={(event) => setFileName(event.target.value)}
                  disabled={isUploading}
                />

                <button className="btn btn-success" onClick={uploadRecording} disabled={isUploading}>
                  {isUploading ? 'Uploading...' : '⬆️ Upload Video'}
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '1.5rem',
                textAlign: 'center',
                background: '#f8f9fa',
                borderRadius: '8px',
                color: '#6c757d',
              }}
            >
              Record a video to preview and upload it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

