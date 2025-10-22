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

export default function About({ tournaments = [] }) {
  const fukuokaBlocks = [
    { name: '京築ブロック', branches: ['行橋支部', '苅田支部', '豊前支部'] },
    { name: '北九州ブロック', branches: ['北九州支部'] },
    { name: '筑豊ブロック', branches: ['中遠支部', '直鞍支部', '嘉飯支部', '田川支部'] },
    { name: '東福岡ブロック', branches: ['古賀支部', '糟屋支部', '宗像支部'] },
    { name: '福岡ブロック', branches: ['福岡支部', '筑紫支部', '春日支部', '大野城支部'] },
    { name: '北筑後ブロック', branches: ['朝倉支部', '八女支部', '浮羽支部', '小郡支部'] },
    { name: '久留米ブロック', branches: ['久留米支部'] },
    { name: '南筑後ブロック', branches: ['柳川支部', '筑後支部', '大牟田支部', '大川大木支部'] }
  ];

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>連盟概要</h1>
            <span>ABOUT US</span>
          </div>

          <div className={styles.content}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>組織名</h2>
            <p style={{ margin: '16px 0', lineHeight: '1.8' }}>公益財団法人 全日本軟式野球連盟 福岡県支部</p>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>所在地</h2>
            <p style={{ margin: '16px 0', lineHeight: '1.8' }}>
              〒812-0011<br />
              福岡県福岡市博多区博多駅前3-25-24<br />
              八百治ビル5F
            </p>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>設立目的</h2>
            <p style={{ margin: '16px 0', lineHeight: '1.8' }}>軟式野球の健全な普及発展を図り、もってスポーツの振興とわが国の文化の向上に寄与することを目的としています。</p>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>主な事業</h2>
            <ul style={{ margin: '16px 0', paddingLeft: '24px', lineHeight: '1.8' }}>
              <li style={{ margin: '8px 0' }}>軟式野球の指導・普及に関する事業</li>
              <li style={{ margin: '8px 0' }}>軟式野球競技会の開催</li>
              <li style={{ margin: '8px 0' }}>軟式野球の選手・指導者の育成</li>
              <li style={{ margin: '8px 0' }}>軟式野球に関する調査研究</li>
              <li style={{ margin: '8px 0' }}>その他目的達成に必要な事業</li>
            </ul>

            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>組織構成</h2>
            <p style={{ margin: '16px 0', lineHeight: '1.8', marginBottom: '24px' }}>福岡県支部は、県内を8つのブロックに分け、各ブロックに支部を設置しています。</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              {fukuokaBlocks.map((block, index) => (
                <div key={index} style={{
                  padding: '20px',
                  background: '#f8f9fa',
                  border: '1px solid #e9ecef'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    color: '#333',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #0066cc'
                  }}>{block.name}</h3>
                  <ul style={{
                    fontSize: '14px',
                    lineHeight: '1.8',
                    color: '#666',
                    paddingLeft: '0',
                    listStyle: 'none',
                    margin: '0'
                  }}>
                    {block.branches.map((branch, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>・{branch}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <BlockSidebar tournaments={tournaments} />
      </main>
      <Footer />
    </div>
  );
}
