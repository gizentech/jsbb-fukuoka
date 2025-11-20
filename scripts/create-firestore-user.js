// scripts/create-firestore-user.js
// Firestoreに管理者ユーザーを作成するスクリプト

const admin = require('firebase-admin');
const crypto = require('crypto');

// Firebase Admin SDKの初期化（環境変数不要で直接初期化）
const serviceAccount = require('../jsbb-fukuoka-hp-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// パスワードをハッシュ化
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function createFirestoreUser() {
  try {
    const email = 'open@open.com';
    const username = 'open';
    const password = 'open';
    const hashedPassword = hashPassword(password);

    // ユーザーが既に存在するか確認
    const userDoc = await db.collection('admin_users').doc(username).get();

    if (userDoc.exists) {
      console.log('ユーザーは既に存在します:', username);
      console.log('既存のデータ:', userDoc.data());
      return;
    }

    // 新しいユーザーを作成
    await db.collection('admin_users').doc(username).set({
      username: username,
      email: email,
      password: hashedPassword,
      displayName: 'Admin User',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Firestoreユーザーの作成に成功しました！');
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password Hash:', hashedPassword);
    console.log('\nログイン情報:');
    console.log('Username: open');
    console.log('Password: open');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

createFirestoreUser()
  .then(() => {
    console.log('\n完了しました！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
