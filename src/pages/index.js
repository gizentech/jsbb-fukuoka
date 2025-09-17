// pages/index.js
import React from 'react'
import styles from '../styles/Home.module.css'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import TopicSection from '../components/TopicSection/TopicSection'
import HeroSlider from '../components/HeroSlider/HeroSlider'
import YaBanner from '../components/YaBanner/YaBanner' // 追加
import Link from 'next/link'
import Analytics from '@vercel/analytics/react';

// getServerSidePropsは既存のものをそのまま維持
export async function getServerSideProps() {
  try {
    // 環境変数からNewt CMS API設定を取得
    const SPACE_UID = process.env.NEWT_SPACE_UID;
    const TOKEN = process.env.NEWT_API_TOKEN;
    const APP_UID = 'tournament';
    
    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    // Newt CMSからニュース取得
    const newtNewsUrl = `https://${SPACE_UID}.cdn.newt.so/v1/information/post?limit=5&order=-_sys.createdAt`;
    let newsData = [];
    
    try {
      const newsResponse = await fetch(newtNewsUrl, { headers });
      
      if (newsResponse.ok) {
        const newsResult = await newsResponse.json();
        
        if (newsResult.items && newsResult.items.length > 0) {
          newsData = newsResult.items.map(item => ({
            id: item._id,
            type: 'news',
            title: item.title || '',
            createdAt: item._sys?.createdAt || new Date().toISOString()
          }));
        }
      } else {
        console.error(`News API Error: ${newsResponse.status}`);
      }
    } catch (newsError) {
      console.error('Error processing news:', newsError);
    }

    // 申込書データを取得（最新6件）
    const applicationUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${APP_UID}/applicationform?limit=6`;
    
    let applications = [];
    
    try {
      const applicationResponse = await fetch(applicationUrl, { headers });
      
      if (applicationResponse.ok) {
        const applicationData = await applicationResponse.json();
        
        if (applicationData.items && applicationData.items.length > 0) {
          applications = await Promise.all(applicationData.items.map(async (app) => {
            let tournamentName = '';
            let tournamentId = '';
            
            // 関連する大会情報を取得
            if (app['application-tournament']) {
              try {
                const tournamentRefId = app['application-tournament'];
                const tourUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${APP_UID}/tour-create/${tournamentRefId}`;
                const tourResponse = await fetch(tourUrl, { headers });
                
                if (tourResponse.ok) {
                  const tourData = await tourResponse.json();
                  tournamentName = tourData['tournament-name'] || '';
                  tournamentId = tourData._id || '';
                }
              } catch (e) {
                console.error('Error fetching tournament info:', e);
              }
            }
            
            return {
              id: app._id,
              type: 'application',
              title: app['application-title'] || '大会申込書',
              fileUrl: app.file && app.file.length > 0 ? app.file[0].src : null,
              fileName: app.file && app.file.length > 0 ? app.file[0].fileName : '申込書.pdf',
              uploadDate: app['upload-date'] || app._sys.updatedAt,
              createdAt: app['upload-date'] || app._sys.updatedAt,
              info: app['application-info'] || '',
              tournamentId: tournamentId,
              tournamentName: tournamentName
            };
          }));
        }
      } else {
        console.error(`Application API Error: ${applicationResponse.status}`);
      }
    } catch (appError) {
      console.error('Error processing applications:', appError);
    }
    
    // ニュースと申込書を統合して日付でソート
    const combinedItems = [...newsData, ...applications].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    // 最新の5件のみ取得
    const latestItems = combinedItems.slice(0, 5);
    
    return {
      props: { 
        news: newsData,
        applications: applications,
        latestItems: latestItems,
        error: null
      }
    };

  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        news: [],
        applications: [],
        latestItems: [],
        error: 'データの読み込みに失敗しました: ' + error.message
      }
    };
  }
}

export default function Home({ news = [], applications = [], latestItems = [], error = null }) {
  // カテゴリー情報を更新（古いIDと新しいIDのマッピング）
  const tournamentCategories = [
    { id: 'es-class', title: '学童' },
    { id: 'jhs-class', title: '少年' },
    { id: 'a-class', title: '一般A級' },
    { id: 'b-class', title: '一般B級' },
    { id: 'c-class', title: '一般C級' },
  ];

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <HeroSlider />
        
        {/* YAバナーをHeroSliderの下に追加 */}
        <YaBanner />

        <section className={styles.tournamentSection}>
          <div className={styles.cardContainer}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>大会情報</h2>
                <span>TOURNAMENTS</span>
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

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>最新情報</h2>
                <span>LATEST INFORMATION</span>
              </div>
              <div className={styles.newsList}>
                {error ? (
                  <p className={styles.errorMessage}>{error}</p>
                ) : latestItems.length === 0 ? (
                  <p>お知らせはありません</p>
                ) : (
                  latestItems.map((item) => (
                    <Link 
                      key={`${item.type}-${item.id}`}
                      href={item.type === 'news' ? `/news/${item.id}` : `/application/${item.id}`}
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
          </div>
        </section>

        <section className={styles.topicContainer}>
          <h2>特別協賛社</h2>
          <TopicSection />
        </section>
      </main>
      <Footer />
    </div>
  );
}