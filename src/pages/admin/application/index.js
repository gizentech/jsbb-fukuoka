// admin/application/index.js
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout/AdminLayout';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import styles from './application.module.css';

export default function ApplicationAdmin() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'draft',
    order: 0
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // データ取得
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const q = query(collection(db, 'applications'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // モーダルを開く
  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description || '',
        category: item.category || '',
        status: item.status,
        order: item.order
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        status: 'draft',
        order: applications.length
      });
    }
    setFile(null);
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      status: 'draft',
      order: 0
    });
    setFile(null);
  };

  // ファイルアップロード
  const uploadFile = async (file) => {
    const timestamp = Date.now();
    const fileName = `applications/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return {
      fileUrl: downloadURL,
      fileName: file.name,
      storagePath: fileName
    };
  };

  // 保存処理
  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let fileData = {};

      // ファイルがある場合はアップロード
      if (file) {
        fileData = await uploadFile(file);
      }

      const dataToSave = {
        ...formData,
        ...fileData,
        updatedAt: serverTimestamp()
      };

      if (editingItem) {
        // 更新
        await updateDoc(doc(db, 'applications', editingItem.id), dataToSave);
        alert('更新しました');
      } else {
        // 新規作成
        dataToSave.createdAt = serverTimestamp();
        await addDoc(collection(db, 'applications'), dataToSave);
        alert('作成しました');
      }

      closeModal();
      fetchApplications();
    } catch (error) {
      console.error('Error saving:', error);
      alert('保存に失敗しました');
    } finally {
      setUploading(false);
    }
  };

  // 削除処理
  const handleDelete = async (item) => {
    if (!confirm('本当に削除しますか？')) return;

    try {
      // Storageからファイルを削除
      if (item.storagePath) {
        const storageRef = ref(storage, item.storagePath);
        await deleteObject(storageRef);
      }

      // Firestoreから削除
      await deleteDoc(doc(db, 'applications', item.id));
      alert('削除しました');
      fetchApplications();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('削除に失敗しました');
    }
  };

  // 公開/非公開切り替え
  const toggleStatus = async (item) => {
    try {
      const newStatus = item.status === 'published' ? 'draft' : 'published';
      await updateDoc(doc(db, 'applications', item.id), {
        status: newStatus,
        publishedAt: newStatus === 'published' ? serverTimestamp() : null
      });
      fetchApplications();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('ステータス変更に失敗しました');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className={styles.loading}>読み込み中...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>大会申込書管理</h1>
          <button className={styles.addButton} onClick={() => openModal()}>
            ＋ 新規作成
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>順序</th>
                <th>タイトル</th>
                <th>カテゴリ</th>
                <th>ファイル</th>
                <th>ステータス</th>
                <th>更新日</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((item) => (
                <tr key={item.id}>
                  <td>{item.order}</td>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>
                    {item.fileName && (
                      <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                        {item.fileName}
                      </a>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.status} ${item.status === 'published' ? styles.published : styles.draft}`}>
                      {item.status === 'published' ? '公開' : '下書き'}
                    </span>
                  </td>
                  <td>
                    {item.updatedAt && new Date(item.updatedAt.seconds * 1000).toLocaleString('ja-JP')}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button onClick={() => openModal(item)} className={styles.editButton}>編集</button>
                      <button onClick={() => toggleStatus(item)} className={styles.toggleButton}>
                        {item.status === 'published' ? '非公開' : '公開'}
                      </button>
                      <button onClick={() => handleDelete(item)} className={styles.deleteButton}>削除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* モーダル */}
        {isModalOpen && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{editingItem ? '編集' : '新規作成'}</h2>
                <button onClick={closeModal} className={styles.closeButton}>×</button>
              </div>

              <form onSubmit={handleSave} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>タイトル *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>説明</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>カテゴリ</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>ファイル (PDF)</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  {editingItem?.fileName && !file && (
                    <div className={styles.currentFile}>
                      現在のファイル: {editingItem.fileName}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>表示順</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>ステータス</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="draft">下書き</option>
                    <option value="published">公開</option>
                  </select>
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" onClick={closeModal} className={styles.cancelButton}>
                    キャンセル
                  </button>
                  <button type="submit" disabled={uploading} className={styles.saveButton}>
                    {uploading ? 'アップロード中...' : '保存'}
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
