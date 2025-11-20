// scripts/create-admin-user.js
// Firebase Admin SDKを使用して管理者ユーザーを作成するスクリプト

const admin = require('firebase-admin');

// Firebase Admin SDKの初期化
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

async function createAdminUser() {
  try {
    const email = 'open@open.com';
    const password = 'open';
    const displayName = 'Admin User';

    // ユーザーが既に存在するか確認
    try {
      const existingUser = await admin.auth().getUserByEmail(email);
      console.log('ユーザーは既に存在します:', existingUser.uid);
      console.log('Email:', existingUser.email);
      return;
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      // ユーザーが存在しない場合は作成を続行
    }

    // 新しいユーザーを作成
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: true
    });

    console.log('✅ ユーザーの作成に成功しました！');
    console.log('User ID:', userRecord.uid);
    console.log('Email:', userRecord.email);
    console.log('Display Name:', userRecord.displayName);
    console.log('\nログイン情報:');
    console.log('Email: open@open.com (または "open")');
    console.log('Password: open');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

createAdminUser()
  .then(() => {
    console.log('\n完了しました！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
