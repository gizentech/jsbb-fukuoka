import Link from 'next/link';
import styles from './TournamentSidebar.module.css';
import { classDisplayToSlug, classSlugToDisplay } from '../../utils/classConvert';

export default function TournamentSidebar({ tournaments = [], title = '関連する大会' }) {
  if (!tournaments || tournaments.length === 0) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <h3 className={styles.sidebarTitle}>{title}</h3>
          <p className={styles.noData}>関連する大会情報がありません</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarInner}>
        <h3 className={styles.sidebarTitle}>{title}</h3>
        <ul className={styles.tournamentList}>
          {tournaments.map((tournament, index) => {
            // URLを生成
            const classSlug = tournament.classes && tournament.classes.length > 0
              ? classDisplayToSlug(tournament.classes[0])
              : 'others';
            const areaSlug = tournament.area
              ? tournament.area.replace(/支部/g, '').toLowerCase()
              : 'unknown';
            const yyyy = tournament.yyyy || tournament.year || '0000';
            const torDataId = tournament.torDataId || tournament.id;

            // yearListがtrueの場合は年度リストページへ、それ以外は詳細ページへ
            const url = tournament.yearList
              ? `/tournaments/tor/${torDataId}`
              : `/tournaments/${encodeURIComponent(tournament.classes?.[0] || '')}/${encodeURIComponent(tournament.area || '')}/${torDataId}/${yyyy}`;

            return (
              <li key={tournament.id || index} className={styles.tournamentItem}>
                <Link href={url} className={styles.tournamentLink}>
                  <div className={styles.tournamentInfo}>
                    {tournament.year && (
                      <span className={styles.tournamentYear}>{tournament.year}年度</span>
                    )}
                    <span className={styles.tournamentTitle}>
                      {tournament.area && `${tournament.area} `}
                      {tournament.title1 || tournament.title}
                      {tournament.title2 && ` ${tournament.title2}`}
                    </span>
                    {tournament.classes && tournament.classes.length > 0 && (
                      <span className={styles.tournamentClass}>
                        {tournament.classes.map(c => typeof c === 'object' ? c.label : classSlugToDisplay(c)).join('・')}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
