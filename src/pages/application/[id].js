// pages/application/[id].js
import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/ApplicationDetail.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Meta from '../../components/Meta/Meta';
import Link from 'next/link';

export const getStaticPaths = async () => {
  // 初期ビルド時に生成するパスを空にする
  return {
    paths: [],
    fallback: 'blocking' // ページが存在しなければビルド時に生成
  };
};

export const getStaticProps = async ({ params }) => {
  try {
    // Newt CMS API設定
    const SPACE_UID = 'jsbb-kurume';
    const TOKEN = 'vdfn4Mdxq2GaU2YMDW1dTIBB7fdgKGLV-pQZfufNZbs';
    const APP_UID = 'tournament';
    
    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    // IDで申込書データを取得
    const applicationUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${APP_UID}/applicationform/${params.id}`;
    console.log('Fetching application detail:', applicationUrl);
    
    const applicationResponse = await fetch(applicationUrl, { headers });
    
    if (!applicationResponse.ok) {
      console.error(`Application detail API Error: ${applicationResponse.status}`);
      return {
        notFound: true,
        revalidate: 60 // 1分後に再検証
      };
    }
    
    const app = await applicationResponse.json();
    
    // 関連する大会情報を取得
    let tournamentName = '';
    let tournamentId = '';
    let tournamentData = null;
    
    if (app['application-tournament']) {
      try {
        const tournamentRefId = app['application-tournament'];
        const tourUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${APP_UID}/tour-create/${tournamentRefId}`;
        const tourResponse = await fetch(tourUrl, { headers });
        
        if (tourResponse.ok) {
          tournamentData = await tourResponse.json();
          tournamentName = tournamentData['tournament-name'] || '';
          tournamentId = tournamentData.id || '';
        }
      } catch (e) {
        console.error('Error fetching tournament info:', e);
      }
    }
    
    const applicationDetail = {
      id: app._id,
      title: app['application-title'] || '大会申込書',
      fileUrl: app.file && app.file.length > 0 ? app.file[0].src : null,
      fileName: app.file && app.file.length > 0 ? app.file[0].fileName : '申込書.pdf',
      uploadDate: app['upload-date'] || app._sys.updatedAt,
      info: app['application-info'] || '',
      tournamentId: tournamentId,
      tournamentName: tournamentName,
      tournamentData: tournamentData
    };

    return {
      props: { application: applicationDetail },
      revalidate: 3600 // 1時間ごとに再生成
    };
  } catch (error) {
    console.error('Error fetching application detail:', error);
    return {
      notFound: true,
      revalidate: 60
    };
  }
};

export default function ApplicationDetail({ application }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>読み込み中...</div>
        <Footer />
      </div>
    );
  }

  if (!application) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.error}>申込書が見つかりませんでした</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Meta 
        title={application.title}
        description={`${application.title}の詳細ページです`}
      />
      <Header />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>大会申込書</h1>
          <span>APPLICATION</span>
        </div>
        
        <article className={styles.article}>
          <h2 className={styles.articleTitle}>{application.title}</h2>
          
          <div className={styles.articleHeader}>
            <time className={styles.articleDate}>
              {new Date(application.uploadDate).toLocaleDateString('ja-JP')}
            </time>
            {application.tournamentName && (
              <span className={styles.articleCategory}>
                {application.tournamentId ? (
                  <Link href={`/tournaments/${application.tournamentId}`}>
                    {application.tournamentName}
                  </Link>
                ) : (
                  application.tournamentName
                )}
              </span>
            )}
          </div>
          
          {application.info && (
            <div 
              className={styles.articleContent}
              dangerouslySetInnerHTML={{ __html: application.info }}
            />
          )}
          
          {application.fileUrl && (
            <div className={styles.downloadSection}>
              <a 
                href={application.fileUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.downloadButton}
              >
                申込書をダウンロード
              </a>
              <p className={styles.fileName}>{application.fileName}</p>
            </div>
          )}
        </article>
        
        <div className={styles.backLink}>
          <Link href="/application">
            申込書一覧に戻る
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}