import React from 'react';
import styles from '../styles/ProgressBar.module.css';

const ProgressBar = ({ progress }) => {
  return (
    <div className={styles.progressBar}>
      <div
        className={styles.progress}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
