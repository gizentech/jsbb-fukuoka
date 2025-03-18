import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import AdminLayout from '@/components/AdminLayout/AdminLayout';
import Link from 'next/link';
import styles from '@/styles/admin/Tournaments.module.css';

export default function TournamentDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const q = query(collection(db, 'tournaments'), orderBy('tournamentId'));
      const querySnapshot = await getDocs(q);
      const tournamentsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title1: data.title1 || '',
          title2: data.title2 || '',
          class: data.class || [],
          updates: data.updates?.map(update => ({
            count: update.count || '',
            year: update.year || '',
            updatedAt: update.updatedAt 
              ? new Date(update.updatedAt.seconds * 1000).toISOString()
              : null
          })) || []
        };
      });
      setTournaments(tournamentsData);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const classNames = {
    'elementary': '学童',
    'junior': '少年',
    'adult-a': '一般A級',
    'adult-b': '一般B級',
    'adult-c': '一般C級',
    '学童': '学童',
  };

  const getTotalRounds = () => {
    return tournaments.reduce((total, t) => total + (t.updates?.length || 0), 0);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className={styles.loading}>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>大会情報管理</h1>
          <div className={styles.actions}>
            <Link href="/admin/tournaments-create" className={styles.button}>
              新規大会登録
            </Link>
            <Link href="/admin/tournaments-edit" className={styles.button}>
              大会回編集
            </Link>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.card}>
            <h3>登録大会数</h3>
            <p className={styles.number}>{tournaments.length}</p>
          </div>
          <div className={styles.card}>
            <h3>総開催回数</h3>
            <p className={styles.number}>{getTotalRounds()}</p>
          </div>
        </div>

        <div className={styles.recentUpdates}>
          <h2>最近の大会</h2>
          <div className={styles.table}>
            <table>
              <thead>
                <tr>
                  <th>大会名</th>
                  <th>最新開催</th>
                  <th>クラス区分</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.slice(0, 5).map(tournament => {
                  const latestUpdate = tournament.updates?.sort((a, b) => 
                    parseInt(b.year) - parseInt(a.year) || 
                    parseInt(b.count) - parseInt(a.count)
                  )[0];

                  return (
                    <tr key={tournament.id}>
                      <td>{tournament.title1} {tournament.title2}</td>
                      <td>
                        {latestUpdate 
                          ? `第${latestUpdate.count}回`
                          : '-'
                        }
                      </td>
                      <td>
                        {tournament.class && tournament.class.length > 0
                          ? tournament.class.map(c => classNames[c] || c).join(', ')
                          : '-'
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}