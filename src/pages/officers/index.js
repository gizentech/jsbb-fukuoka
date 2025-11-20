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

export default function Officers({ tournaments = [] }) {
  const branchOfficersGrouped = {
    '行橋': { president: '村上 泰治', director: '杉山 憲二', secretary: '山下 博' },
    '苅田': { president: '浜本 和彦', director: '山内 淳史', secretary: '山内 淳史' },
    '豊前': { president: '稲葉 淳一', director: '山田 功治', secretary: '岡本 周作' },
    '北九州': { president: '宮田 義髙', director: '久米田 修', secretary: '栁川 尚孝' },
    '中遠': { president: '縄田 芳夫', director: '福山 康憲', secretary: '福山 康憲' },
    '直鞍': { president: '柴田 正博', director: '森本 浩', secretary: '高﨑 建一' },
    '嘉飯': { president: '森山 元昭', director: '井上 茂', secretary: '口石 泰博' },
    '田川': { president: '蜂屋 哲夫', director: '蜂屋 哲夫', secretary: '清川 憲一' },
    '古賀': { president: '内野 邦博', director: '内野 邦博', secretary: '楢橋 俊雄' },
    '糟屋': { president: '中村 希', director: '中村 希', secretary: '中村 希' },
    '宗像': { president: '平 泰勇', director: '北﨑 正則', secretary: '山下 真' },
    '福岡': { president: '浜崎 太郎', director: '吉塚 哲夫', secretary: '西村 浩二' },
    '筑紫': { president: '山内 直人', director: '山内 直人', secretary: '山内 直人' },
    '大野城': { president: '桑野 芳幸', director: '桑野 芳幸', secretary: '内田 隆文' },
    '久留米': { president: '吉田 茂', director: '中村 敏治', secretary: '古賀 正治' },
    '朝倉': { president: '林 裕二', director: '平田 徹', secretary: '長沼 秀彦' },
    '八女': { president: '三田村 統之', director: '田島 茂樹', secretary: '江﨑 泰輔' },
    '浮羽': { president: '石井 榮二', director: '江藤 明', secretary: '後藤 まゆみ' },
    '小郡': { president: '中原 規行', director: '永利 義広', secretary: '濵﨑 徳夫' },
    '柳川': { president: '近藤 末治', director: '高口 博毅', secretary: '橋本 祐二郎' },
    '大川大木': { president: '足達 剛', director: '福永 寛', secretary: '広松 政則' },
    '筑後': { president: '下川 廣志', director: '原 英登志', secretary: '野口 幹雄' },
    '大牟田': { president: '世良 佳弘', director: '野田 幹雄', secretary: '野田 幹雄' }
  };

  const blockLeaders = [
    { position: '京築ブロック長', name: '杉山憲二' },
    { position: '北九州ブロック長', name: '久米田 修' },
    { position: '筑豊ブロック長', name: '蜂屋哲夫' },
    { position: '東福岡ブロック長', name: '北﨑正則' },
    { position: '福岡ブロック長', name: '吉塚哲夫' },
    { position: '久留米ブロック長', name: '野中敏則' },
    { position: '北筑後ブロック長', name: '永利義広' },
    { position: '南筑後ブロック長', name: '野田幹雄' }
  ];

  const prefectureOfficersGrouped = {
    '顧問': ['古賀 正弘', '野村 天朗'],
    '参与': ['川嶋 隆', '村下 和之'],
    '会長': [{ name: '石原 廣士', role: '全日本軟式野球連盟 相談役' }],
    '副会長': ['石川 浩二朗', '宮田 義髙', '吉田 茂'],
    '理事長': [{ name: '中村 敏治', role: '全日本軟式野球連盟 顧問' }],
    '副理事長': ['片山 芳幸', '森本 浩', '和佐野 一文'],
    '常務理事': [
      { name: '杉山 憲二', role: '京築ブロック長' },
      { name: '久米田 修', role: '北九州ブロック長' },
      { name: '蜂屋 哲夫', role: '筑豊ブロック長' },
      { name: '北﨑 正則', role: '東福岡ブロック長' },
      { name: '吉塚 哲夫', role: '福岡ブロック長' },
      { name: '野中 敏則', role: '久留米ブロック長' },
      { name: '永利 義広', role: '北筑後ブロック長' },
      { name: '野田 幹雄', role: '南筑後ブロック長' },
      { name: '古賀 正治', role: '事務局長' },
      { name: '穴井 政美', role: '渉外担当' },
      { name: '菰田 浩', role: '審判長・全日本軟式野球連盟 評議員' }
    ],
    '理事': [
      '山内 淳史', '栁川 尚孝', '福山 康憲', '中村 希', '山内 直人',
      '荒巻 清士', '江藤 明', '高口 博毅', '古川 裕士', '木下 幸洋',
      '水口 孝二', '深町 吉秀', '満潮 辰哉', '中村 佳裕', '嶌田 英志',
      '田中 憲治', { name: '三原 清美', role: '事務局次長' }, '沖田 美記'
    ],
    '監事': ['白銀 太一', '田中 孝一'],
    '評議員': [
      '山下 博', '河津 宏和', '山田 功治', '井本 龍也', '野田 重孝',
      '井上 茂', '穐山 孝', '内野 邦博', '木下 一孝', '山下 真',
      '西村 浩二', '横関 浩一', '桑野 芳幸', '平田 徹', '田島 茂樹',
      '藤田 成男', '川野 裕三', '中野 巳義', '福永 寛', '原 英登志', '猿渡 篤'
    ]
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>役員およびスタッフ</h1>
            <span>OFFICERS & STAFF</span>
          </div>

          <div className={styles.content}>
            <p style={{ margin: '0 0 32px', lineHeight: '1.8', color: '#666' }}>
              福岡県軟式野球連盟の役員およびスタッフをご紹介します。
            </p>

            {/* 県連盟役員 */}
            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '48px 0 24px 0', paddingBottom: '12px', borderBottom: '2px solid #3182ce', color: '#333' }}>
              県連盟役員
            </h2>

            {Object.entries(prefectureOfficersGrouped).map(([position, members], groupIndex) => (
              <div key={groupIndex} style={{ marginBottom: '20px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#333',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {position}
                  <span style={{ fontSize: '14px', fontWeight: 400, color: '#999' }}>
                    （{members.length}名）
                  </span>
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '2px 8px'
                }}>
                  {members.map((member, index) => {
                    const isObject = typeof member === 'object';
                    return (
                      <div key={index} style={{
                        padding: '4px 10px',
                        fontSize: '14px',
                        color: '#333',
                        lineHeight: '1.4'
                      }}>
                        {isObject ? (
                          <>
                            <div>{member.name}</div>
                            <div style={{ fontSize: '12px', color: '#999', marginTop: '2px', whiteSpace: 'nowrap' }}>
                              （{member.role}）
                            </div>
                          </>
                        ) : (
                          member
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* 支部役員 */}
            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '48px 0 24px 0', paddingBottom: '12px', borderBottom: '2px solid #3182ce', color: '#333' }}>
              支部役員
            </h2>

            <div className={styles.branchOfficersGrid}>
              {Object.entries(branchOfficersGrouped).map(([branch, officers], groupIndex) => (
                <div key={groupIndex} style={{ marginBottom: '16px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#333',
                    marginBottom: '6px'
                  }}>
                    {branch}支部
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '2px 8px'
                  }}>
                    <div style={{ padding: '4px 10px', fontSize: '14px', color: '#666' }}>
                      支部長：{officers.president}
                    </div>
                    <div style={{ padding: '4px 10px', fontSize: '14px', color: '#666' }}>
                      理事長：{officers.director}
                    </div>
                    <div style={{ padding: '4px 10px', fontSize: '14px', color: '#666' }}>
                      事務局：{officers.secretary}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <BlockSidebar tournaments={tournaments} showAboutMenu={true} />
      </main>
      <Footer />
    </div>
  );
}
