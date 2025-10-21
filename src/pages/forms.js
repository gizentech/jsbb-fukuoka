import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import styles from '../styles/Forms.module.css';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

// クライアントサイドのみでレンダリング
export async function getStaticProps() {
  return {
    props: {}
  };
}

export default function Forms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const formsSnapshot = await getDocs(collection(db, 'files'));
        const formsData = formsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setForms(formsData);
        console.log('Forms data:', formsData); // 取得したデータをコンソールに出力
      } catch (error) {
        console.error('Error fetching forms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.loading}>ファイルを呼び出しています...</div>
        </main>
        <Footer />
      </>
    );
  }

  const registrationForms = forms.filter((form) => form.category === 'registration');
  const insuranceForms = forms.filter((form) => form.category === 'insurance');

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>申請様式</h1>
          <span>FORMS</span>
        </div>
        <div className={styles.cardContainer}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>登録申請書類</h2>
              <span>REGISTRATION FORMS</span>
            </div>
            <div className={styles.categoryList}>
              {registrationForms.map((form) => (
                <a key={form.id} href={form.fileUrl} className={styles.categoryItem} target="_blank" rel="noopener noreferrer">
                  <span>{form.title}</span>
                </a>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>保険関連書類</h2>
              <span>INSURANCE FORMS</span>
            </div>
            <div className={styles.categoryList}>
              {insuranceForms.map((form) => (
                <a key={form.id} href={form.fileUrl} className={styles.categoryItem} target="_blank" rel="noopener noreferrer">
                  <span>{form.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}