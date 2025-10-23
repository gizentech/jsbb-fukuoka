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

export default function History({ tournaments = [] }) {
  const historyData = [
    {
      year: '平成7年度',
      events: [
        { description: '一般660チーム、学童300チームが登録' }
      ]
    },
    {
      year: '平成17年2月',
      events: [
        { description: '三潴支部、城島支部が市町村合併により、久留米支部に編入' }
      ]
    },
    {
      year: '平成17年度',
      events: [
        { description: '一般717チーム、少年(中学)105チーム、学童325チームが登録' },
        { description: '登録審判員442人' }
      ]
    },
    {
      year: '平成18年2月',
      events: [
        { description: '朝倉支部、甘木市部が市町村合併により、新たに朝倉支部となる' }
      ]
    },
    {
      year: '平成19年2月',
      events: [
        { description: '小倉支部、八幡支部、戸畑支部、若松支部を統括し北九州支部となる' }
      ]
    },
    {
      year: '平成20年2月',
      events: [
        { description: '古賀支部より、糟屋支部が分離独立。県下24支部となる' }
      ]
    },
    {
      year: '平成26年度',
      events: [
        { description: '一般632チーム、少年233チーム、学童314チームが登録' }
      ]
    }
  ];

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>沿革</h1>
            <span>HISTORY</span>
          </div>

          <div className={styles.content}>
            <p style={{ margin: '0 0 32px', lineHeight: '1.8', color: '#666' }}>
              福岡県軟式野球連盟の歩みをご紹介します。市町村合併に伴う支部再編や、
              登録チーム数の推移など、当連盟の発展の歴史をご覧いただけます。
            </p>

            <div style={{ position: 'relative', paddingLeft: '40px' }}>
              {/* タイムライン線 */}
              <div style={{
                position: 'absolute',
                left: '15px',
                top: '0',
                bottom: '0',
                width: '2px',
                background: 'linear-gradient(to bottom, #3182ce, #e0e0e0)'
              }} />

              {historyData.map((item, index) => (
                <div key={index} style={{ position: 'relative', marginBottom: '40px' }}>
                  {/* タイムラインドット */}
                  <div style={{
                    position: 'absolute',
                    left: '-33px',
                    top: '4px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#3182ce',
                    border: '3px solid #fff',
                    boxShadow: '0 0 0 2px #3182ce'
                  }} />

                  {/* 年度 */}
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#333',
                    marginBottom: '12px',
                    display: 'inline-block',
                    background: '#f0f7ff',
                    padding: '4px 12px',
                    borderRadius: '4px'
                  }}>
                    {item.year}
                  </h2>

                  {/* イベント */}
                  <div style={{ marginTop: '12px' }}>
                    {item.events.map((event, eventIndex) => (
                      <div key={eventIndex} style={{
                        background: '#fff',
                        padding: '16px',
                        marginBottom: '12px',
                        borderLeft: '4px solid #3182ce',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        lineHeight: '1.8',
                        color: '#555'
                      }}>
                        {event.description}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '48px',
              padding: '24px',
              background: '#f8f9fa',
              borderLeft: '4px solid #3182ce',
              borderRadius: '4px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#333' }}>
                組織構成の変遷
              </h3>
              <p style={{ lineHeight: '1.8', color: '#666', margin: '0' }}>
                市町村合併に伴い、福岡県内の支部編成も変化してきました。
                現在は県下を8つのブロック、24支部で構成し、
                各地域における軟式野球の普及と発展に努めています。
              </p>
            </div>
          </div>
        </div>
        <BlockSidebar tournaments={tournaments} showAboutMenu={true} />
      </main>
      <Footer />
    </div>
  );
}
