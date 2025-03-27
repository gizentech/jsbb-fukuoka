import { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, query, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import styles from '../../styles/admin/TournamentEdit.module.css';

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

// プロキシURLを取得する関数
function getProxiedUrl(url) {
  if (!url) return '';
  return `/api/file-proxy?url=${encodeURIComponent(url)}`;
}

export default function TournamentEdit() {
 const [tournaments, setTournaments] = useState([]);
 const [selectedTournament, setSelectedTournament] = useState(null);
 const [selectedUpdate, setSelectedUpdate] = useState(null);
 const [selectedClass, setSelectedClass] = useState('');
 const [formData, setFormData] = useState({
   year: '',
   count: '',
   body: '',
   file: null,
   fileUrl: ''
 });

 useEffect(() => {
   fetchTournaments();
 }, []);

 const fetchTournaments = async () => {
   try {
     const q = query(collection(db, 'tournaments'), orderBy('tournamentId'));
     const querySnapshot = await getDocs(q);
     const tournamentsData = querySnapshot.docs.map(doc => {
       const data = doc.data();
       return {
         id: doc.id,
         ...data,
         updates: data.updates || []
       };
     });
     setTournaments(tournamentsData);
   } catch (error) {
     console.error('Error fetching tournaments:', error);
   }
 };

 // サーバーサイドAPIを使用するファイルアップロード
 const handleFileUpload = async (file, tournamentId) => {
   if (!file) return '';
   
   const timestamp = Date.now().toString();
   const fileName = `tournaments/${tournamentId}/files/${timestamp}_${file.name}`;
   
   // FormDataを作成
   const formData = new FormData();
   formData.append('file', file);
   formData.append('path', fileName);
   
   try {
     // サーバーサイドAPIを呼び出し
     const response = await fetch('/api/upload-file', {
       method: 'POST',
       body: formData,
     });
     
     if (!response.ok) {
       throw new Error('ファイルアップロードに失敗しました');
     }
     
     const data = await response.json();
     return data.fileUrl;
   } catch (error) {
     console.error('File upload error:', error);
     alert('ファイルアップロードに失敗しました: ' + error.message);
     return '';
   }
 };

 const getFilePathFromUrl = (url) => {
   try {
     // URLを修正してから処理
     const fixedUrl = fixStorageUrl(url);
     const decodedUrl = decodeURIComponent(fixedUrl);
     const startIndex = decodedUrl.indexOf('/o/') + 3;
     const endIndex = decodedUrl.indexOf('?');
     return decodedUrl.substring(startIndex, endIndex);
   } catch (error) {
     console.error('Error parsing file URL:', error);
     return '';
   }
 };

 const handleDelete = async (update) => {
   if (!window.confirm(`第${update.count}回を削除してもよろしいですか？`)) {
     return;
   }

   try {
     if (update.fileUrl) {
       try {
         // サーバーサイドでファイルを削除
         const response = await fetch('/api/delete-file', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({ path: getFilePathFromUrl(update.fileUrl) }),
         });
         
         if (!response.ok) {
           console.error('ファイル削除APIエラー');
         }
       } catch (error) {
         console.error('Error deleting file:', error);
       }
     }

     const updatedUpdates = selectedTournament.updates.filter(
       u => u.updateId !== update.updateId
     );

     await updateDoc(doc(db, 'tournaments', selectedTournament.id), {
       updates: updatedUpdates,
       updatedAt: new Date().toISOString()
     });

     fetchTournaments();
     alert('削除が完了しました');
   } catch (error) {
     console.error('Error deleting round:', error);
     alert('削除に失敗しました');
   }
 };

 const handleSubmit = async (e) => {
   e.preventDefault();

   if (!selectedTournament || !selectedUpdate) {
     alert('大会と編集する回を選択してください');
     return;
   }

   try {
     let fileUrl = formData.fileUrl;
     
     if (formData.file) {
       fileUrl = await handleFileUpload(formData.file, selectedTournament.tournamentId);
       if (!fileUrl) {
         // アップロード失敗時は処理を中断
         return;
       }
     }

     const now = new Date().toISOString();
     const updatedUpdate = {
       ...selectedUpdate,
       year: formData.year,
       count: formData.count,
       body: formData.body,
       fileUrl: fileUrl,
       updatedAt: now
     };

     const updates = selectedTournament.updates.map(update =>
       update.updateId === selectedUpdate.updateId ? updatedUpdate : update
     );

     await updateDoc(doc(db, 'tournaments', selectedTournament.id), {
       updates,
       updatedAt: now
     });

     fetchTournaments();
     alert('大会回の情報が更新されました');
     handleCloseEdit();
   } catch (error) {
     console.error('Error updating round:', error);
     alert('更新に失敗しました');
   }
 };

 const handleCloseEdit = () => {
   setSelectedUpdate(null);
   setFormData({
     year: '',
     count: '',
     body: '',
     file: null,
     fileUrl: ''
   });
 };

 return (
   <AdminLayout>
     <div className={styles.container}>
       <h1>大会回編集</h1>

       <div className={styles.searchSection}>
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
             className={styles.searchSelect}
             onChange={(e) => setSelectedTournament(tournaments.find(t => t.id === e.target.value))}
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
         <div className={styles.updatesList}>
           <h2>回一覧</h2>
           <table className={styles.updatesTable}>
             <thead>
               <tr>
                 <th>年度</th>
                 <th>回数</th>
                 <th>更新日</th>
                 <th>操作</th>
               </tr>
             </thead>
             <tbody>
               {selectedTournament.updates
                 .sort((a, b) => {
                   const yearA = String(a.year);
                   const yearB = String(b.year);
                   const yearCompare = yearB.localeCompare(yearA);
                   if (yearCompare !== 0) return yearCompare;
                   
                   const countA = String(a.count);
                   const countB = String(b.count);
                   return countB.localeCompare(countA);
                 })
                 .map((update) => (
                   <tr 
                     key={update.updateId}
                     className={selectedUpdate?.updateId === update.updateId ? styles.selectedRow : ''}
                   >
                     <td>{update.year}</td>
                     <td>第{update.count}回</td>
                     <td>{new Date(update.updatedAt).toLocaleDateString('ja-JP')}</td>
                     <td>
                       <button 
                         onClick={() => {
                           setSelectedUpdate(update);
                           setFormData({
                             year: update.year,
                             count: update.count,
                             body: update.body || '',
                             file: null,
                             fileUrl: update.fileUrl || ''
                           });
                         }}
                         className={styles.editButton}
                       >
                         編集
                       </button>
                       <button 
                         onClick={() => handleDelete(update)}
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
       )}

       {selectedUpdate && (
         <div className={styles.editFormOverlay}>
           <div className={styles.editFormContainer}>
             <form onSubmit={handleSubmit} className={styles.editForm}>
               <div className={styles.editFormHeader}>
                 <h2>大会回編集</h2>
                 <button 
                   type="button" 
                   className={styles.closeButton}
                   onClick={handleCloseEdit}
                 >
                   ×
                 </button>
               </div>

               <div className={styles.formGroup}>
                 <label>年度</label>
                 <input
                   type="number"
                   value={formData.year}
                   onChange={(e) => setFormData({ ...formData, year: e.target.value })}
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
                   value={formData.body}
                   onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                   rows={5}
                 />
               </div>

               <div className={styles.formGroup}>
                 <label>関連ファイル</label>
                 {formData.fileUrl && (
                   <div className={styles.currentFile}>
                     <p>
                       現在のファイル: 
                       <button
                         type="button"
                         className={styles.fileButton}
                         onClick={() => window.open(getProxiedUrl(formData.fileUrl), '_blank')}
                       >
                         表示
                       </button>
                     </p>
                   </div>
                 )}
                 <input
                   type="file"
                   onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                   accept=".pdf,.doc,.docx,.xls,.xlsx"
                 />
               </div>

               <div className={styles.formButtons}>
                 <button type="submit" className={styles.submitButton}>
                   更新する
                 </button>
                 <button 
                   type="button" 
                   className={styles.cancelButton}
                   onClick={handleCloseEdit}
                 >
                   キャンセル
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}
     </div>
   </AdminLayout>
 );
}