// ファイル: /pages/tournaments/class/[category].js

import { useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import Link from 'next/link';
import Meta from '../../../components/Meta/Meta';
import styles from '../../../styles/CategoryTournamentList.module.css';
import Image from 'next/image';

// クラス名のマッピング（表示名）
const categoryNames = {
  'es-class': '学童',
  'jhs-class': '少年',
  'a-class': '一般A級',
  'b-class': '一般B級',
  'c-class': '一般C級',
};

export async function getServerSideProps({ params }) {
  try {
    const classValue = params.category;
    
    if (!categoryNames[classValue]) {
      return {
        notFound: true
      };
    }

    // Newt CMS API設定
    const SPACE_UID = 'jsbb-kurume';
    const TOKEN = 'vdfn4Mdxq2GaU2YMDW1dTIBB7fdgKGLV-pQZfufNZbs';
    const APP_UID = 'tournament'; // アプリUID
    
    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };
    
    // 大会マスター情報を取得（tour-create）
    const masterUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${APP_UID}/tour-create`;
    console.log(`Fetching master data: ${masterUrl}`);
    
    const masterResponse = await fetch(masterUrl, { headers });
    
    if (!masterResponse.ok) {
      console.error(`Master API Error: ${masterResponse.status} ${masterResponse.statusText}`);
      return {
        props: {
          error: `マスターデータ取得エラー: ${masterResponse.status} ${masterResponse.statusText}`,
          tournaments: [],
          category: classValue,
          categoryName: categoryNames[classValue]
        }
      };
    }
    
    const masterData = await masterResponse.json();
    const allMasters = masterData.items || [];
    
    console.log(`取得したマスター数: ${allMasters.length}`);
    
    // クラスでフィルタリング
    const filteredMasters = allMasters.filter(master => {
      if (!master.class) return false;
      
      if (Array.isArray(master.class)) {
        return master.class.includes(classValue);
      } else if (typeof master.class === 'string') {
        const classes = master.class.split(',').map(c => c.trim());
        return classes.includes(classValue);
      }
      
      return master.class === classValue;
    });
    
    console.log(`フィルタリング後のマスター数: ${filteredMasters.length}`);
    
    // 大会情報を取得
    const tournamentPromises = filteredMasters.map(async (master) => {
      try {
        // masterのIDを使って、関連する大会情報を取得
        const tourUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${APP_UID}/tournament?tournament._id=${master._id}`;
        const tourResponse = await fetch(tourUrl, { headers });
        
        if (!tourResponse.ok) {
          return {
            id: master._id,
            tournamentId: master.id || '',
            title1: master['tournament-name'] || '',
            title2: '',
            class: master.class || '',
            thumbnail: master['cover-img']?.src || '/images/tournament-bg.webp',
            updatedAt: master._sys.updatedAt || new Date().toISOString()
          };
        }
        
        const tourData = await tourResponse.json();
        const latestTour = tourData.items && tourData.items.length > 0 
          ? tourData.items.reduce((latest, current) => 
              new Date(current._sys.updatedAt) > new Date(latest._sys.updatedAt) ? current : latest, 
              tourData.items[0]
            )
          : null;
        
        return {
          id: master._id,
          tournamentId: master.id || '',
          title1: master['tournament-name'] || '',
          title2: latestTour ? `第${latestTour['tournament-no']}回` : '',
          class: master.class || '',
          thumbnail: master['cover-img']?.src || '/images/tournament-bg.webp',
          updatedAt: master._sys.updatedAt || new Date().toISOString(),
          latestTournament: latestTour
        };
      } catch (e) {
        console.error(`Error fetching tournament for master ${master._id}:`, e);
        return {
          id: master._id,
          tournamentId: master.id || '',
          title1: master['tournament-name'] || '',
          title2: '',
          class: master.class || '',
          thumbnail: master['cover-img']?.src || '/images/tournament-bg.webp',
          updatedAt: master._sys.updatedAt || new Date().toISOString(),
          error: e.message
        };
      }
    });
    
    const tournaments = await Promise.all(tournamentPromises);
    
    // 更新日でソート
    tournaments.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return {
      props: {
        tournaments,
        category: classValue,
        categoryName: categoryNames[classValue],
        error: null
      }
    };
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return {
      props: {
        error: `データ取得エラー: ${error.message}`,
        tournaments: [],
        category: params.category,
        categoryName: categoryNames[params.category] || '大会'
      }
    };
  }
}

export default function TournamentList({ tournaments, category, categoryName, error }) {
  const [imageLoadError, setImageLoadError] = useState({});
  const router = useRouter();

  const handleImageError = (id) => {
    setImageLoadError(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className={styles.container}>
      <Meta 
        title={`${categoryName}の大会一覧`}
        description={`${categoryName}クラスで開催される野球大会の一覧ページです`}
      />
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>{categoryName}</h1>
          <span>TOURNAMENTS</span>
        </div>
        
        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
            <p>API接続に問題が発生しました。時間をおいて再度お試しください。</p>
          </div>
        )}
        
        <div className={styles.list}>
          {!error && tournaments.length > 0 ? (
            tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.tournamentId}`}
                className={styles.listItem}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={imageLoadError[tournament.id] ? '/images/top0.webp' : tournament.thumbnail}
                    alt={`${tournament.title1} ${tournament.title2}`}
                    width={480}
                    height={270}
                    className={styles.image}
                    onError={() => handleImageError(tournament.id)}
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
                  />
                </div>
                <div className={styles.tournamentInfo}>
                  <div className={styles.tournamentTitle}>
                    <span className={styles.titleLine1}>{tournament.title1}</span>
                    <span className={styles.titleLine2}>{tournament.title2}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className={styles.noData}>
              現在、{categoryName}クラスの大会情報はありません
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}