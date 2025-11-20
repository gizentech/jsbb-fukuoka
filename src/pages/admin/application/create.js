// admin/application/create.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout/AdminLayout';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import styles from './application.module.css';

export default function CreateApplication() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // マスタデータ
  const [tournaments, setTournaments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [prefectures, setPrefectures] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [branches, setBranches] = useState([]);
  const [teams, setTeams] = useState([]);

  // フォームデータ
  const [formData, setFormData] = useState({
    displayTitle: '',
    tournamentId: '',
    holdingType: 'number', // 'number' or 'year'
    holdingNumber: '',
    holdingYear: '',
    description: '',
    deadline: '',
    classIds: [],
    files: [],
    hasDirectorMeeting: false,
    directorMeetingDateTime: '',
    directorMeetingPlace: '',
    hasOpeningCeremony: false,
    openingCeremonyDateTime: '',
    openingCeremonyPlace: '',
    requireAttendanceConfirm: false,
    requireUnavailableDates: false,
    selectedTeams: []
  });

  // 申込締切のデフォルト値を設定（今日+30日）
  useEffect(() => {
    const today = new Date();
    const defaultDeadline = new Date(today.setDate(today.getDate() + 30));
    const formattedDate = defaultDeadline.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, deadline: formattedDate }));
  }, []);

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchTournaments(),
        fetchClasses(),
        fetchPrefectures(),
        fetchBlocks(),
        fetchBranches(),
        fetchTeams()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchTournaments = async () => {
    const q = query(collection(db, 'tournamentMaster'), orderBy('name1', 'asc'));
    const snapshot = await getDocs(q);
    setTournaments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchClasses = async () => {
    const q = query(collection(db, 'tournamentClasses'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(c => c.active));
  };

  const fetchPrefectures = async () => {
    const q = query(collection(db, 'prefectures'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    setPrefectures(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchBlocks = async () => {
    const q = query(collection(db, 'blocks'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    setBlocks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchBranches = async () => {
    const q = query(collection(db, 'branches'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    setBranches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchTeams = async () => {
    const q = query(collection(db, 'teams'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    setTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(t => t.active));
  };

  const handleClassToggle = (classId) => {
    const currentIds = formData.classIds || [];
    const newIds = currentIds.includes(classId)
      ? currentIds.filter(id => id !== classId)
      : [...currentIds, classId];
    setFormData({ ...formData, classIds: newIds });
  };

  const handleTeamToggle = (teamId) => {
    const currentIds = formData.selectedTeams || [];
    const newIds = currentIds.includes(teamId)
      ? currentIds.filter(id => id !== teamId)
      : [...currentIds, teamId];
    setFormData({ ...formData, selectedTeams: newIds });
  };

  const handleBranchToggle = (branchId) => {
    const branchTeams = teams.filter(t => t.branchId === branchId && formData.classIds.some(classId => t.classIds?.includes(classId)));
    const branchTeamIds = branchTeams.map(t => t.id);
    const allSelected = branchTeamIds.every(id => formData.selectedTeams.includes(id));

    if (allSelected) {
      setFormData({
        ...formData,
        selectedTeams: formData.selectedTeams.filter(id => !branchTeamIds.includes(id))
      });
    } else {
      setFormData({
        ...formData,
        selectedTeams: [...new Set([...formData.selectedTeams, ...branchTeamIds])]
      });
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const uploadFiles = async () => {
    const uploadedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const timestamp = Date.now();
      const fileName = `applications/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      uploadedFiles.push({
        fileName: file.name,
        fileUrl: downloadURL,
        storagePath: fileName,
        version: 1,
        uploadedAt: new Date().toISOString()
      });
    }

    return uploadedFiles;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      setUploading(true);
      const uploadedFiles = files.length > 0 ? await uploadFiles() : [];
      setUploading(false);

      const applicationData = {
        ...formData,
        files: uploadedFiles,
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'tournamentApplications'), applicationData);

      alert('大会申込書を作成しました');
      router.push('/admin/application');
    } catch (error) {
      console.error('Error creating application:', error);
      alert('作成に失敗しました');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className={styles.loading}>読み込み中...</div>
      </AdminLayout>
    );
  }

  const getFilteredTeams = () => {
    if (formData.classIds.length === 0) return [];

    // 選択されたクラスに該当するチームのみ表示
    return teams.filter(team => {
      // チームのクラスIDと選択されたクラスIDに共通のものがあるか
      return team.classIds?.some(classId => formData.classIds.includes(classId));
    });
  };

  const filteredTeams = getFilteredTeams();

  return (
    <AdminLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>大会申込書作成</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <h2>基本情報</h2>

            <div className={styles.formGroup}>
              <label>表示タイトル（13文字まで） *</label>
              <input
                type="text"
                maxLength={13}
                value={formData.displayTitle}
                onChange={(e) => setFormData({ ...formData, displayTitle: e.target.value })}
                required
              />
              <small>{formData.displayTitle.length}/13文字</small>
            </div>

            <div className={styles.formGroup}>
              <label>大会選択 *</label>
              <select
                value={formData.tournamentId}
                onChange={(e) => setFormData({ ...formData, tournamentId: e.target.value })}
                required
              >
                <option value="">選択してください</option>
                {tournaments.filter(t => t.active).map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name1} {tournament.name2 && `- ${tournament.name2}`}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>開催情報</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="holdingType"
                    value="number"
                    checked={formData.holdingType === 'number'}
                    onChange={(e) => setFormData({ ...formData, holdingType: 'number', holdingYear: '' })}
                  />
                  <span>開催回数</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="holdingType"
                    value="year"
                    checked={formData.holdingType === 'year'}
                    onChange={(e) => setFormData({ ...formData, holdingType: 'year', holdingNumber: '' })}
                  />
                  <span>開催年度</span>
                </label>
              </div>
              {formData.holdingType === 'number' ? (
                <input
                  type="number"
                  min="1"
                  value={formData.holdingNumber}
                  onChange={(e) => setFormData({ ...formData, holdingNumber: e.target.value })}
                  placeholder="例: 1"
                  style={{ marginTop: '0.5rem' }}
                />
              ) : (
                <input
                  type="number"
                  min="2000"
                  max="2099"
                  value={formData.holdingYear}
                  onChange={(e) => setFormData({ ...formData, holdingYear: e.target.value })}
                  placeholder="例: 2025"
                  style={{ marginTop: '0.5rem' }}
                />
              )}
            </div>

            <div className={styles.formGroup}>
              <label>大会説明</label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>申込締切 *</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2>クラス選択 *</h2>
            <div className={styles.checkboxGrid}>
              {classes.map((cls) => (
                <label key={cls.id} className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.classIds.includes(cls.id)}
                    onChange={() => handleClassToggle(cls.id)}
                  />
                  <span>{cls.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2>ファイル添付</h2>
            <div className={styles.formGroup}>
              <label>PDFやExcel、Word（複数選択可）</label>
              <input
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls,.doc,.docx"
                onChange={handleFileChange}
              />
              {files.length > 0 && (
                <div className={styles.fileList}>
                  <p>選択されたファイル:</p>
                  <ul>
                    {files.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2>確認項目</h2>

            <div className={styles.formGroup}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.hasDirectorMeeting}
                  onChange={(e) => setFormData({ ...formData, hasDirectorMeeting: e.target.checked })}
                />
                <span>監督会議あり</span>
              </label>
              {formData.hasDirectorMeeting && (
                <div className={styles.subFields}>
                  <div className={styles.formGroup}>
                    <label>日時</label>
                    <input
                      type="datetime-local"
                      value={formData.directorMeetingDateTime}
                      onChange={(e) => setFormData({ ...formData, directorMeetingDateTime: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>場所</label>
                    <input
                      type="text"
                      value={formData.directorMeetingPlace}
                      onChange={(e) => setFormData({ ...formData, directorMeetingPlace: e.target.value })}
                      placeholder="例: 久留米市野球場"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.hasOpeningCeremony}
                  onChange={(e) => setFormData({ ...formData, hasOpeningCeremony: e.target.checked })}
                />
                <span>開会式あり</span>
              </label>
              {formData.hasOpeningCeremony && (
                <div className={styles.subFields}>
                  <div className={styles.formGroup}>
                    <label>日時</label>
                    <input
                      type="datetime-local"
                      value={formData.openingCeremonyDateTime}
                      onChange={(e) => setFormData({ ...formData, openingCeremonyDateTime: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>場所</label>
                    <input
                      type="text"
                      value={formData.openingCeremonyPlace}
                      onChange={(e) => setFormData({ ...formData, openingCeremonyPlace: e.target.value })}
                      placeholder="例: 久留米市野球場"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.requireAttendanceConfirm}
                  onChange={(e) => setFormData({ ...formData, requireAttendanceConfirm: e.target.checked })}
                />
                <span>参加・不参加の確認</span>
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.requireUnavailableDates}
                  onChange={(e) => setFormData({ ...formData, requireUnavailableDates: e.target.checked })}
                />
                <span>出場不可日の確認</span>
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h2>出場チーム選択</h2>
            <p className={styles.note}>※支部を選択すると、その支部に所属する選択クラスのチームがすべて選択されます</p>

            {formData.classIds.length === 0 && (
              <p className={styles.warning}>先にクラスを選択してください</p>
            )}

            {filteredTeams.length > 0 && (
              <div className={styles.teamSelection}>
                {prefectures.map(pref => {
                  const prefBlocks = blocks.filter(b => b.prefectureId === pref.id);
                  if (prefBlocks.length === 0) return null;

                  return (
                    <div key={pref.id} className={styles.prefecture}>
                      <h3>{pref.name}</h3>
                      {prefBlocks.map(block => {
                        const blockBranches = branches.filter(br => br.blockId === block.id);
                        if (blockBranches.length === 0) return null;

                        return (
                          <div key={block.id} className={styles.block}>
                            <h4>{block.name}</h4>
                            {blockBranches.map(branch => {
                              const branchTeams = filteredTeams.filter(t => t.branchId === branch.id);
                              if (branchTeams.length === 0) return null;

                              const allSelected = branchTeams.every(t => formData.selectedTeams.includes(t.id));

                              return (
                                <div key={branch.id} className={styles.branch}>
                                  <label className={styles.branchLabel}>
                                    <input
                                      type="checkbox"
                                      checked={allSelected}
                                      onChange={() => handleBranchToggle(branch.id)}
                                    />
                                    <strong>{branch.name}</strong>
                                  </label>
                                  <div className={styles.teams}>
                                    {branchTeams.map(team => (
                                      <label key={team.id} className={styles.checkbox}>
                                        <input
                                          type="checkbox"
                                          checked={formData.selectedTeams.includes(team.id)}
                                          onChange={() => handleTeamToggle(team.id)}
                                        />
                                        <span>{team.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            <p className={styles.selectedCount}>
              選択されたチーム: {formData.selectedTeams.length}件
            </p>
          </div>

          <div className={styles.formFooter}>
            <button
              type="button"
              onClick={() => router.push('/admin/application')}
              className={styles.cancelButton}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className={styles.saveButton}
            >
              {uploading ? 'アップロード中...' : saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
