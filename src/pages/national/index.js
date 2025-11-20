import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import BlockSidebar from '../../components/BlockSidebar/BlockSidebar';
import styles from '../../styles/Page.module.css';
import { signInWithRedirect } from 'firebase/auth';
import { skeletonClasses } from '@mui/material';
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

    // CSVファイルを読み込む
    let historyData = [];
    try {
      const csvPath = path.join(process.cwd(), 'src', 'pages', 'national', 'fukuoka_baseball_history.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n');

      // ヘッダー行をスキップして、データ行をパース
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const [year, team, tournament, result] = line.split(',');
          historyData.push({ year, team, tournament, result });
        }
      }
      console.log('CSV data loaded:', historyData.length, 'records');
    } catch (error) {
      console.error('CSV Read Error:', error);
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

export default function National({ tournaments = [], historyData = [] }) {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>全国大会での活躍</h1>
            <span>NATIONAL ACHIEVEMENTS</span>
          </div>

          <div className={styles.content}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>全国大会出場実績</h2>
          <p style={{ margin: '16px 0' }}>福岡県軟式野球連盟所属チームの全国大会での活躍をご紹介します。</p>

          <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '40px 0 16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>歴代の主な成績</h2>

          {historyData.length > 0 ? (
            <>
              {/* PC表示用テーブル */}
              <div style={{ overflowX: 'auto', margin: '20px 0', display: 'none' }} className="pc-only">
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>年度</th>
                      <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>チーム名</th>
                      <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>大会名</th>
                      <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>結果</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((record, index) => (
                      <tr key={index} style={{ background: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{record.year}</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{record.team}</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{record.tournament}</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 600 }}>{record.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SP表示用テーブル */}
              <div style={{ display: 'none', overflowX: 'auto' }} className="sp-only">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {historyData.map((record, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && (
                          <tr>
                            <td colSpan="2" style={{ height: '8px', padding: 0, border: 'none' }}></td>
                          </tr>
                        )}
                        <tr style={{ background: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                          <td colSpan="2" style={{ padding: '4px 10px', textAlign: 'left', whiteSpace: 'nowrap' }}>{record.year}</td>
                        </tr>
                        <tr style={{ background: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                          <td colSpan="2" style={{ padding: '4px 10px', textAlign: 'left' }}>{record.tournament}</td>
                        </tr>
                        <tr style={{ background: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                          <td style={{ padding: '4px 10px', fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>{record.result}</td>
                          <td style={{ padding: '4px 10px', textAlign: 'left' }}>{record.team}</td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
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
            <p style={{ margin: 0 }}><strong>昭和37年（1962年）から平成25年（2013年）までの主要な全国大会成績を掲載しています。</strong></p>
          </div>
          </div>
        </div>
        <BlockSidebar tournaments={tournaments} />
      </main>
      <Footer />
    </div>
  );
}
