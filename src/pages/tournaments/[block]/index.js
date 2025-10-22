import { useRouter } from 'next/router';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import BlockSidebar from '../../../components/BlockSidebar/BlockSidebar';
import styles from '../../../styles/Page.module.css';
import Link from 'next/link';

export async function getServerSideProps(context) {
  const { block } = context.params;

  try {
    const SPACE_UID = process.env.NEWT_SPACE_UID;
    const TOKEN = process.env.NEWT_API_TOKEN;
    const TOURNAMENT_APP_UID = 'fukuoka-tournament';

    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    // 大会情報を取得
    const tournamentUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${TOURNAMENT_APP_UID}/fukuoka-tor?limit=100&order=-_sys.createdAt&depth=2`;
    let allTournaments = [];
    let tournamentsByBranch = {};

    try {
      const tournamentResponse = await fetch(tournamentUrl, { headers });

      if (tournamentResponse.ok) {
        const tournamentResult = await tournamentResponse.json();

        if (tournamentResult.items && tournamentResult.items.length > 0) {
          allTournaments = tournamentResult.items.map(item => {
            const torData = item['tor-data'] || {};
            // fukuoka-title1とfukuoka-title2を組み合わせて表示
            const title1 = torData['fukuoka-title1'] || '';
            const title2 = torData['fukuoka-title2'] || '';
            const fullTitle = title1 && title2 ? `${title1} ${title2}` : (title1 || title2 || '大会');

            return {
              id: item._id,
              title: fullTitle,
              title1: title1,
              title2: title2,
              nameRyaku: item['fukuoka-tor-name-ryaku'] || '',
              startDate: item['tor-start'] || null,
              endDate: item['end-tor'] || null,
              area: item.area || [],
              date: item['tor-start'] || '',
              class: torData['fukuoka-class'] || []
            };
          });

          // 各支部ごとに大会を分類
          const blockInfo = fukuokaBlocksData[block];
          console.log('Block:', block);
          console.log('All tournaments count:', allTournaments.length);
          console.log('Sample tournament area:', allTournaments[0]?.area);

          if (blockInfo) {
            Object.keys(blockInfo.branches).forEach(branchId => {
              const branchName = blockInfo.branches[branchId];
              console.log(`Filtering for branch: ${branchId} (${branchName})`);

              tournamentsByBranch[branchId] = allTournaments.filter(tournament => {
                if (!tournament.area) return false;

                // areaが文字列の場合と配列の場合の両方に対応
                const areas = Array.isArray(tournament.area) ? tournament.area : [tournament.area];
                if (areas.length === 0) return false;

                return areas.some(area => {
                  // areaが文字列の場合と、オブジェクトの場合の両方に対応
                  let areaId, areaLabel;
                  if (typeof area === 'object') {
                    areaId = area.slug;
                    areaLabel = area.label || area.name;
                  } else {
                    areaId = area;
                    areaLabel = area;
                  }

                  const matches = areaId === branchId || areaLabel === branchName;
                  if (matches) {
                    console.log(`Match found: areaId=${areaId}, areaLabel=${areaLabel}, branchId=${branchId}, branchName=${branchName}`);
                  }
                  return matches;
                });
              }).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

              console.log(`Found ${tournamentsByBranch[branchId].length} tournaments for ${branchName}`);
            });
          }
        }
      }
    } catch (error) {
      console.error('Tournament API Error:', error);
    }

    // サイドバー用の最新5件
    const sidebarTournaments = allTournaments
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      .slice(0, 5);

    return {
      props: {
        block,
        tournamentsByBranch,
        tournaments: sidebarTournaments
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        block,
        tournamentsByBranch: {},
        tournaments: []
      }
    };
  }
}

// ブロック情報の定義（サーバーサイドでも使用）
const fukuokaBlocksData = {
  'kyochiku': {
    title: '京築ブロック',
    branches: {
      'yukuhashi': '行橋支部',
      'kanda': '苅田支部',
      'buzen': '豊前支部'
    }
  },
  'kitakyushu': {
    title: '北九州ブロック',
    branches: {
      'kitakyushu': '北九州支部'
    }
  },
  'chikuho': {
    title: '筑豊ブロック',
    branches: {
      'chuen': '中遠支部',
      'chokukuwa': '直鞍支部',
      'kahan': '嘉飯支部',
      'tagawa': '田川支部'
    }
  },
  'higashi-fukuoka': {
    title: '東福岡ブロック',
    branches: {
      'koga': '古賀支部',
      'kasuya': '糟屋支部',
      'munakata': '宗像支部'
    }
  },
  'fukuoka': {
    title: '福岡ブロック',
    branches: {
      'fukuoka': '福岡支部',
      'chikushi': '筑紫支部',
      'kasuga': '春日支部',
      'onojo': '大野城支部'
    }
  },
  'kita-chikugo': {
    title: '北筑後ブロック',
    branches: {
      'asakura': '朝倉支部',
      'yame': '八女支部',
      'ukiha': '浮羽支部',
      'ogori': '小郡支部'
    }
  },
  'kurume': {
    title: '久留米ブロック',
    branches: {
      'kurume': '久留米支部'
    }
  },
  'minami-chikugo': {
    title: '南筑後ブロック',
    branches: {
      'yanagawa': '柳川支部',
      'chikugo': '筑後支部',
      'omuta': '大牟田支部',
      'okawa-oki': '大川大木支部'
    }
  }
};

export default function BlockIndexPage({ block, tournamentsByBranch = {}, tournaments = [] }) {
  const blockInfo = fukuokaBlocksData[block];

  if (!blockInfo) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.mainWithSidebar}>
          <div className={styles.contentArea}>
            <div className={styles.pageHeader}>
              <h1>ブロックが見つかりません</h1>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>{blockInfo.title}</h1>
            <span>BLOCK INFORMATION</span>
          </div>

          <div className={styles.content}>
            {/* 各支部ごとに大会を表示 */}
            {Object.entries(blockInfo.branches).map(([branchId, branchName]) => {
              const branchTournaments = tournamentsByBranch[branchId] || [];

              return (
                <div key={branchId} style={{ marginBottom: '48px' }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    margin: '40px 0 16px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>{branchName}</span>
                    {branchTournaments.length > 0 && (
                      <Link
                        href={`/tournaments/${block}/${branchId}`}
                        style={{
                          fontSize: '14px',
                          color: '#0066cc',
                          textDecoration: 'none',
                          fontWeight: '400'
                        }}
                      >
                        詳細 →
                      </Link>
                    )}
                  </h2>

                  {branchTournaments.length === 0 ? (
                    <p style={{
                      textAlign: 'center',
                      padding: '20px 0',
                      color: '#999',
                      fontSize: '14px'
                    }}>開催予定の大会はありません</p>
                  ) : (
                    <div className={styles.tournamentList}>
                      {branchTournaments.map((tournament) => {
                        let displayDate = '';
                        if (tournament.startDate) {
                          const startDate = new Date(tournament.startDate);
                          const year = startDate.getFullYear();
                          const month = startDate.getMonth() + 1;
                          const day = startDate.getDate();
                          displayDate = `${year}/${month}/${day}~`;
                        }

                        // classの表示（配列の最初の要素）
                        const displayClass = Array.isArray(tournament.class) && tournament.class.length > 0
                          ? tournament.class[0]
                          : '';

                        return (
                          <Link
                            key={tournament.id}
                            href={`/tournaments/tournament/${tournament.id}`}
                            className={styles.tournamentItem}
                          >
                            <div className={styles.tournamentInfo}>
                              <span className={styles.tournamentDate}>{displayDate}</span>
                              {displayClass && (
                                <span className={styles.tournamentClass}>{displayClass}</span>
                              )}
                              {tournament.title2 ? (
                                <div className={styles.tournamentTitleStack}>
                                  <span className={styles.tournamentTitleLine}>{tournament.title1}</span>
                                  <span className={styles.tournamentTitleLine}>{tournament.title2}</span>
                                </div>
                              ) : (
                                <span className={styles.tournamentTitle}>{tournament.title1 || tournament.title}</span>
                              )}
                            </div>
                            <span className={styles.tournamentArrow}>→</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <BlockSidebar tournaments={tournaments} />
      </main>
      <Footer />
    </div>
  );
}
