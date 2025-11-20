import React, { useState, useEffect } from 'react';
import Header from '../../../../../components/Header/Header';
import Footer from '../../../../../components/Footer/Footer';
import Meta from '../../../../../components/Meta/Meta';
import TournamentSidebar from '../../../../../components/TournamentSidebar/TournamentSidebar';
import Breadcrumb from '../../../../../components/Breadcrumb/Breadcrumb';
import styles from '../../../../../styles/TournamentDetail.module.css';
import Image from 'next/image';
import { pdfjs } from 'react-pdf';
import Link from 'next/link';
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

export async function getServerSideProps(context) {
  try {
    const { class: classParam, area: areaParam, id: torDataId, year } = context.params;
    const SPACE_UID = process.env.NEWT_SPACE_UID;
    const TOKEN = process.env.NEWT_API_TOKEN;
    const TOURNAMENT_APP_UID = 'fukuoka-tournament';

    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    // torDataIdと年度から該当する大会を検索
    const allTournamentsUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${TOURNAMENT_APP_UID}/fukuoka-tor?limit=1000&depth=2`;
    let tournamentData = null;

    try {
      const tournamentResponse = await fetch(allTournamentsUrl, { headers });

      if (tournamentResponse.ok) {
        const tournamentResult = await tournamentResponse.json();

        // torDataIdと年度でフィルタリング
        const matchedTournament = tournamentResult.items?.find(item => {
          const itemTorDataId = item['tor-data']?.id;
          let itemYear = '';
          if (item['tor-start']) {
            const startDate = new Date(item['tor-start']);
            itemYear = startDate.getFullYear().toString();
          }

          return itemTorDataId === torDataId && itemYear === year;
        });

        if (matchedTournament) {
          let tournamentYear = '';
          if (matchedTournament['tor-start']) {
            const startDate = new Date(matchedTournament['tor-start']);
            tournamentYear = startDate.getFullYear();
          }

          tournamentData = {
            id: matchedTournament._id,
            torDataId: matchedTournament['tor-data']?.id || '',
            title1: matchedTournament['tor-data']?.['fukuoka-title1'] || '',
            title2: matchedTournament['tor-data']?.['fukuoka-title2'] || '',
            area: matchedTournament.area || '',
            winner: matchedTournament['win-team-fukuoka'] || '',
            classes: matchedTournament['tor-data']?.['fukuoka-class'] || [],
            year: tournamentYear,
            yyyy: matchedTournament.YYYY || tournamentYear,
            startDate: matchedTournament['tor-start'] || null,
            endDate: matchedTournament['end-tor'] || null,
            updatedAt: matchedTournament._sys?.updatedAt || '',
            fileUrl: matchedTournament['fuku-tournament']?.src || null,
            fileName: matchedTournament['fuku-tournament']?.fileName || 'トーナメント表.pdf',
            thumbnail: matchedTournament['fuku-tournament']?.src || '/images/top0.webp'
          };
        }
      }
    } catch (error) {
      console.error('Tournament API Error:', error);
    }

    // サイドバー用：同じtor-dataの大会を取得
    const allTournamentUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${TOURNAMENT_APP_UID}/fukuoka-tor?limit=1000&order=-tor-start&depth=2`;
    let sidebarTournaments = [];

    if (tournamentData && tournamentData.torDataId) {
      try {
        const sidebarResponse = await fetch(allTournamentUrl, { headers });
        if (sidebarResponse.ok) {
          const sidebarResult = await sidebarResponse.json();
          if (sidebarResult.items && sidebarResult.items.length > 0) {
            const filteredSidebar = sidebarResult.items
              .filter(item => item['tor-data']?.id === tournamentData.torDataId)
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
                  yyyy: item.YYYY || year
                };
              });
            sidebarTournaments = filteredSidebar;
          }
        }
      } catch (error) {
        console.error('Sidebar API Error:', error);
      }
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

    return {
      props: {
        tournament: tournamentData,
        sidebarTournaments,
        classParam,
        areaParam,
        formatDate: {
          startDate: formatDate(tournamentData?.startDate),
          endDate: formatDate(tournamentData?.endDate)
        }
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        tournament: null,
        sidebarTournaments: [],
        classParam: context.params.class,
        areaParam: context.params.area,
        formatDate: { startDate: '', endDate: '' }
      }
    };
  }
}

export default function TournamentDetail({ tournament, sidebarTournaments = [], formatDate }) {
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

  const breadcrumbItems = [
    { label: '大会情報', href: '/tournaments' },
    { label: tournament.area, href: `/tournaments/area/${encodeURIComponent(tournament.area)}` },
    { label: `${tournament.title1}${tournament.title2}`, href: `/tournaments/tor/${tournament.torDataId}` },
    { label: `${tournament.year}年度`, href: null }
  ];

  return (
    <div className={styles.wrapper}>
      <Meta
        title={`${tournament.year}年度 ${tournament.title1} ${tournament.title2}`}
        description={`${tournament.year}年度 ${tournament.title1} ${tournament.title2}の大会情報ページです`}
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
            <div className={styles.classLabels}>
              {tournament.classes && Array.isArray(tournament.classes) && tournament.classes.length > 0 && (
                tournament.classes.map((item, index) => (
                  <span key={index} className={styles.classLabel}>
                    {typeof item === 'object' ? item.label : classSlugToDisplay(item)}
                  </span>
                ))
              )}
              <span className={styles.classLabel}>{tournament.year}年度</span>
            </div>
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

      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <Breadcrumb items={breadcrumbItems} />

          <div className={styles.allUpdatesContainer}>
            <div className={styles.updateItem}>
              <div className={styles.updateHeader}>
                <div className={styles.headerContent}>
                  <div className={styles.headerMainLine}>
                    <span className={styles.updateYear}>
                      {tournament.year}年
                    </span>
                    {tournament.winner && (
                      <span className={styles.winnerInfo}>
                        優勝　{tournament.winner}
                      </span>
                    )}
                  </div>
                  <div className={styles.headerSubLines}>
                    {tournament.area && (
                      <div className={styles.headerSubLine}>
                        開催支部：{tournament.area}
                      </div>
                    )}
                    {(formatDate.startDate || formatDate.endDate) && (
                      <div className={styles.headerSubLine}>
                        大会期間：{formatDate.startDate}
                        {formatDate.endDate && formatDate.startDate !== formatDate.endDate && ` 〜 ${formatDate.endDate}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {tournament.fileUrl && (
                <div className={styles.accordionContent}>
                  <PdfThumbnail pdfUrl={tournament.fileUrl} />
                  <a
                    href={tournament.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.pdfLink}
                  >
                    PDFをダウンロード
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        <TournamentSidebar
          tournaments={sidebarTournaments}
          title={`${tournament.title1}の年度一覧`}
        />
      </main>
      <Footer />
    </div>
  );
}
