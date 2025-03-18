import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import styles from '../../styles/admin/Dashboard.module.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalNews: 0,
    recentNews: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // ニュース総数の取得
        const newsSnapshot = await getDocs(collection(db, 'news'));
        const totalNews = newsSnapshot.size;

        // 最新のニュース5件を取得
        const recentNewsQuery = query(
          collection(db, 'news'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentNewsSnapshot = await getDocs(recentNewsQuery);
        const recentNews = recentNewsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            category: data.category || '',
            createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
              ? data.createdAt.toDate().toISOString()
              : new Date().toISOString()
          };
        });

        // カテゴリーの取得
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categories = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || ''
        }));

        setStats({
          totalNews,
          recentNews,
          categories
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>データを読み込み中...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className={styles.errorContainer}>
          <div className={styles.error}>{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className={styles.retryButton}
          >
            再試行
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.dashboard}>
        <h1>ダッシュボード</h1>

        <div className={styles.statsGrid}>
          <div className={styles.statsCard}>
            <h3>お知らせ総数</h3>
            <p className={styles.statsNumber}>{stats.totalNews}</p>
          </div>
          <div className={styles.statsCard}>
            <h3>カテゴリ数</h3>
            <p className={styles.statsNumber}>{stats.categories.length}</p>
          </div>
        </div>

        <div className={styles.recentNews}>
          <h2>最新のお知らせ</h2>
          <div className={styles.newsList}>
            {stats.recentNews.map((news) => (
              <div key={news.id} className={styles.newsItem}>
                <div className={styles.newsHeader}>
                  <span className={styles.newsCategory}>{news.category}</span>
                  <time>{new Date(news.createdAt).toLocaleDateString('ja-JP')}</time>
                </div>
                <h3>{news.title}</h3>
                <a href={`/admin/news/edit/${news.id}`} className={styles.editLink}>
                  編集
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.categories}>
          <h2>カテゴリ一覧</h2>
          <div className={styles.categoryList}>
            {stats.categories.map((category) => (
              <div key={category.id} className={styles.categoryTag}>
                {category.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}