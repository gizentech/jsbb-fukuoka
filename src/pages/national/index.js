import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import BlockSidebar from '../../components/BlockSidebar/BlockSidebar';
import styles from '../../styles/Page.module.css';
import { signInWithRedirect } from 'firebase/auth';
import { skeletonClasses } from '@mui/material';
import TorList from '../tournaments/torlist/[id]';

export async function getServerSideProps() {
  try {
    const SPACE_UID = process.env.NEWT_SPACE_UID;
    const TOKEN = process.env.NEWT_API_TOKEN;
    const TOURNAMENT_APP_UID = 'fukuoka-tournament';

    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    const tournamentUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${TOURNAMENT_APP_UID}/fukuoka-tor?limit=100&order=-_sys.createdAt&depth=2`;
    let tournamentsData = [];

    try {
      const tournamentResponse = await fetch(tournamentUrl, { headers });

      if (tournamentResponse.ok) {
        const tournamentResult = await tournamentResponse.json();

        if (tournamentResult.items && tournamentResult.items.length > 0) {
          console.log('Raw items count:', tournamentResult.items.length);
          console.log('Sample item:', tournamentResult.items[0]);

          const allTournaments = tournamentResult.items.map(item => {
            const title = item['fukuoka-tor-name-ryaku'] || '大会';
            console.log('Tournament title:', title, 'ID:', item._id);
            return {
              id: item._id,
              title: title,
              startDate: item['tor-start'] || null,
              endDate: item['end-tor'] || null,
              date: item['tor-start'] || ''
            };
          });

          // 最新5件を取得
          tournamentsData = allTournaments
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
            .slice(0, 5);
            
          console.log('Final tournamentsData:', tournamentsData);
        } else {
          console.log('No tournament items found');
        }
      } else {
        console.log('Tournament response not OK:', tournamentResponse.status);
      }
    } catch (error) {
      console.error('Tournament API Error:', error);
    }

    return {
      props: {
        tournaments: tournamentsData
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        tournaments: []
      }
    };
  }
}

export default function National({ tournaments = [] }) {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>全国大会での活躍</h1>
            <span>NATIONAL ACHIEVEMENTS</span>
          </div>

          <div className={styles.content}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>全国大会出場実績</h2>
          <p style={{ margin: '16px 0' }}>福岡県軟式野球連盟所属チームの全国大会での活躍をご紹介します。</p>

          <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>天皇賜杯全日本軟式野球大会</h2>
          <p style={{ margin: '16px 0' }}>軟式野球の最高峰である天皇賜杯全日本軟式野球大会において、福岡県代表チームが数々の実績を残しています。</p>

          <h3 style={{ fontSize: '20px', fontWeight: 600, margin: '32px 0 12px' }}>主な成績</h3>
          <ul style={{ margin: '16px 0', paddingLeft: '24px' }}>
            <li style={{ margin: '8px 0' }}>優勝：○回</li>
            <li style={{ margin: '8px 0' }}>準優勝：○回</li>
            <li style={{ margin: '8px 0' }}>ベスト4：○回</li>
            <li style={{ margin: '8px 0' }}>ベスト8：○回</li>
          </ul>

          <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>国民体育大会</h2>
          <p style={{ margin: '16px 0' }}>国民体育大会軟式野球競技においても、福岡県代表は好成績を収めています。</p>

          <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>全日本壮年軟式野球大会</h2>
          <p style={{ margin: '16px 0' }}>壮年の部においても、福岡県代表チームが全国大会で活躍しています。</p>

          <div style={{ background: '#f8f9fa', padding: '20px', borderLeft: '4px solid #0066cc', margin: '24px 0' }}>
            <p style={{ margin: 0 }}><strong>詳細な記録や写真は、随時更新予定です。</strong></p>
          </div>
          </div>
        </div>
        <BlockSidebar tournaments={tournaments} />
      </main>
      <Footer />
    </div>
  );
}
