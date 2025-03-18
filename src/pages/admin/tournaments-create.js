import { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, addDoc, query, getDocs, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import styles from '../../styles/admin/Tournaments.module.css';

export default function TournamentCreate() {
  const [tournaments, setTournaments] = useState([]);
  const [formData, setFormData] = useState({
    tournamentId: '',
    title1: '',
    title2: '',
    class: [],
    thumbnail: null
  });

  useEffect(() => {
    fetchTournaments();
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

  const classes = [
    { id: 'elementary', name: '学童' },
    { id: 'junior', name: '少年' },
    { id: 'adult-a', name: '一般A級' },
    { id: 'adult-b', name: '一般B級' },
    { id: 'adult-c', name: '一般C級' }
  ];

  const handleClassChange = (classId) => {
    const updatedClasses = formData.class.includes(classId)
      ? formData.class.filter(id => id !== classId)
      : [...formData.class, classId];
    setFormData({ ...formData, class: updatedClasses });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, thumbnail: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let thumbnailUrl = '';
      if (formData.thumbnail) {
        const storageRef = ref(storage, `tournaments/${formData.tournamentId}/thumbnail`);
        await uploadBytes(storageRef, formData.thumbnail);
        thumbnailUrl = await getDownloadURL(storageRef);
      }

      // 新規大会データの構造を統一
      const newTournament = {
        tournamentId: formData.tournamentId,
        title1: formData.title1,
        title2: formData.title2,
        class: formData.class,
        thumbnail: thumbnailUrl,
        updates: [],
        updatedAt: new Date() // タイムスタンプを追加
      };

      await addDoc(collection(db, 'tournaments'), newTournament);
      fetchTournaments();
      
      setFormData({
        tournamentId: '',
        title1: '',
        title2: '',
        class: [],
        thumbnail: null
      });

      alert('大会情報が登録されました');
    } catch (error) {
      console.error('Error adding tournament:', error);
      alert('大会情報の登録に失敗しました');
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h1>大会新規登録</h1>
        <section className={styles.tournamentForm}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>大会ID</label>
              <input
                type="text"
                value={formData.tournamentId}
                onChange={(e) => setFormData({ ...formData, tournamentId: e.target.value })}
                required
                placeholder="例: spring-tournament"
              />
            </div>

            <div className={styles.formGroup}>
              <label>大会名（1行目）</label>
              <input
                type="text"
                value={formData.title1}
                onChange={(e) => setFormData({ ...formData, title1: e.target.value })}
                required
                placeholder="例: 第○回春季大会"
              />
            </div>

            <div className={styles.formGroup}>
              <label>大会名（2行目）</label>
              <input
                type="text"
                value={formData.title2}
                onChange={(e) => setFormData({ ...formData, title2: e.target.value })}
                required
                placeholder="例: ○○地区予選"
              />
            </div>

            <div className={styles.formGroup}>
              <label>クラス区分</label>
              <div className={styles.checkboxGroup}>
                {classes.map((classItem) => (
                  <label key={classItem.id} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={formData.class.includes(classItem.id)}
                      onChange={() => handleClassChange(classItem.id)}
                    />
                    {classItem.name}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>サムネイル画像</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              登録する
            </button>
          </form>
        </section>
      </div>
    </AdminLayout>
  );
}