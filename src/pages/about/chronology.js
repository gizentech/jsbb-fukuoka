// src/pages/about/chronology.js
'use client';

import { useState } from 'react';
import styles from '../../styles/about/Chronology.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

// chronologyページのコンポーネント
const Chronology = () => {
  // 年代ごとにデータをグループ化
  const eras = {
    showa: {
      label: '昭和',
      years: ['昭和17年', '昭和21年', '昭和41年']
    },
    heisei: {
      label: '平成',
      years: ['平成1年', '平成10年', '平成20年']
    },
    reiwa: {
      label: '令和',
      years: ['令和1年', '令和2年']
    }
  };

  // フィルター用の状態
  const [selectedEra, setSelectedEra] = useState('all');

  // 沿革データ
  const chronologyData = [
    {
      era: 'showa',
      year: '昭和17年',
      events: [
        '11月　ブリヂストンタイヤ(㈱)『明治神宮奉納全国軟式野球大会』優勝'
      ]
    },
    {
      era: 'showa',
      year: '昭和21年',
      events: [
        '2月　全日本軟式野球連盟に加入',
        '久留米市体育協会　初代野球部長　錦織克成',
        '二代部長　城戸憲治',
        '三代部長　坂田喜久',
        '四代部長　小松　久',
        '事務局長　楢原熊雄'
      ]
    },
    // ... 他の年代データ
  ];

  // フィルター関数
  const filteredData = selectedEra === 'all' 
    ? chronologyData 
    : chronologyData.filter(item => item.era === selectedEra);

  return (
    <>
      <Header />
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>沿革</h1>
            <p className={styles.subtitle}>歴史は昭和から始まる</p>
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterButtons}>
              <button 
                className={`${styles.filterButton} ${selectedEra === 'all' ? styles.active : ''}`}
                onClick={() => setSelectedEra('all')}
              >
                全て
              </button>
              {Object.entries(eras).map(([key, value]) => (
                <button
                  key={key}
                  className={`${styles.filterButton} ${selectedEra === key ? styles.active : ''}`}
                  onClick={() => setSelectedEra(key)}
                >
                  {value.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.timeline}>
            {filteredData.map((item, index) => (
              <div 
                key={index} 
                className={`${styles.timelineItem} ${styles[item.era]}`}
              >
                <div className={styles.yearWrapper}>
                  <h2 className={styles.year}>{item.year}</h2>
                </div>
                <div className={styles.events}>
                  {item.events.map((event, eventIndex) => (
                    <p key={eventIndex} className={styles.event}>{event}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

// コンポーネントのエクスポート
export default Chronology;