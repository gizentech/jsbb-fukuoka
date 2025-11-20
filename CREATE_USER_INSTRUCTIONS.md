# 管理者ユーザーの作成手順

## 方法1: Firebaseコンソールから作成（推奨）

1. Firebaseコンソールにアクセス
   ```
   https://console.firebase.google.com/project/jsbb-fukuoka-hp/authentication/users
   ```

2. 左メニューから「Authentication」を選択

3. 「Users」タブを開く

4. 「ユーザーを追加」ボタンをクリック

5. 以下の情報を入力：
   - **メールアドレス**: `open@open.com`
   - **パスワード**: `open`

6. 「ユーザーを追加」をクリック

## 方法2: Firebase Admin SDK経由（秘密鍵が必要）

### 秘密鍵の取得

1. Firebaseコンソールにアクセス
   ```
   https://console.firebase.google.com/project/jsbb-fukuoka-hp/settings/serviceaccounts/adminsdk
   ```

2. 「新しい秘密鍵の生成」をクリック

3. ダウンロードしたJSONファイルを開き、以下の情報を取得：
   - `project_id`
   - `client_email`
   - `private_key`

4. `.env.local`ファイルを更新：
   ```
   FIREBASE_PROJECT_ID=jsbb-fukuoka-hp
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@jsbb-fukuoka-hp.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

5. スクリプトを実行：
   ```bash
   node scripts/create-admin-user.js
   ```

## ログイン情報

作成後、以下の情報でログインできます：

- **URL**: http://localhost:3000/admin/login
- **ユーザー名**: `open` (または `open@open.com`)
- **パスワード**: `open`

## トラブルシューティング

### ログインできない場合

1. Firebaseコンソールでユーザーが作成されているか確認
2. `.env.local`のFirebase設定が正しいか確認
3. 開発サーバーを再起動
   ```bash
   npm run dev
   ```

### パスワードをリセットする場合

Firebaseコンソールの「Authentication」→「Users」から該当ユーザーを選択し、パスワードをリセットできます。
