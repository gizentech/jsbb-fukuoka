import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Meta from '../../components/Meta/Meta';
import styles from '../../styles/TournamentDetail.module.css';
import Image from 'next/image';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function TournamentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [tournament, setTournament] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState('');
  const [fontSize, setFontSize] = useState({ title1: 2.5, title2: 1.8 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchTournament = async () => {
      try {
        // Newt CMS API設定
        const SPACE_UID = 'jsbb-kurume';
        const TOKEN = 'vdfn4Mdxq2GaU2YMDW1dTIBB7fdgKGLV-pQZfufNZbs';
        const APP_UID = 'tournament';
        
        const headers = {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        };
        
        // tour-createからIDに基づき大会マスター情報を取得
        const masterUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${APP_UID}/tour-create?id=${id}`;
        console.log('Fetching master data:', masterUrl);
        
        const masterResponse = await fetch(masterUrl, { headers });
        
        if (!masterResponse.ok) {
          console.error(`Master API Error: ${masterResponse.status} ${masterResponse.statusText}`);
          throw new Error(`API request failed with status ${masterResponse.status}`);
        }
        
        const masterData = await masterResponse.json();
        
        if (!masterData.items || masterData.items.length === 0) {
          setError('大会情報が見つかりませんでした');
          setLoading(false);
          return;
        }
        
        const masterInfo = masterData.items[0];
        console.log('Master info:', masterInfo);
        
        // 正しいクエリパラメータを使用：tournamentは参照フィールド名
        const tournamentUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${APP_UID}/tournament?tournament=${masterInfo._id}&depth=1`;
        console.log('Fetching tournament data:', tournamentUrl);
        
        const tournamentResponse = await fetch(tournamentUrl, { headers });
        
        if (!tournamentResponse.ok) {
          console.error(`Tournament API Error: ${tournamentResponse.status} ${tournamentResponse.statusText}`);
          throw new Error(`Tournament API request failed with status ${tournamentResponse.status}`);
        }
        
        const tournamentData = await tournamentResponse.json();
        const tournamentItems = tournamentData.items || [];
        console.log('Tournament items:', tournamentItems);
        
        // マスター情報だけで表示できるように準備
        let tournamentInfo = {
          id: masterInfo._id,
          title1: masterInfo['tournament-name'] || '',
          title2: '', // サブタイトルから回数を除去
          thumbnail: masterInfo['cover-img']?.src || '/images/top0.webp',
          description: masterInfo['tournament-info'] || '',  // 大会の説明文を追加
          updates: []
        };
        
        // 更新情報を構築
        if (tournamentItems.length > 0) {
          const updates = tournamentItems.map(item => {
            console.log('Processing tournament item:', item);
            
            // 日付をフォーマット
            const formatDate = (dateString) => {
              if (!dateString) return '';
              const date = new Date(dateString);
              return date.toLocaleDateString('ja-JP', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
            };
            
            const startDate = formatDate(item.startdate);
            const endDate = formatDate(item['end-date']);
            
            return {
              count: item['tournament-no'] ? String(item['tournament-no']) : '1',
              year: item.year || new Date().getFullYear(),
              updatedAt: item._sys.updatedAt || new Date().toISOString(),
              body: item.infomation || '',  // 大会詳細情報
              startDate: startDate,         // 開始日
              endDate: endDate,             // 終了日
              fileUrl: item.file?.src || null,
              fileName: item.file?.fileName || 'トーナメント表.pdf',
              meta: item.meta || ''         // メタ情報も追加
            };
          });
          
          // 更新情報を回数の降順でソート（数値として比較）
          updates.sort((a, b) => parseInt(b.count) - parseInt(a.count));
          
          // 最新の大会情報を取得（回数はサブタイトルから除外）
          tournamentInfo = {
            id: masterInfo._id,
            title1: masterInfo['tournament-name'] || '',
            title2: '', // サブタイトルから回数を除去
            thumbnail: masterInfo['cover-img']?.src || '/images/top0.webp',
            description: masterInfo['tournament-info'] || '',  // 大会の説明文
            updates: updates
          };
          
          // 最も大きい回数（最新）を初期選択
          if (updates.length > 0) {
            // updates配列はすでに回数の降順でソート済みなので、最初の要素が最新
            setSelectedUpdate(updates[0].count);
          }
        } else {
          // トーナメントデータが取得できない場合は、マスター情報だけで表示
          tournamentInfo.updates = [{
            count: '-',
            year: new Date().getFullYear(),
            updatedAt: masterInfo._sys.updatedAt,
            body: masterInfo['tournament-info'] || '大会の詳細情報はまもなく公開されます。',
            startDate: '',
            endDate: '',
            fileUrl: null,
            fileName: null,
            meta: masterInfo.meta || ''
          }];
          setSelectedUpdate('1');
        }
        
        setTournament(tournamentInfo);
      } catch (error) {
        console.error('Error fetching tournament:', error);
        setError('大会情報の取得に失敗しました: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  useEffect(() => {
    const adjustFontSize = () => {
      if (!tournament) return;

      const containerWidth = document.querySelector(`.${styles.titleWrapper}`)?.offsetWidth;
      if (!containerWidth) return;

      let currentSize = 2.5;
      const minSize = 1;
      const step = 0.1;

      const title1Length = tournament.title1.length;
      const title2Length = tournament.title2.length;
      const longerTitleLength = Math.max(title1Length, title2Length);

      while (currentSize > minSize) {
        const estimatedWidth = longerTitleLength * (currentSize * 16);
        if (estimatedWidth <= containerWidth * 0.9) {
          break;
        }
        currentSize -= step;
      }

      setFontSize({
        title1: currentSize,
        title2: currentSize * 0.72 // title2 は title1 の 72% のサイズ
      });
    };

    adjustFontSize();
    window.addEventListener('resize', adjustFontSize);
    return () => window.removeEventListener('resize', adjustFontSize);
  }, [tournament]);

  const handleUpdateSelect = (count) => {
    setSelectedUpdate(count);
    setIsMenuOpen(false);
  };

  // 選択された回数の更新情報を取得
  const getSelectedUpdate = () => {
    if (!tournament || !tournament.updates || !selectedUpdate) return null;
    return tournament.updates.find(update => update.count === selectedUpdate);
  };

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>読み込み中...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className={styles.wrapper}>
        <Header />
        <div className={styles.error}>{error || '大会情報が見つかりませんでした'}</div>
        <Footer />
      </div>
    );
  }

  const selectedUpdateData = getSelectedUpdate();

  return (
    <div className={styles.wrapper}>
      <Meta 
        title={`${tournament.title1} ${tournament.title2}`}
        description={`${tournament.title1} ${tournament.title2}の大会情報ページです`}
      />
      <Header />
      
      <div className={styles.titleSection}>
        <div className={styles.titleBackground}>
          <Image
            src={tournament.thumbnail || '/images/top0.webp'}
            alt=""
            fill
            sizes="100vw"
            className={styles.titleBackgroundImage}
            priority
            onError={(e) => {
              e.currentTarget.src = '/images/default.webp';
            }}
          />
        </div>
        <div className={styles.titleContainer}>
          <div className={styles.titleWrapper}>
            <h1 
              className={styles.title1} 
              style={{ fontSize: `${fontSize.title1}rem` }}
            >
              {tournament.title1}
            </h1>
            {tournament.title2 && (
              <h2 
                className={styles.title2} 
                style={{ fontSize: `${fontSize.title2}rem` }}
              >
                {tournament.title2}
              </h2>
            )}
          </div>
          
          {tournament.updates && tournament.updates.length > 0 && (
            <div className={styles.pcSelect}>
              <select 
                value={selectedUpdate}
                onChange={(e) => handleUpdateSelect(e.target.value)}
                className={styles.updateSelect}
              >
                <option value="">回数を選択</option>
                {tournament.updates.map((update, index) => (
                  <option key={index} value={update.count}>
                    第{update.count}回 {update.year && `(${update.year}年)`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 大会概要エリア */}
      {tournament.description && (
        <div className={styles.tournamentDescription}>
          <h3 className={styles.descriptionTitle}>大会概要</h3>
          <div 
            className={styles.descriptionText}
            dangerouslySetInnerHTML={{ __html: tournament.description }}
          />
        </div>
      )}

      {tournament.updates && tournament.updates.length > 0 && (
        <div className={styles.spMenu}>
          <button 
            className={styles.menuButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="メニューを開く"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          {isMenuOpen && (
            <div className={styles.mobileMenu}>
              {tournament.updates.map((update, index) => (
                <button
                  key={index}
                  onClick={() => handleUpdateSelect(update.count)}
                  className={styles.mobileMenuItem}
                >
                  第{update.count}回 {update.year && `(${update.year}年)`}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <main className={styles.main}>
        {selectedUpdateData ? (
          <div className={styles.selectedUpdateContainer}>
            <div className={styles.updateHeader}>
              <h2 className={styles.updateTitle}>
                第{selectedUpdateData.count}回 {selectedUpdateData.year && `(${selectedUpdateData.year}年)`}
              </h2>
            </div>
              
            {/* 期間情報 */}
            {(selectedUpdateData.startDate || selectedUpdateData.endDate) && (
              <div className={styles.tournamentPeriod}>
                <p className={styles.periodTitle}>開催期間:</p>
                <p className={styles.periodDate}>
                  {selectedUpdateData.startDate}
                  {selectedUpdateData.endDate && selectedUpdateData.startDate !== selectedUpdateData.endDate && ` 〜 ${selectedUpdateData.endDate}`}
                </p>
              </div>
            )}
            
            <p className={styles.updateDate}>
              更新日: {new Date(selectedUpdateData.updatedAt).toLocaleString('ja-JP')}
            </p>
            
            {/* PDFリンク */}
            {selectedUpdateData.fileUrl && (
              <a 
                href={selectedUpdateData.fileUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.pdfLink}
              >
              トーナメント表を開く
              </a>
            )}
            
            {/* 大会詳細情報を直接表示 */}
            {selectedUpdateData.body && (
              <div className={styles.detailContent}>
                <h3 className={styles.detailTitle}>大会詳細</h3>
                <div dangerouslySetInnerHTML={{ __html: selectedUpdateData.body }} />
              </div>
            )}
            
            {/* メタ情報があれば表示 */}
            {selectedUpdateData.meta && (
              <div className={styles.metaInfo}>
                <h3 className={styles.metaTitle}>備考</h3>
                <p>{selectedUpdateData.meta}</p>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.noUpdates}>
            <p>この大会の詳細情報はまだ登録されていません。</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}