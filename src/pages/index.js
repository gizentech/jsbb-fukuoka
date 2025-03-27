// pages/index.js
import { useState } from 'react'
import styles from '../styles/Home.module.css'
import { db } from '../lib/firebase'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import TopicSection from '../components/TopicSection/TopicSection'
import HeroSlider from '../components/HeroSlider/HeroSlider'
import Link from 'next/link'

export async function getStaticProps() {
  try {
    // Firebaseからのニュース取得
    const q = query(
      collection(db, 'news'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    
    const querySnapshot = await getDocs(q);
    const newsData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() 
          ? data.createdAt.toDate().toISOString() 
          : new Date().toISOString()
      };
    });

    // Newt CMS API設定
    const SPACE_UID = 'jsbb-kurume';
    const TOKEN = 'vdfn4Mdxq2GaU2YMDW1dTIBB7fdgKGLV-pQZfufNZbs';
    const APP_UID = 'tournament';
    
    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

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
                  tournamentId = tourData.id || '';
                }
              } catch (e) {
                console.error('Error fetching tournament info:', e);
              }
            }
            
            return {
              id: app._id,
              title: app['application-title'] || '大会申込書',
              fileUrl: app.file && app.file.length > 0 ? app.file[0].src : null,
              fileName: app.file && app.file.length > 0 ? app.file[0].fileName : '申込書.pdf',
              uploadDate: app['upload-date'] || app._sys.updatedAt,
              info: app['application-info'] || '',
              tournamentId: tournamentId,
              tournamentName: tournamentName
            };
          }));
          
          // アップロード日でソート
          applications.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        }
      } else {
        console.error(`Application API Error: ${applicationResponse.status}`);
      }
    } catch (appError) {
      console.error('Error processing applications:', appError);
    }
    
    return {
      props: {
        news: newsData,
        applications: applications,
        error: null
      },
      revalidate: 300 // 5分ごとに再生成
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        news: [],
        applications: [],
        error: 'データの読み込みに失敗しました: ' + error.message
      },
      revalidate: 60 // エラー時は1分後に再試行
    };
  }
}

export default function Home({ news, applications = [], error }) {
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
                <h2>お知らせ</h2>
                <span>INFORMATION</span>
              </div>
              <div className={styles.newsList}>
                {error ? (
                  <p className={styles.errorMessage}>{error}</p>
                ) : news.length === 0 ? (
                  <p>お知らせはありません</p>
                ) : (
                  news.map((item) => (
                    <Link 
                      key={item.id}
                      href={`/news/${item.id}`}
                      className={styles.newsItem}
                    >
                      <span className={styles.newsTitle}>{item.title}</span>
                      <span className={styles.arrow}>→</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 申込書セクション */}
        {applications && applications.length > 0 && (
          <section className={styles.applicationSection}>
            <div className={styles.sectionHeader}>
              <h2>大会申込書</h2>
              <span>APPLICATIONS</span>
            </div>
            <div className={styles.applicationList}>
              {applications.map((app) => (
                <div key={app.id} className={styles.applicationCard}>
                  <div className={styles.applicationInfo}>
                    <h3 className={styles.applicationTitle}>
                      <Link href={`/application/${app.id}`}>
                        {app.title}
                      </Link>
                    </h3>
                    {app.tournamentName && (
                      <p className={styles.tournamentName}>
                        {app.tournamentId ? (
                          <Link href={`/tournaments/${app.tournamentId}`}>
                            {app.tournamentName}
                          </Link>
                        ) : (
                          app.tournamentName
                        )}
                      </p>
                    )}
                    <p className={styles.uploadDate}>
                      アップロード日: {new Date(app.uploadDate).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  {app.fileUrl && (
                    <a 
                      href={app.fileUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.downloadButton}
                    >
                      ダウンロード
                    </a>
                  )}
                </div>
              ))}
            </div>
            <Link href="/application" className={styles.moreLink}>
              すべての申込書を見る
              <span className={styles.arrow}>→</span>
            </Link>
          </section>
        )}

        <section className={styles.topicContainer}>
          <h2>特別協賛社</h2>
          <TopicSection />
        </section>
      </main>
      <Footer />
    </div>
  );
}