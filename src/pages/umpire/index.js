import { useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import BlockSidebar from '../../components/BlockSidebar/BlockSidebar';
import Link from 'next/link';
import styles from '../../styles/Page.module.css';

export async function getServerSideProps() {
  try {
    const SPACE_UID = process.env.NEWT_SPACE_UID;
    const TOKEN = process.env.NEWT_API_TOKEN;
    const TOURNAMENT_APP_UID = 'fukuoka-tournament';

    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    const tournamentUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${TOURNAMENT_APP_UID}/fukuoka-tor?limit=100&order=-_sys.createdAt&depth=2`;
    let tournamentsData = [];

    try {
      const tournamentResponse = await fetch(tournamentUrl, { headers });

      if (tournamentResponse.ok) {
        const tournamentResult = await tournamentResponse.json();

        if (tournamentResult.items && tournamentResult.items.length > 0) {
          console.log('Raw items count:', tournamentResult.items.length);
          console.log('Sample item:', tournamentResult.items[0]);

          const allTournaments = tournamentResult.items.map(item => {
            const title = item['fukuoka-tor-name-ryaku'] || '大会';
            console.log('Tournament title:', title, 'ID:', item._id);
            return {
              id: item._id,
              title: title,
              startDate: item['tor-start'] || null,
              endDate: item['end-tor'] || null,
              date: item['tor-start'] || ''
            };
          });

          // 最新5件を取得
          tournamentsData = allTournaments
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
            .slice(0, 5);

          console.log('Final tournamentsData:', tournamentsData);
        } else {
          console.log('No tournament items found');
        }
      } else {
        console.log('Tournament response not OK:', tournamentResponse.status);
      }
    } catch (error) {
      console.error('Tournament API Error:', error);
    }

    return {
      props: {
        tournaments: tournamentsData
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        tournaments: []
      }
    };
  }
}

export default function Umpire({ tournaments = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const umpireMenuItems = [
    {
      href: '/umpire/request',
      title: '審判依頼について',
      description: '大会や試合の審判派遣依頼に関する情報',
      image: '/images/umpire-request.webp'
    },
    {
      href: '/umpire/interested',
      title: '審判にご興味がある方へ',
      description: '審判員資格取得や講習会に関する情報',
      image: '/images/umpire-interested.webp'
    },
    {
      href: '/umpire/greeting',
      title: '審判長ご挨拶',
      description: '審判部からのメッセージ',
      image: '/images/umpire-greeting.webp'
    },
    {
      href: '/umpire/members',
      title: '審判員のご紹介',
      description: '登録審判員の一覧',
      image: '/images/umpire-members.webp'
    }
  ];

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>審判員</h1>
            <span>UMPIRE</span>
          </div>

          <div className={styles.content}>
            <p style={{ margin: '0 0 32px', lineHeight: '1.8', color: '#666' }}>
              福岡県軟式野球連盟の審判員に関する情報です。下記のメニューから詳細をご確認ください。
            </p>

            <div className={styles.umpireGrid}>
              {umpireMenuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  style={{
                    display: 'block',
                    position: 'relative',
                    height: '200px',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* 背景画像 */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '110%',
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center bottom',
                    zIndex: 0
                  }} />

                  {/* 黒オーバーレイ */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: hoveredIndex === index ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1,
                    transition: 'background 0.3s ease'
                  }} />

                  {/* テキストコンテンツ */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    padding: '24px',
                    zIndex: 2
                  }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#fff',
                      margin: '0 0 8px 0',
                      textAlign: 'left'
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#fff',
                      lineHeight: '1.6',
                      margin: '0',
                      textAlign: 'left'
                    }}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <BlockSidebar tournaments={tournaments} showUmpireMenu={true} />
      </main>
      <Footer />
    </div>
  );
}
