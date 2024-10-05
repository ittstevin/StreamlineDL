import React, { useState } from 'react';
import ProgressBar from './ProgressBar';
import styles from '../styles/DownloadManager.module.css';

const DownloadManager = () => {
  const [url, setUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [controller, setController] = useState(null); // For aborting the fetch
  const [fileName, setFileName] = useState('');

  const startDownload = async () => {
    if (!url) return;

    setIsDownloading(true);
    setProgress(0);
    setDownloadedBytes(0);
    setTotalBytes(0);

    const newController = new AbortController();
    setController(newController);

    try {
      const response = await fetch(url, { signal: newController.signal });

      // Check for response validity
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const contentLength = response.headers.get('Content-Length');
      setTotalBytes(contentLength ? parseInt(contentLength, 10) : 0);

      const reader = response.body.getReader();
      const chunks = [];

      while (isDownloading) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        const bytesDownloaded = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        setDownloadedBytes(bytesDownloaded);

        // Calculate and update progress
        setProgress(((bytesDownloaded / totalBytes) * 100).toFixed(2));
      }

      // Create a Blob from the chunks and download the file
      const blob = new Blob(chunks);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName || 'downloaded_file';
      link.click();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Download canceled or paused');
      } else {
        console.error('Download failed:', error);
      }
    } finally {
      setIsDownloading(false);
      setController(null);
    }
  };

  const pauseDownload = () => {
    if (controller) {
      controller.abort(); // Abort the fetch request
      setIsDownloading(false);
    }
  };

  const resumeDownload = () => {
    // Implement resume logic (if needed)
    // Restarting the download for simplicity
    startDownload();
  };

  const cancelDownload = () => {
    if (controller) {
      controller.abort(); // Abort the fetch request
    }
    setIsDownloading(false);
    setProgress(0);
    setDownloadedBytes(0);
    setTotalBytes(0);
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter file URL"
        className={styles.input}
      />
      <button className={styles.button} onClick={isDownloading ? pauseDownload : startDownload}>
        {isDownloading ? 'Pause' : 'Start Download'}
      </button>
      <button className={styles.button} onClick={cancelDownload} disabled={!isDownloading}>
        Cancel
      </button>
      <ProgressBar progress={progress} />
      <div>
        {totalBytes > 0 && (
          <p>
            Downloaded: {downloadedBytes} / {totalBytes} bytes
          </p>
        )}
      </div>
    </div>
  );
};

export default DownloadManager;
