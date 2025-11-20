// admin/index.js - ダッシュボード
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    // デフォルトでapplicationページにリダイレクト
    router.push('/admin/application');
  }, [router]);

  return null;
}
