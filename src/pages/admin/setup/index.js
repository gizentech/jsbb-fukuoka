// admin/setup/index.js - 初回セットアップ用ページ
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Background from '@/components/Background/Background';
import styles from './setup.module.css';

export default function AdminSetup() {
  const [username, setUsername] = useState('open');
  const [email, setEmail] = useState('shiraishi.healthcare@gmail.com');
  const [password, setPassword] = useState('open');
  const [displayName, setDisplayName] = useState('Ryo Shiraishi');
  const [role, setRole] = useState('admin');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // パスワードをハッシュ化
  const hashPassword = async (password) => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    throw new Error('Crypto API not available');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const hashedPassword = await hashPassword(password);

      // Firestoreにユーザーを作成
      await setDoc(doc(db, 'admin_users', username), {
        username: username,
        email: email,
        password: hashedPassword,
        displayName: displayName,
        role: role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setMessage('✅ ユーザーの作成に成功しました！ログインページに移動してください。');
      console.log('User created successfully');
      console.log('Username:', username);
      console.log('Email:', email);
      console.log('Password Hash:', hashedPassword);

    } catch (error) {
      console.error('Error creating user:', error);
      setMessage('❌ エラーが発生しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Background />
      <div className={styles.setupBox}>
        <div className={styles.header}>
          <h1>管理者アカウント作成</h1>
          <p>初回セットアップ</p>
        </div>

        <form onSubmit={handleCreateUser} className={styles.form}>
          {message && (
            <div className={message.includes('✅') ? styles.success : styles.error}>
              {message}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="username">ユーザー名</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="displayName">表示名</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
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
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role">役割</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              disabled={loading}
              className={styles.select}
            >
              <option value="admin">管理者</option>
              <option value="editor">編集者</option>
              <option value="viewer">閲覧者</option>
            </select>
          </div>

          <button
            type="submit"
            className={styles.createButton}
            disabled={loading}
          >
            {loading ? '作成中...' : 'ユーザーを作成'}
          </button>

          <div className={styles.footer}>
            <a href="/admin/login">ログインページに戻る</a>
          </div>
        </form>
      </div>
    </div>
  );
}
