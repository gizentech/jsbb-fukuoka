import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './RotatingBanners.module.css';

export default function RotatingBanners() {
  const [currentIndex, setCurrentIndex] = useState(0); // 0から開始
  const [isTransitioning, setIsTransitioning] = useState(true);
  const timeoutRef = useRef(null);

  const banners = [
    { id: 1, title: 'お礼の言葉', link: '/thanks', image: '/images/banners/banner01.webp' },
    { id: 2, title: 'バナー 2', image: '/images/banners/banner02.webp' },
    { id: 3, title: 'バナー 3', image: '/images/banners/banner03.webp' },
    { id: 4, title: 'バナー 4', image: '/images/banners/banner04.webp' },
    { id: 5, title: 'バナー 5', image: '/images/banners/banner05.webp' },
    { id: 6, title: 'バナー 6', image: '/images/banners/banner06.webp' }
  ];

  // SP用: 無限ループ用に3回繰り返す
  const extendedBanners = [
    ...banners,
    ...banners,
    ...banners
  ];

  // 自動スライド（無限ループ対応）
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }, 2000); // 2秒ごとに切り替え

    return () => clearInterval(timer);
  }, []);

  // 無限ループの実装: インデックスが6に到達したらリセット
  useEffect(() => {
    if (currentIndex >= banners.length) {
      // トランジション完了を待ってからリセット
      const transitionDuration = 500; // CSSのtransition durationと同じ
      timeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, transitionDuration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, banners.length]);

  // トランジションをリセット後に再開
  useEffect(() => {
    if (currentIndex === 0 && !isTransitioning) {
      // 次のフレームでトランジションを再開
      requestAnimationFrame(() => {
        setIsTransitioning(true);
      });
    }
  }, [currentIndex, isTransitioning]);

  // インジケーター用の実際のインデックス（0-5）を計算
  const getActualIndex = () => {
    return currentIndex % banners.length;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>TOPICS</h2>

      {/* PC表示: 3列×2行のグリッド表示 */}
      <div className={styles.pcCarousel}>
        <div className={styles.pcCarouselTrack}>
          {banners.map((banner) => (
            <div key={`pc-${banner.id}`} className={styles.pcCarouselItem}>
              {banner.link ? (
                <Link href={banner.link} className={styles.bannerContent}>
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className={styles.bannerImage}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </Link>
              ) : (
                <div className={styles.bannerContent}>
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className={styles.bannerImage}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SP表示: カルーセル表示（1つずつ、無限ループ対応） */}
      <div className={styles.spCarousel}>
        <div
          className={styles.carouselTrack}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none'
          }}
        >
          {extendedBanners.map((banner, index) => (
            <div key={`sp-${banner.id}-${index}`} className={styles.carouselItem}>
              {banner.link ? (
                <Link href={banner.link} className={styles.bannerContent}>
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className={styles.bannerImage}
                    sizes="100vw"
                  />
                </Link>
              ) : (
                <div className={styles.bannerContent}>
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className={styles.bannerImage}
                    sizes="100vw"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* インジケーター */}
        <div className={styles.indicators}>
          {banners.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${index === getActualIndex() ? styles.active : ''}`}
              onClick={() => {
                setIsTransitioning(true);
                setCurrentIndex(index);
              }}
              aria-label={`スライド ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
