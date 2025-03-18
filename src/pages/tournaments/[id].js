import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Meta from '../../components/Meta/Meta';
import styles from '../../styles/TournamentDetail.module.css';
import Image from 'next/image';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function TournamentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [tournament, setTournament] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState('');
  const [fontSize, setFontSize] = useState({ title1: 2.5, title2: 1.8 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchTournament = async () => {
      try {
        const tournamentsRef = collection(db, 'tournaments');
        const q = query(tournamentsRef, where('tournamentId', '==', id));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();

          // Updates の日付を変換
          const updatesWithFixedDates = docData.updates?.map(update => ({
            ...update,
            updatedAt: update.updatedAt?.toDate?.() 
              ? update.updatedAt.toDate().toISOString()
              : new Date().toISOString()
          })) || [];

          setTournament({
            id: querySnapshot.docs[0].id,
            ...docData,
            updates: updatesWithFixedDates
          });

          if (updatesWithFixedDates.length > 0) {
            setSelectedUpdate(updatesWithFixedDates[0].count);
          }
        } else {
          setError('大会情報が見つかりませんでした');
        }
      } catch (error) {
        console.error('Error fetching tournament:', error);
        setError('大会情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  useEffect(() => {
    const adjustFontSize = () => {
      if (!tournament) return;

      const containerWidth = document.querySelector(`.${styles.titleWrapper}`)?.offsetWidth;
      if (!containerWidth) return;

      let currentSize = 2.5;
      const minSize = 1;
      const step = 0.1;

      const title1Length = tournament.title1.length;
      const title2Length = tournament.title2.length;
      const longerTitleLength = Math.max(title1Length, title2Length);

      while (currentSize > minSize) {
        const estimatedWidth = longerTitleLength * (currentSize * 16);
        if (estimatedWidth <= containerWidth * 0.9) {
          break;
        }
        currentSize -= step;
      }

      setFontSize({
        title1: currentSize,
        title2: currentSize * 0.72 // title2 は title1 の 72% のサイズ
      });
    };

    adjustFontSize();
    window.addEventListener('resize', adjustFontSize);
    return () => window.removeEventListener('resize', adjustFontSize);
  }, [tournament]);

  const handleUpdateSelect = (count) => {
    setSelectedUpdate(count);
    const element = document.getElementById(`update-${count}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <Header />
        <div className={styles.loading}>読み込み中...</div>
        <Footer />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className={styles.wrapper}>
        <Header />
        <div className={styles.error}>{error || '大会情報が見つかりませんでした'}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Meta 
        title={`${tournament.title1} ${tournament.title2}`}
        description={`${tournament.title1} ${tournament.title2}の大会情報ページです`}
      />
      <Header />
      
      <div className={styles.titleSection}>
        <div className={styles.titleBackground}>
          <Image
            src={tournament.thumbnail || '/images/top0.webp'}
            alt=""
            fill
            sizes="100%"
            className={styles.titleBackgroundImage}
            onError={(e) => {
              if (e.currentTarget.src.includes('top0.webp')) {
                e.currentTarget.src = '/images/default.webp';
              }
            }}
          />
        </div>
        <div className={styles.titleContainer}>
          <div className={styles.titleWrapper}>
            <h1 
              className={styles.title1} 
              style={{ fontSize: `${fontSize.title1}rem` }}
            >
              {tournament.title1}
            </h1>
            <h2 
              className={styles.title2} 
              style={{ fontSize: `${fontSize.title2}rem` }}
            >
              {tournament.title2}
            </h2>
          </div>
          <div className={styles.pcSelect}>
            <select 
              value={selectedUpdate}
              onChange={(e) => handleUpdateSelect(e.target.value)}
              className={styles.updateSelect}
            >
              <option value="">回数を選択</option>
              {tournament.updates?.map((update, index) => (
                <option key={index} value={update.count}>
                  第{update.count}回 {update.year && `(${update.year}年)`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.spMenu}>
        <button 
          className={styles.menuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="メニューを開く"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        {isMenuOpen && (
          <div className={styles.mobileMenu}>
            {tournament.updates?.map((update, index) => (
              <button
                key={index}
                onClick={() => handleUpdateSelect(update.count)}
                className={styles.mobileMenuItem}
              >
                第{update.count}回 {update.year && `(${update.year}年)`}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className={styles.main}>
        <div className={styles.cardGrid}>
          {tournament.updates?.map((update, index) => (
            <div 
              key={index} 
              id={`update-${update.count}`} 
              className={styles.updateCard}
            >
              <div className={styles.cardContent}>
                <div className={styles.updateBadge}>
                  <div className={styles.updateCount}>第{update.count}回</div>
                  {update.year && <div className={styles.updateYear}>{update.year}年</div>}
                </div>
                <div className={styles.updateInfo}>
                  <p className={styles.updateDate}>
                    更新日: {new Date(update.updatedAt).toLocaleString('ja-JP')}
                  </p>
                  <p className={styles.updateBody} style={{ whiteSpace: 'pre-wrap' }}>
                    {update.body}
                  </p>
                  {update.fileUrl && (
                    <a 
                      href={update.fileUrl}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.pdfLink}
                    >
                      トーナメント表をPDFで開く
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}