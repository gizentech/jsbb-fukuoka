import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import BlockSidebar from '../../components/BlockSidebar/BlockSidebar';
import styles from '../../styles/Page.module.css';

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

          // 最新5件を取得
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

export default function Tournaments({ tournaments = [] }) {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
        <div style={{ textAlign: 'center', marginBottom: '48px', paddingBottom: '24px', borderBottom: '2px solid #eee' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>大会情報</h1>
          <span style={{ fontSize: '14px', color: '#999', textTransform: 'uppercase', letterSpacing: '2px' }}>TOURNAMENTS</span>
        </div>

        <div style={{ lineHeight: 1.8, color: '#333' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>開催予定の大会</h2>
          <p style={{ margin: '16px 0' }}>福岡県軟式野球連盟が主催・共催する大会の情報を掲載しています。</p>

          <div style={{ background: '#f8f9fa', padding: '20px', borderLeft: '4px solid #0066cc', margin: '24px 0' }}>
            <p style={{ margin: 0 }}><strong>最新の大会情報は、トップページの「大会情報」セクションをご覧ください。</strong></p>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>主要大会一覧</h2>

          <h3 style={{ fontSize: '20px', fontWeight: 600, margin: '32px 0 12px' }}>一般の部</h3>
          <ul style={{ margin: '16px 0', paddingLeft: '24px' }}>
            <li style={{ margin: '8px 0' }}>福岡県軟式野球大会</li>
            <li style={{ margin: '8px 0' }}>天皇賜杯全日本軟式野球大会福岡県予選</li>
            <li style={{ margin: '8px 0' }}>国民体育大会軟式野球競技福岡県予選</li>
            <li style={{ margin: '8px 0' }}>全日本実業団軟式野球大会福岡県予選</li>
          </ul>

          <h3 style={{ fontSize: '20px', fontWeight: 600, margin: '32px 0 12px' }}>壮年の部</h3>
          <ul style={{ margin: '16px 0', paddingLeft: '24px' }}>
            <li style={{ margin: '8px 0' }}>全日本壮年軟式野球大会福岡県予選</li>
            <li style={{ margin: '8px 0' }}>福岡県壮年軟式野球大会</li>
          </ul>

          <h3 style={{ fontSize: '20px', fontWeight: 600, margin: '32px 0 12px' }}>還暦の部</h3>
          <ul style={{ margin: '16px 0', paddingLeft: '24px' }}>
            <li style={{ margin: '8px 0' }}>全日本還暦軟式野球大会福岡県予選</li>
          </ul>

          <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>大会参加について</h2>
          <p style={{ margin: '16px 0' }}>大会に参加するには、福岡県軟式野球連盟への選手登録と所属チームの加盟が必要です。</p>

          <div style={{ margin: '24px 0' }}>
            <a href="/registration" style={{ display: 'inline-block', padding: '12px 24px', background: '#0066cc', color: '#fff', textDecoration: 'none', borderRadius: '4px', marginRight: '8px' }}>選手登録申請</a>
            <a href="/application" style={{ display: 'inline-block', padding: '12px 24px', background: '#0066cc', color: '#fff', textDecoration: 'none', borderRadius: '4px', marginRight: '8px' }}>大会申込書</a>
          </div>
        </div>
        </div>
        <BlockSidebar tournaments={tournaments} />
      </main>
      <Footer />
    </div>
  );
}
