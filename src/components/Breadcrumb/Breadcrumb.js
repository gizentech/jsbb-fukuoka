import Link from 'next/link';
import styles from './Breadcrumb.module.css';

export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className={styles.breadcrumb}>
      <ol className={styles.breadcrumbList}>
        <li className={styles.breadcrumbItem}>
          <Link href="/" className={styles.breadcrumbLink}>
            ホーム
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className={styles.breadcrumbItem}>
            <span className={styles.separator}>›</span>
            {item.href && index < items.length - 1 ? (
              <Link href={item.href} className={styles.breadcrumbLink}>
                {item.label}
              </Link>
            ) : (
              <span className={styles.breadcrumbCurrent}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
