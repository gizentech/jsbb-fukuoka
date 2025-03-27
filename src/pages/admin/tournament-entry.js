// src/pages/admin/tournament-entry.js
import { useState, useEffect } from 'react';
import { db, storage, auth } from '../../lib/firebase';
import { collection, addDoc, query, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import styles from '../../styles/admin/TournamentEntry.module.css';
import { getProxiedUrl } from '../../../lib/storage-helpers';

const classNames = {
'elementary': '学童',
'junior': '少年',
'adult-a': '一般A級',
'adult-b': '一般B級',
'adult-c': '一般C級',
};

// Firebase Storage URLを修正するヘルパー関数
function fixStorageUrl(url) {
if (!url) return url;
// 古いURLパターンを新しいパターンに変換
return url.replace('jsbb-kurume.appspot.com', 'jsbb-kurume.firebasestorage.app');
}

const EntryList = ({ entries, onDelete }) => {
return (
  <div className={styles.entryList}>
    <h2>申込書一覧</h2>
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>大会名</th>
            <th>年度</th>
            <th>回数</th>
            <th>ファイル</th>
            <th>登録日</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>
                {entry.title1}<br />
                {entry.title2}
              </td>
              <td>{entry.year}</td>
              <td>第{entry.count}回</td>
              <td>
                {entry.fileUrl ? (
                  <a 
                    href={getProxiedUrl(entry.fileUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.downloadLink}
                  >
                    表示
                  </a>
                ) : (
                  <span className={styles.pendingUpload}>
                    {entry.fileName ? `${entry.fileName} (未アップロード)` : "なし"}
                  </span>
                )}
              </td>
              <td>
                {new Date(entry.createdAt).toLocaleDateString('ja-JP')}
              </td>
              <td>
                <button 
                  onClick={() => onDelete(entry)} 
                  className={styles.deleteButton}
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
};

export default function TournamentEntry() {
const [tournaments, setTournaments] = useState([]);
const [entries, setEntries] = useState([]);
const [selectedClass, setSelectedClass] = useState('');
const [selectedTournament, setSelectedTournament] = useState(null);
const [formData, setFormData] = useState({
  year: new Date().getFullYear(),
  count: '',
  content: '',
  file: null,
  createNews: false
});
const [isAuthenticated, setIsAuthenticated] = useState(false);

useEffect(() => {
  fetchTournaments();
  fetchEntries();
  
  // 認証状態を確認
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('認証ユーザー:', user.uid);
      setIsAuthenticated(true);
    } else {
      console.log('未認証状態');
      setIsAuthenticated(false);
    }
  });
  
  return () => unsubscribe();
}, []);

const fetchTournaments = async () => {
  try {
    const q = query(collection(db, 'tournaments'), orderBy('tournamentId'));
    const querySnapshot = await getDocs(q);
    const tournamentsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setTournaments(tournamentsData);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
  }
};

const fetchEntries = async () => {
  try {
    const q = query(collection(db, 'tournament-entries'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const entriesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setEntries(entriesData);
  } catch (error) {
    console.error('Error fetching entries:', error);
  }
};

const handleTournamentSelect = (tournamentId) => {
  const tournament = tournaments.find(t => t.id === tournamentId);
  setSelectedTournament(tournament);
};

const createNewsPost = async (title1, title2) => {
  try {
    await addDoc(collection(db, 'news'), {
      title: `${title1}${title2}申込書掲載`,
      content: `${title1}${title2}の申込書を掲載しました。申込書は大会情報からご確認ください。`,
      category: '大会申込',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('フォーム送信が開始されました');

  if (!selectedTournament) {
    alert('大会を選択してください');
    return;
  }

  console.log('ファイル状態:', formData.file ? 'ファイルあり' : 'ファイルなし');

  try {
    console.log('フォーム送信開始', { selectedTournament, formData });
    
   // handleSubmit 関数内のデータ保存部分を修正
   const entryData = {
     tournamentId: selectedTournament.id,
     title1: selectedTournament.title1,
     title2: selectedTournament.title2,
     year: formData.year,
     count: formData.count,
     content: formData.content,
     class: selectedTournament.class,
     fileUrl: '',  // 空のURLとして保存
     fileName: formData.file ? formData.file.name : '',  // ファイル名だけ保存
     pendingUpload: formData.file ? true : false,  // アップロード保留フラグ
     createdAt: new Date().toISOString()
   };
    
    console.log('Firestoreに保存するデータ:', entryData);
    
    // Firestoreにデータを保存
    const docRef = await addDoc(collection(db, 'tournament-entries'), entryData);
    console.log('Firestoreにデータ保存成功 - ID:', docRef.id);

    if (formData.createNews) {
      try {
        console.log('お知らせ作成開始');
        await createNewsPost(selectedTournament.title1, selectedTournament.title2);
        console.log('お知らせ作成完了');
      } catch (newsError) {
        console.error('お知らせ作成エラー:', newsError);
      }
    }

    // フォームをリセット
    setFormData({
      year: new Date().getFullYear(),
      count: '',
      content: '',
      file: null,
      createNews: false
    });

    // 一覧を更新
    await fetchEntries();
    
    // ファイルが選択されていた場合は特別なメッセージを表示
    if (formData.file) {
      alert('申込書情報が登録されました。\n※ファイルアップロード機能は現在メンテナンス中のため、ファイル名のみ保存されています。');
    } else {
      alert('申込書情報が登録されました');
    }
  } catch (error) {
    console.error('申込書登録エラー:', error);
    alert(`申込書の登録に失敗しました: ${error.message}`);
  }
};

const handleDelete = async (entry) => {
  if (!confirm(`「${entry.title1} ${entry.title2}」の申込書を削除してもよろしいですか？`)) {
    return;
  }

  try {
    // Firestoreからドキュメントを削除
    await deleteDoc(doc(db, 'tournament-entries', entry.id));
    console.log('ドキュメント削除成功:', entry.id);

    // ファイルURLがある場合はStorageからファイルも削除を試みる
    if (entry.fileUrl) {
      try {
        // URLを修正してから処理
        const fixedUrl = fixStorageUrl(entry.fileUrl);
        const fileUrl = new URL(fixedUrl);
        const pathWithQuery = fileUrl.pathname.split('/o/')[1];
        if (pathWithQuery) {
          const path = decodeURIComponent(pathWithQuery.split('?')[0]);
          const fileRef = ref(storage, path);
          
          await deleteObject(fileRef);
          console.log('ファイル削除成功:', path);
        }
      } catch (fileError) {
        console.error('ファイル削除エラー:', fileError);
        // ファイル削除失敗でもドキュメント削除は成功しているのでエラーをスローしない
      }
    }

    // 一覧を更新
    await fetchEntries();
    alert('申込書を削除しました');
  } catch (error) {
    console.error('削除エラー:', error);
    alert(`削除に失敗しました: ${error.message}`);
  }
};

return (
  <AdminLayout>
    <div className={styles.container}>
      <h1>大会申込書登録</h1>
      
      {!isAuthenticated && (
        <div className={styles.warning}>
          ログインしていないか、認証が有効ではありません。一部機能が制限される場合があります。
        </div>
      )}

      <div className={styles.tournamentSelect}>
        <div className={styles.filterGroup}>
          <select
            className={styles.classFilter}
            onChange={(e) => setSelectedClass(e.target.value)}
            value={selectedClass}
          >
            <option value="">全クラス</option>
            {Object.entries(classNames).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
          <select
            className={styles.tournamentDropdown}
            onChange={(e) => handleTournamentSelect(e.target.value)}
            value={selectedTournament?.id || ''}
          >
            <option value="">大会を選択してください</option>
            {tournaments
              .filter(tournament => !selectedClass || tournament.class.includes(selectedClass))
              .map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.title1} {tournament.title2}
                </option>
              ))}
          </select>
        </div>
      </div>

      {selectedTournament && (
        <form onSubmit={handleSubmit} className={styles.entryForm} noValidate>
          <div className={styles.notice}>
            ※ファイルアップロード機能は現在メンテナンス中です。ファイル情報のみが保存されます。
          </div>
          
          <div className={styles.formGroup}>
            <label>年度</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>回数</label>
            <input
              type="text"
              value={formData.count}
              onChange={(e) => setFormData({ ...formData, count: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>内容</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5}
              placeholder="申込書に関する説明を入力"
            />
          </div>

          <div className={styles.formGroup}>
            <label>申込書ファイル (現在ファイル名のみ保存)</label>
            <input
              type="file"
              onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.createNews}
                onChange={(e) => setFormData({ ...formData, createNews: e.target.checked })}
              />
              お知らせにも投稿する
            </label>
          </div>

          <button type="submit" className={styles.submitButton}>
            登録する
          </button>
        </form>
      )}

      <EntryList entries={entries} onDelete={handleDelete} />
    </div>
  </AdminLayout>
);
}