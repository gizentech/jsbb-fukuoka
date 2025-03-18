// pages/news/index.js
import { useState, useEffect } from 'react'
import { db } from '../../lib/firebase'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import styles from '../../styles/News.module.css'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import Link from 'next/link'
import Meta from '../../components/Meta/Meta'

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export default function News() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'entry', name: '大会申込' },
    { id: 'news', name: 'お知らせ' },
    { id: '学童', name: '学童' },
    { id: '少年', name: '少年' },
    { id: '一般A級', name: '一般A級' },
    { id: '一般B級', name: '一般B級' },
    { id: '一般C級', name: '一般C級' }
  ]

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const q = query(
          collection(db, 'news'),
          orderBy('createdAt', 'desc')
        )
        const querySnapshot = await getDocs(q)
        const newsData = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            title: data.title || '',
            category: data.category || '',
            createdAt: data.createdAt 
              ? (typeof data.createdAt.toDate === 'function' 
                  ? data.createdAt.toDate() 
                  : new Date(data.createdAt))
              : new Date()
          }
        })
        setNews(newsData)
      } catch (error) {
        console.error('Error fetching news:', error)
        setError('お知らせの読み込みに失敗しました。ページを更新してください。')
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  const filteredNews = selectedCategory === 'all'
    ? news
    : news.filter(item => item.category === selectedCategory)

  return (
    <div className={styles.container}>
      <Meta 
        title="お知らせ一覧"
        description="野球連盟からのお知らせ一覧ページです"
      />
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>お知らせ</h1>
          <span>INFORMATION</span>
        </div>

        <div className={styles.categoryFilter}>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`${styles.categoryBtn} ${selectedCategory === category.id ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {error ? (
          <div className={styles.error}>
            <p className={styles.errorMessage}>
              {error}
              <button 
                onClick={() => window.location.reload()} 
                className={styles.retryButton}
              >
                再読み込み
              </button>
            </p>
          </div>
        ) : loading ? (
          <div className={styles.loading}>
            <p className={styles.loadingText}>読み込み中...</p>
          </div>
        ) : (
          <div className={styles.list}>
            {filteredNews.length > 0 ? (
              filteredNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className={styles.listItem}
                >
                  <div className={styles.newsInfo}>
                    <div className={styles.newsMeta}>
                      <time className={styles.newsDate}>
                        {formatDate(item.createdAt)}
                      </time>
                      <span className={styles.newsCategory}>
                        {item.category}
                      </span>
                    </div>
                    <h3 className={styles.newsTitle}>
                      {item.title}
                    </h3>
                  </div>
                  <span className={styles.arrow}>→</span>
                </Link>
              ))
            ) : (
              <p className={styles.noData}>
                {selectedCategory === 'all' 
                  ? 'お知らせはありません' 
                  : '該当するお知らせはありません'}
              </p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}