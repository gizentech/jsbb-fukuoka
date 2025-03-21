import { useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../../styles/NewsDetail.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Meta from '../../components/Meta/Meta';

export const getStaticPaths = async () => {
  // 初期ビルド時に生成するパスを空にする
  return {
    paths: [],
    fallback: 'blocking' // ページが存在しなければビルド時に生成
  };
};

export const getStaticProps = async ({ params }) => {
  try {
    const newsRef = doc(db, 'news', params.id);
    const docSnap = await getDoc(newsRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const news = {
        id: docSnap.id,
        title: data.title || '',
        content: data.content ? data.content.replace(/\|\|n\|\|/g, '\n') : '',
        category: data.category || '',
        createdAt: data.createdAt?.toDate?.() 
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
      };

      return {
        props: { news },
        revalidate: 3600 // 1時間ごとに再生成
      };
    } else {
      return {
        notFound: true,
        revalidate: 60 // 1分後に再検証
      };
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    return {
      notFound: true,
      revalidate: 60
    };
  }
};

export default function NewsDetail({ news }) {
  const router = useRouter();

  // fallbackが'blocking'の場合は不要ですが、
  // fallbackを'true'に変更する場合に必要になります
  if (router.isFallback) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>読み込み中...</div>
        <Footer />
      </div>
    );
  }

  if (!news) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.error}>ニュースが見つかりませんでした</div>
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