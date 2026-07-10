import { useEffect, useState } from 'react'

export default function WikiFeedozone() {
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    document.title = 'FeedoZone - Encyclopedia | Food Delivery Warananagar Kolhapur'
    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content',
      'FeedoZone is a hyperlocal food-delivery platform founded by Santosh Tejerao Sangnod in Warananagar, Kolhapur, Maharashtra. Launched March 2026. Built entirely by one person.')
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) }),
      { rootMargin: '-20% 0px -70% 0px' }
    )
    document.querySelectorAll('h2[id]').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const toc = [
    { id: 'overview',   label: '1  Overview' },
    { id: 'history',    label: '2  History' },
    { id: 'founder',    label: '3  Founder' },
    { id: 'platform',   label: '4  Platform & Features' },
    { id: 'technology', label: '5  Technology' },
    { id: 'business',   label: '6  Business Model' },
    { id: 'expansion',  label: '7  Growth & Expansion' },
    { id: 'references', label: '8  References' },
  ]

  const infoRows = [
    ['Type',         'Private — Startup'],
    ['Industry',     'Food Technology, Hyperlocal Delivery'],
    ['Founded',      '26 March 2026'],
    ['App Launch',   '21 May 2026'],
    ['Founder',      'Santosh Tejerao Sangnod'],
    ['CEO',          'Santosh Tejerao Sangnod'],
    ['HQ',           'Warananagar, Kolhapur, MH'],
    ['Area served',  'Warananagar (4 km radius)'],
    ['Platform',     'Web (PWA) · Android'],
    ['Languages',    'English · Marathi · Hindi'],
    ['Website',      'feedo-ruddy.vercel.app'],
  ]

  return (
    <div className="wf-root">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .wf-root { font-family: Georgia, "Times New Roman", serif; background: #fff; color: #202122; min-height: 100vh; }

        /* NAV */
        .wf-nav { background: #f8f9fa; border-bottom: 1px solid #a2a9b1; padding: 10px 20px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .wf-nav-logo { font-weight: 700; color: #E24B4A; font-size: 16px; text-decoration: none; font-family: sans-serif; white-space: nowrap; }
        .wf-nav a { color: #0645ad; text-decoration: none; font-size: 13px; white-space: nowrap; font-family: sans-serif; }
        .wf-nav-sep { color: #a2a9b1; font-size: 13px; }
        .wf-nav-back { margin-left: auto; }

        /* LAYOUT */
        .wf-wrap { max-width: 1100px; margin: 0 auto; display: flex; gap: 28px; padding: 20px 20px 60px; align-items: flex-start; }
        .wf-main { flex: 1; min-width: 0; }
        .wf-aside { width: 236px; flex-shrink: 0; position: sticky; top: 20px; }

        /* INFOBOX — desktop: floated right inside main, mobile: full width block */
        .wf-infobox { float: right; clear: right; width: 270px; margin: 0 0 16px 20px; border: 1px solid #a2a9b1; background: #f8f9fa; font-family: sans-serif; }
        .wf-infobox-title { background: #1a1a1a; color: #fff; padding: 7px 10px; font-weight: 700; font-size: 13px; text-align: center; }
        .wf-infobox img { width: 100%; display: block; height: auto; object-fit: contain; background: #f8f9fa; }
        .wf-infobox-cap { font-size: 11px; color: #555; padding: 4px 8px; text-align: center; border-bottom: 1px solid #a2a9b1; font-style: italic; }
        .wf-ib-row { display: flex; border-bottom: 1px solid #eaecf0; }
        .wf-ib-lbl { font-weight: 700; padding: 4px 8px; width: 96px; flex-shrink: 0; color: #555; font-size: 11px; }
        .wf-ib-val { padding: 4px 8px; color: #202122; font-size: 11px; word-break: break-word; }
        .wf-ib-val a { color: #0645ad; }

        /* TAGS */
        .wf-tags { margin-bottom: 10px; }
        .wf-tag { display: inline-block; background: #eaf3ff; border: 1px solid #a2a9b1; border-radius: 3px; padding: 2px 7px; font-size: 11px; color: #0645ad; margin-right: 5px; margin-bottom: 4px; font-family: sans-serif; }

        /* HEADINGS */
        .wf-h1 { font-size: 26px; font-weight: 400; border-bottom: 1px solid #a2a9b1; padding-bottom: 4px; margin-bottom: 10px; color: #000; }
        .wf-tagline { font-style: italic; color: #555; font-size: 13px; margin-bottom: 10px; }
        .wf-hatnote { font-size: 13px; color: #54595d; border-bottom: 1px solid #eaecf0; padding-bottom: 8px; margin-bottom: 12px; font-family: sans-serif; }
        .wf-h2 { font-size: 20px; font-weight: 400; border-bottom: 1px solid #a2a9b1; margin: 24px 0 10px; padding-bottom: 3px; color: #000; clear: both; }
        .wf-h3 { font-size: 15px; font-weight: 700; margin: 16px 0 6px; color: #000; font-family: sans-serif; }

        /* TEXT */
        .wf-p { font-size: 14px; line-height: 1.85; margin-bottom: 12px; color: #202122; }
        .wf-p a { color: #0645ad; }
        .wf-ul { font-size: 14px; line-height: 2.1; padding-left: 24px; color: #202122; margin-bottom: 12px; }
        .wf-ul a { color: #0645ad; }
        .wf-quote { font-style: italic; color: #555; border-left: 3px solid #E24B4A; padding-left: 14px; margin: 14px 0; font-size: 14px; line-height: 1.8; font-family: sans-serif; }
        .wf-cite { font-size: 12px; color: #555; line-height: 1.9; font-family: sans-serif; }
        .wf-cite a { color: #0645ad; }

        /* TOC (inline, inside main) */
        .wf-toc { border: 1px solid #a2a9b1; background: #f8f9fa; display: inline-block; padding: 12px 18px; margin: 14px 0; font-family: sans-serif; font-size: 13px; clear: both; }
        .wf-toc strong { font-size: 14px; display: block; margin-bottom: 6px; }
        .wf-toc ol { padding-left: 20px; }
        .wf-toc li { line-height: 2; }
        .wf-toc a { color: #0645ad; text-decoration: none; }
        .wf-toc a.act { color: #E24B4A; font-weight: 700; }

        /* SIDEBAR sticky TOC */
        .wf-stick { border: 1px solid #a2a9b1; background: #f8f9fa; padding: 12px 14px; border-radius: 4px; font-family: sans-serif; font-size: 12px; }
        .wf-stick-title { font-weight: 700; font-size: 12px; border-bottom: 1px solid #a2a9b1; padding-bottom: 6px; margin-bottom: 6px; }
        .wf-stick ol { padding-left: 16px; }
        .wf-stick li { line-height: 2.2; }
        .wf-stick a { color: #0645ad; text-decoration: none; }
        .wf-stick a.act { color: #E24B4A; font-weight: 700; }
        .wf-stick-rel { margin-top: 14px; border-top: 1px solid #eaecf0; padding-top: 10px; }
        .wf-stick-rel-title { font-weight: 700; font-size: 10px; color: #777; text-transform: uppercase; margin-bottom: 4px; }
        .wf-stick-rel a { display: block; color: #0645ad; font-size: 12px; line-height: 2.2; text-decoration: none; }

        /* FOOTER */
        .wf-footer { border-top: 1px solid #a2a9b1; margin-top: 36px; padding-top: 14px; font-size: 13px; color: #555; text-align: center; font-family: sans-serif; clear: both; }
        .wf-footer a { color: #0645ad; text-decoration: none; margin: 0 6px; }

        /* ── MOBILE ── */
        @media (max-width: 767px) {
          .wf-aside { display: none; }
          .wf-wrap { padding: 12px 14px 48px; gap: 0; }
          .wf-infobox { float: none !important; width: 100% !important; margin: 0 0 14px 0 !important; }
          .wf-infobox img { height: auto; width: 100%; }
          .wf-h1 { font-size: 22px; }
          .wf-h2 { font-size: 18px; }
          .wf-toc { width: 100%; display: block; }
          .wf-nav-back { margin-left: 0; }
          .wf-nav-sep { display: none; }
        }
      `}</style>

      {/* NAV */}
      <nav className="wf-nav">
        <a href="/" className="wf-nav-logo">🍽 FeedoZone</a>
        <span className="wf-nav-sep">|</span>
        <a href="/wiki">Encyclopedia</a>
        <span className="wf-nav-sep">|</span>
        <a href="/wiki/santosh-sangnod">Santosh Sangnod</a>
        <span className="wf-nav-sep">|</span>
        <a href="/founder-profile">Founder Profile</a>
        <a href="/" className="wf-nav-back">← App</a>
      </nav>

      {/* LAYOUT */}
      <div className="wf-wrap">

        {/* MAIN */}
        <main className="wf-main">

          <div className="wf-tags">
            {['FoodTech','Indian Startups','Food Delivery','Maharashtra','Hyperlocal'].map(t => (
              <span key={t} className="wf-tag">{t}</span>
            ))}
          </div>

          <h1 className="wf-h1">FeedoZone</h1>
          <p className="wf-tagline">Hyperlocal food-delivery platform, Warananagar, Kolhapur</p>
          <p className="wf-hatnote">
            This article is about the food-delivery startup. For the founder, see{' '}
            <a href="/wiki/santosh-sangnod" style={{ color: '#0645ad' }}>Santosh Sangnod</a>.
          </p>

          {/* INFOBOX */}
          <div className="wf-infobox">
            <div className="wf-infobox-title">FeedoZone</div>
            <img src="/santosh-sangnod-founder-feedozone.jpg" alt="Santosh Sangnod — Founder & CEO of FeedoZone" />
            <div className="wf-infobox-cap">Santosh Sangnod, Founder &amp; CEO</div>
            {infoRows.map(([l, v]) => (
              <div key={l} className="wf-ib-row">
                <div className="wf-ib-lbl">{l}</div>
                <div className="wf-ib-val">
                  {l === 'Website'
                    ? <a href="https://feedo-ruddy.vercel.app" target="_blank" rel="noopener noreferrer">{v}</a>
                    : v}
                </div>
              </div>
            ))}
          </div>

          {/* LEAD */}
          <p className="wf-p">
            <b>FeedoZone</b> (stylised as <i>Feedo Zone</i>) is an Indian hyperlocal
            food-delivery platform headquartered in <b>Warananagar</b>, <b>Kolhapur</b>,
            Maharashtra, India. It connects customers with local restaurants for
            home-delivery orders, offering live order tracking, UPI and cash-on-delivery
            payments, and delivery times of 25–45 minutes within a 4 km radius.
          </p>
          <p className="wf-p">
            FeedoZone was founded, designed, and built entirely by{' '}
            <a href="/wiki/santosh-sangnod"><b>Santosh Tejerao Sangnod</b></a>, a solo
            founder and B.Tech student at TKIET, Warananagar. The website launched on
            26 March 2026 and the Android app on Google Play Store on 21 May 2026.
          </p>
          <p className="wf-p">
            FeedoZone is notable for being built by a single person — Santosh conceived,
            developed, deployed, and operates every part of the system alone, including
            vendor onboarding, customer experience, delivery management, payment
            integration, marketing, and business expansion.
          </p>

          {/* TOC */}
          <div className="wf-toc">
            <strong>Contents</strong>
            <ol>
              {toc.map(item => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className={activeSection === item.id ? 'act' : ''}>{item.label}</a>
                </li>
              ))}
            </ol>
          </div>

          {/* 1. OVERVIEW */}
          <h2 id="overview" className="wf-h2">1  Overview</h2>
          <p className="wf-p">
            FeedoZone operates as a <b>hyperlocal food-delivery marketplace</b>, aggregating
            local restaurants in Warananagar and fulfilling delivery orders through its own
            delivery network. The platform serves customers via a Progressive Web App (PWA)
            and a native Android application on Google Play Store.
          </p>
          <p className="wf-p">
            The service supports UPI and cash-on-delivery, catering to both digital and
            non-digital customers. The platform is available in English, Marathi, and Hindi,
            reflecting the linguistic diversity of the Kolhapur region.
          </p>
          <p className="wf-p">
            Unlike large national delivery platforms, FeedoZone is designed for the
            hyperlocal Warananagar market — enabling faster delivery and a more personal
            connection between customers, local restaurants, and delivery partners.
          </p>

          {/* 2. HISTORY */}
          <h2 id="history" className="wf-h2">2  History</h2>
          <h3 className="wf-h3">2.1  Founding</h3>
          <p className="wf-p">
            FeedoZone was conceived and founded by{' '}
            <a href="/wiki/santosh-sangnod">Santosh Tejerao Sangnod</a> in early 2026.
            Observing the absence of a reliable, localised food-delivery service in
            Warananagar, Santosh built the entire solution himself — designing the product
            architecture, developing frontend and backend systems, and managing the business
            launch independently.
          </p>
          <p className="wf-p">
            The FeedoZone website officially launched on <b>26 March 2026</b> at{' '}
            <a href="https://feedo-ruddy.vercel.app" target="_blank" rel="noopener noreferrer">
              feedo-ruddy.vercel.app
            </a>, the first dedicated hyperlocal food-delivery platform in Warananagar.
          </p>
          <h3 className="wf-h3">2.2  Android App Launch</h3>
          <p className="wf-p">
            Santosh published the FeedoZone Android application on the{' '}
            <b>Google Play Store on 21 May 2026</b>, providing push notifications,
            real-time order tracking, and a native ordering interface.
          </p>

          {/* 3. FOUNDER */}
          <h2 id="founder" className="wf-h2">3  Founder</h2>
          <p className="wf-p">
            <a href="/wiki/santosh-sangnod"><b>Santosh Tejerao Sangnod</b></a> is the
            <b> sole founder and CEO</b> of FeedoZone. He is currently pursuing a B.Tech
            in Computer Science and Business Systems (CSBS) at Tatyasaheb Kore Institute
            of Engineering and Technology (<b>TKIET</b>), Warananagar, Kolhapur.
          </p>
          <p className="wf-p">
            Santosh is recognised as a <b>solo builder</b> — he independently
            conceptualised, designed, developed, launched, and continues to operate every
            component of FeedoZone: the customer app, vendor management, delivery
            operations, payment systems, push notifications, multi-language support,
            marketing, and business growth — all by one person.
          </p>
          <div className="wf-quote">
            "FeedoZone is not just an app. It is proof that one determined person can build
            a complete technology business from the ground up." — Santosh Sangnod, Founder
          </div>
          <p className="wf-p">
            For a detailed biography, see the{' '}
            <a href="/wiki/santosh-sangnod">Santosh Sangnod encyclopedia article</a>.
          </p>

          {/* 4. PLATFORM */}
          <h2 id="platform" className="wf-h2">4  Platform &amp; Features</h2>
          <h3 className="wf-h3">4.1  Customer Application</h3>
          <ul className="wf-ul">
            <li>Browse local restaurants and menus in Warananagar</li>
            <li>Live order tracking from preparation to doorstep</li>
            <li>UPI payment and cash-on-delivery</li>
            <li>Order history and reorder functionality</li>
            <li>Multi-language interface (English, Marathi, Hindi)</li>
            <li>Progressive Web App (PWA) + native Android app</li>
          </ul>
          <h3 className="wf-h3">4.2  Vendor Dashboard</h3>
          <ul className="wf-ul">
            <li>Restaurant onboarding and profile management</li>
            <li>Menu creation, pricing, and availability controls</li>
            <li>Incoming order management with real-time notifications</li>
            <li>Earnings tracking and billing history</li>
          </ul>
          <h3 className="wf-h3">4.3  Delivery Management</h3>
          <ul className="wf-ul">
            <li>Delivery partner assignment and routing</li>
            <li>Live delivery tracking visible to customers</li>
            <li>Delivery confirmation and status management</li>
          </ul>
          <h3 className="wf-h3">4.4  Founder Dashboard</h3>
          <ul className="wf-ul">
            <li>Platform-wide analytics — orders, revenue, active vendors</li>
            <li>User management and notification broadcasting</li>
            <li>Business metrics and growth tracking</li>
          </ul>

          {/* 5. TECHNOLOGY */}
          <h2 id="technology" className="wf-h2">5  Technology</h2>
          <ul className="wf-ul">
            <li><b>Frontend:</b> React.js with Vite, deployed on Vercel</li>
            <li><b>Backend / DB:</b> Google Firebase (Firestore, Realtime DB, Auth)</li>
            <li><b>Push Notifications:</b> Firebase Cloud Messaging (FCM)</li>
            <li><b>Payments:</b> UPI integration</li>
            <li><b>Mobile:</b> Android app on Google Play Store</li>
            <li><b>i18n:</b> Custom system — English, Marathi, Hindi</li>
            <li><b>PWA:</b> Service worker with offline capabilities</li>
          </ul>

          {/* 6. BUSINESS */}
          <h2 id="business" className="wf-h2">6  Business Model</h2>
          <p className="wf-p">
            FeedoZone operates on a <b>commission-based marketplace model</b>, earning
            revenue from a percentage of each order and delivery fees. The platform focuses
            on <b>hyperlocal commerce</b> within a 4 km radius — enabling faster delivery
            and stronger local relationships compared to national platforms.
          </p>

          {/* 7. EXPANSION */}
          <h2 id="expansion" className="wf-h2">7  Growth &amp; Expansion</h2>
          <p className="wf-p">
            Since launching in March 2026, FeedoZone has focused on onboarding local
            restaurants in Warananagar and growing its customer base. All vendor
            acquisition, marketing, and business expansion has been managed solely by
            founder Santosh Sangnod. The platform continues expanding across the Kolhapur
            region while maintaining its community-first approach.
          </p>

          {/* 8. REFERENCES */}
          <h2 id="references" className="wf-h2">8  References</h2>
          <ol style={{ paddingLeft: 22, marginBottom: 12 }}>
            <li className="wf-cite">FeedoZone Website — <a href="https://feedo-ruddy.vercel.app" target="_blank" rel="noopener noreferrer">feedo-ruddy.vercel.app</a> (launched 26 March 2026)</li>
            <li className="wf-cite">Android App — <a href="https://play.google.com/store/apps/details?id=com.feedozone.app2024" target="_blank" rel="noopener noreferrer">Google Play Store</a> (21 May 2026)</li>
            <li className="wf-cite">Founder — <a href="/wiki/santosh-sangnod">Santosh Sangnod article</a></li>
            <li className="wf-cite">TKIET — Tatyasaheb Kore Institute of Engineering and Technology, Warananagar, Kolhapur, Maharashtra</li>
          </ol>

          <div className="wf-footer">
            <a href="/wiki/santosh-sangnod">Santosh Sangnod →</a>
            <a href="/founder-profile">Founder Profile</a>
            <a href="/">FeedoZone App</a>
            <a href="/privacy-policy">Privacy Policy</a>
            <br /><br />
            <span style={{ fontSize: 11, color: '#aaa' }}>
              FeedoZone Encyclopedia · Verified by Santosh Tejerao Sangnod, Founder &amp; CEO
            </span>
          </div>

        </main>

        {/* SIDEBAR — desktop only */}
        <aside className="wf-aside">
          <div className="wf-stick">
            <div className="wf-stick-title">📖 Contents</div>
            <ol>
              {toc.map(item => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className={activeSection === item.id ? 'act' : ''}>{item.label}</a>
                </li>
              ))}
            </ol>
            <div className="wf-stick-rel">
              <div className="wf-stick-rel-title">Related</div>
              <a href="/wiki/santosh-sangnod">Santosh Sangnod</a>
              <a href="/founder-profile">Founder Profile</a>
              <a href="https://play.google.com/store/apps/details?id=com.feedozone.app2024" target="_blank" rel="noopener noreferrer">FeedoZone on Play Store</a>
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}
