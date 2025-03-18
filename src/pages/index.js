// pages/index.js
import { useState, useEffect } from 'react'
import styles from '../styles/Home.module.css'
import { db } from '../lib/firebase'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import TopicSection from '../components/TopicSection/TopicSection'
import HeroSlider from '../components/HeroSlider/HeroSlider'
import Link from 'next/link'

export default function Home() {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
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
            createdAt: data.createdAt?.toDate?.().toISOString() || null
          };
        });
        
        setNews(newsData);
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('ニュースの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const tournamentCategories = [
    { id: 'elementary', title: '学童' },
    { id: 'junior', title: '少年' },
    { id: 'adult-a', title: '一般A級' },
    { id: 'adult-b', title: '一般B級' },
    { id: 'adult-c', title: '一般C級' },
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
                    href={`/tournament-categories/${category.id}`}
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
                {loading ? (
                  <p>読み込み中...</p>
                ) : error ? (
                  <p className={styles.errorMessage}>{error}</p>
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

        <section className={styles.topicContainer}>
          <h2>特別協賛社</h2>
          <TopicSection />
        </section>
      </main>
      <Footer />
    </div>
  );
}