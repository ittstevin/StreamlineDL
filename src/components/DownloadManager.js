import React, { useState } from 'react';
import ProgressBar from './ProgressBar';
import styles from '../styles/DownloadManager.module.css';

const DownloadManager = () => {
  const [url, setUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startDownload = () => {
    setIsDownloading(true);
    // Simulate download logic here
    // Update progress periodically
  };

  const pauseDownload = () => {
    setIsDownloading(false);
    // Logic to pause download
  };

  const resumeDownload = () => {
    setIsDownloading(true);
    // Logic to resume download
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
      <button className={styles.button} onClick={startDownload}>
        {isDownloading ? 'Pause' : 'Start Download'}
      </button>
      <ProgressBar progress={progress} />
    </div>
  );
};

export default DownloadManager;
