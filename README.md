# 🎬 Live Streaming & File Downloader Application

A full-stack application built with Next.js and Node.js for live video streaming, online video playback, and large file downloads with chunked download support.

## ✨ Features

- **📺 Video Streaming**: Stream videos with HTTP range request support for efficient playback
- **🎮 Video Player**: Custom video player with controls (play/pause, volume, playback speed, seek)
- **🎥 Camera Recorder**: Capture videos directly from your device camera and upload them to the server
- **📥 File Downloader**: Download large files with progress tracking and chunked downloads
- **🔄 Real-time Updates**: Refresh and view available videos and files
- **💅 Modern UI**: Beautiful, responsive user interface with gradient design

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create necessary directories** (they will be created automatically, but you can create them manually):
   ```bash
   mkdir -p videos downloads uploads
   ```

4. **Add your media files**:
   - Place video files (`.mp4`, `.webm`, `.ogg`, `.mov`, `.avi`, `.mkv`) in the `videos/` directory
   - Place files for download in the `downloads/` directory

### Running the Application

#### Option 1: Run Both Servers Separately

**Terminal 1 - Next.js Frontend:**
```bash
npm run dev
```
This will start the Next.js frontend on `http://192.168.2.115:3021` (update the port in `package.json` if you prefer a different one)

**Terminal 2 - Node.js Backend:**
```bash
npm run server
```
This will start the Express backend server on `http://192.168.2.115:3001`

#### Option 2: Run Both Servers Together (Recommended)

```bash
npm run dev:all
```

This will start both the frontend and backend servers concurrently.

### Environment Variables

Create a `.env.local` file in the root directory (optional):

```env
NEXT_PUBLIC_API_URL=http://192.168.2.115:3001
PORT=3001
```

## 📁 Project Structure

```
LiveStriming_Nextjs_Application/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── CameraRecorder.tsx # Device camera recording & upload
│   ├── VideoPlayer.tsx    # Video player component
│   ├── VideoList.tsx      # Video list component
│   ├── FileDownloader.tsx # File downloader component
│   └── FileList.tsx       # File list component
├── server/                # Node.js backend
│   ├── index.js          # Express server
│   └── handlers/         # Request handlers
│       ├── videoStream.js # Video streaming handler
│       └── fileDownload.js # File download handler
├── videos/                # Video files directory (auto-created)
├── downloads/             # Downloadable files directory (auto-created)
├── uploads/               # Upload directory (auto-created)
├── package.json
├── tsconfig.json
└── next.config.js
```

## 🎯 Usage

### Video Streaming

1. Add video files to the `videos/` directory
2. Open the application in your browser
3. Click on the "📺 Video Player" tab
4. Select a video from the list to start playing
5. Use the player controls to:
   - Play/Pause
   - Adjust volume
   - Change playback speed (0.5x to 2x)
   - Seek through the video

### File Downloads

1. Add files to the `downloads/` directory
2. Click on the "📥 File Downloader" tab
3. View available files with their sizes
4. Click "⬇️ Download" to download files
5. Monitor download progress in real-time

## 🔧 API Endpoints

### Backend API (Port 3001)

- `GET /api/health` - Health check
- `GET /api/videos` - List all available videos
- `GET /api/stream/:filename` - Stream video with range support
- `GET /api/files` - List all available files
- `GET /api/download/:filename` - Download file with chunked support
- `POST /api/upload` - Upload recorded videos from the camera recorder

## 🛠️ Technologies Used

- **Frontend**:
  - Next.js 14
  - React 18
  - TypeScript
  - CSS3

- **Backend**:
  - Node.js
  - Express.js
  - fs-extra
  - mime-types

## 📝 Features in Detail

### Video Streaming
- HTTP Range Request support for efficient video streaming
- Supports seeking without downloading the entire file
- Compatible with HTML5 video players
- Supports multiple video formats

### Camera Recording & Uploads
- Access device camera directly from the browser
- Record video and review immediately
- Upload recordings to the backend where they become available in the live videos tab
- Automatically refresh the video list after uploads

### File Downloads
- Chunked download support for large files
- Progress tracking
- Resume capability (via range requests)
- Proper MIME type handling

## 🐛 Troubleshooting

### Videos not showing up?
- Make sure video files are in the `videos/` directory
- Check that the backend server is running on port 3001
- Verify file extensions are supported (`.mp4`, `.webm`, `.ogg`, `.mov`, `.avi`, `.mkv`)

### Download not working?
- Ensure files are in the `downloads/` directory
- Check browser console for errors
- Verify backend server is running

### CORS errors?
- Make sure both servers are running
- Check that `NEXT_PUBLIC_API_URL` matches your backend URL

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## 📧 Support

For issues and questions, please open an issue on the repository.

---

**Happy Streaming! 🎉**
