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
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, []);

  const toggleMenu = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (newIsOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  };

  const handleLinkClick = (e) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
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

        {isOpen && <div className={styles.overlay} onClick={toggleMenu}></div>}

        <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
          <ul className={styles.pcMenu}>
            <li>
              <Link href="/news">お知らせ</Link>
            </li>
            <li>
              <Link href="/application">大会申込書</Link>
            </li>
            <li>
              <Link href="/forms">選手登録申請</Link>
            </li>
            <li>
              <Link href="/about">連盟概要</Link>
            </li>
            <li>
              <Link href="/about/chronology">沿革</Link>
            </li>
            <li>
              <Link href="/about/history">連盟のあゆみ</Link>
            </li>
            <li>
              <Link href="/contact">お問い合わせ</Link>
            </li>
          </ul>

          <div className={styles.mobileMenu}>
            <div className={styles.menuContent}>
              <div className={styles.menuSection}>
                <h3 className={styles.menuTitle}>大会情報</h3>
                <ul>
                  <li>
                    <Link href="/tournaments/class/es-class" onClick={handleLinkClick}>学童</Link>
                  </li>
                  <li>
                    <Link href="/tournaments/class/jhs-class" onClick={handleLinkClick}>少年</Link>
                  </li>
                  <li>
                    <Link href="/tournaments/class/a-class" onClick={handleLinkClick}>A級</Link>
                  </li>
                  <li>
                    <Link href="/tournaments/class/b-class" onClick={handleLinkClick}>B級</Link>
                  </li>
                  <li>
                    <Link href="/tournaments/class/c-class" onClick={handleLinkClick}>C級</Link>
                  </li>
                </ul>
              </div>

              <div className={styles.menuSection}>
                <h3 className={styles.menuTitle}>お知らせ・申請</h3>
                <ul>
                  <li>
                    <Link href="/news" onClick={handleLinkClick}>お知らせ</Link>
                  </li>
                  <li>
                    <Link href="/application" onClick={handleLinkClick}>大会申込書</Link>
                  </li>
                  <li>
                    <Link href="/forms" onClick={handleLinkClick}>申請様式</Link>
                  </li>
                </ul>
              </div>

              <div className={styles.menuSection}>
                <h3 className={styles.menuTitle}>連盟について</h3>
                <ul>
                  <li>
                    <Link href="/about" onClick={handleLinkClick}>連盟概要</Link>
                  </li>
                  <li>
                    <Link href="/about/chronology" onClick={handleLinkClick}>沿革</Link>
                  </li>
                  <li>
                    <Link href="/contact" onClick={handleLinkClick}>お問い合わせ</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}