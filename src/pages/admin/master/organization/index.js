// admin/master/organization/index.js
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout/AdminLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, query, where } from 'firebase/firestore';
import styles from './organization.module.css';

export default function OrganizationMaster() {
  const [activeTab, setActiveTab] = useState('prefecture');
  const [prefectures, setPrefectures] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [branches, setBranches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [classes, setClasses] = useState([]);
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
        fetchPrefectures(),
        fetchBlocks(),
        fetchBranches(),
        fetchTeams(),
        fetchClasses()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrefectures = async () => {
    const q = query(collection(db, 'prefectures'), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setPrefectures(data);
  };

  const fetchBlocks = async () => {
    const q = query(collection(db, 'blocks'), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setBlocks(data);
  };

  const fetchBranches = async () => {
    const q = query(collection(db, 'branches'), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setBranches(data);
  };

  const fetchTeams = async () => {
    const q = query(collection(db, 'teams'), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setTeams(data);
  };

  const fetchClasses = async () => {
    const q = query(collection(db, 'classes'), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setClasses(data);
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
    // 福岡県のIDを取得（デフォルト値用）
    const fukuokaPref = prefectures.find(p => p.code === '40');
    const fukuokaPrefId = fukuokaPref ? fukuokaPref.id : '';

    switch (type) {
      case 'prefecture':
        return { name: '', code: '', order: prefectures.length };
      case 'block':
        return { name: '', prefectureId: fukuokaPrefId, order: blocks.length };
      case 'branch':
        return { name: '', blockId: '', prefectureId: fukuokaPrefId, order: branches.length };
      case 'team':
        return {
          name: '',
          branchId: '',
          blockId: '',
          prefectureId: fukuokaPrefId,
          active: true,
          representativeName: '',
          email1: '',
          email2: '',
          email3: '',
          classIds: []
        };
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

      const collectionName = getCollectionName(activeTab);

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
      const collectionName = getCollectionName(type);
      await deleteDoc(doc(db, collectionName, item.id));
      alert('削除しました');
      fetchAllData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('削除に失敗しました');
    }
  };

  const getCollectionName = (type) => {
    switch (type) {
      case 'prefecture': return 'prefectures';
      case 'block': return 'blocks';
      case 'branch': return 'branches';
      case 'team': return 'teams';
      default: return '';
    }
  };

  const getPrefectureName = (id) => {
    const pref = prefectures.find(p => p.id === id);
    return pref ? pref.name : '-';
  };

  const getBlockName = (id) => {
    const block = blocks.find(b => b.id === id);
    return block ? block.name : '-';
  };

  const getBranchName = (id) => {
    const branch = branches.find(b => b.id === id);
    return branch ? branch.name : '-';
  };

  const getClassNames = (classIds) => {
    if (!classIds || classIds.length === 0) return '-';
    return classIds
      .map(id => {
        const classItem = classes.find(c => c.id === id);
        return classItem ? classItem.name : '';
      })
      .filter(name => name)
      .join(', ');
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
        <h1>組織マスタ管理</h1>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'prefecture' ? styles.active : ''}`}
            onClick={() => setActiveTab('prefecture')}
          >
            都道府県
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'block' ? styles.active : ''}`}
            onClick={() => setActiveTab('block')}
          >
            ブロック
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'branch' ? styles.active : ''}`}
            onClick={() => setActiveTab('branch')}
          >
            支部
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'team' ? styles.active : ''}`}
            onClick={() => setActiveTab('team')}
          >
            チーム
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

          {activeTab === 'prefecture' && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>順序</th>
                  <th>都道府県名</th>
                  <th>コード</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {prefectures.map((item) => (
                  <tr key={item.id}>
                    <td>{item.order}</td>
                    <td>{item.name}</td>
                    <td>{item.code}</td>
                    <td>
                      <div className={styles.actions}>
                        <button onClick={() => openModal('prefecture', item)} className={styles.editButton}>編集</button>
                        <button onClick={() => handleDelete('prefecture', item)} className={styles.deleteButton}>削除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'block' && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>順序</th>
                  <th>ブロック名</th>
                  <th>都道府県</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((item) => (
                  <tr key={item.id}>
                    <td>{item.order}</td>
                    <td>{item.name}</td>
                    <td>{getPrefectureName(item.prefectureId)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button onClick={() => openModal('block', item)} className={styles.editButton}>編集</button>
                        <button onClick={() => handleDelete('block', item)} className={styles.deleteButton}>削除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'branch' && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>順序</th>
                  <th>支部名</th>
                  <th>ブロック</th>
                  <th>都道府県</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((item) => (
                  <tr key={item.id}>
                    <td>{item.order}</td>
                    <td>{item.name}</td>
                    <td>{getBlockName(item.blockId)}</td>
                    <td>{getPrefectureName(item.prefectureId)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button onClick={() => openModal('branch', item)} className={styles.editButton}>編集</button>
                        <button onClick={() => handleDelete('branch', item)} className={styles.deleteButton}>削除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'team' && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>チーム名</th>
                  <th>代表者名</th>
                  <th>メールアドレス</th>
                  <th>クラス</th>
                  <th>支部</th>
                  <th>ブロック</th>
                  <th>都道府県</th>
                  <th>状態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.representativeName || '-'}</td>
                    <td>
                      {item.email1 && <div>{item.email1}</div>}
                      {item.email2 && <div style={{ fontSize: '0.85em', color: '#666' }}>{item.email2}</div>}
                      {item.email3 && <div style={{ fontSize: '0.85em', color: '#666' }}>{item.email3}</div>}
                      {!item.email1 && !item.email2 && !item.email3 && '-'}
                    </td>
                    <td>{getClassNames(item.classIds)}</td>
                    <td>{getBranchName(item.branchId)}</td>
                    <td>{getBlockName(item.blockId)}</td>
                    <td>{getPrefectureName(item.prefectureId)}</td>
                    <td>
                      <span className={`${styles.status} ${item.active ? styles.active : styles.inactive}`}>
                        {item.active ? '有効' : '無効'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button onClick={() => openModal('team', item)} className={styles.editButton}>編集</button>
                        <button onClick={() => handleDelete('team', item)} className={styles.deleteButton}>削除</button>
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
                {activeTab === 'prefecture' && (
                  <>
                    <div className={styles.formGroup}>
                      <label>都道府県名 *</label>
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
                  </>
                )}

                {activeTab === 'block' && (
                  <>
                    <div className={styles.formGroup}>
                      <label>ブロック名 *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>都道府県 *</label>
                      <select
                        value={formData.prefectureId || ''}
                        onChange={(e) => setFormData({ ...formData, prefectureId: e.target.value })}
                        required
                      >
                        <option value="">選択してください</option>
                        {prefectures.map((pref) => (
                          <option key={pref.id} value={pref.id}>{pref.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>表示順</label>
                      <input
                        type="number"
                        value={formData.order || 0}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      />
                    </div>
                  </>
                )}

                {activeTab === 'branch' && (
                  <>
                    <div className={styles.formGroup}>
                      <label>支部名 *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>都道府県 *</label>
                      <select
                        value={formData.prefectureId || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, prefectureId: e.target.value, blockId: '' });
                        }}
                        required
                      >
                        <option value="">選択してください</option>
                        {prefectures.map((pref) => (
                          <option key={pref.id} value={pref.id}>{pref.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>ブロック *</label>
                      <select
                        value={formData.blockId || ''}
                        onChange={(e) => setFormData({ ...formData, blockId: e.target.value })}
                        required
                        disabled={!formData.prefectureId}
                      >
                        <option value="">選択してください</option>
                        {blocks
                          .filter(block => block.prefectureId === formData.prefectureId)
                          .map((block) => (
                            <option key={block.id} value={block.id}>{block.name}</option>
                          ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>表示順</label>
                      <input
                        type="number"
                        value={formData.order || 0}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      />
                    </div>
                  </>
                )}

                {activeTab === 'team' && (
                  <>
                    <div className={styles.formGroup}>
                      <label>チーム名 *</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>代表者名</label>
                      <input
                        type="text"
                        value={formData.representativeName || ''}
                        onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>メールアドレス①</label>
                      <input
                        type="email"
                        value={formData.email1 || ''}
                        onChange={(e) => setFormData({ ...formData, email1: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>メールアドレス②</label>
                      <input
                        type="email"
                        value={formData.email2 || ''}
                        onChange={(e) => setFormData({ ...formData, email2: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>メールアドレス③</label>
                      <input
                        type="email"
                        value={formData.email3 || ''}
                        onChange={(e) => setFormData({ ...formData, email3: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>都道府県 *</label>
                      <select
                        value={formData.prefectureId || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, prefectureId: e.target.value, blockId: '', branchId: '' });
                        }}
                        required
                      >
                        <option value="">選択してください</option>
                        {prefectures.map((pref) => (
                          <option key={pref.id} value={pref.id}>{pref.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>ブロック *</label>
                      <select
                        value={formData.blockId || ''}
                        onChange={(e) => {
                          setFormData({ ...formData, blockId: e.target.value, branchId: '' });
                        }}
                        required
                        disabled={!formData.prefectureId}
                      >
                        <option value="">選択してください</option>
                        {blocks
                          .filter(block => block.prefectureId === formData.prefectureId)
                          .map((block) => (
                            <option key={block.id} value={block.id}>{block.name}</option>
                          ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>支部 *</label>
                      <select
                        value={formData.branchId || ''}
                        onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                        required
                        disabled={!formData.blockId}
                      >
                        <option value="">選択してください</option>
                        {branches
                          .filter(branch => branch.blockId === formData.blockId)
                          .map((branch) => (
                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                          ))}
                      </select>
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
                    <div className={styles.formGroup}>
                      <label>クラス</label>
                      <div className={styles.checkboxGrid}>
                        {classes.map((classItem) => (
                          <label key={classItem.id} className={styles.checkbox}>
                            <input
                              type="checkbox"
                              checked={(formData.classIds || []).includes(classItem.id)}
                              onChange={(e) => {
                                const currentClassIds = formData.classIds || [];
                                if (e.target.checked) {
                                  setFormData({ ...formData, classIds: [...currentClassIds, classItem.id] });
                                } else {
                                  setFormData({ ...formData, classIds: currentClassIds.filter(id => id !== classItem.id) });
                                }
                              }}
                            />
                            <span>{classItem.name}</span>
                          </label>
                        ))}
                      </div>
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
