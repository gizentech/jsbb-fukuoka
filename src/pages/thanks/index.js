import Head from 'next/head';
import Image from 'next/image';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import BlockSidebar from '@/components/BlockSidebar/BlockSidebar';
import pageStyles from '@/styles/Page.module.css';
import styles from './thanks.module.css';

export default function Thanks() {
  return (
    <>
      <Head>
        <title>中村敏治氏 旭日双光章 受賞 | 福岡県軟式野球連盟</title>
        <meta name="description" content="中村敏治氏による旭日双光章受章のお礼の言葉" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className={pageStyles.mainWithSidebar}>
        <div className={pageStyles.contentArea}>
          <div className={styles.pageHeader}>
            <div className={styles.subtitles}>
              <p className={styles.subtitle}>全日本軟式野球連盟 顧問</p>
              <p className={styles.subtitle}>一般社団法人 福岡県軟式野球連盟 理事長</p>
            </div>
            <h1 className={styles.title}>中村敏治氏 旭日双光章 受賞</h1>
          </div>

          <div className={styles.imageContainer}>
            <Image
              src="/images/toshiharu01.webp"
              alt="中村敏治氏"
              width={1280}
              height={720}
              className={styles.image}
              priority
            />
          </div>

          <div className={pageStyles.content}>
            <p className={styles.paragraph}>
              このたび、令和3年秋の叙勲に際しては、はからずも旭日双光章の栄誉に浴し、去る令和3年11月、福岡県庁に於いて、服部福岡県知事より勲記、勲章の伝達を受けお言葉を戴き感謝の極みでした。
            </p>

            <p className={styles.paragraph}>
              これも偏に皆様方の長年に亘り心暖かいご指導とご支援の賜物と深く感謝申し上げます。
            </p>

            <p className={styles.paragraph}>
              顧みますと、昭和40年久留米市野球連盟の審判員となり、今日に至るまで57年間、野球を通じ、地域社会への発展、並びに青少年の健全育成に少なからず貢献できましたこと、また、昭和53年第60回全国高校野球選手大会で審判に携わったこと、平成15年全日本軟式野球福岡県連盟理事、平成19年(財)全日本軟式野球連盟理事、平成21年からは、公益社団法人全日本軟式野球連盟常務理事等を歴任し、微力ながら野球界の発展に携わったことができましたことは、私自身誇りに思うところです。
            </p>

            <p className={styles.paragraph}>
              今後は、この栄誉に恥じないように一層精進し、ますますの野球界の発展に貢献いたしたく決意を新たにした次第でございます。
            </p>

            <p className={styles.paragraph}>
              これからも皆様方の変わらぬご交誼とご指導、ご鞭撻を賜りますようにお願い申し上げます。
            </p>

            <p className={styles.paragraph}>
              最後になりましたが、皆様の益々のご健勝とご多幸を祈念申し上げ、意を十分尽くしませんがお礼の言葉といたします。
            </p>

            <div className={styles.signature}>
              <p className={styles.date}>令和4年8月28日</p>
              <p className={styles.name}>中村　敏治</p>
            </div>
          </div>
        </div>
        <BlockSidebar showAboutMenu={true} />
      </main>
      <Footer />
    </>
  );
}
