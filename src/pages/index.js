// pages/index.js
import React from 'react'
import styles from '../styles/Home.module.css'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import Link from 'next/link'
import Analytics from '@vercel/analytics/react';

// getServerSidePropsは既存のものをそのまま維持
export async function getServerSideProps() {
  try {
    // 環境変数からNewt CMS API設定を取得
    const SPACE_UID = process.env.NEWT_SPACE_UID;
    const TOKEN = process.env.NEWT_API_TOKEN;
    const TOURNAMENT_APP_UID = 'fukuoka-tournament'; // 福岡県大会情報用
    const INFO_APP_UID = 'fukuoka-info'; // 福岡県お知らせ用

    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    // Newt CMSからニュース取得（福岡県お知らせ用App）
    const newtNewsUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${INFO_APP_UID}/info?limit=5&order=-_sys.createdAt`;
    let newsData = [];

    try {
      const newsResponse = await fetch(newtNewsUrl, { headers });
      
      if (newsResponse.ok) {
        const newsResult = await newsResponse.json();

        if (newsResult.items && newsResult.items.length > 0) {
          newsData = newsResult.items.map(item => ({
            id: item._id,
            type: 'news',
            title: item['info-tital'] || item.title || '',
            createdAt: item._sys?.createdAt || new Date().toISOString(),
            body: item['info-body'] || '',
            file: item.file || null,
            important: item.important || false,
            class: item.class || []
          }));
        }
      } else {
        console.error(`News API Error: ${newsResponse.status}`);
      }
    } catch (newsError) {
      console.error('Error processing news:', newsError);
    }

    // 大会情報を取得（福岡県大会情報用App）
    const tournamentUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${TOURNAMENT_APP_UID}/fukuoka-tor?limit=6&order=-_sys.createdAt`;

    let tournaments = [];

    try {
      const tournamentResponse = await fetch(tournamentUrl, { headers });

      if (tournamentResponse.ok) {
        const tournamentData = await tournamentResponse.json();

        if (tournamentData.items && tournamentData.items.length > 0) {
          tournaments = tournamentData.items.map(item => {
            const frameInfo = item['fukuoka-frame'] || {};
            return {
              id: item._id,
              type: 'tournament',
              title: frameInfo['fukuoka-title1'] || '大会',
              createdAt: item['tor-start'] || item._sys?.createdAt || new Date().toISOString(),
              tournamentFile: item['fuku-tournament'] || null,
              startDate: item['tor-start'] || null,
              endDate: item['end-tor'] || null,
              winTeam: item['win-team-fukuoka'] || '',
              area: item.area || [],
              torNo: item['tor-no'] || 0
            };
          });
        }
      } else {
        console.error(`Tournament API Error: ${tournamentResponse.status}`);
      }
    } catch (tourError) {
      console.error('Error processing tournaments:', tourError);
    }
    
    // ニュースと大会情報を統合して日付でソート
    const combinedItems = [...newsData, ...tournaments].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    // 最新の5件のみ取得
    const latestItems = combinedItems.slice(0, 5);

    return {
      props: {
        news: newsData,
        tournaments: tournaments,
        latestItems: latestItems,
        error: null
      }
    };

  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        news: [],
        tournaments: [],
        latestItems: [],
        error: 'データの読み込みに失敗しました: ' + error.message
      }
    };
  }
}

export default function Home({ news = [], tournaments = [], latestItems = [], error = null }) {
  // 福岡県8ブロック情報
  const fukuokaBlocks = [
    {
      id: 'kyochiku',
      title: '京築ブロック',
      branches: ['行橋支部', '苅田支部', '豊前支部']
    },
    {
      id: 'kitakyushu',
      title: '北九州ブロック',
      branches: ['北九州支部']
    },
    {
      id: 'chikuho',
      title: '筑豊ブロック',
      branches: ['中遠支部', '直鞍支部', '嘉飯支部', '田川支部']
    },
    {
      id: 'higashi-fukuoka',
      title: '東福岡ブロック',
      branches: ['古賀支部', '糟屋支部', '宗像支部']
    },
    {
      id: 'fukuoka',
      title: '福岡ブロック',
      branches: ['福岡支部', '筑紫支部', '春日支部', '大野城支部']
    },
    {
      id: 'kita-chikugo',
      title: '北筑後ブロック',
      branches: ['朝倉支部', '八女支部', '浮羽支部', '小郡支部']
    },
    {
      id: 'kurume',
      title: '久留米ブロック',
      branches: ['久留米支部']
    },
    {
      id: 'minami-chikugo',
      title: '南筑後ブロック',
      branches: ['柳川支部', '筑後支部', '大牟田支部', '大川大木支部']
    }
  ];

  // カテゴリー情報
  const tournamentCategories = [
    { id: 'gakudo', title: '学童' },
    { id: 'shonen', title: '少年' },
    { id: 'a-class', title: 'A級' },
    { id: 'b-class', title: 'B級' },
    { id: 'c-class', title: 'C級' },
    { id: 'other', title: 'その他' },
  ];

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <section className={styles.tournamentSection}>
          <div className={styles.cardContainer}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>最近の大会</h2>
                <span>RECENT TOURNAMENTS</span>
              </div>
              <div className={styles.newsList}>
                {error ? (
                  <p className={styles.errorMessage}>{error}</p>
                ) : tournaments.length === 0 ? (
                  <p className={styles.noData}>大会情報はありません</p>
                ) : (
                  tournaments.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      href={`/tournaments/${item.id}`}
                      className={styles.newsItem}
                    >
                      <div className={styles.itemContent}>
                        <span className={styles.itemDate}>
                          {new Date(item.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                        <span className={styles.itemTitle}>{item.title}</span>
                      </div>
                      <span className={styles.arrow}>→</span>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>ブロック情報</h2>
                <span>BLOCK INFORMATION</span>
              </div>
              <div className={styles.list}>
                {fukuokaBlocks.map((block) => (
                  <Link
                    key={block.id}
                    href={`/tournaments/block/${block.id}`}
                    className={styles.listItem}
                  >
                    <span className={styles.categoryTitle}>{block.title}</span>
                    <span className={styles.arrow}>→</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>大会情報（カテゴリー別）</h2>
                <span>TOURNAMENTS BY CATEGORY</span>
              </div>
              <div className={styles.list}>
                {tournamentCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/tournaments/class/${category.id}`}
                    className={styles.listItem}
                  >
                    <span className={styles.categoryTitle}>{category.title}</span>
                    <span className={styles.arrow}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* お知らせセクション */}
        <section className={styles.latestInfoSection}>
          <div className={styles.latestInfoCard}>
            <div className={styles.cardHeader}>
              <h2>お知らせ</h2>
              <span>NEWS</span>
            </div>

            <div className={styles.newsList}>
              {error ? (
                <p className={styles.errorMessage}>{error}</p>
              ) : news.length === 0 ? (
                <p className={styles.noData}>お知らせはありません</p>
              ) : (
                news.slice(0, 6).map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.id}`}
                    className={`${styles.newsItem} ${styles.infoNewsItem}`}
                  >
                    <div className={styles.itemContent}>
                      <span className={styles.importantBadgeWrapper}>
                        {item.important && (
                          <span className={styles.importantBadge}>重要</span>
                        )}
                      </span>
                      <span className={styles.itemDate}>
                        {new Date(item.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                      <div className={styles.classTagWrapper}>
                        {item.class && item.class.length > 0 && (
                          <span className={styles.classTag}>
                            {typeof item.class[0] === 'object' ? item.class[0].label : item.class[0]}
                          </span>
                        )}
                      </div>
                      <span className={styles.itemTitle}>{item.title}</span>
                    </div>
                    <span className={styles.arrow}>→</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* 登録チーム数表示セクション */}
        <section className={styles.teamCountSection}>
          <h2>登録チーム数</h2>
          <div className={styles.teamCountGrid}>
            <div className={styles.teamCountCard}>
              <h3>学童</h3>
              <p className={styles.teamCount}>-</p>
            </div>
            <div className={styles.teamCountCard}>
              <h3>少年</h3>
              <p className={styles.teamCount}>-</p>
            </div>
            <div className={styles.teamCountCard}>
              <h3>A級</h3>
              <p className={styles.teamCount}>-</p>
            </div>
            <div className={styles.teamCountCard}>
              <h3>B級</h3>
              <p className={styles.teamCount}>-</p>
            </div>
            <div className={styles.teamCountCard}>
              <h3>C級</h3>
              <p className={styles.teamCount}>-</p>
            </div>
            <div className={styles.teamCountCard}>
              <h3>その他</h3>
              <p className={styles.teamCount}>-</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}