// admin/login/index.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { authenticateUser, saveSession } from '@/lib/auth';
import Background from '@/components/Background/Background';
import styles from './login.module.css';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authenticateUser(username, password);

      if (result.success) {
        // セッションを保存
        saveSession(result.user);
        // 管理画面にリダイレクト
        router.push('/admin/application');
      } else {
        setError(result.error || 'ログインに失敗しました');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Background />
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1>管理画面ログイン</h1>
          <p>福岡県軟式野球連盟</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="username">ユーザー名</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="open"
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className={styles.footer}>
          <a href="/">トップページに戻る</a>
        </div>
      </div>
    </div>
  );
}
