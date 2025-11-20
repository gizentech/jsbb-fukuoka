// pages/index.js
import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import styles from '../styles/Home.module.css'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import TournamentSection from '../components/TournamentSection/TournamentSection'
import NewsSection from '../components/NewsSection/NewsSection'
import RegistrationStatus from '../components/RegistrationStatus/RegistrationStatus'
import RotatingBanners from '../components/RotatingBanners/RotatingBanners'
import Analytics from '@vercel/analytics/react';

const Background = dynamic(() => import('../components/Background/Background'), {
  ssr: false,
});

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
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={styles.container}>
      <Header />
      <Background activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className={styles.main}>
        <TournamentSection tournaments={tournaments} error={error} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* お知らせ・登録状況セクション */}
        <section className={styles.infoRegistrationSection}>
          <div className={styles.infoRegistrationContainer}>
            {/* お知らせエリア (1.8fr) */}
            <div className={styles.newsArea}>
              <NewsSection news={news} error={error} />
            </div>

            {/* 登録状況エリア (1.2fr) */}
            <div className={styles.registrationArea}>
              <RegistrationStatus />
            </div>
          </div>
        </section>
      </main>

      {/* 回転式バナー（Footerの上） */}
      <section className={styles.bannersSection}>
        <RotatingBanners />
      </section>

      <Footer />
    </div>
  );
}