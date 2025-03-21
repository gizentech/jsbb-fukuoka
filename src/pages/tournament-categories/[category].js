import { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Link from 'next/link';
import Meta from '../../components/Meta/Meta';
import styles from '../../styles/CategoryTournamentList.module.css';
import Image from 'next/image';

const categories = {
  'elementary': '学童',
  'junior': '少年',
  'adult-a': '一般A級',
  'adult-b': '一般B級',
  'adult-c': '一般C級',
};

export const getStaticPaths = async () => {
  const paths = Object.keys(categories).map(category => ({
    params: { category }
  }));

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps = async ({ params }) => {
  try {
    const tournamentsRef = collection(db, 'tournaments');
    const q = query(
      tournamentsRef,
      where('class', 'array-contains', params.category)
    );
    
    const querySnapshot = await getDocs(q);
    const tournaments = querySnapshot.docs.map(doc => {
      const data = doc.data();

      const serializedData = {
        id: doc.id,
        tournamentId: data.tournamentId || '',
        title1: data.title1 || '',
        title2: data.title2 || '',
        class: data.class || [],
        thumbnail: data.thumbnail || '/images/tournament-bg.webp',
        updatedAt: data.updatedAt?.toDate?.() 
          ? data.updatedAt.toDate().toISOString()
          : new Date().toISOString()
      };

      return serializedData;
    });

    tournaments.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return {
      props: {
        tournaments,
        category: params.category,
        categoryName: categories[params.category]
      },
      revalidate: 3600 // 1時間ごとに再生成（秒単位）
    };
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return {
      notFound: true,
      revalidate: 60 // エラー時は60秒後に再試行
    };
  }
};

export default function TournamentList({ tournaments, category, categoryName }) {
  const [imageLoadError, setImageLoadError] = useState({});

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
        
        <div className={styles.list}>
          {tournaments.length > 0 ? (
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