import React from 'react';
import Link from 'next/link';
import styles from './NewsSection.module.css';

export default function NewsSection({ news = [], error = null }) {
  return (
    <div className={styles.latestInfoCard}>
      <div className={styles.cardHeader}>
        <h2>お知らせ</h2>
        <span>NEWS</span>
      </div>

      <div className={styles.newsList}>
        {error ? (
          <p className={styles.errorMessage}>{error}</p>
        ) : news.length === 0 ? (
          <p className={styles.noData}>お知らせはありません</p>
        ) : (
          news.slice(0, 6).map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.id}`}
              className={`${styles.newsItem} ${styles.infoNewsItem}`}
            >
              <div className={styles.itemContent}>
                <span className={styles.importantBadgeWrapper}>
                  {item.important && (
                    <span className={styles.importantBadge}>重要</span>
                  )}
                </span>
                <span className={styles.itemDate}>
                  {new Date(item.createdAt).toLocaleDateString('ja-JP')}
                </span>
                <div className={styles.classTagWrapper}>
                  {item.class && item.class.length > 0 && (
                    <span className={styles.classTag}>
                      {typeof item.class[0] === 'object' ? item.class[0].label : item.class[0]}
                    </span>
                  )}
                </div>
                <span className={styles.itemTitle}>{item.title}</span>
              </div>
              <span className={styles.arrow}>→</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
