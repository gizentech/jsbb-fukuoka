import React from 'react';
import Link from 'next/link';
import styles from './RegistrationStatus.module.css';

export default function RegistrationStatus() {
  const registrationData = [
    { category: '学童', people: '--', teams: 305 },
    { category: '少年', people: '--', teams: 240 },
    { category: 'A級', people: '--', teams: 43 },
    { category: 'B級', people: '--', teams: 119 },
    { category: 'C級', people: '--', teams: 189 },
    { category: 'その他', people: '--', teams: 25 },
  ];

  const totalTeams = registrationData.reduce((sum, item) => sum + item.teams, 0);

  return (
    <Link href="/team-registration" className={styles.cardLink}>
      <div className={styles.registrationCard}>
        <div className={styles.cardHeader}>
          <h2>登録状況</h2>
          <span>REGISTRATION</span>
        </div>
        <div className={styles.teamCountGrid}>
          {/* 全登録数 */}
          <div className={styles.totalCard}>
            <h3>福岡県軟式野球連盟</h3>
            <p className={styles.totalCount}>
              <span className={styles.totalNumber}>{totalTeams}</span>
              <span className={styles.totalUnit}>チーム</span>
            </p>
          </div>

          {/* 各カテゴリー */}
          {registrationData.map((item, index) => (
            <div key={index} className={styles.teamCountCard}>
              <h3>{item.category}</h3>
              <p className={styles.teamCount}>
                <span className={styles.countNumber}>{item.people}</span>
                <span className={styles.countUnit}>人</span>
                <span className={styles.countSeparator}>／</span>
                <span className={styles.countNumber}>{item.teams}</span>
                <span className={styles.countUnit}>チーム</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
