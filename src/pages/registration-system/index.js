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

export default function RegistrationSystem({ tournaments = [] }) {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>野球競技者登録システム</h1>
            <span>REGISTRATION SYSTEM</span>
          </div>

          <div className={styles.content}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>野球競技者登録システムについて</h2>
            <p style={{ margin: '16px 0' }}>日本軟式野球連盟が運営する「野球競技者登録システム」を利用して、選手登録を行うことができます。</p>

            <div style={{ background: '#f8f9fa', padding: '20px', borderLeft: '4px solid #0066cc', margin: '24px 0' }}>
              <p style={{ margin: 0 }}><strong>オンラインで簡単に選手登録が可能です</strong></p>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>システムの特徴</h2>
            <ul style={{ margin: '16px 0', paddingLeft: '24px' }}>
              <li style={{ margin: '8px 0' }}>24時間いつでも登録申請が可能</li>
              <li style={{ margin: '8px 0' }}>登録状況をリアルタイムで確認</li>
              <li style={{ margin: '8px 0' }}>データの一元管理</li>
              <li style={{ margin: '8px 0' }}>登録証明書の即時発行</li>
            </ul>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>登録の流れ</h2>
            <ol style={{ margin: '16px 0', paddingLeft: '24px' }}>
              <li style={{ margin: '8px 0' }}>野球競技者登録システムにアクセス</li>
              <li style={{ margin: '8px 0' }}>アカウント作成（初回のみ）</li>
              <li style={{ margin: '8px 0' }}>必要事項を入力</li>
              <li style={{ margin: '8px 0' }}>登録料の支払い</li>
              <li style={{ margin: '8px 0' }}>審査・承認</li>
              <li style={{ margin: '8px 0' }}>登録完了</li>
            </ol>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>登録料</h2>
            <p style={{ margin: '16px 0' }}>選手登録には、日本軟式野球連盟が定める登録料が必要です。</p>
            <ul style={{ margin: '16px 0', paddingLeft: '24px' }}>
              <li style={{ margin: '8px 0' }}>一般：年間○○○○円</li>
              <li style={{ margin: '8px 0' }}>壮年：年間○○○○円</li>
              <li style={{ margin: '8px 0' }}>還暦：年間○○○○円</li>
            </ul>

            <div style={{ background: '#fff3cd', padding: '20px', borderLeft: '4px solid #ffc107', margin: '24px 0' }}>
              <p style={{ margin: 0 }}><strong>重要なお知らせ</strong></p>
              <p style={{ margin: '8px 0 0' }}>登録申請から承認まで数日かかる場合があります。大会出場予定の方は、余裕をもって登録手続きを行ってください。</p>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>システムへのアクセス</h2>
            <div style={{ margin: '24px 0' }}>
              <a href="https://jsbb-entry.com/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '12px 24px', background: '#0066cc', color: '#fff', textDecoration: 'none', borderRadius: '4px', marginRight: '8px' }}>野球競技者登録システム</a>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>お問い合わせ</h2>
            <p style={{ margin: '16px 0' }}>システムの利用方法や登録に関するご質問は、お問い合わせフォームよりご連絡ください。</p>

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
