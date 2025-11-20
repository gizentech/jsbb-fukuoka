import { useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import BlockSidebar from '../../components/BlockSidebar/BlockSidebar';
import RotatingBanners from '../../components/RotatingBanners/RotatingBanners';
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

export default function TeamRegistration({ tournaments = [] }) {
  const [openBlocks, setOpenBlocks] = useState({});

  const toggleBlock = (blockName) => {
    setOpenBlocks(prev => ({
      ...prev,
      [blockName]: !prev[blockName]
    }));
  };

  const registrationData = [
    // 京築ブロック
    { block: '京築ブロック', branch: '行橋', aClass: '', bClass: 7, cClass: 9, adult: '', senior: '', kanreki: 1, gakudo: 2, shonen: 6, isSubtotal: false },
    { block: '京築ブロック', branch: '苅田', aClass: '', bClass: 4, cClass: 12, adult: '', senior: '', kanreki: '', gakudo: 1, shonen: 8, isSubtotal: false },
    { block: '京築ブロック', branch: '豊前', aClass: '', bClass: 1, cClass: 8, adult: '', senior: '', kanreki: '', gakudo: 5, shonen: 6, isSubtotal: false },
    { block: '京築ブロック', branch: '小計', aClass: '', bClass: 12, cClass: 29, adult: '', senior: '', kanreki: 1, gakudo: 8, shonen: 20, isSubtotal: true },

    // 北九州ブロック
    { block: '北九州ブロック', branch: '北九州', aClass: 10, bClass: 11, cClass: 21, adult: 1, senior: '', kanreki: 1, gakudo: 40, shonen: 50, isSubtotal: false },
    { block: '北九州ブロック', branch: '小計', aClass: 10, bClass: 11, cClass: 21, adult: 1, senior: '', kanreki: 1, gakudo: 40, shonen: 50, isSubtotal: true },

    // 筑豊ブロック
    { block: '筑豊ブロック', branch: '中遠', aClass: 1, bClass: 3, cClass: 3, adult: 1, senior: '', kanreki: '', gakudo: 16, shonen: 9, isSubtotal: false },
    { block: '筑豊ブロック', branch: '直鞍', aClass: 3, bClass: 3, cClass: 6, adult: '', senior: '', kanreki: 1, gakudo: 7, shonen: 5, isSubtotal: false },
    { block: '筑豊ブロック', branch: '嘉飯', aClass: 1, bClass: 1, cClass: 4, adult: '', senior: '', kanreki: 1, gakudo: 15, shonen: 1, isSubtotal: false },
    { block: '筑豊ブロック', branch: '田川', aClass: '', bClass: 4, cClass: 2, adult: 1, senior: 2, kanreki: 1, gakudo: 16, shonen: 2, isSubtotal: false },
    { block: '筑豊ブロック', branch: '小計', aClass: 5, bClass: 11, cClass: 15, adult: 2, senior: 2, kanreki: 3, gakudo: 54, shonen: 17, isSubtotal: true },

    // 東福岡ブロック
    { block: '東福岡ブロック', branch: '古賀', aClass: 2, bClass: 3, cClass: '', adult: 1, senior: '', kanreki: '', gakudo: 20, shonen: 1, isSubtotal: false },
    { block: '東福岡ブロック', branch: '糟屋', aClass: '', bClass: 3, cClass: 5, adult: '', senior: '', kanreki: '', gakudo: '', shonen: 16, isSubtotal: false },
    { block: '東福岡ブロック', branch: '宗像', aClass: '', bClass: 8, cClass: 10, adult: 2, senior: '', kanreki: 1, gakudo: 16, shonen: 6, isSubtotal: false },
    { block: '東福岡ブロック', branch: '小計', aClass: 2, bClass: 14, cClass: 15, adult: 3, senior: '', kanreki: 1, gakudo: 36, shonen: 23, isSubtotal: true },

    // 福岡ブロック
    { block: '福岡ブロック', branch: '福岡', aClass: 10, bClass: 6, cClass: 12, adult: 1, senior: 1, kanreki: 1, gakudo: 54, shonen: 46, isSubtotal: false },
    { block: '福岡ブロック', branch: '筑紫', aClass: '', bClass: '', cClass: '', adult: '', senior: '', kanreki: '', gakudo: 24, shonen: 13, isSubtotal: false },
    { block: '福岡ブロック', branch: '大野城', aClass: '', bClass: '', cClass: 10, adult: '', senior: '', kanreki: '', gakudo: '', shonen: 12, isSubtotal: false },
    { block: '福岡ブロック', branch: '小計', aClass: 10, bClass: 6, cClass: 22, adult: 1, senior: 1, kanreki: 1, gakudo: 78, shonen: 71, isSubtotal: true },

    // 久留米ブロック
    { block: '久留米ブロック', branch: '久留米', aClass: 9, bClass: 21, cClass: 26, adult: 1, senior: 1, kanreki: 1, gakudo: 33, shonen: 19, isSubtotal: false },
    { block: '久留米ブロック', branch: '小計', aClass: 9, bClass: 21, cClass: 26, adult: 1, senior: 1, kanreki: 1, gakudo: 33, shonen: 19, isSubtotal: true },

    // 北筑後ブロック
    { block: '北筑後ブロック', branch: '朝倉', aClass: 1, bClass: 2, cClass: 4, adult: 1, senior: 1, kanreki: '', gakudo: 6, shonen: 2, isSubtotal: false },
    { block: '北筑後ブロック', branch: '八女', aClass: 6, bClass: 8, cClass: 18, adult: '', senior: '', kanreki: 1, gakudo: 11, shonen: 10, isSubtotal: false },
    { block: '北筑後ブロック', branch: '浮羽', aClass: '', bClass: 6, cClass: 8, adult: '', senior: '', kanreki: '', gakudo: 5, shonen: 1, isSubtotal: false },
    { block: '北筑後ブロック', branch: '小郡', aClass: '', bClass: 8, cClass: 9, adult: '', senior: '', kanreki: 1, gakudo: 8, shonen: 6, isSubtotal: false },
    { block: '北筑後ブロック', branch: '小計', aClass: 7, bClass: 24, cClass: 39, adult: 1, senior: 1, kanreki: 2, gakudo: 30, shonen: 19, isSubtotal: true },

    // 南筑後ブロック
    { block: '南筑後ブロック', branch: '柳川', aClass: '', bClass: 6, cClass: 4, adult: '', senior: '', kanreki: '', gakudo: 7, shonen: 8, isSubtotal: false },
    { block: '南筑後ブロック', branch: '大川大木', aClass: '', bClass: 6, cClass: 2, adult: '', senior: '', kanreki: '', gakudo: 6, shonen: 3, isSubtotal: false },
    { block: '南筑後ブロック', branch: '筑後', aClass: '', bClass: '', cClass: 8, adult: '', senior: '', kanreki: '', gakudo: 8, shonen: 3, isSubtotal: false },
    { block: '南筑後ブロック', branch: '大牟田', aClass: '', bClass: 8, cClass: 8, adult: 1, senior: '', kanreki: '', gakudo: 5, shonen: 7, isSubtotal: false },
    { block: '南筑後ブロック', branch: '小計', aClass: '', bClass: 20, cClass: 22, adult: 1, senior: '', kanreki: '', gakudo: 26, shonen: 21, isSubtotal: true },
  ];

  const totalData = {
    aClass: 43,
    bClass: 119,
    cClass: 189,
    adult: 10,
    senior: 5,
    kanreki: 10,
    gakudo: 305,
    shonen: 240
  };

  const categoryTotals = {
    general: totalData.aClass + totalData.bClass + totalData.cClass, // 一般：A級+B級+C級
    adult: totalData.adult, // 成年
    senior: totalData.senior, // 実年
    kanreki: totalData.kanreki, // 還暦
    gakudo: totalData.gakudo, // 学童
    shonen: totalData.shonen // 少年
  };

  let currentBlock = '';

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>チーム登録数</h1>
            <span>TEAM REGISTRATION</span>
          </div>

          <div className={styles.content}>
            <p style={{ margin: '0 0 32px', lineHeight: '1.8', color: '#666' }}>
              福岡県軟式野球連盟に登録されている各支部のチーム数をご覧いただけます。
            </p>

            {/* 詳細テーブル - PC表示 */}
            <div className="pc-table" style={{ overflowX: 'auto', marginTop: '40px' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <thead>
                  <tr style={{ background: '#3182ce', color: '#fff' }}>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 600, minWidth: '120px' }}>ブロック</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 600, minWidth: '100px' }}>支部名</th>
                    <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 600, minWidth: '70px' }}>A級</th>
                    <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 600, minWidth: '70px' }}>B級</th>
                    <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 600, minWidth: '70px' }}>C級</th>
                    <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 600, minWidth: '70px' }}>成年</th>
                    <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 600, minWidth: '70px' }}>実年</th>
                    <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 600, minWidth: '70px' }}>還暦</th>
                    <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 600, minWidth: '70px' }}>学童</th>
                    <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 600, minWidth: '70px' }}>少年</th>
                  </tr>
                </thead>
                <tbody>
                  {registrationData.map((row, index) => {
                    const showBlock = currentBlock !== row.block;
                    if (showBlock) currentBlock = row.block;

                    const rowStyle = row.isSubtotal
                      ? { background: '#f8f9fa', fontWeight: 600, borderTop: '2px solid #ddd', borderBottom: '2px solid #ddd' }
                      : { background: index % 2 === 0 ? '#fff' : '#fafafa' };

                    return (
                      <tr key={index} style={rowStyle}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                          {showBlock && !row.isSubtotal ? row.block : ''}
                        </td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #eee', paddingLeft: row.isSubtotal ? '24px' : '12px' }}>
                          {row.branch}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{row.aClass || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{row.bClass || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{row.cClass || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{row.adult || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{row.senior || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{row.kanreki || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{row.gakudo || '-'}</td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{row.shonen || '-'}</td>
                      </tr>
                    );
                  })}
                  {/* 合計行 */}
                  <tr style={{ background: '#3182ce', color: '#fff', fontWeight: 'bold' }}>
                    <td colSpan="2" style={{ padding: '16px 12px', textAlign: 'center' }}>合計</td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>{totalData.aClass}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>{totalData.bClass}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>{totalData.cClass}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>{totalData.adult}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>{totalData.senior}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>{totalData.kanreki}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>{totalData.gakudo}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>{totalData.shonen}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SP用テーブル表示 */}
            <div className="sp-accordion" style={{ marginTop: '40px' }}>
              {Object.entries(
                registrationData.reduce((acc, row) => {
                  if (!acc[row.block]) {
                    acc[row.block] = { branches: [], subtotal: null };
                  }
                  if (row.isSubtotal) {
                    acc[row.block].subtotal = row;
                  } else {
                    acc[row.block].branches.push(row);
                  }
                  return acc;
                }, {})
              ).map(([blockName, blockData]) => (
                <div key={blockName} style={{
                  border: '1px solid #ddd',
                  marginBottom: '8px',
                  background: '#fff',
                  overflow: 'hidden'
                }}>
                  {/* ブロックヘッダー */}
                  <div style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#f8f9fa',
                    borderBottom: '1px solid #ddd',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}>
                    {blockName}
                  </div>

                  {/* 小計と支部詳細を表形式で */}
                  {blockData.subtotal && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '11px',
                        minWidth: '400px'
                      }}>
                        <thead>
                          <tr style={{ background: '#fafafa' }}>
                            <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #ddd', minWidth: '80px' }}>支部名</th>
                            <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #ddd', minWidth: '50px' }}>学童</th>
                            <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #ddd', minWidth: '50px' }}>少年</th>
                            <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #ddd', minWidth: '60px' }}>社会人</th>
                            <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #ddd', minWidth: '60px' }}>その他</th>
                            <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #ddd', minWidth: '50px' }}>合計</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* 小計行 */}
                          <tr style={{ background: '#f0f0f0', fontWeight: 600 }}>
                            <td style={{ padding: '8px 6px', borderBottom: '1px solid #ddd' }}>小計</td>
                            <td style={{ padding: '8px 4px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{blockData.subtotal.gakudo || '-'}</td>
                            <td style={{ padding: '8px 4px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{blockData.subtotal.shonen || '-'}</td>
                            <td style={{ padding: '8px 4px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                              {(Number(blockData.subtotal.aClass) || 0) + (Number(blockData.subtotal.bClass) || 0) + (Number(blockData.subtotal.cClass) || 0) || '-'}
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                              {(Number(blockData.subtotal.adult) || 0) + (Number(blockData.subtotal.senior) || 0) + (Number(blockData.subtotal.kanreki) || 0) || '-'}
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                              {(Number(blockData.subtotal.gakudo) || 0) + (Number(blockData.subtotal.shonen) || 0) + (Number(blockData.subtotal.aClass) || 0) + (Number(blockData.subtotal.bClass) || 0) + (Number(blockData.subtotal.cClass) || 0) + (Number(blockData.subtotal.adult) || 0) + (Number(blockData.subtotal.senior) || 0) + (Number(blockData.subtotal.kanreki) || 0)}
                            </td>
                          </tr>

                          {/* 支部詳細 */}
                          {blockData.branches.map((branch, idx) => (
                            <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                              <td style={{ padding: '8px 6px', borderBottom: '1px solid #eee' }}>{branch.branch}</td>
                              <td style={{ padding: '8px 4px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{branch.gakudo || '-'}</td>
                              <td style={{ padding: '8px 4px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{branch.shonen || '-'}</td>
                              <td style={{ padding: '8px 4px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                                {(Number(branch.aClass) || 0) + (Number(branch.bClass) || 0) + (Number(branch.cClass) || 0) || '-'}
                              </td>
                              <td style={{ padding: '8px 4px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                                {(Number(branch.adult) || 0) + (Number(branch.senior) || 0) + (Number(branch.kanreki) || 0) || '-'}
                              </td>
                              <td style={{ padding: '8px 4px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
                                {(Number(branch.gakudo) || 0) + (Number(branch.shonen) || 0) + (Number(branch.aClass) || 0) + (Number(branch.bClass) || 0) + (Number(branch.cClass) || 0) + (Number(branch.adult) || 0) + (Number(branch.senior) || 0) + (Number(branch.kanreki) || 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}

              {/* 合計 */}
              <div style={{
                border: '1px solid #ddd',
                overflow: 'hidden',
                marginTop: '8px',
                background: '#fff'
              }}>
                <div style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#3182ce',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '14px'
                }}>
                  合計
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '11px',
                    minWidth: '400px'
                  }}>
                    <thead>
                      <tr style={{ background: '#fafafa' }}>
                        <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #ddd', minWidth: '80px' }}>カテゴリ</th>
                        <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #ddd', minWidth: '50px' }}>学童</th>
                        <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #ddd', minWidth: '50px' }}>少年</th>
                        <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #ddd', minWidth: '60px' }}>社会人</th>
                        <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #ddd', minWidth: '60px' }}>その他</th>
                        <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #ddd', minWidth: '50px' }}>合計</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: '#f0f0f0', fontWeight: 600 }}>
                        <td style={{ padding: '8px 6px' }}>総計</td>
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>{totalData.gakudo}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>{totalData.shonen}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>{totalData.aClass + totalData.bClass + totalData.cClass}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>{totalData.adult + totalData.senior + totalData.kanreki}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>{totalData.gakudo + totalData.shonen + totalData.aClass + totalData.bClass + totalData.cClass + totalData.adult + totalData.senior + totalData.kanreki}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* サマリーカード */}
              <div className="summary-cards" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                marginTop: '16px',
                padding: '12px',
                background: '#fff',
                border: '1px solid #eee'
              }}>
                <div className="summary-card" style={{ background: '#f8f8f8', padding: '12px 8px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 6px 0', color: '#555' }}>一般</h3>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#3182ce',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: '1px'
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{categoryTotals.general}</span>
                    <span style={{ fontSize: '10px', fontWeight: 'normal', color: '#666' }}>チーム</span>
                  </p>
                </div>
                <div className="summary-card" style={{ background: '#f8f8f8', padding: '12px 8px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 6px 0', color: '#555' }}>成年</h3>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#3182ce',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: '1px'
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{categoryTotals.adult}</span>
                    <span style={{ fontSize: '10px', fontWeight: 'normal', color: '#666' }}>チーム</span>
                  </p>
                </div>
                <div className="summary-card" style={{ background: '#f8f8f8', padding: '12px 8px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 6px 0', color: '#555' }}>実年</h3>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#3182ce',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: '1px'
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{categoryTotals.senior}</span>
                    <span style={{ fontSize: '10px', fontWeight: 'normal', color: '#666' }}>チーム</span>
                  </p>
                </div>
                <div className="summary-card" style={{ background: '#f8f8f8', padding: '12px 8px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 6px 0', color: '#555' }}>還暦</h3>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#3182ce',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: '1px'
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{categoryTotals.kanreki}</span>
                    <span style={{ fontSize: '10px', fontWeight: 'normal', color: '#666' }}>チーム</span>
                  </p>
                </div>
                <div className="summary-card" style={{ background: '#f8f8f8', padding: '12px 8px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 6px 0', color: '#555' }}>学童</h3>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#3182ce',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: '1px'
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{categoryTotals.gakudo}</span>
                    <span style={{ fontSize: '10px', fontWeight: 'normal', color: '#666' }}>チーム</span>
                  </p>
                </div>
                <div className="summary-card" style={{ background: '#f8f8f8', padding: '12px 8px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 6px 0', color: '#555' }}>少年</h3>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#3182ce',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: '1px'
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{categoryTotals.shonen}</span>
                    <span style={{ fontSize: '10px', fontWeight: 'normal', color: '#666' }}>チーム</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 回転式バナー */}
            <RotatingBanners />

            <style jsx>{`
              @media (min-width: 769px) {
                .sp-accordion {
                  display: none;
                }
              }
              @media (max-width: 768px) {
                .pc-table {
                  display: none;
                }
              }
              @media (max-width: 640px) {
                .summary-cards {
                  grid-template-columns: repeat(3, 1fr) !important;
                  gap: 8px !important;
                  padding: 8px !important;
                }
                .summary-card {
                  padding: 10px 6px !important;
                }
                .summary-card h3 {
                  font-size: 11px !important;
                  margin-bottom: 4px !important;
                }
                .summary-card p span:first-child {
                  font-size: 14px !important;
                }
                .summary-card p span:last-child {
                  font-size: 9px !important;
                }
              }
            `}</style>

          </div>
        </div>
        <BlockSidebar tournaments={tournaments} showAboutMenu={true} />
      </main>
      <Footer />
    </div>
  );
}
