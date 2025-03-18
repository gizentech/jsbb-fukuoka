import { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Link from 'next/link';
import Meta from '../../components/Meta/Meta';
import styles from '../../styles/CategoryTournamentList.module.css';

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
    fallback: false // 404を返す
  };
};

export const getStaticProps = async ({ params }) => {
  try {
    const entriesRef = collection(db, 'tournament-entries');
    const q = query(
      entriesRef,
      where('class', 'array-contains', params.category),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const entries = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      const formatDate = (timestamp) => {
        if (!timestamp) return null;
        try {
          if (typeof timestamp === 'string') {
            return timestamp;
          }
          if (timestamp.seconds) {
            return new Date(timestamp.seconds * 1000).toISOString();
          }
          if (timestamp instanceof Date) {
            return timestamp.toISOString();
          }
          return null;
        } catch (error) {
          console.error('Date formatting error:', error);
          return null;
        }
      };

      return {
        id: doc.id,
        title1: data.title1 || '',
        title2: data.title2 || '',
        content: data.content || '',
        fileUrl: data.fileUrl || '',
        class: data.class || [],
        count: data.count || '',
        year: data.year || '',
        tournamentId: data.tournamentId || '',
        createdAt: formatDate(data.createdAt)
      };
    });

    return {
      props: {
        entries,
        category: params.category,
        categoryName: categories[params.category]
      }
    };
  } catch (error) {
    console.error('Error fetching entries:', error);
    return {
      notFound: true
    };
  }
};

export default function CategoryEntryList({ entries, category, categoryName }) {
  const formatDisplayDate = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleDateString('ja-JP');
    } catch (error) {
      console.error('Error formatting display date:', error);
      return '';
    }
  };

  return (
    <div className={styles.container}>
      <Meta 
        title={`${categoryName}の申込情報`}
        description={`${categoryName}クラスの大会申込情報一覧ページです`}
      />
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>{categoryName}</h1>
          <span>ENTRY</span>
        </div>
        
        <div className={styles.list}>
          {entries.length > 0 ? (
            entries.map((entry) => (
              <Link
                key={entry.id}
                href={`/entry/${entry.id}`}
                className={styles.listItem}
              >
                <div className={styles.entryInfo}>
                  <div className={styles.entryMeta}>
                    <time className={styles.entryDate}>
                      {formatDisplayDate(entry.createdAt)}
                    </time>
                  </div>
                  <h3 className={styles.entryTitle}>
                    第{entry.count}回 {entry.title1} {entry.title2}
                  </h3>
                </div>
                <span className={styles.arrow}>→</span>
              </Link>
            ))
          ) : (
            <p className={styles.noData}>
              現在、{categoryName}クラスの申込情報はありません
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}