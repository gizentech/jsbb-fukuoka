// Header.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from './Header.module.css'
import Link from 'next/link'

export default function Header() {
  const router = useRouter();
  const isHomePage = router.pathname === '/';
  const [isOpen, setIsOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [scrollLevel, setScrollLevel] = useState(0);

  // 福岡県8ブロック情報
  const fukuokaBlocks = [
    {
      id: 'kyochiku',
      title: '京築',
      branches: [
        { id: 'yukuhashi', name: '行橋支部' },
        { id: 'kanda', name: '苅田支部' },
        { id: 'buzen', name: '豊前支部' }
      ]
    },
    {
      id: 'kitakyushu',
      title: '北九州',
      branches: [
        { id: 'kitakyushu', name: '北九州支部' }
      ]
    },
    {
      id: 'chikuho',
      title: '筑豊',
      branches: [
        { id: 'chuen', name: '中遠支部' },
        { id: 'chokukuwa', name: '直鞍支部' },
        { id: 'kahan', name: '嘉飯支部' },
        { id: 'tagawa', name: '田川支部' }
      ]
    },
    {
      id: 'higashi-fukuoka',
      title: '東福岡',
      branches: [
        { id: 'koga', name: '古賀支部' },
        { id: 'kasuya', name: '糟屋支部' },
        { id: 'munakata', name: '宗像支部' }
      ]
    },
    {
      id: 'fukuoka',
      title: '福岡',
      branches: [
        { id: 'fukuoka', name: '福岡支部' },
        { id: 'chikushi', name: '筑紫支部' },
        { id: 'kasuga', name: '春日支部' },
        { id: 'onojo', name: '大野城支部' }
      ]
    },
    {
      id: 'kita-chikugo',
      title: '北筑後',
      branches: [
        { id: 'asakura', name: '朝倉支部' },
        { id: 'yame', name: '八女支部' },
        { id: 'ukiha', name: '浮羽支部' },
        { id: 'ogori', name: '小郡支部' }
      ]
    },
    {
      id: 'kurume',
      title: '久留米',
      branches: [
        { id: 'kurume', name: '久留米支部' }
      ]
    },
    {
      id: 'minami-chikugo',
      title: '南筑後',
      branches: [
        { id: 'yanagawa', name: '柳川支部' },
        { id: 'chikugo', name: '筑後支部' },
        { id: 'omuta', name: '大牟田支部' },
        { id: 'okawa-oki', name: '大川大木支部' }
      ]
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);

      // スクロール量に応じてレベルを設定
      if (position > 100) {
        setScrollLevel(2); // 両方隠す
      } else if (position > 50) {
        setScrollLevel(1); // 1段目を隠す
      } else {
        setScrollLevel(0); // すべて表示
      }
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

  const toggleSubmenu = (menuName) => {
    setOpenSubmenu(openSubmenu === menuName ? null : menuName);
  };

  return (
    <header className={`${styles.header} ${scrollLevel === 1 ? styles.scrolledLevel1 : ''} ${scrollLevel === 2 ? styles.scrolledLevel2 : ''}`}>
      {/* 1段目: 組織名 */}
      <div className={styles.topBar}>
        <div className={styles.logoWrapper}>
          <p className={styles.subtitle}>公益財団法人全日本軟式野球連盟 福岡県支部</p>
          <h1 className={styles.logo}>
            <Link href="/">一般社団法人福岡県軟式野球連盟</Link>
          </h1>
        </div>

        {/* 野球競技者登録システムボタン */}
        <div className={styles.registrationButtonWrapper}>
          <Link href="https://yakyu-net.jp/" className={styles.registrationButton}>
            野球競技者登録システム
          </Link>
        </div>

        {/* ハンバーガーボタン */}
        <button
          className={`${styles.hamburger} ${isOpen ? styles.active : ''}`}
          onClick={toggleMenu}
          aria-label="メニュー"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* 2段目: メニューバー */}
      <div className={styles.menuBar}>
        <div className={styles.menuInner}>

          {isOpen && <div className={styles.overlay} onClick={toggleMenu}></div>}

          <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
            {/* モバイルヘッダー */}
            <div className={styles.mobileHeader}>
              <p className={styles.mobileSubtitle}>公益財団法人全日本軟式野球連盟 福岡県支部</p>
              <h2 className={styles.mobileTitle}>一般社団法人福岡県軟式野球連盟</h2>
            </div>

            {/* 1行目: 主要メニュー */}
            <ul className={styles.mainMenu}>
              <li>
                <Link href="/tournaments">大会情報</Link>
              </li>
              <li>
                <Link href="/application">大会申込書</Link>
              </li>
              <li>
                <Link href="/umpire">審判員</Link>
              </li>
              <li>
                <Link href="/announcer">アナウンス</Link>
              </li>
              <li>
                <Link href="/news">お知らせ</Link>
              </li>
              <li>
                <Link href="/registration">選手登録申請</Link>
              </li>
              <li>
                <Link href="/about">連盟概要</Link>
              </li>
              <li>
                <Link href="/national">全国大会での活躍</Link>
              </li>
              <li>
                <Link href="/festival">野球感謝祭</Link>
              </li>
              <li>
                <Link href="/contact">お問い合わせ</Link>
              </li>
            </ul>

            {/* 2行目: ブロックメニュー（トップページのみ表示） */}
            {isHomePage && (
              <ul className={styles.blockMenu}>
                {fukuokaBlocks.map((block) => (
                  <li key={block.id} className={styles.hasSubmenu}>
                    <span>{block.title}</span>
                    <ul className={styles.submenu}>
                      {block.branches.map((branch) => (
                        <li key={branch.id}>
                          <Link href={`/tournaments/area/${encodeURIComponent(branch.name.replace('支部', ''))}`}>{branch.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}

          <div className={styles.mobileMenu}>
            <div className={styles.menuContent}>
              {/* 大会・活動情報 */}
              <div className={styles.menuCategory}>
                <h3 className={styles.categoryTitle}>大会・活動情報</h3>
                <ul className={styles.categoryList}>
                  <li><Link href="/tournaments" onClick={handleLinkClick}>大会情報</Link></li>
                  <li><Link href="/national" onClick={handleLinkClick}>全国大会での活躍</Link></li>
                </ul>
              </div>

              {/* 審判・アナウンス */}
              <div className={styles.menuCategory}>
                <h3 className={styles.categoryTitle}>審判・アナウンス</h3>
                <ul className={styles.categoryList}>
                  <li><Link href="/umpire" onClick={handleLinkClick}>審判員</Link></li>
                  <li><Link href="/announcer" onClick={handleLinkClick}>アナウンス</Link></li>
                </ul>
              </div>

              {/* 申請・登録 */}
              <div className={styles.menuCategory}>
                <h3 className={styles.categoryTitle}>申請・登録</h3>
                <ul className={styles.categoryList}>
                  <li><Link href="/application" onClick={handleLinkClick}>大会申込書</Link></li>
                  <li><Link href="/registration" onClick={handleLinkClick}>選手登録申請</Link></li>
                </ul>
              </div>

              {/* お知らせ・連盟情報 */}
              <div className={styles.menuCategory}>
                <h3 className={styles.categoryTitle}>お知らせ・連盟情報</h3>
                <ul className={styles.categoryList}>
                  <li><Link href="/news" onClick={handleLinkClick}>お知らせ</Link></li>
                  <li><Link href="/about" onClick={handleLinkClick}>連盟概要</Link></li>
                  <li><Link href="/contact" onClick={handleLinkClick}>お問い合わせ</Link></li>
                </ul>
              </div>

              {/* ブロック一覧ボタン */}
              <div className={styles.blockButtonSection}>
                <h3 className={styles.categoryTitle}>ブロック一覧</h3>
                <div className={styles.blockButtonGrid}>
                  {fukuokaBlocks.map((block) => (
                    <div key={block.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{
                        padding: '8px',
                        background: '#333',
                        color: '#fff',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        fontWeight: '600'
                      }}>
                        {block.title}
                      </div>
                      {block.branches.map((branch) => (
                        <Link
                          key={branch.id}
                          href={`/tournaments/area/${encodeURIComponent(branch.name.replace('支部', ''))}`}
                          onClick={handleLinkClick}
                          className={styles.blockButton}
                          style={{ fontSize: '0.8rem', padding: '8px' }}
                        >
                          {branch.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* 野球競技者登録システム */}
              <div className={styles.registrationSection}>
                <Link href="/registration-system" onClick={handleLinkClick} className={styles.registrationLink}>
                  野球競技者登録システム
                </Link>
              </div>
            </div>
          </div>
        </nav>
        </div>
      </div>
    </header>
  );
}