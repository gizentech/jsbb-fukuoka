// src/components/AdminLayout/AdminLayout.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSession, clearSession } from '../../lib/auth';
import Link from 'next/link';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const menuItems = [
    { href: '/admin/dashboard', label: 'ダッシュボード' },
    { href: '/admin/application', label: '大会申込書管理' },
    { href: '/admin/tournament-entry', label: '申込書登録' },
    { href: '/admin/news', label: 'お知らせ管理' },
    { href: '/admin/tournaments', label: '大会情報' },
    { href: '/admin/files', label: 'ファイル管理' },
    { href: '/admin/master/organization', label: '組織マスタ' },
    { href: '/admin/master/tournament', label: '大会マスタ' }
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // セッションチェック
    const session = getSession();
    if (!session && router.pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setLoading(false);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      clearSession();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleMenuItemClick = () => {
    if (isMobile) {
      setMenuOpen(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>
          <span className={styles.loadingDot}></span>
          <span className={styles.loadingDot}></span>
          <span className={styles.loadingDot}></span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <button 
        className={`${styles.menuToggle} ${menuOpen ? styles.open : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="メニュー"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`${styles.sidebar} ${menuOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2>管理画面</h2>
          {isMobile && (
            <button 
              className={styles.closeMenu}
              onClick={() => setMenuOpen(false)}
              aria-label="メニューを閉じる"
            >
              ×
            </button>
          )}
        </div>

        <ul className={styles.menu}>
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={router.pathname === item.href ? styles.active : ''}
                onClick={handleMenuItemClick}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <button onClick={handleLogout} className={styles.logoutButton}>
          ログアウト
        </button>
      </nav>

      <main className={`${styles.main} ${menuOpen ? styles.shifted : ''}`}>
        <div className={styles.mainContent}>
          {children}
        </div>
      </main>
    </div>
  );
}