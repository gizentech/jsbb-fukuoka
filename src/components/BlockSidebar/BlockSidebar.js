import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './BlockSidebar.module.css';

export default function BlockSidebar({ tournaments = [], showAboutMenu = false, showUmpireMenu = false, showAnnouncerMenu = false, showRegistrationMenu = false, showNewsMenu = false, showApplicationMenu = false, showNationalMenu = false, showFestivalMenu = false, showContactMenu = false }) {
  const router = useRouter();
  const currentPath = router.pathname;
  const [openBlocks, setOpenBlocks] = useState({
    aboutMenu: true,
    umpireMenu: true,
    announcerMenu: true,
    registrationMenu: true,
    newsMenu: true,
    applicationMenu: true,
    nationalMenu: true,
    festivalMenu: true,
    contactMenu: true,
    tournamentInfo: true
  });

  const recentTournaments = tournaments.slice(0, 5);

  console.log('BlockSidebar received tournaments:', tournaments.length);
  console.log('Recent tournaments:', recentTournaments);

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

  const aboutMenuItems = [
    { href: '/about', label: '連盟概要' },
    { href: '/history', label: '沿革' },
    { href: '/team-registration', label: '連盟登録チーム数' },
    { href: '/officers', label: '役員およびスタッフ' },
    { href: '/timeline', label: '連盟のあゆみ' },
    { href: '/privacy', label: 'プライバシーポリシー' },
    { href: '/terms', label: 'ホームページについて' }
  ];

  const umpireMenuItems = [
    { href: '/umpire/request', label: '審判依頼について' },
    { href: '/umpire/interested', label: '審判にご興味がある方へ' },
    { href: '/umpire/greeting', label: '審判長ご挨拶' },
    { href: '/umpire/members', label: '審判員のご紹介' }
  ];

  const announcerMenuItems = [
    { href: '/announcer', label: 'アナウンスについて' }
  ];

  const registrationMenuItems = [
    { href: '/registration', label: '選手登録申請' }
  ];

  const newsMenuItems = [
    { href: '/news', label: 'お知らせ一覧' }
  ];

  const applicationMenuItems = [
    { href: '/application', label: '大会申込書' }
  ];

  const nationalMenuItems = [
    { href: '/national', label: '全国大会での活躍' }
  ];

  const festivalMenuItems = [
    { href: '/festival', label: '野球感謝祭' }
  ];

  const contactMenuItems = [
    { href: '/contact', label: 'お問い合わせ' }
  ];

  const toggleBlock = (blockId) => {
    setOpenBlocks(prev => {
      const isCurrentlyOpen = prev[blockId];
      if (isCurrentlyOpen) {
        return {};
      } else {
        return { [blockId]: true };
      }
    });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarInner}>
        <div className={styles.scrollArea}>
          {/* 連盟概要メニュー */}
          {showAboutMenu && (
            <div className={styles.blockItem}>
              <button
                className={styles.header}
                onClick={() => toggleBlock('aboutMenu')}
              >
                <h3>連盟概要</h3>
              </button>
              {openBlocks.aboutMenu && (
                <ul className={styles.branchList}>
                  {aboutMenuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className={`${styles.branchLink} ${currentPath === item.href ? styles.active : ''}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 審判員メニュー */}
          {showUmpireMenu && (
            <div className={styles.blockItem}>
              <button
                className={styles.header}
                onClick={() => toggleBlock('umpireMenu')}
              >
                <h3>審判員</h3>
              </button>
              {openBlocks.umpireMenu && (
                <ul className={styles.branchList}>
                  {umpireMenuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className={`${styles.branchLink} ${currentPath === item.href ? styles.active : ''}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* アナウンスメニュー */}
          {showAnnouncerMenu && (
            <div className={styles.blockItem}>
              <button
                className={styles.header}
                onClick={() => toggleBlock('announcerMenu')}
              >
                <h3>アナウンス</h3>
              </button>
              {openBlocks.announcerMenu && (
                <ul className={styles.branchList}>
                  {announcerMenuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className={`${styles.branchLink} ${currentPath === item.href ? styles.active : ''}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 選手登録申請メニュー */}
          {showRegistrationMenu && (
            <div className={styles.blockItem}>
              <button
                className={styles.header}
                onClick={() => toggleBlock('registrationMenu')}
              >
                <h3>選手登録申請</h3>
              </button>
              {openBlocks.registrationMenu && (
                <ul className={styles.branchList}>
                  {registrationMenuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className={`${styles.branchLink} ${currentPath === item.href ? styles.active : ''}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* お知らせメニュー */}
          {showNewsMenu && (
            <div className={styles.blockItem}>
              <button
                className={styles.header}
                onClick={() => toggleBlock('newsMenu')}
              >
                <h3>お知らせ</h3>
              </button>
              {openBlocks.newsMenu && (
                <ul className={styles.branchList}>
                  {newsMenuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className={`${styles.branchLink} ${currentPath === item.href ? styles.active : ''}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 大会申込書メニュー */}
          {showApplicationMenu && (
            <div className={styles.blockItem}>
              <button
                className={styles.header}
                onClick={() => toggleBlock('applicationMenu')}
              >
                <h3>大会申込書</h3>
              </button>
              {openBlocks.applicationMenu && (
                <ul className={styles.branchList}>
                  {applicationMenuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className={`${styles.branchLink} ${currentPath === item.href ? styles.active : ''}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 全国大会での活躍メニュー */}
          {showNationalMenu && (
            <div className={styles.blockItem}>
              <button
                className={styles.header}
                onClick={() => toggleBlock('nationalMenu')}
              >
                <h3>全国大会での活躍</h3>
              </button>
              {openBlocks.nationalMenu && (
                <ul className={styles.branchList}>
                  {nationalMenuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className={`${styles.branchLink} ${currentPath === item.href ? styles.active : ''}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 野球感謝祭メニュー */}
          {showFestivalMenu && (
            <div className={styles.blockItem}>
              <button
                className={styles.header}
                onClick={() => toggleBlock('festivalMenu')}
              >
                <h3>野球感謝祭</h3>
              </button>
              {openBlocks.festivalMenu && (
                <ul className={styles.branchList}>
                  {festivalMenuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className={`${styles.branchLink} ${currentPath === item.href ? styles.active : ''}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* お問い合わせメニュー */}
          {showContactMenu && (
            <div className={styles.blockItem}>
              <button
                className={styles.header}
                onClick={() => toggleBlock('contactMenu')}
              >
                <h3>お問い合わせ</h3>
              </button>
              {openBlocks.contactMenu && (
                <ul className={styles.branchList}>
                  {contactMenuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className={`${styles.branchLink} ${currentPath === item.href ? styles.active : ''}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 大会情報 */}
          <div className={styles.blockItem}>
            <button
              className={styles.header}
              onClick={() => toggleBlock('tournamentInfo')}
            >
              <h3>大会情報</h3>
            </button>
            {openBlocks.tournamentInfo && (
              <ul className={styles.branchList}>
                {recentTournaments.length > 0 ? (
                  recentTournaments.map((tournament) => (
                    <li key={tournament.id} className={styles.branchLink}>
                      <div>{tournament.title}</div>
                    </li>
                  ))
                ) : (
                  <li className={styles.branchLink}>
                    <div className={styles.noData}>大会情報がありません</div>
                  </li>
                )}
              </ul>
            )}
          </div>

          {fukuokaBlocks.map((block) => (
            <div key={block.id} className={styles.blockItem}>
              <button
                className={styles.blockTitle}
                onClick={() => toggleBlock(block.id)}
              >
                {block.title}
              </button>
              {openBlocks[block.id] && (
                <ul className={styles.branchList}>
                  {block.branches.map((branch) => (
                    <li key={branch.id}>
                      <Link href={`/tournaments/area/${encodeURIComponent(branch.name.replace('支部', ''))}`} className={styles.branchLink}>
                        {branch.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
