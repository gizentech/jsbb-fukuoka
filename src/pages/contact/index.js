import { useRef, useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import BlockSidebar from '../../components/BlockSidebar/BlockSidebar';
import styles from '../../styles/Page.module.css';

export async function getServerSideProps() {
  try {
    const SPACE_UID = process.env.NEWT_SPACE_UID;
    const TOKEN = process.env.NEWT_API_TOKEN;
    const TOURNAMENT_APP_UID = 'fukuoka-tournament';

    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    const tournamentUrl = `https://${SPACE_UID}.cdn.newt.so/v1/${TOURNAMENT_APP_UID}/fukuoka-tor?limit=100&order=-_sys.createdAt&depth=2`;
    let tournamentsData = [];

    try {
      const tournamentResponse = await fetch(tournamentUrl, { headers });

      if (tournamentResponse.ok) {
        const tournamentResult = await tournamentResponse.json();

        if (tournamentResult.items && tournamentResult.items.length > 0) {
          const allTournaments = tournamentResult.items.map(item => {
            const title = item['fukuoka-tor-name-ryaku'] || '大会';
            return {
              id: item._id,
              title: title,
              startDate: item['tor-start'] || null,
              endDate: item['end-tor'] || null,
              date: item['tor-start'] || ''
            };
          });

          tournamentsData = allTournaments
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
            .slice(0, 5);
        }
      }
    } catch (error) {
      console.error('Tournament API Error:', error);
    }

    return {
      props: {
        tournaments: tournamentsData
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        tournaments: []
      }
    };
  }
}

export default function Contact({ tournaments = [] }) {
  const formRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    emailjs.init('BEEBQ6IvRIVmBx3lv');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day} ${hour}:${minute}`;

    const timestampInput = document.createElement('input');
    timestampInput.type = 'hidden';
    timestampInput.name = 'timestamp';
    timestampInput.value = timestamp;
    formRef.current.appendChild(timestampInput);

    try {
      const result = await emailjs.sendForm(
        'service_y5tzhrc',
        'template_wj0zuid',
        formRef.current
      );
      console.log('EmailJS Success:', result);
      setSubmitStatus('success');
      formRef.current.reset();
    } catch (error) {
      console.error('EmailJS Error:', error);
      setSubmitStatus('error');
    } finally {
      if (timestampInput.parentNode) {
        timestampInput.parentNode.removeChild(timestampInput);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainWithSidebar}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>お問い合わせ</h1>
            <span>CONTACT</span>
          </div>

          <div className={styles.content}>
            <div style={{
              background: '#fff3cd',
              padding: '16px 20px',
              marginBottom: '30px',
              fontSize: '14px',
              color: '#856404',
              border: '1px solid #ffeaa7',
              borderLeft: '4px solid #ffc107'
            }}>
              <p style={{ margin: 0 }}>※選手登録や出場申請は問い合わせでは受け付けておりません。</p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="category" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  お問い合わせ種別 <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">選択してください</option>
                  <option value="チーム加盟">チーム加盟</option>
                  <option value="審判関係">審判関係</option>
                  <option value="アナウンス関係">アナウンス関係</option>
                  <option value="ハラスメントや暴力通報">ハラスメントや暴力通報</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="name" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  お名前 <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #ddd'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="organization" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  所属団体
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #ddd'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="email" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  メールアドレス <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #ddd'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="phone" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  電話番号
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #ddd'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label htmlFor="message" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  お問い合わせ内容 <span style={{ color: '#e53e3e' }}>*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#fff',
                  background: isSubmitting ? '#999' : '#0066cc',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = '#0052a3';
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = '#0066cc';
                }}
              >
                {isSubmitting ? '送信中...' : '送信する'}
              </button>

              {submitStatus === 'success' && (
                <p style={{
                  marginTop: '20px',
                  padding: '12px',
                  background: '#d4edda',
                  color: '#155724',
                  border: '1px solid #c3e6cb',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  お問い合わせを受け付けました。内容を確認次第、ご連絡させていただきます。
                </p>
              )}
              {submitStatus === 'error' && (
                <p style={{
                  marginTop: '20px',
                  padding: '12px',
                  background: '#f8d7da',
                  color: '#721c24',
                  border: '1px solid #f5c6cb',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  送信に失敗しました。時間をおいて再度お試しください。
                </p>
              )}
            </form>
          </div>
        </div>
        <BlockSidebar tournaments={tournaments} />
      </main>
      <Footer />
    </div>
  );
}
