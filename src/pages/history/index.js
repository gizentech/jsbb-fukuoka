import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import BlockSidebar from '../../components/BlockSidebar/BlockSidebar';
import styles from '../../styles/Page.module.css';
import fs from 'fs';
import path from 'path';

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

    // CSVファイルを読み込む
    let historyData = [];
    try {
      const csvPath = path.join(process.cwd(), 'src', 'pages', 'history', 'fukuoka_renmei_history.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n');

      // ヘッダー行をスキップして、データ行をパース
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const [year, month, event] = line.split(',');
          historyData.push({ year, month, event });
        }
      }
      console.log('History CSV data loaded:', historyData.length, 'records');
    } catch (error) {
      console.error('History CSV Read Error:', error);
    }

    return {
      props: {
        tournaments: tournamentsData,
        historyData: historyData
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        tournaments: [],
        historyData: []
      }
    };
  }
}

export default function History({ tournaments = [], historyData = [] }) {
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
            <p style={{ margin: '16px 0 32px', lineHeight: '1.8', color: '#666' }}>
              福岡県軟式野球連盟の歩みをご紹介します。
            </p>

            {historyData.length > 0 ? (
              <>
                {/* PC表示用テーブル */}
                <div style={{ overflowX: 'auto', margin: '20px 0', display: 'none' }} className="pc-only">
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                    <thead>
                      <tr style={{ background: '#4a4a4a', color: '#fff' }}>
                        <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left', width: '120px' }}>年度</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>出来事</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((record, index) => (
                        <tr key={index} style={{ background: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                          <td style={{ padding: '10px', border: '1px solid #ddd', whiteSpace: 'nowrap' }}>
                            {record.year && record.month ? `${record.year}年${record.month}月` : record.year ? `${record.year}年` : '年代不明'}
                          </td>
                          <td style={{ padding: '10px', border: '1px solid #ddd' }}>{record.event}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* SP表示用 */}
                <div style={{ display: 'none', overflowX: 'auto' }} className="sp-only">
                  <div style={{ border: '1px solid #ddd' }}>
                    {historyData.map((record, index) => (
                      <div key={index} style={{
                        background: index % 2 === 0 ? '#fff' : '#f9f9f9',
                        padding: '12px',
                        borderBottom: index < historyData.length - 1 ? '1px solid #ddd' : 'none'
                      }}>
                        <div style={{ fontWeight: 600, color: '#3182ce', marginBottom: '8px', fontSize: '14px' }}>
                          {record.year && record.month ? `${record.year}年${record.month}月` : record.year ? `${record.year}年` : '年代不明'}
                        </div>
                        <div style={{ fontSize: '13px', lineHeight: '1.6' }}>{record.event}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <style jsx>{`
                  @media (min-width: 768px) {
                    .pc-only {
                      display: block !important;
                    }
                    .sp-only {
                      display: none !important;
                    }
                  }
                  @media (max-width: 767px) {
                    .pc-only {
                      display: none !important;
                    }
                    .sp-only {
                      display: block !important;
                    }
                  }
                `}</style>
              </>
            ) : (
              <p style={{ margin: '16px 0' }}>データを読み込んでいます...</p>
            )}

            <div style={{ background: '#f8f9fa', padding: '20px', borderLeft: '4px solid #0066cc', margin: '24px 0' }}>
              <p style={{ margin: 0 }}><strong>福岡県軟式野球連盟は昭和21年（1946年）の設立以来、福岡県の軟式野球の発展に尽力してまいりました。</strong></p>
            </div>
          </div>
        </div>
        <BlockSidebar tournaments={tournaments} showAboutMenu={true} />
      </main>
      <Footer />
    </div>
  );
}
