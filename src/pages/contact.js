import { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import styles from '../styles/Contact.module.css';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

export default function Contact() {
  const formRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await emailjs.sendForm(
        'service_y5tzhrc',
        'template_wj0zuid',
        formRef.current,
        'BEEBQ6IvRIVmBx3lv'
      );
      setSubmitStatus('success');
      formRef.current.reset();
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>お問い合わせ</h1>
        
        <div className={styles.formContainer}>
          <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">お名前 <span className={styles.required}>*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="organization">所属団体</label>
              <input
                type="text"
                id="organization"
                name="organization"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">メールアドレス <span className={styles.required}>*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">電話番号</label>
              <input
                type="tel"
                id="phone"
                name="phone"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">お問い合わせ内容 <span className={styles.required}>*</span></label>
              <textarea
                id="message"
                name="message"
                rows="6"
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? '送信中...' : '送信する'}
            </button>

            {submitStatus === 'success' && (
              <p className={styles.successMessage}>
                お問い合わせを受け付けました。内容を確認次第、ご連絡させていただきます。
              </p>
            )}
            {submitStatus === 'error' && (
              <p className={styles.errorMessage}>
                送信に失敗しました。時間をおいて再度お試しください。
              </p>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}