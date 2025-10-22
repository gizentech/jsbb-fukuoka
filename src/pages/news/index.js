import { useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import BlockSidebar from '../../components/BlockSidebar/BlockSidebar';
import styles from '../../styles/Page.module.css';
import Link from 'next/link';

export async function getServerSideProps() {
  try {
    const SPACE_UID = process.env.NEWT_SPACE_UID;
    const TOKEN = process.env.NEWT_API_TOKEN;
    const INFO_APP_UID = 'fukuoka-info';
    const TOURNAMENT_APP_UID = 'fukuoka-tournament';

    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    // ニュース取得
    const newtNewsUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${INFO_APP_UID}/info?limit=100&order=-_sys.createdAt`;
    let newsData = [];

    try {
      const newsResponse = await fetch(newtNewsUrl, { headers });

      if (newsResponse.ok) {
        const newsResult = await newsResponse.json();

        if (newsResult.items && newsResult.items.length > 0) {
          newsData = newsResult.items.map(item => ({
            id: item._id,
            title: item['info-tital'] || item.title || '',
            createdAt: item._sys?.createdAt || new Date().toISOString(),
            body: item['info-body'] || '',
            file: item.file || null,
            important: item.important || false,
            class: item.class || []
          }));
        }
      }
    } catch (newsError) {
      console.error('Error processing news:', newsError);
    }

    // サイドバー用の大会情報取得
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
    } catch (tourError) {
      console.error('Error processing tournaments:', tourError);
    }

    return {
      props: {
        news: newsData,
        tournaments: tournamentsData,
        error: null
      }
    };

  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        news: [],
        tournaments: [],
        error: 'データの読み込みに失敗しました'
      }
    };
  }
}

export default function NewsIndex({ news = [], tournaments = [], error = null }) {
  const [selectedClass, setSelectedClass] = useState('all');

  const filteredNews = selectedClass === 'all'
    ? news
    : news.filter(item => {
        if (!item.class || item.class.length === 0) return false;
        const classLabel = typeof item.class[0] === 'object' ? item.class[0].label : item.class[0];
        return classLabel === selectedClass;
      });

  const classOptions = ['all', '学童', '少年', 'A級', 'B級', 'C級', 'その他'];

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>お知らせ</h1>
            <span>NEWS</span>
          </div>

          <div className={styles.content}>
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '30px',
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

            {error ? (
              <p style={{
                textAlign: 'center',
                padding: '40px',
                color: '#e53e3e',
                fontSize: '16px'
              }}>{error}</p>
            ) : filteredNews.length === 0 ? (
              <p style={{
                textAlign: 'center',
                padding: '40px',
                color: '#666',
                fontSize: '16px'
              }}>お知らせはありません</p>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
                border: '1px solid #eee'
              }}>
                {filteredNews.map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
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
                      {item.important && (
                        <span style={{
                          background: '#e53e3e',
                          color: '#fff',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: '600',
                          whiteSpace: 'nowrap'
                        }}>重要</span>
                      )}
                      <span style={{
                        fontSize: '14px',
                        color: '#666',
                        whiteSpace: 'nowrap',
                        flexShrink: '0'
                      }}>
                        {new Date(item.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                      {item.class && item.class.length > 0 && (
                        <span style={{
                          background: '#f0f0f0',
                          padding: '4px 8px',
                          fontSize: '11px',
                          color: '#666',
                          whiteSpace: 'nowrap'
                        }}>
                          {typeof item.class[0] === 'object' ? item.class[0].label : item.class[0]}
                        </span>
                      )}
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        flex: '1',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: '0'
                      }}>{item.title}</span>
                    </div>
                    <span style={{
                      color: '#999',
                      fontSize: '20px',
                      marginLeft: '12px'
                    }}>→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        <BlockSidebar tournaments={tournaments} />
      </main>
      <Footer />
    </div>
  );
}
