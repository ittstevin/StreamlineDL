import React, { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import styles from '../styles/DownloadManager.module.css';

const DownloadManager = () => {
  const [url, setUrl] = useState('');
  const [downloads, setDownloads] = useState([]);
  const [nextDownloadId, setNextDownloadId] = useState(1);

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const startDownload = async () => {
    if (!url) return;

    const newDownload = {
      id: nextDownloadId,
      url,
      status: 'downloading',
      progress: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      controller: new AbortController(),
      fileName: '',
      error: null,
    };

    setDownloads([...downloads, newDownload]);
    setNextDownloadId(nextDownloadId + 1);

    try {
      const response = await fetch(url, {
        signal: newDownload.controller.signal,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const contentLength = response.headers.get('Content-Length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      const fileName = getFileNameFromResponse(response) || 'downloaded_file';

      updateDownload(newDownload.id, {
        totalBytes,
        fileName,
      });

      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        const downloadedBytes = chunks.reduce(
          (acc, chunk) => acc + chunk.length,
          0
        );

        updateDownload(newDownload.id, {
          downloadedBytes,
          progress: ((downloadedBytes / totalBytes) * 100).toFixed(2),
        });
      }

      const blob = new Blob(chunks);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();

      updateDownload(newDownload.id, { status: 'completed' });
    } catch (error) {
      if (error.name === 'AbortError') {
        updateDownload(newDownload.id, { status: 'paused' });
      } else {
        console.error('Download failed:', error);
        updateDownload(newDownload.id, {
          status: 'failed',
          error: error.message,
        });
      }
    }
  };

  const pauseDownload = (id) => {
    const download = downloads.find((d) => d.id === id);
    if (download && download.controller) {
      download.controller.abort();
    }
  };

  const resumeDownload = (id) => {
    // For now, just restart the download
    const download = downloads.find((d) => d.id === id);
    if (download) {
      startDownload(download.url);
    }
  };

  const cancelDownload = (id) => {
    setDownloads(downloads.filter((d) => d.id !== id));
  };

  const updateDownload = (id, updates) => {
    setDownloads(
      downloads.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const getFileNameFromResponse = (response) => {
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
        contentDisposition
      );
      if (matches != null && matches[1]) {
        return matches[1].replace(/['"]/g, '');
      }
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        value={url}
        onChange={handleUrlChange}
        placeholder="Enter file URL"
        className={styles.input}
      />
      <button className={styles.button} onClick={startDownload}>
        Start Download
      </button>

      <ul className={styles.downloadList}>
        {downloads.map((download) => (
          <li key={download.id} className={styles.downloadItem}>
            <span className={styles.fileName}>{download.fileName}</span>
            <ProgressBar progress={download.progress} />
            <div className={styles.downloadDetails}>
              {download.status === 'downloading' && (
                <p>
                  Downloaded: {download.downloadedBytes} /{' '}
                  {download.totalBytes} bytes
                </p>
              )}
              {download.status === 'failed' && (
                <p className={styles.error}>Error: {download.error}</p>
              )}
            </div>
            <div className={styles.actions}>
              {download.status === 'downloading' && (
                <button
                  className={styles.button}
                  onClick={() => pauseDownload(download.id)}
                >
                  Pause
                </button>
              )}
              {download.status === 'paused' && (
                <button
                  className={styles.button}
                  onClick={() => resumeDownload(download.id)}
                >
                  Resume
                </button>
              )}
              <button
                className={styles.button}
                onClick={() => cancelDownload(download.id)}
              >
                Cancel
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DownloadManager;