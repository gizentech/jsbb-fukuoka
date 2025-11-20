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

export default function Registration({ tournaments = [] }) {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>軟式野球をはじめる方へ</h1>
            <span>PLAYER REGISTRATION</span>
          </div>

          <div className={styles.content}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>選手登録について</h2>
            <p style={{ margin: '16px 0' }}>福岡県軟式野球連盟主催の大会に出場するには、選手登録が必要です。</p>

            <div style={{ background: '#f8f9fa', padding: '20px', borderLeft: '4px solid #0066cc', margin: '24px 0' }}>
              <p style={{ margin: 0 }}><strong>オンライン登録システムをご利用ください</strong></p>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>登録の種類</h2>

            <h3 style={{ fontSize: '20px', fontWeight: 600, margin: '32px 0 12px' }}>一般の部</h3>
            <ul style={{ margin: '16px 0', paddingLeft: '24px' }}>
              <li style={{ margin: '8px 0' }}>年齢制限：満15歳以上</li>
              <li style={{ margin: '8px 0' }}>登録期間：4月1日〜翌年3月31日</li>
            </ul>

            <h3 style={{ fontSize: '20px', fontWeight: 600, margin: '32px 0 12px' }}>壮年の部</h3>
            <ul style={{ margin: '16px 0', paddingLeft: '24px' }}>
              <li style={{ margin: '8px 0' }}>年齢制限：満40歳以上</li>
              <li style={{ margin: '8px 0' }}>登録期間：4月1日〜翌年3月31日</li>
            </ul>

            <h3 style={{ fontSize: '20px', fontWeight: 600, margin: '32px 0 12px' }}>還暦の部</h3>
            <ul style={{ margin: '16px 0', paddingLeft: '24px' }}>
              <li style={{ margin: '8px 0' }}>年齢制限：満60歳以上</li>
              <li style={{ margin: '8px 0' }}>登録期間：4月1日〜翌年3月31日</li>
            </ul>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>登録方法</h2>
            <p style={{ margin: '16px 0' }}>日本軟式野球連盟の「野球競技者登録システム」を利用して登録を行います。</p>

            <ol style={{ margin: '16px 0', paddingLeft: '24px' }}>
              <li style={{ margin: '8px 0' }}>野球競技者登録システムにアクセス</li>
              <li style={{ margin: '8px 0' }}>アカウント作成（初回のみ）</li>
              <li style={{ margin: '8px 0' }}>チーム選択</li>
              <li style={{ margin: '8px 0' }}>選手情報入力</li>
              <li style={{ margin: '8px 0' }}>登録料の支払い</li>
              <li style={{ margin: '8px 0' }}>審査・承認</li>
            </ol>

            <div style={{ background: '#fff3cd', padding: '20px', borderLeft: '4px solid #ffc107', margin: '24px 0' }}>
              <p style={{ margin: 0 }}><strong>重要</strong></p>
              <p style={{ margin: '8px 0 0' }}>登録には数日かかる場合があります。大会出場予定の方は、余裕をもって登録手続きを行ってください。</p>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>登録料</h2>
            <ul style={{ margin: '16px 0', paddingLeft: '24px' }}>
              <li style={{ margin: '8px 0' }}>一般：年間○○○○円</li>
              <li style={{ margin: '8px 0' }}>壮年：年間○○○○円</li>
              <li style={{ margin: '8px 0' }}>還暦：年間○○○○円</li>
            </ul>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>登録システムへのアクセス</h2>
            <div style={{ margin: '24px 0' }}>
              <a href="https://jsbb-entry.com/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '12px 24px', background: '#0066cc', color: '#fff', textDecoration: 'none', borderRadius: '4px', marginRight: '8px' }}>野球競技者登録システム</a>
              <a href="/registration-system" style={{ display: 'inline-block', padding: '12px 24px', background: '#0066cc', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>システム詳細</a>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>お問い合わせ</h2>
            <p style={{ margin: '16px 0' }}>選手登録に関するご不明な点は、お問い合わせフォームよりご連絡ください。</p>

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
