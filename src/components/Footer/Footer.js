import styles from './Footer.module.css'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerNav}>
          <ul>
            <li>
              <Link href="/about">連盟について</Link>
            </li>
            <li>
              <Link href="/privacy">プライバシーポリシー</Link>
            </li>
            <li>
              <Link href="/terms">ホームページについて</Link>
            </li>
          </ul>
        </div>
        <p className={styles.copyright}>© 2025 KURUME BASEBALL ASSOCIATION All Rights Reserved.</p>
      </div>
    </footer>
  )
}