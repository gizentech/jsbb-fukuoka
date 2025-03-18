// components/HeroSlider/HeroSlider.js
import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import styles from './HeroSlider.module.css';

const slides = [
  { id: 1, image: '/images/top1.webp', alt: 'トップ画像1' },
  { id: 2, image: '/images/top2.webp', alt: 'トップ画像2' },
  { id: 3, image: '/images/top3.webp', alt: 'トップ画像3' }
];

const titles = [
  { line1: '野球の感動と興奮を、', line2: 'すべての人々へ。' },
  { line1: '次世代を担う、', line2: '若き才能の育成。' },
  { line1: '地域と共に、', line2: '野球の未来を創る。' }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [nextSlide, setNextSlide] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef(null);

  const handleSlideChange = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setNextSlide((currentSlide + 1) % slides.length);
      
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 2000);
    }
  }, [currentSlide, isTransitioning]);

  const parallaxEffect = useCallback((e) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const moveX = (clientX - centerX) / 50;
    const moveY = (clientY - centerY) / 50;

    document.querySelectorAll(`.${styles.imageWrapper}`).forEach(slide => {
      slide.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(handleSlideChange, 6000);
    window.addEventListener('mousemove', parallaxEffect);

    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', parallaxEffect);
    };
  }, [handleSlideChange, parallaxEffect]);

  return (
    <div className={styles.hero} ref={sliderRef}>
      <div className={styles.overlay}></div>
      <div className={styles.slideContainer}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.slide} 
              ${index === currentSlide ? styles.current : ''} 
              ${index === nextSlide && isTransitioning ? styles.next : ''}
            `}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                sizes="100vw"
                priority={index === 0}
                quality={90}
                className={styles.slideImage}
              />
            </div>
            <div className={styles.gradientOverlay}></div>
          </div>
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.titleContainer}>
          {titles.map((title, index) => (
            <div 
              key={index} 
              className={`${styles.titleBlock} ${index === currentSlide ? styles.active : ''}`}
            >
              <div className={styles.titleTextWrapper}>
                <span className={styles.titleLine}>{title.line1}</span>
                <span className={styles.titleLine}>{title.line2}</span>
              </div>
              <div className={styles.textEffects}>
                <div className={styles.glowLine}></div>
                <div className={styles.slidingBar}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.indicators}>
        {slides.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${
              index === currentSlide ? styles.active : ''
            }`}
            aria-label={`スライド ${index + 1}に切り替え`}
          >
            <div className={styles.indicatorInner}></div>
            <div className={styles.indicatorGlow}></div>
          </button>
        ))}
      </div>
    </div>
  );
}