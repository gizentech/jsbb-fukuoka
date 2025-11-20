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

export default function Terms({ tournaments = [] }) {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>ホームページについて</h1>
            <span>ABOUT THIS WEBSITE</span>
          </div>

          <div className={styles.content}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>運営管理</h2>
            <div style={{ margin: '16px 0', lineHeight: '1.8' }}>
              <p style={{ margin: '16px 0' }}>
                一般社団法人福岡県軟式野球連盟<br />
                久留米市野球連盟<br />
                <br />
                Fukuoka Rubber Baseball Association.<br />
                Kurume Baseball Association
              </p>
              <p style={{ margin: '16px 0' }}>
                所在地<br />
                〒830-0003<br />
                福岡県久留米市東櫛原町173
              </p>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>制作情報</h2>
            <div style={{ margin: '16px 0', lineHeight: '1.8' }}>
              <p style={{ margin: '16px 0' }}>
                一般社団法人福岡県軟式野球連盟<br />
                久留米市野球連盟<br />
                開発窓口：白石　稜
              </p>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>システム情報</h2>
            <div style={{ margin: '16px 0', lineHeight: '1.8' }}>
              <p style={{ margin: '16px 0' }}>
                フレームワーク：Next.js<br />
                開発言語：JavaScript/React<br />
                最終更新日：{new Date().toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
        </div>
        <BlockSidebar tournaments={tournaments} />
      </main>
      <Footer />
    </div>
  );
}
