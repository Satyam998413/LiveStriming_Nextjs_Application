import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Live Streaming & Video Player',
  description: 'Stream videos and download large files',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

