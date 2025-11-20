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

export default function Announcer({ tournaments = [] }) {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>アナウンス</h1>
            <span>ANNOUNCER</span>
          </div>

          <div className={styles.content}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>アナウンス担当について</h2>
            <p style={{ margin: '16px 0' }}>福岡県軟式野球連盟主催の大会では、試合を盛り上げるアナウンス担当を配置しています。</p>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>アナウンス業務内容</h2>
            <ul style={{ margin: '16px 0', paddingLeft: '24px' }}>
              <li style={{ margin: '8px 0' }}>試合開始前のアナウンス</li>
              <li style={{ margin: '8px 0' }}>選手紹介</li>
              <li style={{ margin: '8px 0' }}>試合中の実況</li>
              <li style={{ margin: '8px 0' }}>得点・イニングの案内</li>
              <li style={{ margin: '8px 0' }}>試合結果の発表</li>
              <li style={{ margin: '8px 0' }}>表彰式の司会進行</li>
            </ul>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>アナウンス担当者の募集</h2>
            <p style={{ margin: '16px 0' }}>福岡県軟式野球連盟では、大会でアナウンスを担当していただける方を募集しています。</p>

            <h3 style={{ fontSize: '20px', fontWeight: 600, margin: '32px 0 12px' }}>応募条件</h3>
            <ul style={{ margin: '16px 0', paddingLeft: '24px' }}>
              <li style={{ margin: '8px 0' }}>野球に関する基礎知識をお持ちの方</li>
              <li style={{ margin: '8px 0' }}>明瞭な発音ができる方</li>
              <li style={{ margin: '8px 0' }}>大会当日に参加可能な方</li>
              <li style={{ margin: '8px 0' }}>年齢・性別・経験不問</li>
            </ul>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>講習会の実施</h2>
            <p style={{ margin: '16px 0' }}>アナウンス担当者向けの講習会を定期的に開催しています。</p>

            <div style={{ background: '#f8f9fa', padding: '20px', borderLeft: '4px solid #0066cc', margin: '24px 0' }}>
              <p style={{ margin: 0 }}><strong>アナウンス担当に関するお問い合わせ</strong></p>
              <p style={{ margin: '8px 0 0' }}>募集情報や講習会の日程については、お問い合わせフォームよりご連絡ください。</p>
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
