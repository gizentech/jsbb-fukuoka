// Header.js
import { useState, useEffect } from 'react'
import styles from './Header.module.css'
import Link from 'next/link'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = 'auto';
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = !isOpen ? 'hidden' : 'auto';
  };

  const handleLinkClick = (e) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
      document.body.style.overflow = 'auto';
    }
  };

  return (
    <header className={`${styles.header} ${scrollPosition > 0 ? styles.scrolled : ''}`}>
      <div className={styles.headerInner}>
        <h1 className={styles.logo}>
          <Link href="/">久留米市野球連盟</Link>
        </h1>
        
        <button 
          className={`${styles.hamburger} ${isOpen ? styles.active : ''}`}
          onClick={toggleMenu}
          aria-label="メニュー"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
          {isOpen && <div className={styles.sideText}>KURUME</div>}
          <ul>
            <li>
              <Link href="/news" onClick={handleLinkClick}>お知らせ</Link>
            </li>
            <li>
              <Link href="/application" onClick={handleLinkClick}>大会申込書</Link>
            </li>
            <li>
              <Link href="/forms" onClick={handleLinkClick}>選手登録申請</Link>
            </li>
            <li>
              <Link href="/about" onClick={handleLinkClick}>連盟概要</Link>
            </li>
            <li>
              <Link href="/about/chronology" onClick={handleLinkClick}>沿革</Link>
            </li>
            <li>
              <Link href="/about/history" onClick={handleLinkClick}>連盟のあゆみ</Link>
            </li>
            <li>
              <Link href="/contact" onClick={handleLinkClick}>お問い合わせ</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}