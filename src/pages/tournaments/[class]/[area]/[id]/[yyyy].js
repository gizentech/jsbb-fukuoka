import React, { useState, useEffect } from 'react';
import Header from '../../../../../components/Header/Header';
import Footer from '../../../../../components/Footer/Footer';
import Meta from '../../../../../components/Meta/Meta';
import TournamentSidebar from '../../../../../components/TournamentSidebar/TournamentSidebar';
import Breadcrumb from '../../../../../components/Breadcrumb/Breadcrumb';
import styles from '../../../../../styles/TournamentDetail.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { pdfjs } from 'react-pdf';
import { classSlugToDisplay } from '../../../../../utils/classConvert';

// PDF.js workerの設定
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// PDFサムネイルコンポーネント
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
        const page = await pdf.getPage(1);

        const canvas = document.createElement('canvas');
        const viewport = page.getViewport({ scale: 1.0 });

        const landscape = viewport.width > viewport.height;
        setIsLandscape(landscape);

        const scale = landscape ? 2.0 : 2.0;
        const scaledViewport = page.getViewport({ scale });

        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        const renderContext = {
          canvasContext: canvas.getContext('2d'),
          viewport: scaledViewport
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

export async function getServerSideProps({ params }) {
  try {
    // パラメータから取得
    const { yyyy, class: classSlug, area: areaSlug, id: torDataId } = params;

    // Newt CMS API設定
    const SPACE_UID = process.env.NEWT_SPACE_UID;
    const TOKEN = process.env.NEWT_API_TOKEN;
    const APP_UID = 'fukuoka-tournament';

    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    // YYYYとtor-data.idで大会情報を取得
    const allTournamentsUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${APP_UID}/fukuoka-tor?limit=1000&depth=2`;
    const allResponse = await fetch(allTournamentsUrl, { headers });

    if (!allResponse.ok) {
      return { notFound: true };
    }

    const allResult = await allResponse.json();

    // YYYYとtor-data.idでフィルタリング
    const masterInfo = allResult.items.find(item =>
      item['tor-data']?.id === torDataId && item.YYYY === parseInt(yyyy)
    );

    if (!masterInfo) {
      return { notFound: true };
    }

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

    // この特定の大会のみの更新情報を構築（1件のみ）
    const updates = [{
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

    // クラス名の変換
    const classDisplayName = classSlugToDisplay(classSlug);

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

    // サイドバー用：同じ大会の過去の年度を取得（YYYYの降順）
    const allSidebarUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${APP_UID}/fukuoka-tor?limit=1000&order=-YYYY,-tor-start&depth=2`;
    let sidebarTournaments = [];

    try {
      const sidebarResponse = await fetch(allSidebarUrl, { headers });
      if (sidebarResponse.ok) {
        const sidebarResult = await sidebarResponse.json();
        if (sidebarResult.items && sidebarResult.items.length > 0) {
          // 同じtor-data.idでフィルタリングし、現在の年度は除外
          const filteredSidebar = sidebarResult.items
            .filter(item => item['tor-data']?.id === torDataId && item.YYYY !== parseInt(yyyy))
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
                yyyy: item.YYYY || year,
                yearList: false  // 詳細ページへリンク
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
        tournament: tournamentInfo,
        breadcrumbs: {
          classSlug,
          classDisplayName,
          areaSlug: decodeURIComponent(areaSlug),
          torDataId,
          yyyy: masterInfo.YYYY || null
        },
        sidebarTournaments
      }
    };
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return {
      notFound: true
    };
  }
}

export default function TournamentDetail({ tournament, breadcrumbs, sidebarTournaments = [] }) {
  const [fontSize, setFontSize] = useState({ title1: 2.5, title2: 1.8 });

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

      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          {/* パンくずリスト */}
          {breadcrumbs && (
            <Breadcrumb items={[
              { label: '大会情報', href: '/tournaments' },
              { label: breadcrumbs.classDisplayName, href: `/tournaments/${breadcrumbs.classSlug}` },
              { label: breadcrumbs.areaSlug, href: `/tournaments/${breadcrumbs.classSlug}/${encodeURIComponent(breadcrumbs.areaSlug)}` },
              { label: `${tournament.title1}${tournament.title2}`, href: `/tournaments/${breadcrumbs.classSlug}/${encodeURIComponent(breadcrumbs.areaSlug)}/${breadcrumbs.torDataId}` },
              { label: `${breadcrumbs.yyyy}年度`, href: null }
            ]} />
          )}

          {tournament.updates && tournament.updates.length > 0 ? (
            <div className={styles.allUpdatesContainer}>
            {tournament.updates.map((update, index) => (
              <div key={index} className={styles.updateItem}>
                <div className={styles.updateHeader}>
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
              </div>
            ))}
          </div>
          ) : (
            <div className={styles.noUpdates}>
              <p>この大会の詳細情報はまだ登録されていません。</p>
            </div>
          )}
        </div>
        <TournamentSidebar tournaments={sidebarTournaments} title={`${tournament.title1}の他の年度`} />
      </main>
      <Footer />
    </div>
  );
}
