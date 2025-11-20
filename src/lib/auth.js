// lib/auth.js
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import crypto from 'crypto';

// パスワードをハッシュ化（クライアント側）
export function hashPassword(password) {
  // ブラウザ環境では crypto.subtle を使用
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
      .then(hashBuffer => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      });
  }

  // Node.js環境では crypto モジュールを使用
  return Promise.resolve(
    crypto.createHash('sha256').update(password).digest('hex')
  );
}

// Firestoreでユーザー認証
export async function authenticateUser(username, password) {
  try {
    const hashedPassword = await hashPassword(password);

    // usernameで検索（メールアドレスの場合はemailで検索）
    const usersRef = collection(db, 'admin_users');
    let q;

    if (username.includes('@')) {
      // メールアドレスの場合
      q = query(usersRef, where('email', '==', username));
    } else {
      // usernameの場合
      q = query(usersRef, where('username', '==', username));
    }

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // パスワード検証
    if (userData.password !== hashedPassword) {
      return { success: false, error: 'パスワードが正しくありません' };
    }

    // セッション情報を返す
    return {
      success: true,
      user: {
        id: userDoc.id,
        username: userData.username,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: '認証エラーが発生しました' };
  }
}

// セッション管理
export function saveSession(user) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminUser', JSON.stringify(user));
    localStorage.setItem('adminSessionExpiry', Date.now() + 24 * 60 * 60 * 1000); // 24時間
  }
}

export function getSession() {
  if (typeof window === 'undefined') return null;

  const user = localStorage.getItem('adminUser');
  const expiry = localStorage.getItem('adminSessionExpiry');

  if (!user || !expiry) return null;

  if (Date.now() > parseInt(expiry)) {
    clearSession();
    return null;
  }

  return JSON.parse(user);
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminSessionExpiry');
  }
}

export function isAuthenticated() {
  return getSession() !== null;
}
