// pages/about/history.js
import styles from '../../styles/History.module.css'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'

const History = () => {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>久留米市野球連盟のあゆみ</h1>
        <article className={styles.article}>
          <h2 className={styles.subtitle}>７５年のあゆみ</h2>
          <div className={styles.content}>
            <p>
              久留米は、古くから有馬２１万石の城下町として栄えてきました。その有馬藩１５代当主有馬頼寧公(農林大臣時代、競馬有馬記念創設者)は、戦前のプロ野球東京セネターズ（現日本ハムファイターズ）のオーナーをつとめられ、その功績により日本野球殿堂入りを果たされています。
            </p>
            {/* 以下、沿革の詳細を記述 */}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}

export default History