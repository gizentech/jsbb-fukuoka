import React from 'react';
import styles from './RegistrationStatus.module.css';

export default function RegistrationStatus() {
  const registrationData = [
    { category: '学童', people: 1240, teams: 124 },
    { category: '少年', people: 1580, teams: 158 },
    { category: 'A級', people: 1120, teams: 112 },
    { category: 'B級', people: 1360, teams: 136 },
    { category: 'C級', people: 1050, teams: 105 },
    { category: 'その他', people: 1200, teams: 120 },
  ];

  return (
    <div className={styles.registrationCard}>
      <div className={styles.cardHeader}>
        <h2>登録状況</h2>
        <span>REGISTRATION</span>
      </div>
      <div className={styles.teamCountGrid}>
        {registrationData.map((item, index) => (
          <div key={index} className={styles.teamCountCard}>
            <h3>{item.category}</h3>
            <p className={styles.teamCount}>
              <span className={styles.countNumber}>{item.people.toLocaleString()}</span>
              <span className={styles.countUnit}>人</span>
              <span className={styles.countSeparator}>／</span>
              <span className={styles.countNumber}>{item.teams}</span>
              <span className={styles.countUnit}>チーム</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
