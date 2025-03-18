import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Meta from '../../components/Meta/Meta';
import styles from '../../styles/EntryDetail.module.css';

const classNames = {
  'elementary': '学童',
  'junior': '少年',
  'adult-a': '一般A級',
  'adult-b': '一般B級',
  'adult-c': '一般C級',
};

export default function EntryDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchEntry = async () => {
      try {
        const docRef = doc(db, 'tournament-entries', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEntry({
            id: docSnap.id,
            title1: data.title1 || '',
            title2: data.title2 || '',
            content: data.content || '',
            fileUrl: data.fileUrl || '',
            class: data.class || [],
            count: data.count || '',
            year: data.year || '',
            createdAt: data.createdAt?.toDate?.() 
              ? data.createdAt.toDate().toISOString()
              : new Date().toISOString()
          });
        } else {
          setError('申込情報が見つかりませんでした');
        }
      } catch (error) {
        console.error('Error fetching entry:', error);
        setError('申込情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>読み込み中...</div>
        <Footer />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.error}>{error || '申込情報が見つかりませんでした'}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Meta 
        title={`${entry.title1} ${entry.title2} 申込書`}
        description={`${entry.title1} ${entry.title2}の大会申込書ページです`}
      />
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>
            第{entry.count}回
            <br />
            {entry.title1}
            <br />
            {entry.title2}
          </h1>
        </div>

        <div className={styles.content}>
          <div className={styles.meta}>
            <div className={styles.round}>
              {entry.year}年度 第{entry.count}回
            </div>
            <div className={styles.classes}>
              {entry.class.map(c => classNames[c]).join('、')}
            </div>
          </div>

          <div className={styles.description}>
            {entry.content}
          </div>

          {entry.fileUrl && (
            <div className={styles.download}>
              <a 
                href={entry.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.downloadButton}
              >
                申込書をダウンロード
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}