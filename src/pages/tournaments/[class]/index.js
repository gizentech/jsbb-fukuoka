import { useState } from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import TournamentSidebar from '../../../components/TournamentSidebar/TournamentSidebar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import styles from '../../../styles/Page.module.css';
import Link from 'next/link';
import { classSlugToDisplay, classDisplayToSlug } from '../../../utils/classConvert';

export async function getServerSideProps(context) {
  try {
    const { class: classSlug } = context.params;
    const SPACE_UID = process.env.NEWT_SPACE_UID;
    const TOKEN = process.env.NEWT_API_TOKEN;
    const TOURNAMENT_APP_UID = 'fukuoka-tournament';

    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    // クラス名の変換
    const classDisplayName = classSlugToDisplay(classSlug);

    const page = parseInt(context.query.page || '1', 10);
    const limit = 20;
    const skip = (page - 1) * limit;

    // 全件取得してクラスでフィルタリング
    const allTournamentsUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${TOURNAMENT_APP_UID}/fukuoka-tor?limit=1000&order=-_sys.updatedAt&depth=2`;
    let tournamentsData = [];
    let total = 0;

    try {
      const allResponse = await fetch(allTournamentsUrl, { headers });

      if (allResponse.ok) {
        const allResult = await allResponse.json();

        // クラスでフィルタリング
        if (allResult.items && allResult.items.length > 0) {
          const filteredItems = allResult.items.filter(item => {
            const classes = item['tor-data']?.['fukuoka-class'] || [];
            return classes.includes(classDisplayName);
          });

          total = filteredItems.length;

          // ページネーション
          const paginatedItems = filteredItems.slice(skip, skip + limit);

          tournamentsData = paginatedItems.map(item => {
            let year = '';
            if (item['tor-start']) {
              const startDate = new Date(item['tor-start']);
              year = startDate.getFullYear();
            }

            return {
              id: item._id,
              torDataId: item['tor-data']?.id || '',
              title1: item['tor-data']?.['fukuoka-title1'] || '',
              title2: item['tor-data']?.['fukuoka-title2'] || '',
              area: item.area || '',
              winner: item['win-team-fukuoka'] || '',
              classes: item['tor-data']?.['fukuoka-class'] || [],
              year: year,
              yyyy: item.YYYY || null,
              startDate: item['tor-start'] || null,
              endDate: item['end-tor'] || null,
              updatedAt: item._sys?.updatedAt || ''
            };
          });
        }
      }
    } catch (error) {
      console.error('Tournament API Error:', error);
    }

    // サイドバー用：同じクラスの大会5件を取得
    const sidebarUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${TOURNAMENT_APP_UID}/fukuoka-tor?limit=1000&order=-_sys.updatedAt&depth=2`;
    let sidebarTournaments = [];

    try {
      const sidebarResponse = await fetch(sidebarUrl, { headers });
      if (sidebarResponse.ok) {
        const sidebarResult = await sidebarResponse.json();
        if (sidebarResult.items && sidebarResult.items.length > 0) {
          // 同じクラスでフィルタリング
          const filteredSidebar = sidebarResult.items
            .filter(item => {
              const classes = item['tor-data']?.['fukuoka-class'] || [];
              return classes.includes(classDisplayName);
            })
            .slice(0, 5)
            .map(item => {
              let year = '';
              if (item['tor-start']) {
                const startDate = new Date(item['tor-start']);
                year = startDate.getFullYear();
              }
              return {
                id: item._id,
                torDataId: item['tor-data']?.id || '',
                title1: item['tor-data']?.['fukuoka-title1'] || '',
                title2: item['tor-data']?.['fukuoka-title2'] || '',
                area: item.area || '',
                classes: item['tor-data']?.['fukuoka-class'] || [],
                year: year,
                yyyy: item.YYYY || null
              };
            });
          sidebarTournaments = filteredSidebar;
        }
      }
    } catch (error) {
      console.error('Sidebar API Error:', error);
    }

    return {
      props: {
        tournaments: tournamentsData,
        sidebarTournaments,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        classSlug,
        classDisplayName
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        tournaments: [],
        sidebarTournaments: [],
        currentPage: 1,
        totalPages: 1,
        total: 0,
        classSlug: context.params.class,
        classDisplayName: ''
      }
    };
  }
}

export default function TournamentsByClass({ tournaments = [], sidebarTournaments = [], currentPage = 1, totalPages = 1, total = 0, classSlug, classDisplayName }) {
  const [selectedArea, setSelectedArea] = useState('all');

  // フィルタリング
  const filteredTournaments = tournaments.filter(tournament => {
    const areaMatch = selectedArea === 'all' || tournament.area === selectedArea;
    return areaMatch;
  });

  // エリア一覧を取得
  const areas = ['all', ...new Set(tournaments.map(t => t.area).filter(Boolean))];

  const breadcrumbItems = [
    { label: '大会情報', href: '/tournaments' },
    { label: classDisplayName, href: null }
  ];

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>{classDisplayName} 大会情報</h1>
            <span>TOURNAMENTS - {classDisplayName.toUpperCase()}</span>
          </div>

          <Breadcrumb items={breadcrumbItems} />

          <div className={styles.content}>
            {/* エリアフィルター */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                gap: '8px',
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
                {filteredTournaments.map((tournament) => {
                  const areaSlug = tournament.area ? tournament.area.replace(/支部/g, '').toLowerCase() : 'unknown';
                  const yyyy = tournament.yyyy || tournament.year || '0000';
                  const tournamentUrl = `/tournaments/${classSlug}/${encodeURIComponent(areaSlug)}/${tournament.torDataId}/${yyyy}`;

                  return (
                  <Link
                    key={tournament.id}
                    href={tournamentUrl}
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
                      <div style={{
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
                    </div>
                    <span style={{
                      color: '#999',
                      fontSize: '20px',
                      marginLeft: '12px',
                      flexShrink: '0'
                    }}>→</span>
                  </Link>
                  );
                })}
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
                  <a href={`/tournaments/${classSlug}?page=${currentPage - 1}`} style={{
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
                        href={`/tournaments/${classSlug}?page=${page}`}
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
                  <a href={`/tournaments/${classSlug}?page=${currentPage + 1}`} style={{
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
        <TournamentSidebar tournaments={sidebarTournaments} title={`${classDisplayName}の大会`} />
      </main>
      <Footer />
    </div>
  );
}
