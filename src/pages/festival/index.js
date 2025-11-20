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
            return {
              id: item._id,
              title: item['fukuoka-tor-name-ryaku'] || '大会',
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

export default function Festival({ tournaments = [] }) {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>野球感謝祭</h1>
            <span>BASEBALL FESTIVAL</span>
          </div>

          <div className={styles.content}>
            <h2>イベント概要</h2>
            <p>久留米市では、「スポーツを楽しむ街久留米」をテーマに、普段野球場に入る機会のない親子を対象とした市民感謝祭を開催します。この無料野球イベントでは、ティーボール、ストラックアウト、ベースボール5などの野球体験プログラムをお楽しみいただけます。参加者全員に参加賞もございます。</p>
            <p>久留米市野球場の広大なフィールドで、お子様が野球の楽しさを体感できる貴重な機会です。野球初心者のお子様でも安心してご参加いただけます。</p>

            <h2>久留米球場であそぼっ！プログラム</h2>
            <p>当日は、久留米市野球場の広大なフィールドで、野球の楽しさを体感できる多彩なプログラムをご用意しています。</p>

            <h3>午前の部 （野球体験）</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div>親子ティーボール</div>
              <div>ストラックアウト</div>
              <div>久留米ビジョン特別企画</div>
            </div>

            <h3>午後の部（午後の部は学童軟式野球チーム対象）</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div>ベースボール5</div>
              <div>キャッチボールクラシック</div>
              <div>古希野球チーム vs 学童チーム</div>
            </div>

            <h2>会場情報</h2>
            <ul>
              <li><strong>開催会場：</strong> 久留米市野球場</li>
              <li><strong>会場住所：</strong> 福岡県久留米市東櫛原町173</li>
              <li><strong>駐車場：</strong> リバーサイドパーク東櫛原</li>
            </ul>
            <p style={{ color: '#dc3545' }}>駐車場はリバーサイドパークをご利用ください。久留米市野球場及び久留米アリーナには駐車出来ません。</p>
            <p><strong>アクセス：</strong></p>
            <ul>
              <li>JR久留米駅からバス約15分</li>
              <li>西鉄久留米駅からバス約10分</li>
            </ul>
            <p>雨天の場合は、久留米市野球連盟の公式ウェブサイト（申し込みサイト）でお知らせいたします。</p>

            <h2>開催実績</h2>
            <table className={styles.table} style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: '#6c757d', color: '#fff', padding: '1rem' }}>開催日</th>
                  <th style={{ backgroundColor: '#6c757d', color: '#fff', padding: '1rem' }}>参加者数</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ backgroundColor: '#f8f9fa', padding: '1rem' }}>2025年11月9日</td>
                  <td style={{ backgroundColor: '#f8f9fa', padding: '1rem' }}>雨天中止</td>
                </tr>
              </tbody>
            </table>

            <h2>主催・共催</h2>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ marginBottom: '0.5rem' }}><strong>主催</strong></p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>久留米市野球連盟</div>
                  <div>久留米北ロータリークラブ</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ marginBottom: '0.5rem' }}><strong>共催</strong></p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>久留米市</div>
                  <div>久留米市教育委員会</div>
                  <div>（公財）久留米市スポーツ協会</div>
                  <div>福岡県高等学校野球連盟</div>
                  <div>久留米総合スポーツセンター</div>
                </div>
              </div>

              <div>
                <p style={{ marginBottom: '0.5rem' }}><strong>主管</strong></p>
                <div>野球感謝祭実行委員会</div>
              </div>
            </div>

            <h2>協賛企業・団体</h2>
            <p>本イベントは以下の企業・団体様のご協賛により開催されています。</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '1rem'
            }}>
              <div>株式会社筑邦銀行</div>
              <div>筑後信用金庫</div>
              <div>株式会社駅前不動産</div>
              <div>株式会社CRCCメディア</div>
              <div>株式会社共同写真企画</div>
              <div>田中藍株式会社</div>
              <div>丸永製菓株式会社</div>
              <div>北原ウェルテック株式会社</div>
              <div>損害保険ジャパン株式会社</div>
              <div>第一生命保険株式会社</div>
              <div>あいおいニッセイ同和損保株式会社</div>
              <div>ミズノ株式会社</div>
              <div>内外ゴム株式会社</div>
              <div>ナガセケンコー株式会社</div>
              <div>マルエス株式会社</div>
              <div>昭光株式会社</div>
              <div>株式会社カネタニ</div>
            </div>

            <h2>お問い合わせ・事務局</h2>
            <p><strong>久留米市野球連盟 事務局</strong></p>
            <ul>
              <li><strong>電話：</strong> 0942-38-8333</li>
              <li><strong>FAX：</strong> 0942-27-6332</li>
              <li><strong>メール：</strong> zennan-fukuoka@aqua.plala.or.jp</li>
              <li><strong>受付時間：</strong> 10:00〜16:00 (火曜・日曜・祝日を除く)</li>
              <li><strong>所在地：</strong> 〒830-0003 福岡県久留米市東櫛原町173</li>
            </ul>
          </div>
        </div>
        <BlockSidebar tournaments={tournaments} />
      </main>
      <Footer />
    </div>
  );
}
