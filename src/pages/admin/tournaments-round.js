// tournaments-round.jsを修正

import { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, query, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import styles from '../../styles/admin/tournaments-round.module.css';

const classNames = {
  'elementary': '学童',
  'junior': '少年',
  'adult-a': '一般A級',
  'adult-b': '一般B級',
  'adult-c': '一般C級',
};

export default function TournamentRound() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [formData, setFormData] = useState({
    count: '',
    year: new Date().getFullYear().toString(),
    file: null,
    body: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTournament) {
      alert('大会を選択してください');
      return;
    }

    try {
      let fileUrl = '';
      if (formData.file) {
        const fileRef = ref(storage, `tournaments/${selectedTournament.tournamentId}/files/${Date.now()}_${formData.file.name}`);
        await uploadBytes(fileRef, formData.file);
        fileUrl = await getDownloadURL(fileRef);
      }

      const now = new Date().toISOString();
      const update = {
        count: formData.count,
        year: formData.year,
        body: formData.body,
        fileUrl: fileUrl,
        updateId: Date.now().toString(),
        updatedAt: now
      };

      const updates = [...(selectedTournament.updates || []), update];

      await updateDoc(doc(db, 'tournaments', selectedTournament.id), {
        updates,
        updatedAt: now
      });

      setFormData({
        count: '',
        year: new Date().getFullYear().toString(),
        file: null,
        body: ''
      });

      fetchTournaments();
      alert('新規回が追加されました');
    } catch (error) {
      console.error('Error adding round:', error);
      alert('新規回の追加に失敗しました');
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h1>大会回追加</h1>

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
              onChange={(e) => {
                const tournament = tournaments.find(t => t.id === e.target.value);
                setSelectedTournament(tournament);
              }}
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
          <form onSubmit={handleSubmit} className={styles.roundForm}>
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
                placeholder="例: 1"
              />
            </div>

            <div className={styles.formGroup}>
              <label>内容</label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                rows={5}
                placeholder="大会の詳細情報を入力"
              />
            </div>

            <div className={styles.formGroup}>
              <label>関連ファイル</label>
              <input
                type="file"
                onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              追加する
            </button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}