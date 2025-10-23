import { useState } from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import BlockSidebar from '../../../components/BlockSidebar/BlockSidebar';
import styles from '../../../styles/TorList.module.css';
import Link from 'next/link';

export async function getServerSideProps(context) {
  try {
    const { id } = context.params;
    const SPACE_UID = process.env.NEWT_SPACE_UID;
    const TOKEN = process.env.NEWT_API_TOKEN;
    const TOURNAMENT_APP_UID = 'fukuoka-tournament';

    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    const page = parseInt(context.query.page || '1', 10);
    const limit = 20;
    const skip = (page - 1) * limit;

    // 指定されたtor-dataのidに紐づく大会を取得
    const tournamentUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${TOURNAMENT_APP_UID}/fukuoka-tor?limit=${limit}&skip=${skip}&order=-_sys.updatedAt&depth=2`;
    let tournamentsData = [];
    let total = 0;
    let torDataInfo = null;

    try {
      const tournamentResponse = await fetch(tournamentUrl, { headers });

      if (tournamentResponse.ok) {
        const tournamentResult = await tournamentResponse.json();

        if (tournamentResult.items && tournamentResult.items.length > 0) {
          // 指定されたidでフィルタリング
          const filteredItems = tournamentResult.items.filter(item =>
            item['tor-data']?.id === id
          );

          total = filteredItems.length;

          if (filteredItems.length > 0) {
            // tor-data情報を取得
            torDataInfo = filteredItems[0]['tor-data'];

            tournamentsData = filteredItems.map(item => {
              let year = '';
              if (item['tor-start']) {
                const startDate = new Date(item['tor-start']);
                year = startDate.getFullYear();
              }

              return {
                id: item._id,
                title1: item['tor-data']?.['fukuoka-title1'] || '',
                title2: item['tor-data']?.['fukuoka-title2'] || '',
                area: item.area || '',
                winner: item['win-team-fukuoka'] || '',
                classes: item['tor-data']?.['fukuoka-class'] || [],
                year: year,
                startDate: item['tor-start'] || null,
                endDate: item['end-tor'] || null,
                updatedAt: item._sys?.updatedAt || ''
              };
            });
          }
        }
      }
    } catch (error) {
      console.error('Tournament API Error:', error);
    }

    // サイドバー用の最新5件（単年度の大会のみ）
    const sidebarUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${TOURNAMENT_APP_UID}/fukuoka-tor?limit=5&order=-_sys.updatedAt&depth=2`;
    let sidebarTournaments = [];

    try {
      const sidebarResponse = await fetch(sidebarUrl, { headers });
      if (sidebarResponse.ok) {
        const sidebarResult = await sidebarResponse.json();
        if (sidebarResult.items && sidebarResult.items.length > 0) {
          sidebarTournaments = sidebarResult.items.map(item => ({
            id: item._id,
            title: item['fukuoka-tor-name-ryaku'] || '大会',
            startDate: item['tor-start'] || null,
            endDate: item['end-tor'] || null,
            date: item['tor-start'] || ''
          }));
        }
      }
    } catch (error) {
      console.error('Sidebar API Error:', error);
    }

    return {
      props: {
        tournaments: tournamentsData,
        sidebarTournaments,
        torDataInfo,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        torId: id
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        tournaments: [],
        sidebarTournaments: [],
        torDataInfo: null,
        currentPage: 1,
        totalPages: 1,
        total: 0,
        torId: context.params.id
      }
    };
  }
}

export default function TorList({ tournaments = [], sidebarTournaments = [], torDataInfo = null, currentPage = 1, totalPages = 1, total = 0, torId = '' }) {
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');

  // フィルタリング
  const filteredTournaments = tournaments.filter(tournament => {
    const areaMatch = selectedArea === 'all' || tournament.area === selectedArea;
    const classMatch = selectedClass === 'all' ||
      (tournament.classes && tournament.classes.includes(selectedClass));
    return areaMatch && classMatch;
  });

  // エリア一覧を取得
  const areas = ['all', ...new Set(tournaments.map(t => t.area).filter(Boolean))];

  // クラス一覧
  const classOptions = ['all', '学童', '少年', 'A級', 'B級', 'C級', 'その他'];

  const pageTitle = torDataInfo
    ? `${torDataInfo['fukuoka-title1']} ${torDataInfo['fukuoka-title2']}`
    : '大会情報';

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>{pageTitle}</h1>
            <span>TOURNAMENT LIST</span>
          </div>

          <div className={styles.content}>
            {/* フィルター */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '12px',
                flexWrap: 'wrap'
              }}>
                {areas.map(area => (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    style={{
                      padding: '8px 16px',
                      background: selectedArea === area ? '#333' : '#fff',
                      color: selectedArea === area ? '#fff' : '#333',
                      border: '1px solid #333',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {area === 'all' ? 'すべての地域' : area}
                  </button>
                ))}
              </div>

              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {classOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => setSelectedClass(option)}
                    style={{
                      padding: '8px 16px',
                      background: selectedClass === option ? '#333' : '#fff',
                      color: selectedClass === option ? '#fff' : '#333',
                      border: '1px solid #333',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {option === 'all' ? 'すべて' : option}
                  </button>
                ))}
              </div>
            </div>
            {filteredTournaments.length === 0 ? (
              <p style={{
                textAlign: 'center',
                padding: '40px',
                color: '#666',
                fontSize: '16px'
              }}>大会情報はありません</p>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
                border: '1px solid #eee'
              }}>
                {filteredTournaments.map((tournament) => (
                  <Link
                    key={tournament.id}
                    href={`/tournaments/tournament/${tournament.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      minHeight: '64px',
                      textDecoration: 'none',
                      color: 'inherit',
                      background: '#fff',
                      borderBottom: '1px solid #eee',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8f8f8'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '12px',
                      flex: '1',
                      minWidth: '0'
                    }}>
                      {/* PC表示 */}
                      <div className={styles.pcTable} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        flex: '1',
                        minWidth: '0'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0'
                        }}>
                          <span style={{
                            fontSize: '20px',
                            color: '#333',
                            fontWeight: '600',
                            flex: '1',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            minWidth: '0'
                          }}>
                            {tournament.year && `${tournament.year}年度`}{tournament.area}{tournament.title1} {tournament.title2}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#999',
                          minHeight: '20px'
                        }}>
                          {tournament.winner && `優勝：${tournament.winner}`}
                        </div>
                      </div>

                      {/* SP表示 */}
                      <div className={styles.spCards} style={{
                        display: 'none',
                        flexDirection: 'column',
                        gap: '4px',
                        flex: '1'
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          fontSize: '12px',
                          color: '#999',
                          marginBottom: '2px'
                        }}>
                          {tournament.year && <span>{tournament.year}年度</span>}
                          {tournament.area && <span>{tournament.area}</span>}
                        </div>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          {tournament.title1}
                        </span>
                        {tournament.title2 && (
                          <div style={{
                            fontSize: '13px',
                            color: '#666'
                          }}>
                            {tournament.title2}
                          </div>
                        )}
                        {tournament.winner && (
                          <div style={{
                            fontSize: '13px',
                            color: '#999'
                          }}>
                            優勝：{tournament.winner}
                          </div>
                        )}
                      </div>
                    </div>
                    <span style={{
                      color: '#999',
                      fontSize: '20px',
                      marginLeft: '12px',
                      flexShrink: '0'
                    }}>→</span>
                  </Link>
                ))}
              </div>
            )}

            {/* ページネーション */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '32px'
              }}>
                {currentPage > 1 && (
                  <a href={`/tournaments/torlist/${torId}?page=${currentPage - 1}`} style={{
                    padding: '8px 16px',
                    border: '1px solid #333',
                    textDecoration: 'none',
                    color: '#333',
                    background: '#fff',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}>
                    前へ
                  </a>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <a
                        key={page}
                        href={`/tournaments/torlist/${torId}?page=${page}`}
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #333',
                          textDecoration: 'none',
                          color: page === currentPage ? '#fff' : '#333',
                          background: page === currentPage ? '#333' : '#fff',
                          fontSize: '14px',
                          fontWeight: page === currentPage ? 600 : 400,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {page}
                      </a>
                    );
                  } else if (
                    page === currentPage - 3 ||
                    page === currentPage + 3
                  ) {
                    return <span key={page} style={{ padding: '8px' }}>...</span>;
                  }
                  return null;
                })}

                {currentPage < totalPages && (
                  <a href={`/tournaments/torlist/${torId}?page=${currentPage + 1}`} style={{
                    padding: '8px 16px',
                    border: '1px solid #333',
                    textDecoration: 'none',
                    color: '#333',
                    background: '#fff',
                    fontSize: '14px',
                    transition: 'all 0.3s ease'
                  }}>
                    次へ
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        <BlockSidebar tournaments={sidebarTournaments} />
      </main>
      <Footer />
    </div>
  );
}
