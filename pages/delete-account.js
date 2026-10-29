import Head from 'next/head'
import styles from '@/styles/Info/PublicInfo.module.css'

export default function DeleteAccountPage() {
  return <>
    <Head>
      <title>Request account deletion | MediLocate</title>
      <meta name="description" content="Request deletion of your MediLocate account and associated personal data." />
    </Head>
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.container}>
          <span>MEDILOCATE ACCOUNT</span>
          <h1>Request account deletion</h1>
          <p>You can request deletion of your MediLocate account and associated personal data here.</p>
        </div>
      </header>
      <section className={`${styles.container} ${styles.section}`}>
        <div className={styles.faq}>
          <h2>How to send your request</h2>
          <p>Email us from the address associated with your account, or include your account phone number so we can verify ownership. Do not email passwords, prescriptions, or payment details.</p>
          <p>We will verify your request, delete your account and associated personal data, and let you know if any records must be retained for legal or regulatory reasons.</p>
          <div className={styles.actions} style={{ marginTop: 24 }}>
            <a href="mailto:support@medilocate.com?subject=MediLocate%20account%20deletion%20request">Email deletion request</a>
          </div>
          <p style={{ marginTop: 16 }}>If the button does not open your email app, write to support@medilocate.com with the subject “MediLocate account deletion request”.</p>
        </div>
      </section>
    </main>
  </>
}
