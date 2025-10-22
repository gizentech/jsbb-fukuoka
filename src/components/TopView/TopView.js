import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './TopView.module.css';

export default function TopView({ activeTab = 0, setActiveTab = () => {} }) {
  const [aisoImages, setAisoImages] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  const handleButtonClick = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  useEffect(() => {
    setIsMounted(true);

    // アイソメトリックイラストのランダム配置を生成（重ならないように）
    const availableImages = [1, 2, 3, 4, 7, 8, 9, 10, 11, 12];
    const numberOfImages = 10; // 配置する画像の数
    const images = [];
    const minDistance = 150; // 最小距離（ピクセル）

    // 重なりをチェックする関数
    const isTooClose = (newImg, existingImages) => {
      return existingImages.some(img => {
        const dx = newImg.leftPx - img.leftPx;
        const dy = newImg.topPx - img.topPx;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < minDistance;
      });
    };

    let attempts = 0;
    const maxAttempts = 100;

    while (images.length < numberOfImages && attempts < maxAttempts) {
      const randomIndex = availableImages[Math.floor(Math.random() * availableImages.length)];
      const size = Math.random() * 120 + 90; // 90-210px (1.5倍)
      const topPercent = Math.random() * 30 + 60; // 60-90%
      const leftPercent = Math.random() * 90 + 5; // 5-95%

      // パーセントをピクセルに変換（概算: 幅1920px, 高さ600pxと仮定）
      const leftPx = (leftPercent / 100) * 1920;
      const topPx = (topPercent / 100) * 600;

      const newImage = {
        id: images.length,
        src: `/images/aiso/aiso${randomIndex}.svg`,
        top: topPercent,
        left: leftPercent,
        leftPx,
        topPx,
        size,
        opacity: Math.random() * 0.3 + 0.2, // 0.2-0.5
      };

      if (!isTooClose(newImage, images)) {
        images.push(newImage);
      }

      attempts++;
    }

    setAisoImages(images);
  }, []);

  return (
    <section className={styles.topView}>
      <div className={styles.backgroundAnimation}>
        <div className={styles.animationLayer1}></div>
        <div className={styles.animationLayer2}></div>
        <div className={styles.animationLayer3}></div>

        {/* アイソメトリックイラストをランダムに配置 */}
        {isMounted && aisoImages.map((img) => (
          <div
            key={img.id}
            className={styles.aisoImage}
            style={{
              top: `${img.top}%`,
              left: `${img.left}%`,
              width: `${img.size}px`,
              height: `${img.size}px`,
              opacity: img.opacity,
            }}
          >
            <Image
              src={img.src}
              alt="アイソメトリックイラスト"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        ))}
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
