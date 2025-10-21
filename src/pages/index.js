// pages/index.js
import React, { useState } from 'react'
import styles from '../styles/Home.module.css'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import TopView from '../components/TopView/TopView'
import TournamentSection from '../components/TournamentSection/TournamentSection'
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
    const tournamentUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${TOURNAMENT_APP_UID}/fukuoka-tor?limit=100&order=-_sys.createdAt&depth=2`;

    let tournaments = [];
    let allTournaments = [];

    try {
      const tournamentResponse = await fetch(tournamentUrl, { headers });

      if (tournamentResponse.ok) {
        const tournamentData = await tournamentResponse.json();

        if (tournamentData.items && tournamentData.items.length > 0) {
          allTournaments = tournamentData.items.map(item => {
            const torData = item['tor-data'] || {};
            return {
              id: item._id,
              type: 'tournament',
              title: torData['fukuoka-title1'] || '大会',
              nameRyaku: item['fukuoka-tor-name-ryaku'] || '',
              createdAt: item['tor-start'] || item._sys?.createdAt || new Date().toISOString(),
              tournamentFile: item['fuku-tournament'] || null,
              startDate: item['tor-start'] || null,
              endDate: item['end-tor'] || null,
              winTeam: item['win-team-fukuoka'] || '',
              area: item.area || [],
              torNo: item['tor-no'] || 0
            };
          });

          // 今日の日付を取得
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // 前後10日を計算
          const tenDaysBefore = new Date(today);
          tenDaysBefore.setDate(today.getDate() - 10);

          const tenDaysAfter = new Date(today);
          tenDaysAfter.setDate(today.getDate() + 10);

          // 前後10日以内の大会をフィルタリング
          const filteredTournaments = allTournaments.filter(item => {
            if (!item.startDate || !item.endDate) return false;

            const start = new Date(item.startDate);
            const end = new Date(item.endDate);

            // 大会期間が前後10日以内に重なっているかチェック
            return (start <= tenDaysAfter && end >= tenDaysBefore);
          });

          // フィルタ後が8大会以下の場合、終了日が直近のものを表示
          if (filteredTournaments.length <= 8) {
            tournaments = allTournaments
              .filter(item => item.endDate) // 終了日があるもののみ
              .sort((a, b) => new Date(b.endDate) - new Date(a.endDate)) // 終了日の降順
              .slice(0, 8);
          } else {
            tournaments = filteredTournaments;
          }
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
  const [activeTab, setActiveTab] = useState(1);

  return (
    <div className={styles.container}>
      <Header />
      <TopView activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className={styles.main}>
        <TournamentSection tournaments={tournaments} error={error} activeTab={activeTab} setActiveTab={setActiveTab} />

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