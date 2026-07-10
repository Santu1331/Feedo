import { useEffect } from 'react'

/**
 * Public founder profile page — no login required.
 * Fully crawlable by Google. Optimised for the Knowledge Panel
 * and "Who is Santosh Sangnod / who is founder of FeedoZone" queries.
 */
export default function FounderProfile() {
  useEffect(() => {
    document.title = 'Santosh Sangnod — Founder & CEO of FeedoZone | Solo Builder'
    const desc = document.querySelector('meta[name="description"]')
    if (desc) {
      desc.setAttribute(
        'content',
        'Santosh Tejerao Sangnod is the Founder & CEO of FeedoZone, a food-delivery startup in Warananagar, Kolhapur. He single-handedly built the entire platform — vendor onboarding, customer app, live tracking, delivery management, and marketing — all by himself.'
      )
    }
  }, [])

  const styles = {
    page: {
      fontFamily: 'Poppins, sans-serif',
      background: '#fff',
      color: '#1a1a1a',
      minHeight: '100vh',
      padding: '0 0 60px',
    },
    hero: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: '#fff',
      padding: '60px 24px 48px',
      textAlign: 'center',
    },
    photoWrap: {
      display: 'inline-block',
      borderRadius: '50%',
      overflow: 'hidden',
      width: 160,
      height: 160,
      border: '4px solid #E24B4A',
      marginBottom: 24,
    },
    photo: { width: '100%', height: '100%', objectFit: 'cover' },
    name: { fontSize: 32, fontWeight: 700, margin: '0 0 8px' },
    role: { fontSize: 16, color: '#E24B4A', fontWeight: 600, margin: '0 0 4px' },
    company: { fontSize: 15, color: '#ccc', margin: 0 },
    badge: {
      display: 'inline-block',
      background: '#E24B4A',
      color: '#fff',
      fontSize: 12,
      fontWeight: 700,
      padding: '4px 14px',
      borderRadius: 20,
      marginTop: 16,
      letterSpacing: 1,
    },
    section: { maxWidth: 720, margin: '0 auto', padding: '40px 24px 0' },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 700,
      color: '#E24B4A',
      borderBottom: '2px solid #E24B4A',
      paddingBottom: 8,
      marginBottom: 20,
    },
    p: { fontSize: 15, lineHeight: 1.8, color: '#333', marginBottom: 16 },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 16,
      marginTop: 8,
    },
    card: {
      background: '#f9f9f9',
      border: '1px solid #eee',
      borderRadius: 12,
      padding: '20px 20px',
    },
    cardTitle: { fontWeight: 700, fontSize: 15, marginBottom: 6, color: '#1a1a1a' },
    cardText: { fontSize: 13, color: '#555', lineHeight: 1.6 },
    stat: { textAlign: 'center', background: '#fff9f9', border: '1px solid #fdd', borderRadius: 12, padding: '20px 16px' },
    statNum: { fontSize: 28, fontWeight: 700, color: '#E24B4A' },
    statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
    backLink: {
      display: 'inline-block',
      marginTop: 40,
      color: '#E24B4A',
      textDecoration: 'none',
      fontWeight: 600,
      fontSize: 14,
    },
  }

  return (
    <div style={styles.page}>
      {/* ── HERO ── */}
      <div style={styles.hero}>
        <div style={styles.photoWrap}>
          <img
            src="/santosh-sangnod-founder-feedozone.jpg"
            alt="Santosh Sangnod — Founder & CEO of FeedoZone"
            style={styles.photo}
            width="160"
            height="160"
          />
        </div>
        <h1 style={styles.name}>Santosh Sangnod</h1>
        <p style={styles.role}>Founder &amp; CEO</p>
        <p style={styles.company}>FeedoZone — Food Delivery. Simplified.</p>
        <span style={styles.badge}>SOLO FOUNDER · SOLO BUILDER</span>
      </div>

      {/* ── ABOUT ── */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>About Santosh Sangnod</h2>
        <p style={styles.p}>
          <strong>Santosh Tejerao Sangnod</strong> is the sole founder and CEO of{' '}
          <strong>FeedoZone</strong>, a hyperlocal food-delivery platform based in
          Warananagar, Kolhapur, Maharashtra, India. What makes Santosh unique is that
          he built the <em>entire FeedoZone system entirely by himself</em> — one person,
          one vision, zero co-founders.
        </p>
        <p style={styles.p}>
          From the customer-facing ordering app to the vendor management dashboard,
          from live real-time order tracking to delivery coordination, from UPI payment
          integration to push notifications — every single line of code, every design
          decision, every business strategy, and every marketing effort was the work of
          Santosh alone.
        </p>
        <p style={styles.p}>
          He is currently pursuing a B.Tech in Computer Science and Business Systems
          (CSBS) at Tatyasaheb Kore Institute of Engineering and Technology (TKIET),
          Warananagar — building a real startup while studying full-time.
        </p>
      </div>

      {/* ── STATS ── */}
      <div style={{ ...styles.section, paddingTop: 32 }}>
        <h2 style={styles.sectionTitle}>FeedoZone at a Glance</h2>
        <div style={styles.grid}>
          <div style={styles.stat}><div style={styles.statNum}>1</div><div style={styles.statLabel}>Sole Founder & Builder</div></div>
          <div style={styles.stat}><div style={styles.statNum}>Mar 2026</div><div style={styles.statLabel}>Website Launched</div></div>
          <div style={styles.stat}><div style={styles.statNum}>May 2026</div><div style={styles.statLabel}>Android App on Play Store</div></div>
          <div style={styles.stat}><div style={styles.statNum}>Warananagar</div><div style={styles.statLabel}>Serving Kolhapur, MH</div></div>
        </div>
      </div>

      {/* ── WHAT HE BUILT ── */}
      <div style={{ ...styles.section, paddingTop: 40 }}>
        <h2 style={styles.sectionTitle}>What Santosh Built — Alone</h2>
        <div style={styles.grid}>
          {[
            { title: '🛒 Customer Ordering App', text: 'Full web and Android app for customers to browse restaurants, place orders, and pay via UPI or cash-on-delivery.' },
            { title: '🏪 Vendor Onboarding System', text: 'Complete vendor dashboard for restaurant owners to manage their menu, receive orders, and track earnings.' },
            { title: '📍 Live Order Tracking', text: 'Real-time order status updates and live delivery tracking built from scratch.' },
            { title: '🚴 Delivery Management', text: 'Delivery partner assignment, routing logic, and order flow management for efficient 25–45 min delivery.' },
            { title: '💳 Payment Integration', text: 'UPI and cash-on-delivery payment flows, refund handling, and order billing systems.' },
            { title: '📣 Marketing & Growth', text: 'All marketing campaigns, social media presence, user acquisition, and business expansion strategies handled solo.' },
            { title: '🔔 Push Notifications', text: 'FCM-based push notifications for order updates, new orders for vendors, and customer alerts.' },
            { title: '📊 Founder Dashboard', text: 'Analytics and control panel for monitoring the entire business — orders, vendors, users, and revenue.' },
          ].map((item) => (
            <div key={item.title} style={styles.card}>
              <div style={styles.cardTitle}>{item.title}</div>
              <div style={styles.cardText}>{item.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── EDUCATION ── */}
      <div style={{ ...styles.section, paddingTop: 40 }}>
        <h2 style={styles.sectionTitle}>Education</h2>
        <div style={styles.card}>
          <div style={styles.cardTitle}>🎓 B.Tech — Computer Science and Business Systems (CSBS)</div>
          <div style={styles.cardText}>
            Tatyasaheb Kore Institute of Engineering and Technology (TKIET), Warananagar, Kolhapur, Maharashtra, India
          </div>
        </div>
      </div>

      {/* ── LINKS ── */}
      <div style={{ ...styles.section, paddingTop: 40, textAlign: 'center' }}>
        <a href="/" style={styles.backLink}>← Back to FeedoZone</a>
        &nbsp;&nbsp;&nbsp;
        <a
          href="https://play.google.com/store/apps/details?id=com.feedozone.app2024"
          style={{ ...styles.backLink, background: '#E24B4A', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download FeedoZone App
        </a>
      </div>
    </div>
  )
}
