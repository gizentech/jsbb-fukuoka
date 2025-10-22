import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import BlockSidebar from '../components/BlockSidebar/BlockSidebar';
import styles from '../styles/Page.module.css';

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
          const allTournaments = tournamentResult.items.map(item => {
            return {
              id: item._id,
              title: item['fukuoka-tor-name-ryaku'] || '大会',
              startDate: item['tor-start'] || null,
              endDate: item['end-tor'] || null,
              date: item['tor-start'] || ''
            };
          });

          tournamentsData = allTournaments
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
            .slice(0, 5);
        }
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

export default function Festival({ tournaments = [] }) {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>野球感謝祭</h1>
            <span>BASEBALL FESTIVAL</span>
          </div>

          <div className={styles.content}>
            <h2>野球感謝祭について</h2>
            <p>福岡県軟式野球連盟では、毎年野球関係者や支援者の皆様に感謝の気持ちを込めて「野球感謝祭」を開催しています。</p>

            <h2>開催内容</h2>
            <ul>
              <li>表彰式</li>
              <li>記念講演</li>
              <li>懇親会</li>
              <li>各種イベント</li>
            </ul>

            <h2>表彰について</h2>
            <p>福岡県軟式野球の発展に貢献された方々を表彰いたします。</p>

            <h3>表彰の種類</h3>
            <ul>
              <li>功労賞</li>
              <li>優秀選手賞</li>
              <li>優秀チーム賞</li>
              <li>特別賞</li>
            </ul>

            <h2>開催日程</h2>
            <div className={styles.infoBox}>
              <p><strong>開催日程は、お知らせページにて随時ご案内いたします。</strong></p>
            </div>
          </div>
        </div>
        <BlockSidebar tournaments={tournaments} />
      </main>
      <Footer />
    </div>
  );
}
