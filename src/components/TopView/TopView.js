import React from 'react';
import styles from './TopView.module.css';

export default function TopView({ activeTab = 0, setActiveTab = () => {} }) {
  const handleButtonClick = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  return (
    <section className={styles.topView}>
      <div className={styles.backgroundAnimation}>
        <div className={styles.animationLayer1}></div>
        <div className={styles.animationLayer2}></div>
        <div className={styles.animationLayer3}></div>
      </div>

      <div className={styles.content}>
      </div>

      {/* SPでカードボタンを表示するエリア */}
      <div className={styles.buttonArea}>
        <button
          className={`${styles.viewButton} ${activeTab === 0 ? styles.active : ''}`}
          onClick={() => handleButtonClick(0)}
        >
          最近の大会
        </button>
        <button
          className={`${styles.viewButton} ${activeTab === 1 ? styles.active : ''}`}
          onClick={() => handleButtonClick(1)}
        >
          大会情報
        </button>
        <button
          className={`${styles.viewButton} ${activeTab === 2 ? styles.active : ''}`}
          onClick={() => handleButtonClick(2)}
        >
          カテゴリー
        </button>
      </div>
    </section>
  );
}
