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
            <h1>福岡県連盟登録及び加入申込書</h1>
            <span>REGISTRATION & APPLICATION FORMS</span>
          </div>

          <div className={styles.content}>
            <div style={{ background: '#f8f9fa', padding: '20px', borderLeft: '4px solid #0066cc', margin: '24px 0' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>全軟登録票　+　県連加入申込書（登録者の年齢によって）　+　県連登録名簿　を１セットにしてご提出ください。</p>
            </div>

            <div style={{ background: '#fff3cd', padding: '20px', borderLeft: '4px solid #ffc107', margin: '24px 0' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>県連加入申込書該当する年齢</p>
              <ul style={{ margin: '12px 0 0', paddingLeft: '24px' }}>
                <li style={{ margin: '4px 0' }}><strong>還暦</strong>　60歳以上</li>
                <li style={{ margin: '4px 0' }}><strong>成年</strong>　40歳以上</li>
                <li style={{ margin: '4px 0' }}><strong>実年</strong>　50歳以上</li>
              </ul>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>全軟登録票</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', margin: '16px 0' }}>
              <a href="#" style={{ display: 'block', padding: '12px 20px', background: '#6c757d', color: '#fff', textDecoration: 'none', textAlign: 'center' }}>
                令和7年度【支部】チーム登録名簿
              </a>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>県連加入申込書</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', margin: '16px 0' }}>
              <a href="#" style={{ display: 'block', padding: '12px 20px', background: '#6c757d', color: '#fff', textDecoration: 'none', textAlign: 'center' }}>
                令和7年度 - 学童
              </a>
              <a href="#" style={{ display: 'block', padding: '12px 20px', background: '#6c757d', color: '#fff', textDecoration: 'none', textAlign: 'center' }}>
                令和7年度 - 少年
              </a>
              <a href="#" style={{ display: 'block', padding: '12px 20px', background: '#6c757d', color: '#fff', textDecoration: 'none', textAlign: 'center' }}>
                令和7年度 - 一般
              </a>
              <a href="#" style={{ display: 'block', padding: '12px 20px', background: '#6c757d', color: '#fff', textDecoration: 'none', textAlign: 'center' }}>
                令和7年度 - 成年
              </a>
              <a href="#" style={{ display: 'block', padding: '12px 20px', background: '#6c757d', color: '#fff', textDecoration: 'none', textAlign: 'center' }}>
                令和7年度 - 実年
              </a>
              <a href="#" style={{ display: 'block', padding: '12px 20px', background: '#6c757d', color: '#fff', textDecoration: 'none', textAlign: 'center' }}>
                令和7年度 - 還暦
              </a>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>チームスポーツ保険</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', margin: '16px 0' }}>
              <a href="#" style={{ display: 'block', padding: '12px 20px', background: '#6c757d', color: '#fff', textDecoration: 'none', textAlign: 'center' }}>
                令和7年度_スポーツ保険　チーム用
              </a>
              <a href="#" style={{ display: 'block', padding: '12px 20px', background: '#6c757d', color: '#fff', textDecoration: 'none', textAlign: 'center' }}>
                令和7年度_スポーツ保険　役員・審判用
              </a>
              <a href="#" style={{ display: 'block', padding: '12px 20px', background: '#6c757d', color: '#fff', textDecoration: 'none', textAlign: 'center' }}>
                令和7年度_九連補償制度役員審判員名簿
              </a>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>県連登録名簿</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', margin: '16px 0' }}>
              <a href="#" style={{ display: 'block', padding: '12px 20px', background: '#6c757d', color: '#fff', textDecoration: 'none', textAlign: 'center' }}>
                令和7年度_個人登録名簿（少年）
              </a>
              <a href="#" style={{ display: 'block', padding: '12px 20px', background: '#6c757d', color: '#fff', textDecoration: 'none', textAlign: 'center' }}>
                令和7年度_個人登録名簿（学童）
              </a>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>支部届</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', margin: '16px 0' }}>
              <a href="#" style={{ display: 'block', padding: '12px 20px', background: '#6c757d', color: '#fff', textDecoration: 'none', textAlign: 'center' }}>
                令和7年度_支部届
              </a>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>令和7年度 福岡県大会球場関係報告書</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', margin: '16px 0' }}>
              <a href="#" style={{ display: 'block', padding: '12px 20px', background: '#6c757d', color: '#fff', textDecoration: 'none', textAlign: 'center' }}>
                令和7年度 福岡県大会球場関係報告書
              </a>
            </div>
          </div>
        </div>
        <BlockSidebar tournaments={tournaments} />
      </main>
      <Footer />
    </div>
  );
}
