// admin/setup-prefectures.js
import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout/AdminLayout';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import styles from '@/styles/admin/CommonAdmin.module.css';

export default function SetupPrefectures() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 福岡県8ブロック情報
  const fukuokaBlocks = [
    {
      id: 'kyochiku',
      title: '京築',
      branches: [
        { id: 'yukuhashi', name: '行橋支部' },
        { id: 'kanda', name: '苅田支部' },
        { id: 'buzen', name: '豊前支部' }
      ]
    },
    {
      id: 'kitakyushu',
      title: '北九州',
      branches: [
        { id: 'kitakyushu', name: '北九州支部' }
      ]
    },
    {
      id: 'chikuho',
      title: '筑豊',
      branches: [
        { id: 'chuen', name: '中遠支部' },
        { id: 'chokukuwa', name: '直鞍支部' },
        { id: 'kahan', name: '嘉飯支部' },
        { id: 'tagawa', name: '田川支部' }
      ]
    },
    {
      id: 'higashi-fukuoka',
      title: '東福岡',
      branches: [
        { id: 'koga', name: '古賀支部' },
        { id: 'kasuya', name: '糟屋支部' },
        { id: 'munakata', name: '宗像支部' }
      ]
    },
    {
      id: 'fukuoka',
      title: '福岡',
      branches: [
        { id: 'fukuoka', name: '福岡支部' },
        { id: 'chikushi', name: '筑紫支部' },
        { id: 'kasuga', name: '春日支部' },
        { id: 'onojo', name: '大野城支部' }
      ]
    },
    {
      id: 'kita-chikugo',
      title: '北筑後',
      branches: [
        { id: 'asakura', name: '朝倉支部' },
        { id: 'yame', name: '八女支部' },
        { id: 'ukiha', name: '浮羽支部' },
        { id: 'ogori', name: '小郡支部' }
      ]
    },
    {
      id: 'kurume',
      title: '久留米',
      branches: [
        { id: 'kurume', name: '久留米支部' }
      ]
    },
    {
      id: 'minami-chikugo',
      title: '南筑後',
      branches: [
        { id: 'yanagawa', name: '柳川支部' },
        { id: 'chikugo', name: '筑後支部' },
        { id: 'omuta', name: '大牟田支部' },
        { id: 'okawa-oki', name: '大川大木支部' }
      ]
    }
  ];

  const addFukuokaPrefecture = async () => {
    setLoading(true);
    setMessage('');

    try {
      // 既存の福岡県データを確認
      const querySnapshot = await getDocs(collection(db, 'prefectures'));
      const existingFukuoka = querySnapshot.docs.find(doc => doc.data().code === '40');

      if (existingFukuoka) {
        setMessage('⚠️ 福岡県は既に登録されています (ID: ' + existingFukuoka.id + ')');
        setLoading(false);
        return;
      }

      // 福岡県を追加
      const prefectureData = {
        name: '福岡',
        code: '40',
        order: 40,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'prefectures'), prefectureData);

      setMessage('✓ 福岡県を追加しました (ID: ' + docRef.id + ')');
    } catch (error) {
      console.error('Error adding prefecture:', error);
      setMessage('❌ エラー: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addTournamentClasses = async () => {
    setLoading(true);
    setMessage('');

    try {
      const classes = [
        { name: '学童', code: 'gakudo', order: 0 },
        { name: '少年', code: 'shonen', order: 1 },
        { name: 'A級', code: 'a-class', order: 2 },
        { name: 'B級', code: 'b-class', order: 3 },
        { name: 'C級', code: 'c-class', order: 4 },
        { name: 'ガールズ', code: 'girls', order: 5 },
        { name: '還暦', code: 'kanreki', order: 6 },
        { name: '実年', code: 'jitsunen', order: 7 },
        { name: '成年', code: 'seinen', order: 8 }
      ];

      // 既存のデータを確認
      const querySnapshot = await getDocs(collection(db, 'tournamentClasses'));
      const existingCodes = new Set(querySnapshot.docs.map(doc => doc.data().code));

      let addedCount = 0;
      let skippedCount = 0;

      for (const cls of classes) {
        if (existingCodes.has(cls.code)) {
          skippedCount++;
          continue;
        }

        const classData = {
          ...cls,
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await addDoc(collection(db, 'tournamentClasses'), classData);
        addedCount++;
      }

      setMessage(`✓ 完了: ${addedCount}件追加、${skippedCount}件スキップ`);
    } catch (error) {
      console.error('Error adding tournament classes:', error);
      setMessage('❌ エラー: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addAllPrefectures = async () => {
    setLoading(true);
    setMessage('');

    try {
      const prefectures = [
        { name: '北海道', code: '01', order: 1 },
        { name: '青森', code: '02', order: 2 },
        { name: '岩手', code: '03', order: 3 },
        { name: '宮城', code: '04', order: 4 },
        { name: '秋田', code: '05', order: 5 },
        { name: '山形', code: '06', order: 6 },
        { name: '福島', code: '07', order: 7 },
        { name: '茨城', code: '08', order: 8 },
        { name: '栃木', code: '09', order: 9 },
        { name: '群馬', code: '10', order: 10 },
        { name: '埼玉', code: '11', order: 11 },
        { name: '千葉', code: '12', order: 12 },
        { name: '東京', code: '13', order: 13 },
        { name: '神奈川', code: '14', order: 14 },
        { name: '新潟', code: '15', order: 15 },
        { name: '富山', code: '16', order: 16 },
        { name: '石川', code: '17', order: 17 },
        { name: '福井', code: '18', order: 18 },
        { name: '山梨', code: '19', order: 19 },
        { name: '長野', code: '20', order: 20 },
        { name: '岐阜', code: '21', order: 21 },
        { name: '静岡', code: '22', order: 22 },
        { name: '愛知', code: '23', order: 23 },
        { name: '三重', code: '24', order: 24 },
        { name: '滋賀', code: '25', order: 25 },
        { name: '京都', code: '26', order: 26 },
        { name: '大阪', code: '27', order: 27 },
        { name: '兵庫', code: '28', order: 28 },
        { name: '奈良', code: '29', order: 29 },
        { name: '和歌山', code: '30', order: 30 },
        { name: '鳥取', code: '31', order: 31 },
        { name: '島根', code: '32', order: 32 },
        { name: '岡山', code: '33', order: 33 },
        { name: '広島', code: '34', order: 34 },
        { name: '山口', code: '35', order: 35 },
        { name: '徳島', code: '36', order: 36 },
        { name: '香川', code: '37', order: 37 },
        { name: '愛媛', code: '38', order: 38 },
        { name: '高知', code: '39', order: 39 },
        { name: '福岡', code: '40', order: 40 },
        { name: '佐賀', code: '41', order: 41 },
        { name: '長崎', code: '42', order: 42 },
        { name: '熊本', code: '43', order: 43 },
        { name: '大分', code: '44', order: 44 },
        { name: '宮崎', code: '45', order: 45 },
        { name: '鹿児島', code: '46', order: 46 },
        { name: '沖縄', code: '47', order: 47 }
      ];

      // 既存のデータを確認
      const querySnapshot = await getDocs(collection(db, 'prefectures'));
      const existingCodes = new Set(querySnapshot.docs.map(doc => doc.data().code));

      let addedCount = 0;
      let skippedCount = 0;

      for (const pref of prefectures) {
        if (existingCodes.has(pref.code)) {
          skippedCount++;
          continue;
        }

        const prefectureData = {
          ...pref,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await addDoc(collection(db, 'prefectures'), prefectureData);
        addedCount++;
      }

      setMessage(`✓ 完了: ${addedCount}件追加、${skippedCount}件スキップ`);
    } catch (error) {
      console.error('Error adding prefectures:', error);
      setMessage('❌ エラー: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addFukuokaBlocksAndBranches = async () => {
    setLoading(true);
    setMessage('');

    try {
      // 福岡県を取得
      const prefQuery = query(collection(db, 'prefectures'), where('code', '==', '40'));
      const prefSnapshot = await getDocs(prefQuery);

      if (prefSnapshot.empty) {
        setMessage('❌ エラー: 福岡県が見つかりません。先に福岡県を追加してください。');
        setLoading(false);
        return;
      }

      const fukuokaPrefId = prefSnapshot.docs[0].id;
      let addedBlocks = 0;
      let addedBranches = 0;
      let skippedBlocks = 0;
      let skippedBranches = 0;

      // 既存のブロックを確認
      const blocksSnapshot = await getDocs(collection(db, 'blocks'));
      const existingBlockNames = new Set(blocksSnapshot.docs.map(doc => doc.data().name));

      // 各ブロックを追加
      for (let i = 0; i < fukuokaBlocks.length; i++) {
        const block = fukuokaBlocks[i];

        let blockDocId;

        // ブロックが既に存在するか確認
        if (existingBlockNames.has(block.title)) {
          skippedBlocks++;
          const existingBlock = blocksSnapshot.docs.find(doc => doc.data().name === block.title);
          blockDocId = existingBlock.id;
        } else {
          // ブロックを追加
          const blockData = {
            name: block.title,
            code: block.id,
            prefectureId: fukuokaPrefId,
            order: i,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          const blockDocRef = await addDoc(collection(db, 'blocks'), blockData);
          blockDocId = blockDocRef.id;
          addedBlocks++;
        }

        // 既存の支部を確認
        const branchesSnapshot = await getDocs(collection(db, 'branches'));
        const existingBranchNames = new Set(branchesSnapshot.docs.map(doc => doc.data().name));

        // 支部を追加
        for (let j = 0; j < block.branches.length; j++) {
          const branch = block.branches[j];

          if (existingBranchNames.has(branch.name)) {
            skippedBranches++;
            continue;
          }

          const branchData = {
            name: branch.name,
            code: branch.id,
            blockId: blockDocId,
            prefectureId: fukuokaPrefId,
            order: j,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          await addDoc(collection(db, 'branches'), branchData);
          addedBranches++;
        }
      }

      setMessage(`✓ 完了: ブロック ${addedBlocks}件追加/${skippedBlocks}件スキップ、支部 ${addedBranches}件追加/${skippedBranches}件スキップ`);
    } catch (error) {
      console.error('Error adding blocks and branches:', error);
      setMessage('❌ エラー: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h1>都道府県セットアップ</h1>

        <div style={{ marginTop: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>福岡県のみ追加</h2>
            <button
              onClick={addFukuokaPrefecture}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3182ce',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '処理中...' : '福岡県を追加'}
            </button>
          </div>

          <div style={{ marginBottom: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>福岡県の8ブロックと支部を追加</h2>
            <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
              福岡県の8ブロック（京築、北九州、筑豊、東福岡、福岡、北筑後、久留米、南筑後）と各支部を追加します
            </p>
            <button
              onClick={addFukuokaBlocksAndBranches}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3182ce',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '処理中...' : 'ブロックと支部を追加'}
            </button>
          </div>

          <div style={{ marginBottom: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>クラスマスタを追加</h2>
            <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
              学童、少年、A級、B級、C級、ガールズ、還暦、実年、成年の9クラスを追加します
            </p>
            <button
              onClick={addTournamentClasses}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3182ce',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '処理中...' : 'クラスマスタを追加'}
            </button>
          </div>

          <div style={{ marginBottom: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>全都道府県を追加</h2>
            <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
              47都道府県すべてを一括で追加します（既存のデータはスキップされます）
            </p>
            <button
              onClick={addAllPrefectures}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#2c5282',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '処理中...' : '全都道府県を追加'}
            </button>
          </div>

          {message && (
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              background: message.includes('❌') ? '#fed7d7' : message.includes('⚠️') ? '#fef3c7' : '#c6f6d5',
              color: message.includes('❌') ? '#742a2a' : message.includes('⚠️') ? '#78350f' : '#22543d',
              fontSize: '0.95rem'
            }}>
              {message}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
