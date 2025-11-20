// admin/master/tournament/index.js
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout/AdminLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import styles from './tournament.module.css';

export default function TournamentMaster() {
  const [activeTab, setActiveTab] = useState('class');
  const [classes, setClasses] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchClasses(),
        fetchTournaments()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    const q = query(collection(db, 'tournamentClasses'), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setClasses(data);
  };

  const fetchTournaments = async () => {
    const q = query(collection(db, 'tournamentMaster'), orderBy('name1', 'asc'));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setTournaments(data);
  };

  const openModal = (type, item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData(getInitialFormData(type));
    }
    setIsModalOpen(true);
  };

  const getInitialFormData = (type) => {
    switch (type) {
      case 'class':
        return { name: '', code: '', order: classes.length, active: true };
      case 'tournament':
        return { name1: '', name2: '', classIds: [], active: true };
      default:
        return {};
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const dataToSave = {
        ...formData,
        updatedAt: serverTimestamp()
      };

      const collectionName = activeTab === 'class' ? 'tournamentClasses' : 'tournamentMaster';

      if (editingItem) {
        await updateDoc(doc(db, collectionName, editingItem.id), dataToSave);
        alert('更新しました');
      } else {
        dataToSave.createdAt = serverTimestamp();
        await addDoc(collection(db, collectionName), dataToSave);
        alert('作成しました');
      }

      closeModal();
      fetchAllData();
    } catch (error) {
      console.error('Error saving:', error);
      alert('保存に失敗しました');
    }
  };

  const handleDelete = async (type, item) => {
    if (!confirm('本当に削除しますか？')) return;

    try {
      const collectionName = type === 'class' ? 'tournamentClasses' : 'tournamentMaster';
      await deleteDoc(doc(db, collectionName, item.id));
      alert('削除しました');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('削除に失敗しました');
    }
  };

  const getClassNames = (classIds) => {
    if (!classIds || classIds.length === 0) return '-';
    return classIds
      .map(id => {
        const cls = classes.find(c => c.id === id);
        return cls ? cls.name : '';
      })
      .filter(name => name)
      .join(', ');
  };

  const handleClassToggle = (classId) => {
    const currentIds = formData.classIds || [];
    const newIds = currentIds.includes(classId)
      ? currentIds.filter(id => id !== classId)
      : [...currentIds, classId];
    setFormData({ ...formData, classIds: newIds });
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
        <h1>大会マスタ管理</h1>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'class' ? styles.active : ''}`}
            onClick={() => setActiveTab('class')}
          >
            クラスマスタ
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'tournament' ? styles.active : ''}`}
            onClick={() => setActiveTab('tournament')}
          >
            大会マスタ
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <button
              className={styles.addButton}
              onClick={() => openModal(activeTab)}
            >
              ＋ 新規作成
            </button>
          </div>

          {activeTab === 'class' && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>順序</th>
                  <th>クラス名</th>
                  <th>コード</th>
                  <th>状態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((item) => (
                  <tr key={item.id}>
                    <td>{item.order}</td>
                    <td>{item.name}</td>
                    <td>{item.code}</td>
                    <td>
                      <span className={`${styles.status} ${item.active ? styles.active : styles.inactive}`}>
                        {item.active ? '有効' : '無効'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button onClick={() => openModal('class', item)} className={styles.editButton}>編集</button>
                        <button onClick={() => handleDelete('class', item)} className={styles.deleteButton}>削除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'tournament' && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>大会名1</th>
                  <th>大会名2</th>
                  <th>対象クラス</th>
                  <th>状態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name1}</td>
                    <td>{item.name2 || '-'}</td>
                    <td>{getClassNames(item.classIds)}</td>
                    <td>
                      <span className={`${styles.status} ${item.active ? styles.active : styles.inactive}`}>
                        {item.active ? '有効' : '無効'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button onClick={() => openModal('tournament', item)} className={styles.editButton}>編集</button>
                        <button onClick={() => handleDelete('tournament', item)} className={styles.deleteButton}>削除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
                {activeTab === 'class' && (
                  <>
                    <div className={styles.formGroup}>
                      <label>クラス名 *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>コード</label>
                      <input
                        type="text"
                        value={formData.code || ''}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>表示順</label>
                      <input
                        type="number"
                        value={formData.order || 0}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>状態</label>
                      <select
                        value={formData.active !== undefined ? formData.active.toString() : 'true'}
                        onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                      >
                        <option value="true">有効</option>
                        <option value="false">無効</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === 'tournament' && (
                  <>
                    <div className={styles.formGroup}>
                      <label>大会名1 *</label>
                      <input
                        type="text"
                        value={formData.name1 || ''}
                        onChange={(e) => setFormData({ ...formData, name1: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>大会名2</label>
                      <input
                        type="text"
                        value={formData.name2 || ''}
                        onChange={(e) => setFormData({ ...formData, name2: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>対象クラス *</label>
                      <div className={styles.checkboxGroup}>
                        {classes.filter(c => c.active).map((cls) => (
                          <label key={cls.id} className={styles.checkbox}>
                            <input
                              type="checkbox"
                              checked={(formData.classIds || []).includes(cls.id)}
                              onChange={() => handleClassToggle(cls.id)}
                            />
                            <span>{cls.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label>状態</label>
                      <select
                        value={formData.active !== undefined ? formData.active.toString() : 'true'}
                        onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                      >
                        <option value="true">有効</option>
                        <option value="false">無効</option>
                      </select>
                    </div>
                  </>
                )}

                <div className={styles.modalFooter}>
                  <button type="button" onClick={closeModal} className={styles.cancelButton}>
                    キャンセル
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    保存
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
