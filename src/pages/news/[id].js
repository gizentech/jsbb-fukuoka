import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../../styles/NewsDetail.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Meta from '../../components/Meta/Meta';

export default function NewsDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchNews = async () => {
      try {
        const newsRef = doc(db, 'news', id);
        const docSnap = await getDoc(newsRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setNews({
            id: docSnap.id,
            title: data.title || '',
            content: data.content ? data.content.replace(/\|\|n\|\|/g, '\n') : '',
            category: data.category || '',
            createdAt: data.createdAt?.toDate?.() 
              ? data.createdAt.toDate().toISOString()
              : new Date().toISOString(),
          });
        } else {
          setError('ニュースが見つかりませんでした');
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('ニュースの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
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

  if (error || !news) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.error}>{error || 'ニュースが見つかりませんでした'}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Meta 
        title={news.title}
        description={`${news.title}の詳細ページです`}
      />
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>お知らせ</h1>
          <span>INFORMATION</span>
        </div>
        
        <article className={styles.article}>
          <div className={styles.articleHeader}>
            <time className={styles.articleDate}>
              {new Date(news.createdAt).toLocaleDateString('ja-JP')}
            </time>
            <span className={styles.articleCategory}>
              {news.category}
            </span>
          </div>
          <h2 className={styles.articleTitle}>{news.title}</h2>
          <div className={styles.articleContent}>
            <pre>{news.content}</pre>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}