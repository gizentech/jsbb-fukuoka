// scripts/add-fukuoka-prefecture.js
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Firebase Admin初期化
let credential;

// serviceAccountKey.jsonがある場合はそれを使用
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  credential = admin.credential.cert(serviceAccount);
} else {
  // 環境変数から認証情報を取得
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = admin.credential.cert(serviceAccount);
  } else {
    console.error('エラー: Firebase認証情報が見つかりません');
    console.error('serviceAccountKey.json または FIREBASE_SERVICE_ACCOUNT 環境変数が必要です');
    process.exit(1);
  }
}

admin.initializeApp({
  credential: credential
});

const db = admin.firestore();

async function addFukuokaPrefecture() {
  try {
    console.log('福岡県を追加しています...');

    const prefectureData = {
      name: '福岡',
      code: '40',
      order: 40,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('prefectures').add(prefectureData);

    console.log('✓ 福岡県を追加しました');
    console.log('  ID:', docRef.id);
    console.log('  名前:', prefectureData.name);
    console.log('  コード:', prefectureData.code);
    console.log('  表示順:', prefectureData.order);

    process.exit(0);
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

addFukuokaPrefecture();
