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

export default function Umpire({ tournaments = [] }) {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>審判員</h1>
            <span>UMPIRE</span>
          </div>

          <div className={styles.content}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>審判員制度について</h2>
            <p style={{ margin: '16px 0' }}>福岡県軟式野球連盟では、公正な試合運営のために審判員制度を設けています。</p>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>審判員資格</h2>

            <h3 style={{ fontSize: '20px', fontWeight: 600, margin: '32px 0 12px' }}>資格の種類</h3>
            <ul style={{ margin: '16px 0', paddingLeft: '24px' }}>
              <li style={{ margin: '8px 0' }}>公認審判員</li>
              <li style={{ margin: '8px 0' }}>上級審判員</li>
              <li style={{ margin: '8px 0' }}>一級審判員</li>
              <li style={{ margin: '8px 0' }}>二級審判員</li>
              <li style={{ margin: '8px 0' }}>三級審判員</li>
            </ul>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>審判員講習会</h2>
            <p style={{ margin: '16px 0' }}>審判員の資格取得や技術向上のため、定期的に講習会を開催しています。</p>

            <h3 style={{ fontSize: '20px', fontWeight: 600, margin: '32px 0 12px' }}>講習内容</h3>
            <ul style={{ margin: '16px 0', paddingLeft: '24px' }}>
              <li style={{ margin: '8px 0' }}>ルール講習</li>
              <li style={{ margin: '8px 0' }}>実技講習</li>
              <li style={{ margin: '8px 0' }}>シグナル確認</li>
              <li style={{ margin: '8px 0' }}>審判資格試験</li>
            </ul>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>審判員登録について</h2>
            <p style={{ margin: '16px 0' }}>審判員として活動するには、福岡県軟式野球連盟への登録が必要です。</p>

            <div style={{ background: '#f8f9fa', padding: '20px', borderLeft: '4px solid #0066cc', margin: '24px 0' }}>
              <p style={{ margin: 0 }}><strong>審判員に関するお問い合わせ</strong></p>
              <p style={{ margin: '8px 0 0' }}>講習会の日程や審判員登録については、お問い合わせフォームよりご連絡ください。</p>
            </div>

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
