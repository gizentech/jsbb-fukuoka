import styles from './Footer.module.css'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.organizationSection}>
          <p className={styles.organizationSubtitle}>公益財団法人全日本軟式野球九州連合会 福岡県支部</p>
          <h2 className={styles.organizationTitle}>一般社団法人福岡県軟式野球連盟</h2>
          <address className={styles.organizationAddress}>
            〒830-0003<br />
            福岡県久留米市東櫛原町173 久留米市野球場内
          </address>
        </div>

        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>連盟について</h3>
            <ul className={styles.footerList}>
              <li><Link href="/about">連盟概要</Link></li>
              <li><Link href="/contact">お問い合わせ</Link></li>
              <li><Link href="/privacy">プライバシーポリシー</Link></li>
              <li><Link href="/terms">ホームページについて</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>大会・イベント</h3>
            <ul className={styles.footerList}>
              <li><Link href="/tournaments">大会情報</Link></li>
              <li><a href="https://kurume.jsbb-fukuoka.com/YA" target="_blank" rel="noopener noreferrer">全国大会での活躍</a></li>
              <li><a href="https://kurume.jsbb-fukuoka.com/YA" target="_blank" rel="noopener noreferrer">久留米球場であそぼっ！野球感謝祭</a></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>ブロック</h3>
            <ul className={styles.footerList}>
              <li><Link href="/tournaments/kyochiku">京築ブロック</Link></li>
              <li><Link href="/tournaments/kitakyushu">北九州ブロック</Link></li>
              <li><Link href="/tournaments/chikuho">筑豊ブロック</Link></li>
              <li><Link href="/tournaments/higashi-fukuoka">東福岡ブロック</Link></li>
              <li><Link href="/tournaments/fukuoka">福岡ブロック</Link></li>
              <li><Link href="/tournaments/kita-chikugo">北筑後ブロック</Link></li>
              <li><Link href="/tournaments/kurume">久留米ブロック</Link></li>
              <li><Link href="/tournaments/minami-chikugo">南筑後ブロック</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>お知らせ・申請</h3>
            <ul className={styles.footerList}>
              <li><Link href="/news">お知らせ</Link></li>
              <li><Link href="/announcer">アナウンサー</Link></li>
              <li><Link href="/umpire">審判員</Link></li>
              <li><Link href="/registration">登録</Link></li>
              <li><Link href="/registration-system">登録システム</Link></li>
              <li><Link href="/application">大会申込書</Link></li>
              <li><Link href="/forms">申請様式</Link></li>
            </ul>
            <p className={styles.copyright}>© 2025 一般社団法人福岡県軟式野球連盟 All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}