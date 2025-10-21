// ファイル: /pages/tournaments/[id].js
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Meta from '../../components/Meta/Meta';
import styles from '../../styles/TournamentDetail.module.css';
import Image from 'next/image';
import { pdfjs } from 'react-pdf';

// PDF.js workerの設定
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// PDFサムネイルコンポーネント - 修正版
const PdfThumbnail = ({ pdfUrl }) => {
  const [thumbnailSrc, setThumbnailSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    if (!pdfUrl) return;

    const renderPdf = async () => {
      try {
        setLoading(true);
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1); // 最初のページを取得

        const canvas = document.createElement('canvas');
        const viewport = page.getViewport({ scale: 1.0 });

        // 横向きか縦向きか判断
        const landscape = viewport.width > viewport.height;
        setIsLandscape(landscape);

        // スケールを調整（より大きく表示）
        const scale = landscape ? 2.0 : 2.0;
        const scaledViewport = page.getViewport({ scale });

        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        const renderContext = {
          canvasContext: canvas.getContext('2d'),
          viewport: scaledViewport
        };

        await page.render(renderContext).promise;

        // キャンバスの内容をBase64画像に変換
        const thumbnailDataUrl = canvas.toDataURL('image/png');
        setThumbnailSrc(thumbnailDataUrl);
        setLoading(false);
      } catch (err) {
        console.error('Error rendering PDF:', err);
        setError(err);
        setLoading(false);
      }
    };

    renderPdf();
  }, [pdfUrl]);

  if (loading) return <div className={styles.thumbnailLoading}>サムネイル読み込み中...</div>;
  if (error) return <div className={styles.thumbnailError}>プレビューを表示できません</div>;

  return (
    <div className={`${styles.pdfPreviewContainer} ${isLandscape ? styles.landscape : styles.portrait}`}>
      {thumbnailSrc && (
        <img
          src={thumbnailSrc}
          alt="PDFサムネイル"
          className={styles.pdfCanvas}
        />
      )}
    </div>
  );
};

// getStaticPathsとgetStaticPropsを削除して、getServerSidePropsに変更
export async function getServerSideProps({ params }) {
  try {
    // Newt CMS API設定
    const SPACE_UID = process.env.NEWT_SPACE_UID;
    const TOKEN = process.env.NEWT_API_TOKEN;
    const APP_UID = 'fukuoka-tournament'; // 福岡県大会情報用

    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    // IDで直接大会情報を取得
    const tournamentUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${APP_UID}/fukuoka-tor/${params.id}`;

    const tournamentResponse = await fetch(tournamentUrl, { headers });

    if (!tournamentResponse.ok) {
      return { notFound: true };
    }

    const masterInfo = await tournamentResponse.json();

    // 日付フォーマット用の関数
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // tor-dataから大会枠情報を取得
    const frameInfo = masterInfo['tor-data'] || {};
    const torDataId = frameInfo['id'];

    // 同じtor-data.idを持つ大会を全て取得
    let allTournaments = [];
    if (torDataId) {
      // tor-dataのidでフィルタリング
      const allTournamentsUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${APP_UID}/fukuoka-tor?limit=100&depth=1`;

      try {
        const allTournamentsResponse = await fetch(allTournamentsUrl, { headers });
        if (allTournamentsResponse.ok) {
          const allTournamentsData = await allTournamentsResponse.json();
          // tor-dataのidが一致するものだけフィルタ
          allTournaments = (allTournamentsData.items || []).filter(item => {
            return item['tor-data']?.id === torDataId;
          });
          console.log('tor-data id:', torDataId);
          console.log('Found tournaments:', allTournaments.length);
        } else {
          console.error('Failed to fetch tournaments:', allTournamentsResponse.status);
        }
      } catch (error) {
        console.error('Error fetching related tournaments:', error);
      }
    } else {
      console.log('No tor-data id found');
    }

    // 大会を回数順（降順）にソート
    const sortedTournaments = allTournaments.length > 0
      ? allTournaments
          .filter(item => item['tor-no']) // tor-noがあるものだけ
          .sort((a, b) => (b['tor-no'] || 0) - (a['tor-no'] || 0))
      : [];

    // 更新情報を構築
    const updates = sortedTournaments.length > 0
      ? sortedTournaments.map(item => ({
          count: item['tor-no'] || '1',
          year: item['tor-start'] ? new Date(item['tor-start']).getFullYear() : new Date().getFullYear(),
          updatedAt: item._sys?.updatedAt || new Date().toISOString(),
          body: '',
          startDate: formatDate(item['tor-start']),
          endDate: formatDate(item['end-tor']),
          fileUrl: item['fuku-tournament']?.src || null,
          fileName: item['fuku-tournament']?.fileName || 'トーナメント表.pdf',
          meta: item['win-team-fukuoka'] ? `優勝チーム: ${item['win-team-fukuoka']}` : ''
        }))
      : [{
          count: masterInfo['tor-no'] || '1',
          year: masterInfo['tor-start'] ? new Date(masterInfo['tor-start']).getFullYear() : new Date().getFullYear(),
          updatedAt: masterInfo._sys?.updatedAt || new Date().toISOString(),
          body: '',
          startDate: formatDate(masterInfo['tor-start']),
          endDate: formatDate(masterInfo['end-tor']),
          fileUrl: masterInfo['fuku-tournament']?.src || null,
          fileName: masterInfo['fuku-tournament']?.fileName || 'トーナメント表.pdf',
          meta: masterInfo['win-team-fukuoka'] ? `優勝チーム: ${masterInfo['win-team-fukuoka']}` : ''
        }];

    // 大会情報を構築
    const tournamentInfo = {
      id: masterInfo._id,
      title1: frameInfo['fukuoka-title1'] || '大会',
      title2: frameInfo['fukuoka-title2'] || '',
      thumbnail: masterInfo['fuku-tournament']?.src || '/images/top0.webp',
      description: '',
      fukuokaClass: frameInfo['fukuoka-class'] || [],
      area: masterInfo.area || '',
      updates: updates
    };
    
    return {
      props: {
        tournament: tournamentInfo
      }
    };
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return { 
      notFound: true
    };
  }
}

export default function TournamentDetail({ tournament }) {
  const [fontSize, setFontSize] = useState({ title1: 2.5, title2: 1.8 });
  const [openIndex, setOpenIndex] = useState(-1); // 全て閉じた状態

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

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
        title2: currentSize * 0.72
      });
    };

    adjustFontSize();
    window.addEventListener('resize', adjustFontSize);
    return () => window.removeEventListener('resize', adjustFontSize);
  }, [tournament]);

  if (!tournament) {
    return (
      <div className={styles.wrapper}>
        <Header />
        <div className={styles.error}>大会情報が見つかりませんでした</div>
        <Footer />
      </div>
    );
  }

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
            {tournament.fukuokaClass && Array.isArray(tournament.fukuokaClass) && tournament.fukuokaClass.length > 0 && (
              <div className={styles.classLabels}>
                {tournament.fukuokaClass.map((item, index) => (
                  <span key={index} className={styles.classLabel}>
                    {typeof item === 'object' ? item.label : item}
                  </span>
                ))}
              </div>
            )}
            <h1
              className={styles.mainTitle}
              style={{ fontSize: `${fontSize.title1}rem` }}
            >
              {tournament.title1}
            </h1>
            {tournament.title2 && (
              <h2
                className={styles.subTitle}
                style={{ fontSize: `${fontSize.title1}rem` }}
              >
                {tournament.title2}
              </h2>
            )}
          </div>
        </div>
      </div>

      {tournament.description && (
        <div className={styles.tournamentDescription}>
          <h3 className={styles.descriptionTitle}>大会概要</h3>
          <div
            className={styles.descriptionText}
            dangerouslySetInnerHTML={{ __html: tournament.description }}
          />
        </div>
      )}

      <main className={styles.main}>
        {tournament.updates && tournament.updates.length > 0 ? (
          <div className={styles.allUpdatesContainer}>
            {tournament.updates.map((update, index) => (
              <div key={index} className={styles.updateItem}>
                <div
                  className={styles.updateHeader}
                  onClick={() => toggleAccordion(index)}
                >
                  <div className={styles.accordionIconWrapper}>
                    <span className={styles.accordionIcon}>
                      {openIndex === index ? '−' : '+'}
                    </span>
                  </div>
                  <div className={styles.headerContent}>
                    <div className={styles.headerMainLine}>
                      <span className={styles.updateYear}>
                        {update.year}年
                      </span>
                      {update.meta && update.meta.includes('優勝チーム:') && (
                        <span className={styles.winnerInfo}>
                          優勝　{update.meta.replace('優勝チーム: ', '')}
                        </span>
                      )}
                    </div>
                    <div className={styles.headerSubLines}>
                      {tournament.area && (
                        <div className={styles.headerSubLine}>
                          開催支部：{typeof tournament.area === 'object' ? tournament.area.label : tournament.area}
                        </div>
                      )}
                      {(update.startDate || update.endDate) && (
                        <div className={styles.headerSubLine}>
                          大会期間：{update.startDate}
                          {update.endDate && update.startDate !== update.endDate && ` 〜 ${update.endDate}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {openIndex === index && (
                  <div className={styles.accordionContent}>
                    {update.fileUrl && (
                      <>
                        <PdfThumbnail pdfUrl={update.fileUrl} />
                        <a
                          href={update.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.pdfLink}
                        >
                          トーナメント表を開く
                        </a>
                      </>
                    )}

                    {update.body && (
                      <div className={styles.detailContent}>
                        <h3 className={styles.detailTitle}>大会詳細</h3>
                        <div dangerouslySetInnerHTML={{ __html: update.body }} />
                      </div>
                    )}

                    <p className={styles.updateDate}>
                      更新日: {new Date(update.updatedAt).toLocaleString('ja-JP')}
                    </p>
                  </div>
                )}
              </div>
            ))}
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