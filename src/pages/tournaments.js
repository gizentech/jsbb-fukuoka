// pages/tournaments.js
import styles from '../styles/Tournaments.module.css'
import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import Link from 'next/link'
import Meta from '../components/Meta/Meta'

export default function Tournaments() {
  const categories = [
    { id: 'elementary', title: '学童' },
    { id: 'junior', title: '少年' },
    { id: 'adult-a', title: '一般 A級' },
    { id: 'adult-b', title: '一般 B級' },
    { id: 'adult-c', title: '一般 C級' },
  ]

  return (
    <div className={styles.container}>
      <Meta
        title="大会情報"
        description="野球大会の申込情報や大会情報をカテゴリー別にご覧いただけます。"
        urlPath="/tournaments"
      />
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>大会情報</h1>
        
        <div className={styles.cardContainer}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>大会申込</h2>
              <span>APPLICATION</span>
            </div>
            <div className={styles.categoryList}>
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/application/${category.id}`}
                  className={styles.categoryItem}
                >
                  <span>{category.title}</span>
                  <span className={styles.arrow}>→</span>
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>大会情報</h2>
              <span>TOURNAMENTS</span>
            </div>
            <div className={styles.categoryList}>
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/tournament-categories/${category.id}`}
                  className={styles.categoryItem}
                >
                  <span>{category.title}</span>
                  <span className={styles.arrow}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}