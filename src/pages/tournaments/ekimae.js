// ファイル: /pages/tournaments/ekimae.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Meta from '../../components/Meta/Meta';
import styles from '../../styles/Ekimae.module.css';
import Image from 'next/image';
import { pdfjs } from 'react-pdf';

// PDF.js workerの設定
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// PDFサムネイルコンポーネント
const PdfThumbnail = ({ pdfUrl }) => {
  const [thumbnailSrc, setThumbnailSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pdfUrl) return;

    const renderPdf = async () => {
      try {
        setLoading(true);
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const canvas = document.createElement('canvas');
        const viewport = page.getViewport({ scale: 1.0 });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: canvas.getContext('2d'),
          viewport: viewport
        };

        await page.render(renderContext).promise;

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
    <div className={styles.pdfPreviewContainer}>
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

// getServerSidePropsでCMSからデータ取得
export async function getServerSideProps() {
  try {
    // Newt CMS API設定
    const SPACE_UID = process.env.NEWT_SPACE_UID;
    const TOKEN = process.env.NEWT_API_TOKEN;
    const APP_UID = 'tournament';

    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    // tour-createからekimaeの大会マスター情報を取得
    const masterUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${APP_UID}/tour-create?id=ekimae`;

    const masterResponse = await fetch(masterUrl, { headers });

    if (!masterResponse.ok) {
      console.error('Failed to fetch ekimae master data:', masterResponse.status);
      return {
        props: {
          tournament: null,
          error: 'マスター情報の取得に失敗しました'
        }
      };
    }

    const masterData = await masterResponse.json();

    if (!masterData.items || masterData.items.length === 0) {
      return {
        props: {
          tournament: null,
          error: 'マスター情報が見つかりません。CMSで id=ekimae のデータを作成してください。'
        }
      };
    }

    const masterInfo = masterData.items[0];

    // tournamentモデルから関連する大会情報を取得
    const tournamentUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${APP_UID}/tournament?tournament=${masterInfo._id}&depth=1`;

    const tournamentResponse = await fetch(tournamentUrl, { headers });

    if (!tournamentResponse.ok) {
      console.error('Failed to fetch ekimae tournament data:', tournamentResponse.status);
    }

    const tournamentData = await tournamentResponse.json();
    const items = tournamentData.items || [];

    // 大会回数ごとのデータを整理
    let updates = [];

    if (items.length > 0) {
      updates = items.map(item => {
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
          body: item.infomation || '',
          startDate: startDate,
          endDate: endDate,
          fileUrl: item.file?.src || null,
          fileName: item.file?.fileName || 'トーナメント表.pdf',
          headerImage: item['header-image']?.src || null, // PDFヘッダー画像
          meta: item.meta || ''
        };
      });

      // 大会回数でソート（降順）
      updates.sort((a, b) => parseInt(b.count) - parseInt(a.count));
    }

    const tournamentInfo = {
      id: 'ekimae',
      title1: '駅前不動産旗',
      title2: '久留米近圏秋季学童軟式野球大会',
      thumbnail: masterInfo['cover-img']?.src || '/images/ekimae.webp',
      description: masterInfo['tournament-info'] || '駅前不動産旗 久留米近圏秋季学童軟式野球大会の情報をお届けします。',
      banner: masterInfo['banner']?.src || '/images/ekimae-burner1.webp', // バナー画像（デフォルト）
      updates: updates
    };

    return {
      props: {
        tournament: tournamentInfo,
        error: null
      }
    };
  } catch (error) {
    console.error('Error fetching ekimae tournament:', error);
    return {
      props: {
        tournament: null,
        error: error.message || 'エラーが発生しました'
      }
    };
  }
}

export default function EkimaeTournamentDetail({ tournament, error }) {
  const [fontSize, setFontSize] = useState({ title1: 3.5, title2: 2.5 });

  useEffect(() => {
    const adjustFontSize = () => {
      if (!tournament) return;

      const containerWidth = document.querySelector(`.${styles.titleWrapper}`)?.offsetWidth;
      if (!containerWidth) return;

      let currentSize = 3.5;
      const minSize = 1.5;
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

  if (error || !tournament) {
    return (
      <div className={styles.wrapper}>
        <Meta
          title="駅前不動産旗 久留米近圏秋季学童軟式野球大会"
          description="駅前不動産旗 久留米近圏秋季学童軟式野球大会の情報"
        />
        <Header />
        <div className={styles.error}>
          {error || '大会情報が見つかりませんでした'}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Meta
        title={`${tournament.title1} ${tournament.title2}`}
        description={tournament.description}
      />
      <Header />

      <div className={styles.titleSection}>
        <div className={styles.titleBackground}>
          <Image
            src={tournament.thumbnail}
            alt=""
            fill
            sizes="100vw"
            className={styles.titleBackgroundImage}
            priority
            onError={(e) => {
              e.currentTarget.src = '/images/ekimae.webp';
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
        </div>
      </div>

      {/* バナーセクション */}
      {tournament.banner && (
        <div className={styles.bannerSection}>
          <a
            href="https://www.ekimae-r-e.co.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.bannerLink}
          >
            <Image
              src={tournament.banner}
              alt="大会バナー"
              width={1200}
              height={300}
              className={styles.bannerImage}
              style={{ width: '100%', height: 'auto' }}
              priority
            />
          </a>
        </div>
      )}

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
                <div className={styles.updateHeader}>
                  <h2 className={styles.updateTitle}>
                    第{update.count}回 {update.year && `(${update.year}年)`}
                  </h2>
                </div>

                {(update.startDate || update.endDate) && (
                  <div className={styles.tournamentPeriod}>
                    <p className={styles.periodTitle}>開催期間:</p>
                    <p className={styles.periodDate}>
                      {update.startDate}
                      {update.endDate && update.startDate !== update.endDate && ` 〜 ${update.endDate}`}
                    </p>
                  </div>
                )}

                {/* PDFヘッダー画像（駅前不動産旗専用） */}
                {update.headerImage && (
                  <div className={styles.pdfHeaderImage}>
                    <Image
                      src={update.headerImage}
                      alt="大会情報ヘッダー"
                      width={800}
                      height={400}
                      className={styles.headerImage}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </div>
                )}

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

                {update.meta && (
                  <div className={styles.metaInfo}>
                    <h3 className={styles.metaTitle}>備考</h3>
                    <p>{update.meta}</p>
                  </div>
                )}

                <p className={styles.updateDate}>
                  更新日: {new Date(update.updatedAt).toLocaleString('ja-JP')}
                </p>
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
