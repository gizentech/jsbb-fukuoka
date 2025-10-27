import React, { useState, useRef } from 'react';
import Link from 'next/link';
import styles from './TournamentSection.module.css';
import { classSlugToDisplay } from '../../utils/classConvert';

export default function TournamentSection({ tournaments = [], error = null, activeTab = 0, setActiveTab = () => {} }) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef(null);

  // スワイプ処理
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeTab < 2) {
      setActiveTab(activeTab + 1);
    }
    if (isRightSwipe && activeTab > 0) {
      setActiveTab(activeTab - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // 福岡県8ブロック情報
  const fukuokaBlocks = [
    {
      id: 'kyochiku',
      title: '京築ブロック',
      branches: ['行橋支部', '苅田支部', '豊前支部']
    },
    {
      id: 'kitakyushu',
      title: '北九州ブロック',
      branches: ['北九州支部']
    },
    {
      id: 'chikuho',
      title: '筑豊ブロック',
      branches: ['中遠支部', '直鞍支部', '嘉飯支部', '田川支部']
    },
    {
      id: 'higashi-fukuoka',
      title: '東福岡ブロック',
      branches: ['古賀支部', '糟屋支部', '宗像支部']
    },
    {
      id: 'fukuoka',
      title: '福岡ブロック',
      branches: ['福岡支部', '筑紫支部', '春日支部', '大野城支部']
    },
    {
      id: 'kita-chikugo',
      title: '北筑後ブロック',
      branches: ['朝倉支部', '八女支部', '浮羽支部', '小郡支部']
    },
    {
      id: 'kurume',
      title: '久留米ブロック',
      branches: ['久留米支部']
    },
    {
      id: 'minami-chikugo',
      title: '南筑後ブロック',
      branches: ['柳川支部', '筑後支部', '大牟田支部', '大川大木支部']
    }
  ];

  // カテゴリー情報
  const tournamentCategories = [
    { id: 'es', title: classSlugToDisplay('es') },
    { id: 'jhs', title: classSlugToDisplay('jhs') },
    { id: 'a-class', title: classSlugToDisplay('a-class') },
    { id: 'b-class', title: classSlugToDisplay('b-class') },
    { id: 'c-class', title: classSlugToDisplay('c-class') },
    { id: 'girls', title: classSlugToDisplay('girls') },
    { id: 'others', title: classSlugToDisplay('others') },
  ];

  return (
    <section className={styles.tournamentSection} data-tournament-section>
      {/* SP用タブナビゲーション */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tabButton} ${activeTab === 0 ? styles.active : ''}`}
          onClick={() => setActiveTab(0)}
        >
          大会情報
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 1 ? styles.active : ''}`}
          onClick={() => setActiveTab(1)}
        >
          各地区
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 2 ? styles.active : ''}`}
          onClick={() => setActiveTab(2)}
        >
          カテゴリ
        </button>
      </div>

      <div
        className={styles.cardContainer}
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={styles.cardsWrapper}
          style={{ transform: `translateX(calc(-${activeTab * 100}vw + ${activeTab * 24}px))` }}
        >
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>最近の大会</h2>
              <span>RECENT TOURNAMENTS</span>
            </div>
            <div className={styles.newsList}>
              {error ? (
                <p className={styles.errorMessage}>{error}</p>
              ) : tournaments.length === 0 ? (
                <p className={styles.noData}>大会情報はありません</p>
              ) : (
                tournaments.slice(0, 5).map((item) => {
                  // 表示する大会名（略称があれば略称、なければフルネーム）
                  let displayName = item.nameRyaku || item.title;

                  // 13文字以内に制限
                  if (displayName.length > 13) {
                    displayName = displayName.substring(0, 13) + '...';
                  }

                  // 日付を「YYYY/M/D~」形式で表示
                  let displayDate = '';
                  if (item.startDate) {
                    const startDate = new Date(item.startDate);
                    const year = startDate.getFullYear();
                    const month = startDate.getMonth() + 1;
                    const day = startDate.getDate();
                    displayDate = `${year}/${month}/${day}~`;
                  }

                  return (
                    <div
                      key={item.id}
                      className={styles.newsItem}
                    >
                      <div className={styles.itemContent}>
                        <span className={styles.itemDate}>
                          {displayDate}
                        </span>
                        <span className={styles.itemTitle}>{displayName}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>大会情報</h2>
              <span>TOURNAMENT INFORMATION</span>
            </div>
            <div className={styles.list}>
              {fukuokaBlocks.map((block) => (
                <Link
                  key={block.id}
                  href={`/tournaments/block/${block.id}`}
                  className={styles.listItem}
                >
                  <span className={styles.categoryTitle}>{block.title}</span>
                  <span className={styles.arrow}>→</span>
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>カテゴリー</h2>
              <span>CATEGORY</span>
            </div>
            <div className={styles.list}>
              {tournamentCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/tournaments/class/${category.id}`}
                  className={styles.listItem}
                >
                  <span className={styles.categoryTitle}>{category.title}</span>
                  <span className={styles.arrow}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
