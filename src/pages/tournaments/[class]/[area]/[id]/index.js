import React, { useState, useEffect } from 'react';
import Header from '../../../../../components/Header/Header';
import Footer from '../../../../../components/Footer/Footer';
import Meta from '../../../../../components/Meta/Meta';
import TournamentSidebar from '../../../../../components/TournamentSidebar/TournamentSidebar';
import Breadcrumb from '../../../../../components/Breadcrumb/Breadcrumb';
import styles from '../../../../../styles/TournamentDetail.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { classSlugToDisplay, classDisplayToSlug } from '../../../../../utils/classConvert';

export async function getServerSideProps(context) {
  try {
    const { id, class: classSlug, area: areaSlug } = context.params;
    const SPACE_UID = process.env.NEWT_SPACE_UID;
    const TOKEN = process.env.NEWT_API_TOKEN;
    const TOURNAMENT_APP_UID = 'fukuoka-tournament';

    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    const page = parseInt(context.query.page || '1', 10);
    const limit = 20;
    const skip = (page - 1) * limit;

    // 指定されたtor-dataのidに紐づく大会を全件取得してからフィルタリング
    const allTournamentUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${TOURNAMENT_APP_UID}/fukuoka-tor?limit=1000&order=-YYYY,-tor-start&depth=2`;
    let tournamentsData = [];
    let total = 0;
    let torDataInfo = null;

    try {
      const tournamentResponse = await fetch(allTournamentUrl, { headers });

      if (tournamentResponse.ok) {
        const tournamentResult = await tournamentResponse.json();

        if (tournamentResult.items && tournamentResult.items.length > 0) {
          // 指定されたidでフィルタリング
          const filteredItems = tournamentResult.items.filter(item =>
            item['tor-data']?.id === id
          );

          // YYYYの降順、次に開始日の降順にソート（新しい年度が上）
          const sortedItems = filteredItems.sort((a, b) => {
            const yyyyA = a.YYYY || 0;
            const yyyyB = b.YYYY || 0;
            if (yyyyA !== yyyyB) return yyyyB - yyyyA;

            const dateA = new Date(a['tor-start'] || 0);
            const dateB = new Date(b['tor-start'] || 0);
            return dateB - dateA;
          });

          total = sortedItems.length;

          // ページネーション用に配列をスライス
          const startIndex = skip;
          const endIndex = skip + limit;
          const paginatedItems = sortedItems.slice(startIndex, endIndex);

          if (paginatedItems.length > 0) {
            // tor-data情報を取得
            torDataInfo = paginatedItems[0]['tor-data'];

            tournamentsData = paginatedItems.map(item => {
              let year = '';
              if (item['tor-start']) {
                const startDate = new Date(item['tor-start']);
                year = startDate.getFullYear();
              }

              return {
                id: item._id,
                title1: item['tor-data']?.['fukuoka-title1'] || '',
                title2: item['tor-data']?.['fukuoka-title2'] || '',
                area: item.area || '',
                winner: item['win-team-fukuoka'] || '',
                classes: item['tor-data']?.['fukuoka-class'] || [],
                year: year,
                yyyy: item.YYYY || null,
                startDate: item['tor-start'] || null,
                endDate: item['end-tor'] || null,
                updatedAt: item._sys?.updatedAt || '',
                fileUrl: item['fuku-tournament']?.src || null,
                fileName: item['fuku-tournament']?.fileName || 'トーナメント表.pdf',
                tournamentId: item._id
              };
            });
          }
        }
      }
    } catch (error) {
      console.error('Tournament API Error:', error);
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

    // サイドバー用：同じ大会の過去の年度を取得（YYYYの降順）
    const allSidebarUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${TOURNAMENT_APP_UID}/fukuoka-tor?limit=1000&order=-YYYY,-tor-start&depth=2`;
    let sidebarTournaments = [];

    try {
      const sidebarResponse = await fetch(allSidebarUrl, { headers });
      if (sidebarResponse.ok) {
        const sidebarResult = await sidebarResponse.json();
        if (sidebarResult.items && sidebarResult.items.length > 0) {
          // 同じtor-data.idでフィルタリング
          const filteredSidebar = sidebarResult.items
            .filter(item => item['tor-data']?.id === id)
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

    // 大会情報を構築
    const tournamentInfo = torDataInfo ? {
      id: id,
      title1: torDataInfo['fukuoka-title1'] || '大会',
      title2: torDataInfo['fukuoka-title2'] || '',
      thumbnail: tournamentsData[0]?.fileUrl || '/images/top0.webp',
      description: '',
      fukuokaClass: torDataInfo['fukuoka-class'] || [],
      area: tournamentsData[0]?.area || '',
      updates: tournamentsData.map(item => ({
        count: item.year,
        year: item.year,
        yyyy: item.yyyy,
        updatedAt: item.updatedAt,
        body: '',
        startDate: formatDate(item.startDate),
        endDate: formatDate(item.endDate),
        fileUrl: item.fileUrl,
        fileName: item.fileName,
        meta: item.winner ? `優勝チーム: ${item.winner}` : '',
        tournamentId: item.tournamentId,
        classes: item.classes,
        area: item.area
      }))
    } : null;

    return {
      props: {
        tournament: tournamentInfo,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        torId: id,
        sidebarTournaments,
        classSlug,
        areaSlug
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        tournament: null,
        currentPage: 1,
        totalPages: 1,
        total: 0,
        torId: context.params.id,
        sidebarTournaments: [],
        classSlug: context.params.class,
        areaSlug: context.params.area
      }
    };
  }
}

export default function TournamentYearList({ tournament, sidebarTournaments = [], classSlug, areaSlug }) {
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
    { label: classSlugToDisplay(classSlug), href: `/tournaments/${classSlug}` },
    { label: decodeURIComponent(areaSlug), href: `/tournaments/${classSlug}/${areaSlug}` },
    { label: `${tournament.title1}${tournament.title2}`, href: null }
  ];

  return (
    <div className={styles.wrapper}>
      <Meta
        title={`${tournament.title1}${tournament.title2}`}
        description={`${tournament.title1}${tournament.title2}の大会情報ページです`}
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
          <Breadcrumb items={breadcrumbItems} />

          {tournament.updates && tournament.updates.length > 0 ? (
            <div className={styles.allUpdatesContainer}>
              {tournament.updates.map((update, index) => {
                // URL用のパラメータを生成
                const updateClassSlug = update.classes && update.classes.length > 0
                  ? classDisplayToSlug(update.classes[0])
                  : 'others';
                const updateAreaSlug = update.area ? update.area.replace(/支部/g, '').toLowerCase() : 'unknown';
                const torDataId = tournament.id;
                const yyyy = update.yyyy || update.year || '0000';

                const detailUrl = `/tournaments/${updateClassSlug}/${encodeURIComponent(updateAreaSlug)}/${torDataId}/${yyyy}`;

                return (
                <div key={index} className={styles.updateItem}>
                  <Link
                    href={detailUrl}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className={styles.updateHeader}>
                      <div className={styles.headerContent}>
                        <div className={styles.headerMainLine}>
                          {update.yyyy ? (
                            <span className={styles.updateYear}>
                              {update.yyyy}年度
                            </span>
                          ) : (
                            <span className={styles.updateYear}>
                              {update.year}年
                            </span>
                          )}
                          {update.classes && update.classes.length > 0 && (
                            <span style={{
                              padding: '4px 12px',
                              background: '#555',
                              color: '#fff',
                              fontSize: '0.9rem',
                              borderRadius: '4px'
                            }}>
                              {update.classes.join('・')}
                            </span>
                          )}
                          {update.meta && update.meta.includes('優勝チーム:') && (
                            <span className={styles.winnerInfo}>
                              優勝　{update.meta.replace('優勝チーム: ', '')}
                            </span>
                          )}
                        </div>
                        <div className={styles.headerSubLines}>
                          {update.area && (
                            <div className={styles.headerSubLine}>
                              開催支部：{typeof update.area === 'object' ? update.area.label : update.area}
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
                      <span style={{
                        color: '#fff',
                        fontSize: '20px',
                        marginLeft: '12px',
                        flexShrink: '0'
                      }}>→</span>
                    </div>
                  </Link>
                </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.noUpdates}>
              <p>この大会の詳細情報はまだ登録されていません。</p>
            </div>
          )}
        </div>
        <TournamentSidebar tournaments={sidebarTournaments} title={`${tournament.title1}の年度一覧`} />
      </main>
      <Footer />
    </div>
  );
}
