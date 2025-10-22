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
            const title = item['fukuoka-tor-name-ryaku'] || '大会';
            return {
              id: item._id,
              title: title,
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

export default function Application({ tournaments = [] }) {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>大会申込書</h1>
            <span>TOURNAMENT APPLICATION</span>
          </div>

          <div className={styles.content}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>大会申込について</h2>
            <p style={{ margin: '16px 0' }}>福岡県軟式野球連盟主催の大会に参加するには、事前の申込が必要です。</p>

            <div style={{ background: '#f8f9fa', padding: '20px', borderLeft: '4px solid #0066cc', margin: '24px 0' }}>
              <p style={{ margin: 0 }}><strong>各大会の申込書は下記よりダウンロードしてください</strong></p>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>申込手順</h2>
            <ol style={{ margin: '16px 0', paddingLeft: '24px' }}>
              <li style={{ margin: '8px 0' }}>該当する大会の申込書をダウンロード</li>
              <li style={{ margin: '8px 0' }}>必要事項を記入</li>
              <li style={{ margin: '8px 0' }}>所属支部へ提出</li>
              <li style={{ margin: '8px 0' }}>参加費の納入</li>
            </ol>

            <div style={{ background: '#fff3cd', padding: '20px', borderLeft: '4px solid #ffc107', margin: '24px 0' }}>
              <p style={{ margin: 0 }}><strong>重要</strong></p>
              <p style={{ margin: '8px 0 0' }}>申込締切日を過ぎた場合、参加できない可能性があります。余裕をもって申込手続きを行ってください。</p>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>申込書一覧</h2>
            <p style={{ margin: '16px 0' }}>現在、申込書の準備中です。各大会の詳細ページをご確認ください。</p>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>お問い合わせ</h2>
            <p style={{ margin: '16px 0' }}>大会申込に関するご不明な点は、お問い合わせフォームよりご連絡ください。</p>

            <div style={{ margin: '24px 0' }}>
              <a href="/contact" style={{ display: 'inline-block', padding: '12px 24px', background: '#0066cc', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>お問い合わせ</a>
            </div>
          </div>
        </div>
        <BlockSidebar tournaments={tournaments} />
      </main>
      <Footer />
    </div>
  );
}
