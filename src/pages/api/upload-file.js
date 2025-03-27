import formidable from 'formidable';
import admin from 'firebase-admin';
import fs from 'fs';

// サーバーサイドでのみ初期化
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm();
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'ファイル解析エラー' });
      }
      
      const file = files.file;
      const path = fields.path[0]; // 保存先パス
      
      // ファイルをFirebase Storageにアップロード
      const bucket = admin.storage().bucket();
      await bucket.upload(file.filepath, {
        destination: path,
        metadata: {
          contentType: file.mimetype,
        },
      });
      
      // URLを取得
      const fileRef = bucket.file(path);
      const [url] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '03-01-2500', // 長期間有効
      });
      
      return res.status(200).json({ fileUrl: url });
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'アップロードエラー' });
  }
}