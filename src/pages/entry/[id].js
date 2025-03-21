import { useState } from 'react';
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

export const getStaticPaths = async () => {
  // 初期ビルド時に生成するパスを空にする
  return {
    paths: [],
    fallback: 'blocking' // ページが存在しなければビルド時に生成
  };
};

export const getStaticProps = async ({ params }) => {
  try {
    const docRef = doc(db, 'tournament-entries', params.id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const entry = {
        id: docSnap.id,
        title1: data.title1 || '',
        title2: data.title2 || '',
        content: data.content || '',
        fileUrl: data.fileUrl || '',
        class: data.class || [],
        count: data.count || '',
        year: data.year || '',
        createdAt: data.createdAt 
          ? (typeof data.createdAt.toDate === 'function' 
             ? data.createdAt.toDate().toISOString() 
             : data.createdAt)
          : new Date().toISOString()
      };

      return {
        props: { entry },
        revalidate: 3600 // 1時間ごとに再生成
      };
    } else {
      return {
        notFound: true,
        revalidate: 60
      };
    }
  } catch (error) {
    console.error('Error fetching entry:', error);
    return {
      notFound: true,
      revalidate: 60
    };
  }
};

export default function EntryDetail({ entry }) {
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

  if (!entry) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.error}>申込情報が見つかりませんでした</div>
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