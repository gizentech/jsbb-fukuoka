import { useState } from 'react';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import TournamentSidebar from '../../../components/TournamentSidebar/TournamentSidebar';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import styles from '../../../styles/Page.module.css';
import Link from 'next/link';
import { classSlugToDisplay } from '../../../utils/classConvert';

// 福岡県8ブロック情報
const fukuokaBlocks = {
  'kyochiku': {
    title: '京築',
    branches: ['行橋', '苅田', '豊前']
  },
  'kitakyushu': {
    title: '北九州',
    branches: ['北九州']
  },
  'chikuho': {
    title: '筑豊',
    branches: ['中遠', '直鞍', '嘉飯', '田川']
  },
  'higashi-fukuoka': {
    title: '東福岡',
    branches: ['古賀', '糟屋', '宗像']
  },
  'fukuoka': {
    title: '福岡',
    branches: ['福岡', '筑紫', '春日', '大野城']
  },
  'kita-chikugo': {
    title: '北筑後',
    branches: ['朝倉', '八女', '浮羽', '小郡']
  },
  'kurume': {
    title: '久留米',
    branches: ['久留米']
  },
  'minami-chikugo': {
    title: '南筑後',
    branches: ['柳川', '筑後', '大牟田', '大川大木']
  }
};

export async function getServerSideProps(context) {
  try {
    const { blockId } = context.params;
    const blockInfo = fukuokaBlocks[blockId];

    if (!blockInfo) {
      return {
        notFound: true
      };
    }

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

    // 全件取得してブロック内の支部でフィルタリング
    const allTournamentsUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${TOURNAMENT_APP_UID}/fukuoka-tor?limit=1000&order=-_sys.updatedAt&depth=2`;
    let tournamentsData = [];
    let total = 0;

    try {
      const allResponse = await fetch(allTournamentsUrl, { headers });

      if (allResponse.ok) {
        const allResult = await allResponse.json();

        // ブロック内の支部でフィルタリング
        if (allResult.items && allResult.items.length > 0) {
          const filteredItems = allResult.items.filter(item => {
            const area = item.area || '';
            // ブロック内のいずれかの支部にマッチするか確認
            return blockInfo.branches.some(branch =>
              area.includes(branch) || branch.includes(area.replace('支部', ''))
            );
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

    // サイドバー用：同じブロックの大会5件を取得
    const sidebarUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${TOURNAMENT_APP_UID}/fukuoka-tor?limit=1000&order=-_sys.updatedAt&depth=2`;
    let sidebarTournaments = [];

    try {
      const sidebarResponse = await fetch(sidebarUrl, { headers });
      if (sidebarResponse.ok) {
        const sidebarResult = await sidebarResponse.json();
        if (sidebarResult.items && sidebarResult.items.length > 0) {
          // 同じブロックでフィルタリング
          const filteredSidebar = sidebarResult.items
            .filter(item => {
              const area = item.area || '';
              return blockInfo.branches.some(branch =>
                area.includes(branch) || branch.includes(area.replace('支部', ''))
              );
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
        blockId,
        blockTitle: blockInfo.title
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
        blockId: context.params.blockId,
        blockTitle: ''
      }
    };
  }
}

export default function TournamentsByBlock({ tournaments = [], sidebarTournaments = [], currentPage = 1, totalPages = 1, total = 0, blockId, blockTitle }) {
  const [selectedClass, setSelectedClass] = useState('all');

  // クラスフィルタリング
  const filteredTournaments = tournaments.filter(tournament => {
    if (selectedClass === 'all') return true;
    const classes = tournament.classes || [];
    return classes.includes(selectedClass);
  });

  // クラス一覧を取得
  const allClasses = new Set();
  tournaments.forEach(t => {
    if (t.classes && Array.isArray(t.classes)) {
      t.classes.forEach(c => allClasses.add(c));
    }
  });
  const classOptions = ['all', ...Array.from(allClasses)];

  const breadcrumbItems = [
    { label: '大会情報', href: '/tournaments' },
    { label: `${blockTitle}ブロック`, href: null }
  ];

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>{blockTitle}ブロック 大会情報</h1>
            <span>TOURNAMENTS - {blockTitle.toUpperCase()}</span>
          </div>

          <Breadcrumb items={breadcrumbItems} />

          <div className={styles.content}>
            {/* クラスフィルター */}
            <div style={{ marginBottom: '24px' }}>
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
                    {option === 'all' ? 'すべてのクラス' : classSlugToDisplay(option)}
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
                  // クラスごとにURLを生成
                  const firstClass = tournament.classes && tournament.classes.length > 0
                    ? tournament.classes[0]
                    : '';

                  const tournamentUrl = `/tournaments/${encodeURIComponent(firstClass)}/${encodeURIComponent(tournament.area)}/${tournament.torDataId}/${tournament.year || tournament.yyyy || ''}`;

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
                          gap: '8px'
                        }}>
                          {tournament.classes && tournament.classes.length > 0 && (
                            <span style={{
                              padding: '2px 8px',
                              background: '#333',
                              color: '#fff',
                              fontSize: '12px',
                              borderRadius: '3px'
                            }}>
                              {tournament.classes.map(c => typeof c === 'object' ? c.label : classSlugToDisplay(c)).join('・')}
                            </span>
                          )}
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
                  <a href={`/tournaments/block/${blockId}?page=${currentPage - 1}`} style={{
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
                        href={`/tournaments/block/${blockId}?page=${page}`}
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
                  <a href={`/tournaments/block/${blockId}?page=${currentPage + 1}`} style={{
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
        <TournamentSidebar tournaments={sidebarTournaments} title={`${blockTitle}ブロックの大会`} />
      </main>
      <Footer />
    </div>
  );
}
