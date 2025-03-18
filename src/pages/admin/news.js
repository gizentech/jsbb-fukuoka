import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, query, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import styles from '../../styles/admin/News.module.css';

export default function NewsManagement() {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [newCategory, setNewCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const newsQuery = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
        const categoriesQuery = query(collection(db, 'categories'), orderBy('name'));

        const [newsSnapshot, categoriesSnapshot] = await Promise.all([
          getDocs(newsQuery),
          getDocs(categoriesQuery)
        ]);

        const newsData = newsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            content: data.content ? data.content.replace(/\|\|n\|\|/g, '\n') : '',
            category: data.category || '',
            createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
              ? data.createdAt.toDate().toISOString()
              : new Date().toISOString()
          };
        });

        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || ''
        }));

        setNews(newsData);
        setCategories(categoriesData);
        if (categoriesData.length > 0) {
          setFormData(prev => ({ ...prev, category: categoriesData[0].name }));
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) return;

    setSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'news'), {
        title: formData.title.trim(),
        content: formData.content.replace(/\n/g, '||n||'),
        category: formData.category,
        createdAt: new Date()
      });

      const newNews = {
        id: docRef.id,
        ...formData,
        createdAt: new Date().toISOString()
      };

      setNews([newNews, ...news]);
      setFormData({
        title: '',
        content: '',
        category: formData.category
      });
    } catch (error) {
      console.error('Error adding news:', error);
      setError('ニュース記事の投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        name: newCategory.trim(),
        createdAt: new Date()
      });

      const newCategoryObj = {
        id: docRef.id,
        name: newCategory.trim()
      };

      setCategories([...categories, newCategoryObj]);
      setNewCategory('');
    } catch (error) {
      console.error('Error adding category:', error);
      setError('カテゴリーの追加に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか？')) return;

    try {
      await deleteDoc(doc(db, 'news', id));
      setNews(news.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting news:', error);
      setError('記事の削除に失敗しました');
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
        <h1>お知らせ管理</h1>

        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <section className={styles.categorySection}>
          <h2>カテゴリ管理</h2>
          <form onSubmit={handleAddCategory} className={styles.categoryForm}>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="新しいカテゴリ名"
              disabled={submitting}
            />
            <button type="submit" disabled={submitting}>
              {submitting ? '追加中...' : '追加'}
            </button>
          </form>
          <div className={styles.categoryList}>
            {categories.map((cat) => (
              <span key={cat.id} className={styles.categoryTag}>
                {cat.name}
              </span>
            ))}
          </div>
        </section>

        <section className={styles.newsForm}>
          <h2>新規投稿</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                disabled={submitting}
              >
                <option value="">カテゴリを選択</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="タイトル"
                required
                disabled={submitting}
              />
            </div>

            <div className={styles.formGroup}>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="内容"
                required
                rows={10}
                disabled={submitting}
              />
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? '投稿中...' : '投稿する'}
            </button>
          </form>
        </section>

        <section className={styles.newsList}>
          <h2>投稿一覧</h2>
          {news.map((item) => (
            <article key={item.id} className={styles.newsItem}>
              <div className={styles.newsHeader}>
                <span className={styles.newsCategory}>{item.category}</span>
                <time>{new Date(item.createdAt).toLocaleString('ja-JP')}</time>
              </div>
              <h3>{item.title}</h3>
              <pre className={styles.newsContent}>{item.content}</pre>
              <button
                onClick={() => handleDelete(item.id)}
                className={styles.deleteButton}
                disabled={submitting}
              >
                削除
              </button>
            </article>
          ))}
        </section>
      </div>
    </AdminLayout>
  );
}