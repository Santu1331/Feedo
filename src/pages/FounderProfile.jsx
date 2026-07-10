import { useEffect } from 'react'

export default function FounderProfile() {
  useEffect(() => {
    document.title = 'Santosh Sangnod — Founder & CEO of FeedoZone | Solo Builder'
    const desc = document.querySelector('meta[name="description"]')
    if (desc) {
      desc.setAttribute('content',
        'Santosh Tejerao Sangnod is the Founder & CEO of FeedoZone. He single-handedly built the entire platform — vendor onboarding, customer app, live tracking, delivery management, and marketing — all by himself.')
    }
  }, [])

  const built = [
    { icon: '🛒', title: 'Customer Ordering App', text: 'Full web + Android app — browse restaurants, order food, pay via UPI or cash-on-delivery.' },
    { icon: '🏪', title: 'Vendor Onboarding System', text: 'Complete dashboard for restaurant owners to manage menu, receive orders, and track earnings.' },
    { icon: '📍', title: 'Live Order Tracking', text: 'Real-time order status and live delivery tracking built from scratch.' },
    { icon: '🚴', title: 'Delivery Management', text: 'Delivery partner assignment, routing logic, and order flow for 25–45 min delivery.' },
    { icon: '💳', title: 'Payment Integration', text: 'UPI and cash-on-delivery flows, refund handling, and billing systems.' },
    { icon: '📣', title: 'Marketing & Growth', text: 'All campaigns, social media, user acquisition, and business expansion — solo.' },
    { icon: '🔔', title: 'Push Notifications', text: 'FCM-based notifications for order updates, new orders for vendors, and customer alerts.' },
    { icon: '📊', title: 'Founder Dashboard', text: 'Analytics and control panel — orders, vendors, users, and revenue in one place.' },
  ]

  return (
    <div className="fp-root">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .fp-root { font-family: 'Poppins', sans-serif; background: #fff; color: #1a1a1a; min-height: 100vh; }

        /* ── NAV ── */
        .fp-nav { background: #1a1a1a; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
        .fp-nav-logo { font-size: 18px; font-weight: 700; color: #E24B4A; text-decoration: none; }
        .fp-nav-links { display: flex; gap: 16px; flex-wrap: wrap; }
        .fp-nav-links a { color: #ccc; text-decoration: none; font-size: 13px; }
        .fp-nav-links a:hover { color: #fff; }

        /* ── HERO ── */
        .fp-hero { background: linear-gradient(160deg, #1a1a1a 0%, #2d2d2d 100%); color: #fff; padding: 40px 24px 40px; text-align: center; }
        .fp-photo-wrap { display: block; margin: 0 auto 24px; width: 240px; border: 4px solid #E24B4A; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
        .fp-photo-wrap img { width: 100%; height: auto; display: block; object-fit: contain; }
        .fp-hero h1 { font-size: 28px; font-weight: 700; margin-bottom: 6px; }
        .fp-hero-role { font-size: 15px; color: #E24B4A; font-weight: 600; margin-bottom: 4px; }
        .fp-hero-company { font-size: 14px; color: #bbb; margin-bottom: 16px; }
        .fp-badge { display: inline-block; background: #E24B4A; color: #fff; font-size: 11px; font-weight: 700; padding: 5px 16px; border-radius: 20px; letter-spacing: 1px; }

        /* ── SECTION ── */
        .fp-section { max-width: 800px; margin: 0 auto; padding: 40px 20px 0; }
        .fp-section-title { font-size: 18px; font-weight: 700; color: #E24B4A; border-bottom: 2px solid #E24B4A; padding-bottom: 8px; margin-bottom: 20px; }
        .fp-p { font-size: 14px; line-height: 1.85; color: #333; margin-bottom: 14px; }

        /* ── STATS GRID ── */
        .fp-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 8px; }
        .fp-stat { text-align: center; background: #fff9f9; border: 1px solid #fdd; border-radius: 12px; padding: 18px 10px; }
        .fp-stat-num { font-size: 22px; font-weight: 700; color: #E24B4A; line-height: 1.2; }
        .fp-stat-label { font-size: 11px; color: #888; margin-top: 4px; }

        /* ── CARDS GRID ── */
        .fp-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 8px; }
        .fp-card { background: #f9f9f9; border: 1px solid #eee; border-radius: 12px; padding: 18px; }
        .fp-card-icon { font-size: 22px; margin-bottom: 6px; }
        .fp-card-title { font-weight: 700; font-size: 14px; margin-bottom: 5px; color: #1a1a1a; }
        .fp-card-text { font-size: 12px; color: #555; line-height: 1.65; }

        /* ── EDU ── */
        .fp-edu { background: #f9f9f9; border: 1px solid #eee; border-radius: 12px; padding: 18px 20px; }
        .fp-edu-title { font-weight: 700; font-size: 14px; margin-bottom: 6px; }
        .fp-edu-text { font-size: 13px; color: #555; line-height: 1.6; }

        /* ── LINKS ROW ── */
        .fp-links { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; padding: 40px 20px 60px; max-width: 800px; margin: 0 auto; }
        .fp-btn-outline { color: #E24B4A; text-decoration: none; font-weight: 600; font-size: 14px; border: 2px solid #E24B4A; padding: 10px 20px; border-radius: 8px; }
        .fp-btn-solid { background: #E24B4A; color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; }

        /* ── MOBILE ── */
        @media (max-width: 600px) {
          .fp-hero { padding: 32px 16px 32px; }
          .fp-photo-wrap { width: 200px; }
          .fp-hero h1 { font-size: 22px; }
          .fp-stats { grid-template-columns: repeat(2, 1fr); }
          .fp-cards { grid-template-columns: 1fr; }
          .fp-section { padding: 32px 16px 0; }
          .fp-links { padding: 32px 16px 48px; flex-direction: column; align-items: stretch; text-align: center; }
          .fp-btn-outline, .fp-btn-solid { display: block; text-align: center; }
          .fp-nav-links { gap: 10px; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="fp-nav">
        <a href="/" className="fp-nav-logo">🍽 FeedoZone</a>
        <div className="fp-nav-links">
          <a href="/wiki">Encyclopedia</a>
          <a href="/wiki/santosh-sangnod">Santosh Sangnod</a>
          <a href="/">← App</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="fp-hero">
        <div className="fp-photo-wrap">
          <img
            src="/santosh-sangnod-founder-feedozone.jpg"
            alt="Santosh Sangnod — Founder & CEO of FeedoZone"
          />
        </div>
        <h1>Santosh Sangnod</h1>
        <p className="fp-hero-role">Founder &amp; CEO</p>
        <p className="fp-hero-company">FeedoZone — Food Delivery. Simplified.</p>
        <span className="fp-badge">SOLO FOUNDER · SOLO BUILDER</span>
      </div>

      {/* ── ABOUT ── */}
      <div className="fp-section">
        <h2 className="fp-section-title">About Santosh Sangnod</h2>
        <p className="fp-p">
          <strong>Santosh Tejerao Sangnod</strong> is the sole founder and CEO of{' '}
          <strong>FeedoZone</strong>, a hyperlocal food-delivery platform in Warananagar,
          Kolhapur, Maharashtra, India. He built the <em>entire FeedoZone system by himself</em> —
          one person, one vision, zero co-founders.
        </p>
        <p className="fp-p">
          From the customer ordering app to the vendor dashboard, from live order tracking to
          delivery coordination, from UPI payments to push notifications — every line of code,
          every design decision, every business strategy, and every marketing effort was
          Santosh's work alone.
        </p>
        <p className="fp-p">
          He is currently pursuing a B.Tech in Computer Science and Business Systems (CSBS) at
          Tatyasaheb Kore Institute of Engineering and Technology (TKIET), Warananagar —
          building a real startup while studying full-time.
        </p>
      </div>

      {/* ── STATS ── */}
      <div className="fp-section" style={{ paddingTop: 32 }}>
        <h2 className="fp-section-title">FeedoZone at a Glance</h2>
        <div className="fp-stats">
          <div className="fp-stat"><div className="fp-stat-num">1</div><div className="fp-stat-label">Sole Founder &amp; Builder</div></div>
          <div className="fp-stat"><div className="fp-stat-num">Mar 2026</div><div className="fp-stat-label">Website Launched</div></div>
          <div className="fp-stat"><div className="fp-stat-num">May 2026</div><div className="fp-stat-label">Android App Live</div></div>
          <div className="fp-stat"><div className="fp-stat-num">Warananagar</div><div className="fp-stat-label">Kolhapur, MH</div></div>
        </div>
      </div>

      {/* ── WHAT HE BUILT ── */}
      <div className="fp-section">
        <h2 className="fp-section-title">What Santosh Built — Alone</h2>
        <div className="fp-cards">
          {built.map(item => (
            <div key={item.title} className="fp-card">
              <div className="fp-card-icon">{item.icon}</div>
              <div className="fp-card-title">{item.title}</div>
              <div className="fp-card-text">{item.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── EDUCATION ── */}
      <div className="fp-section">
        <h2 className="fp-section-title">Education</h2>
        <div className="fp-edu">
          <div className="fp-edu-title">🎓 B.Tech — Computer Science and Business Systems (CSBS)</div>
          <div className="fp-edu-text">
            Tatyasaheb Kore Institute of Engineering and Technology (TKIET),
            Warananagar, Kolhapur, Maharashtra, India
          </div>
        </div>
      </div>

      {/* ── LINKS ── */}
      <div className="fp-links">
        <a href="/wiki/santosh-sangnod" className="fp-btn-outline">📖 Read Full Wikipedia Article</a>
        <a href="https://play.google.com/store/apps/details?id=com.feedozone.app2024"
          className="fp-btn-solid" target="_blank" rel="noopener noreferrer">
          ⬇ Download FeedoZone App
        </a>
      </div>
    </div>
  )
}
