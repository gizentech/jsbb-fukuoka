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

  useEffect(() => {
    if (!pdfUrl) return;

    const renderPdf = async () => {
      try {
        setLoading(true);
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1); // 最初のページを取得
        
        const canvas = document.createElement('canvas');
        const viewport = page.getViewport({ scale: 1.0 }); // スケール調整
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: canvas.getContext('2d'),
          viewport: viewport
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

export async function getStaticPaths() {
  try {
    // Newt CMS API設定
    const SPACE_UID = process.env.NEWT_SPACE_UID;
    const TOKEN = process.env.NEWT_API_TOKEN;
    const APP_UID = 'tournament';
    
    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    // 大会マスター情報を取得
    const masterUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${APP_UID}/tour-create`;
    
    const masterResponse = await fetch(masterUrl, { headers });
    
    if (!masterResponse.ok) {
      console.error('Failed to fetch tournament paths');
      return { paths: [], fallback: false };
    }
    
    const masterData = await masterResponse.json();
    
    // パスの生成
    const paths = masterData.items.map((tournament) => ({
      params: { id: tournament.id || tournament._id }
    }));

    return { paths, fallback: 'blocking' }; // blocking に変更してISRをサポート
  } catch (error) {
    console.error('Error generating tournament paths:', error);
    return { paths: [], fallback: 'blocking' }; // blocking に変更
  }
}

export async function getStaticProps({ params }) {
  try {
    // Newt CMS API設定
    const SPACE_UID = process.env.NEWT_SPACE_UID;
    const TOKEN = process.env.NEWT_API_TOKEN;
    const APP_UID = 'tournament';
    
    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };
    
    // tour-createからIDに基づき大会マスター情報を取得
    const masterUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${APP_UID}/tour-create?id=${params.id}`;
    
    const masterResponse = await fetch(masterUrl, { headers });
    
    if (!masterResponse.ok) {
      return { notFound: true, revalidate: 60 };
    }
    
    const masterData = await masterResponse.json();
    
    if (!masterData.items || masterData.items.length === 0) {
      return { notFound: true, revalidate: 60 };
    }
    
    const masterInfo = masterData.items[0];
    
    // 正しいクエリパラメータを使用：tournamentは参照フィールド名
    const tournamentUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${APP_UID}/tournament?tournament=${masterInfo._id}&depth=1`;
    
    const tournamentResponse = await fetch(tournamentUrl, { headers });
    
    if (!tournamentResponse.ok) {
      return { notFound: true, revalidate: 60 };
    }
    
    const tournamentData = await tournamentResponse.json();
    const tournamentItems = tournamentData.items || [];
    
    // マスター情報だけで表示できるように準備
    let tournamentInfo = {
      id: masterInfo._id,
      title1: masterInfo['tournament-name'] || '',
      title2: '', 
      thumbnail: masterInfo['cover-img']?.src || '/images/top0.webp',
      description: masterInfo['tournament-info'] || '',
      updates: []
    };
    
    // 更新情報を構築
    if (tournamentItems.length > 0) {
      const updates = tournamentItems.map(item => {
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
          meta: item.meta || ''
        };
      });
      
      updates.sort((a, b) => parseInt(b.count) - parseInt(a.count));
      
      tournamentInfo = {
        ...tournamentInfo,
        updates: updates
      };
    } else {
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
    }
    
    return {
      props: {
        tournament: tournamentInfo
      },
      revalidate: 60 // 60秒ごとに再検証
    };
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return { 
      notFound: true,
      revalidate: 60
    };
  }
}

export default function TournamentDetail({ tournament }) {
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
                
                <p className={styles.updateDate}>
                  更新日: {new Date(update.updatedAt).toLocaleString('ja-JP')}
                </p>
                
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