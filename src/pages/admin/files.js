import { useState, useEffect } from 'react';
import { auth, db, storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import styles from '../../styles/admin/Files.module.css';

export default function FileUpload() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    category: 'registration',
    file: null
  });

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'files'));
        const filesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            category: data.category || '',
            fileName: data.fileName || '',
            fileUrl: data.fileUrl || '',
            fileType: data.fileType || '',
            fileSize: data.fileSize || '',
            uploadedAt: data.uploadedAt || '',
            storagePath: data.storagePath || ''
          };
        });
        setFiles(filesData);
      } catch (error) {
        console.error('Error fetching files:', error);
        setError('ファイル一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const isAllowedFileType = (file) => {
    const allowedTypes = {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    };

    const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
    const fileType = file.type;

    return allowedTypes[fileType]?.includes(fileExtension);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!isAllowedFileType(file)) {
        alert('許可されているファイル形式：PDF, DOC, DOCX, XLS, XLSX');
        e.target.value = '';
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('ファイルサイズは10MB以下にしてください');
        e.target.value = '';
        return;
      }

      setUploadData(prev => ({ ...prev, file }));
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.title || !uploadData.file) {
      alert('タイトルとファイルを選択してください');
      return;
    }

    setUploadLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('認証が必要です');
      }

      const timestamp = new Date().getTime();
      const storageRef = ref(storage, `files/${uploadData.category}/${timestamp}_${uploadData.file.name}`);
      
      await uploadBytes(storageRef, uploadData.file);
      const downloadURL = await getDownloadURL(storageRef);

      const newFileData = {
        title: uploadData.title,
        category: uploadData.category,
        fileName: uploadData.file.name,
        fileUrl: downloadURL,
        fileType: uploadData.file.type,
        fileSize: `${(uploadData.file.size / 1024).toFixed(1)}KB`,
        uploadedAt: new Date().toISOString(),
        storagePath: `files/${uploadData.category}/${timestamp}_${uploadData.file.name}`,
        uploadedBy: user.uid
      };

      const docRef = await addDoc(collection(db, 'files'), newFileData);
      
      setFiles([{ id: docRef.id, ...newFileData }, ...files]);
      
      setUploadData({
        title: '',
        category: 'registration',
        file: null
      });

      alert('ファイルがアップロードされました');
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('アップロードに失敗しました');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (fileData) => {
    if (!window.confirm('このファイルを削除しますか？')) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('認証が必要です');
      }

      const storageRef = ref(storage, fileData.storagePath);
      await deleteObject(storageRef);
      await deleteDoc(doc(db, 'files', fileData.id));
      
      setFiles(files.filter(f => f.id !== fileData.id));
      alert('ファイルが削除されました');
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>データを読み込み中...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h1>ファイル管理</h1>
        
        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}
        
        <section className={styles.uploadSection}>
          <h2>ファイルアップロード</h2>
          <form onSubmit={handleFileUpload} className={styles.uploadForm}>
            <div className={styles.formGroup}>
              <label>タイトル</label>
              <input 
                type="text" 
                value={uploadData.title} 
                onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))} 
                required 
                disabled={uploadLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label>カテゴリ</label>
              <select 
                value={uploadData.category} 
                onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))} 
                required
                disabled={uploadLoading}
              >
                <option value="registration">登録申請書類</option>
                <option value="insurance">保険関連書類</option>
                <option value="tournament">大会関連書類</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>ファイル</label>
              <input 
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                required 
                disabled={uploadLoading}
              />
            </div>

            <button type="submit" disabled={uploadLoading}>
              {uploadLoading ? 'アップロード中...' : 'アップロード'}
            </button>
          </form>
        </section>

        <section className={styles.filesList}>
          <h2>アップロード済みファイル一覧</h2>
          {files.map((file) => (
            <div key={file.id} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                <h3>{file.title}</h3>
                <span className={styles.fileCategory}>{file.category}</span>
                <span className={styles.fileMeta}>
                  {file.fileType} - {file.fileSize}
                </span>
                <time>{new Date(file.uploadedAt).toLocaleString('ja-JP')}</time>
              </div>
              <div className={styles.fileActions}>
                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className={styles.downloadButton}>
                  ダウンロード
                </a>
                <button onClick={() => handleDelete(file)} className={styles.deleteButton}>
                  削除
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </AdminLayout>
  );
}