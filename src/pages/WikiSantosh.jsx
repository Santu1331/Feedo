import { useEffect, useState } from 'react'

export default function WikiSantosh() {
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    document.title = 'Santosh Sangnod - Founder & CEO of FeedoZone | Encyclopedia'
    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content',
      'Santosh Tejerao Sangnod is the Founder and CEO of FeedoZone. He single-handedly built the entire food-delivery platform — app, vendor system, tracking, payments, marketing — all by himself. B.Tech CSBS student at TKIET Warananagar.')

    const existing = document.getElementById('ws-schema')
    if (!existing) {
      const s = document.createElement('script')
      s.id = 'ws-schema'
      s.type = 'application/ld+json'
      s.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': 'https://feedo-ruddy.vercel.app/#founder',
        name: 'Santosh Tejerao Sangnod',
        givenName: 'Santosh',
        additionalName: 'Tejerao',
        familyName: 'Sangnod',
        alternateName: ['Santosh Sangnod', 'Santosh T. Sangnod'],
        jobTitle: 'Founder & CEO',
        description: 'Santosh Tejerao Sangnod is the sole Founder and CEO of FeedoZone. He single-handedly built the entire system — customer app, vendor onboarding, live tracking, delivery management, payments, and marketing — all by himself while studying B.Tech CSBS at TKIET Warananagar.',
        image: {
          '@type': 'ImageObject',
          url: 'https://feedo-ruddy.vercel.app/santosh-sangnod-founder-feedozone.jpg',
          caption: 'Santosh Sangnod — Founder & CEO of FeedoZone',
          width: 800, height: 1000,
        },
        url: 'https://feedo-ruddy.vercel.app/wiki/santosh-sangnod',
        mainEntityOfPage: 'https://feedo-ruddy.vercel.app/wiki/santosh-sangnod',
        nationality: 'Indian',
        worksFor: { '@id': 'https://feedo-ruddy.vercel.app/#organization' },
        founderOf: { '@id': 'https://feedo-ruddy.vercel.app/#organization' },
        alumniOf: {
          '@type': 'CollegeOrUniversity',
          name: 'Tatyasaheb Kore Institute of Engineering and Technology (TKIET)',
          address: { '@type': 'PostalAddress', addressLocality: 'Warananagar', addressRegion: 'Maharashtra', addressCountry: 'IN' },
        },
        sameAs: [
          'https://feedo-ruddy.vercel.app/',
          'https://feedo-ruddy.vercel.app/wiki/santosh-sangnod',
          'https://feedo-ruddy.vercel.app/founder-profile',
        ],
      })
      document.head.appendChild(s)
    }
    return () => { document.getElementById('ws-schema')?.remove() }
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
    { id: 'early-life',    label: '1  Early Life & Education' },
    { id: 'feedozone',     label: '2  FeedoZone' },
    { id: 'solo-builder',  label: '3  Solo Builder Achievement' },
    { id: 'what-he-built', label: '4  What He Built' },
    { id: 'philosophy',    label: '5  Philosophy & Vision' },
    { id: 'references',    label: '6  References' },
  ]

  const infoRows = [
    ['Full name',    'Santosh Tejerao Sangnod'],
    ['Also known as','Santosh Sangnod'],
    ['Nationality',  'Indian'],
    ['Occupation',   'Entrepreneur, Developer'],
    ['Title',        'Founder & CEO, FeedoZone'],
    ['Education',    'B.Tech CSBS — TKIET Warananagar'],
    ['Founded',      'FeedoZone (2026)'],
    ['Role',         'Solo Founder & Solo Builder'],
    ['Location',     'Warananagar, Kolhapur, MH'],
  ]

  return (
    <div className="ws-root">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .ws-root { font-family: Georgia, "Times New Roman", serif; background: #fff; color: #202122; min-height: 100vh; }

        /* NAV */
        .ws-nav { background: #f8f9fa; border-bottom: 1px solid #a2a9b1; padding: 10px 20px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .ws-nav-logo { font-weight: 700; color: #E24B4A; font-size: 16px; text-decoration: none; font-family: sans-serif; white-space: nowrap; }
        .ws-nav a { color: #0645ad; text-decoration: none; font-size: 13px; white-space: nowrap; font-family: sans-serif; }
        .ws-nav-sep { color: #a2a9b1; font-size: 13px; }
        .ws-nav-back { margin-left: auto; }

        /* LAYOUT */
        .ws-wrap { max-width: 1100px; margin: 0 auto; display: flex; gap: 28px; padding: 20px 20px 60px; align-items: flex-start; }
        .ws-main { flex: 1; min-width: 0; }
        .ws-aside { width: 236px; flex-shrink: 0; position: sticky; top: 20px; }

        /* INFOBOX */
        .ws-infobox { float: right; clear: right; width: 270px; margin: 0 0 16px 20px; border: 1px solid #a2a9b1; background: #f8f9fa; font-family: sans-serif; }
        .ws-infobox-title { background: #1a1a1a; color: #fff; padding: 7px 10px; font-weight: 700; font-size: 13px; text-align: center; }
        .ws-infobox img { width: 100%; display: block; height: auto; object-fit: contain; background: #f8f9fa; }
        .ws-infobox-cap { font-size: 11px; color: #555; padding: 4px 8px; text-align: center; border-bottom: 1px solid #a2a9b1; font-style: italic; }
        .ws-ib-row { display: flex; border-bottom: 1px solid #eaecf0; }
        .ws-ib-lbl { font-weight: 700; padding: 4px 8px; width: 100px; flex-shrink: 0; color: #555; font-size: 11px; }
        .ws-ib-val { padding: 4px 8px; color: #202122; font-size: 11px; word-break: break-word; }

        /* TAGS */
        .ws-tags { margin-bottom: 10px; }
        .ws-tag { display: inline-block; background: #eaf3ff; border: 1px solid #a2a9b1; border-radius: 3px; padding: 2px 7px; font-size: 11px; color: #0645ad; margin-right: 5px; margin-bottom: 4px; font-family: sans-serif; }

        /* HEADINGS */
        .ws-h1 { font-size: 26px; font-weight: 400; border-bottom: 1px solid #a2a9b1; padding-bottom: 4px; margin-bottom: 10px; color: #000; }
        .ws-tagline { font-style: italic; color: #555; font-size: 13px; margin-bottom: 10px; }
        .ws-hatnote { font-size: 13px; color: #54595d; border-bottom: 1px solid #eaecf0; padding-bottom: 8px; margin-bottom: 12px; font-family: sans-serif; }
        .ws-h2 { font-size: 20px; font-weight: 400; border-bottom: 1px solid #a2a9b1; margin: 24px 0 10px; padding-bottom: 3px; color: #000; clear: both; }
        .ws-h3 { font-size: 15px; font-weight: 700; margin: 16px 0 6px; color: #000; font-family: sans-serif; }

        /* TEXT */
        .ws-p { font-size: 14px; line-height: 1.85; margin-bottom: 12px; color: #202122; }
        .ws-p a { color: #0645ad; }
        .ws-ul { font-size: 14px; line-height: 2.1; padding-left: 24px; color: #202122; margin-bottom: 12px; }
        .ws-quote { font-style: italic; color: #555; border-left: 3px solid #E24B4A; padding-left: 14px; margin: 14px 0; font-size: 14px; line-height: 1.8; font-family: sans-serif; }
        .ws-achieve { background: #fff9f0; border: 2px solid #E24B4A; border-radius: 8px; padding: 14px 18px; margin: 14px 0; font-family: sans-serif; }
        .ws-achieve-title { font-weight: 700; color: #E24B4A; margin-bottom: 6px; font-size: 15px; }
        .ws-achieve-text { font-size: 14px; line-height: 1.8; color: #333; }
        .ws-cite { font-size: 12px; color: #555; line-height: 1.9; font-family: sans-serif; }
        .ws-cite a { color: #0645ad; }

        /* TOC */
        .ws-toc { border: 1px solid #a2a9b1; background: #f8f9fa; display: inline-block; padding: 12px 18px; margin: 14px 0; font-family: sans-serif; font-size: 13px; clear: both; }
        .ws-toc strong { font-size: 14px; display: block; margin-bottom: 6px; }
        .ws-toc ol { padding-left: 20px; }
        .ws-toc li { line-height: 2; }
        .ws-toc a { color: #0645ad; text-decoration: none; }
        .ws-toc a.act { color: #E24B4A; font-weight: 700; }

        /* SIDEBAR */
        .ws-stick { border: 1px solid #a2a9b1; background: #f8f9fa; padding: 12px 14px; border-radius: 4px; font-family: sans-serif; font-size: 12px; }
        .ws-stick-title { font-weight: 700; font-size: 12px; border-bottom: 1px solid #a2a9b1; padding-bottom: 6px; margin-bottom: 6px; }
        .ws-stick ol { padding-left: 16px; }
        .ws-stick li { line-height: 2.2; }
        .ws-stick a { color: #0645ad; text-decoration: none; }
        .ws-stick a.act { color: #E24B4A; font-weight: 700; }
        .ws-stick-rel { margin-top: 14px; border-top: 1px solid #eaecf0; padding-top: 10px; }
        .ws-stick-rel-title { font-weight: 700; font-size: 10px; color: #777; text-transform: uppercase; margin-bottom: 4px; }
        .ws-stick-rel a { display: block; color: #0645ad; font-size: 12px; line-height: 2.2; text-decoration: none; }

        /* FOOTER */
        .ws-footer { border-top: 1px solid #a2a9b1; margin-top: 36px; padding-top: 14px; font-size: 13px; color: #555; text-align: center; font-family: sans-serif; clear: both; }
        .ws-footer a { color: #0645ad; text-decoration: none; margin: 0 6px; }

        /* ── MOBILE ── */
        @media (max-width: 767px) {
          .ws-aside { display: none; }
          .ws-wrap { padding: 12px 14px 48px; gap: 0; }
          .ws-infobox { float: none !important; width: 100% !important; margin: 0 0 14px 0 !important; }
          .ws-infobox img { height: auto; width: 100%; }
          .ws-h1 { font-size: 22px; }
          .ws-h2 { font-size: 18px; }
          .ws-toc { width: 100%; display: block; }
          .ws-nav-back { margin-left: 0; }
          .ws-nav-sep { display: none; }
        }
      `}</style>

      {/* NAV */}
      <nav className="ws-nav">
        <a href="/" className="ws-nav-logo">🍽 FeedoZone</a>
        <span className="ws-nav-sep">|</span>
        <a href="/wiki">FeedoZone Article</a>
        <span className="ws-nav-sep">|</span>
        <a href="/wiki/santosh-sangnod" style={{ color: '#E24B4A', fontWeight: 700 }}>Santosh Sangnod</a>
        <span className="ws-nav-sep">|</span>
        <a href="/founder-profile">Founder Profile</a>
        <a href="/" className="ws-nav-back">← App</a>
      </nav>

      {/* LAYOUT */}
      <div className="ws-wrap">

        <main className="ws-main">

          <div className="ws-tags">
            {['Indian Entrepreneurs','Solo Founders','FoodTech','Maharashtra','Student Entrepreneur'].map(t => (
              <span key={t} className="ws-tag">{t}</span>
            ))}
          </div>

          <h1 className="ws-h1">Santosh Tejerao Sangnod</h1>
          <p className="ws-tagline">Indian entrepreneur, software developer, and founder of FeedoZone</p>
          <p className="ws-hatnote">
            For the company he founded, see <a href="/wiki" style={{ color: '#0645ad' }}>FeedoZone</a>.
          </p>

          {/* INFOBOX */}
          <div className="ws-infobox">
            <div className="ws-infobox-title">Santosh Tejerao Sangnod</div>
            <img
              src="/santosh-sangnod-founder-feedozone.jpg"
              alt="Santosh Tejerao Sangnod, Founder and CEO of FeedoZone"
            />
            <div className="ws-infobox-cap">Santosh Sangnod, Founder &amp; CEO of FeedoZone</div>
            {infoRows.map(([l, v]) => (
              <div key={l} className="ws-ib-row">
                <div className="ws-ib-lbl">{l}</div>
                <div className="ws-ib-val">{v}</div>
              </div>
            ))}
          </div>

          {/* LEAD */}
          <p className="ws-p">
            <b>Santosh Tejerao Sangnod</b> (commonly known as <b>Santosh Sangnod</b>) is
            an Indian entrepreneur, software developer, and the{' '}
            <b>Founder and CEO of <a href="/wiki">FeedoZone</a></b>, a hyperlocal
            food-delivery platform in Warananagar, Kolhapur, Maharashtra, India.
          </p>
          <p className="ws-p">
            Santosh is best known as a <b>solo builder</b> — he single-handedly conceived,
            designed, developed, launched, and operates the entire FeedoZone platform.
            This includes the customer ordering app, vendor onboarding, real-time tracking,
            delivery management, payment integration, push notifications, multi-language
            support, marketing, and all business expansion — built and managed by one person.
          </p>
          <p className="ws-p">
            He is currently pursuing a B.Tech in Computer Science and Business Systems
            (CSBS) at Tatyasaheb Kore Institute of Engineering and Technology (
            <b>TKIET</b>), Warananagar, Kolhapur.
          </p>

          {/* TOC */}
          <div className="ws-toc">
            <strong>Contents</strong>
            <ol>
              {toc.map(item => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className={activeSection === item.id ? 'act' : ''}>{item.label}</a>
                </li>
              ))}
            </ol>
          </div>

          {/* 1. EARLY LIFE */}
          <h2 id="early-life" className="ws-h2">1  Early Life &amp; Education</h2>
          <p className="ws-p">
            Santosh Tejerao Sangnod grew up in Maharashtra, India. He developed an early
            interest in technology and software development, leading him to pursue
            engineering at the university level.
          </p>
          <p className="ws-p">
            He is currently enrolled in the <b>B.Tech program in Computer Science and
            Business Systems (CSBS)</b> at <b>Tatyasaheb Kore Institute of Engineering
            and Technology (TKIET)</b>, Warananagar, Kolhapur, Maharashtra. The CSBS
            program combines computer science with business fundamentals — giving Santosh
            the dual skill set to both build and manage a technology startup.
          </p>
          <p className="ws-p">
            Santosh founded FeedoZone while attending university full-time, balancing
            academic commitments with the full responsibilities of a startup founder,
            developer, and business operator simultaneously.
          </p>

          {/* 2. FEEDOZONE */}
          <h2 id="feedozone" className="ws-h2">2  FeedoZone</h2>
          <h3 className="ws-h3">2.1  Founding</h3>
          <p className="ws-p">
            Santosh founded <a href="/wiki">FeedoZone</a> in early 2026 after identifying
            the absence of a reliable, localised food-delivery service in Warananagar.
            Rather than waiting for a co-founder or investment, he began building the
            platform himself from scratch immediately.
          </p>
          <p className="ws-p">
            The FeedoZone website officially launched on <b>26 March 2026</b>, becoming
            the first dedicated hyperlocal food-delivery platform in Warananagar.
            The Android application followed on <b>21 May 2026</b> on Google Play Store.
          </p>
          <h3 className="ws-h3">2.2  Role at FeedoZone</h3>
          <p className="ws-p">
            As sole founder and CEO, Santosh holds full responsibility across every function
            — he is simultaneously lead developer, product designer, business strategist,
            marketing manager, and operations head.
          </p>

          {/* 3. SOLO BUILDER */}
          <h2 id="solo-builder" className="ws-h2">3  Solo Builder Achievement</h2>
          <div className="ws-achieve">
            <div className="ws-achieve-title">🏆 The Solo Builder Feat</div>
            <p className="ws-achieve-text">
              Santosh Sangnod built the <strong>entire FeedoZone technology platform and
              business by himself</strong> — no co-founders, no development team, no
              outsourcing. Every system was designed, developed, tested, deployed, and
              is maintained by a single person.
            </p>
          </div>
          <p className="ws-p">
            Building a complete food-delivery ecosystem — customer mobile apps, real-time
            tracking, vendor dashboards, payment gateways, push notifications, and business
            operations — typically requires teams of engineers, designers, product managers,
            and operations staff. Santosh accomplished this alone.
          </p>
          <div className="ws-quote">
            "One person. One vision. A complete food-delivery system built from scratch."
          </div>

          {/* 4. WHAT HE BUILT */}
          <h2 id="what-he-built" className="ws-h2">4  What He Built</h2>
          <p className="ws-p">Every system listed below was designed and developed solely by Santosh Sangnod:</p>
          <h3 className="ws-h3">4.1  Customer Platform</h3>
          <ul className="ws-ul">
            <li>Full-featured customer web app (Progressive Web App)</li>
            <li>Native Android application on Google Play Store</li>
            <li>Restaurant browsing, menu ordering, and live tracking</li>
            <li>UPI payment integration and cash-on-delivery</li>
            <li>Order history, reorder, and account management</li>
            <li>Multi-language support — English, Marathi, Hindi</li>
          </ul>
          <h3 className="ws-h3">4.2  Vendor Onboarding &amp; Management</h3>
          <ul className="ws-ul">
            <li>Complete vendor onboarding workflow for restaurant owners</li>
            <li>Vendor dashboard — menu, pricing, availability controls</li>
            <li>Incoming order management with real-time notifications</li>
            <li>Vendor earnings, billing, and order history</li>
          </ul>
          <h3 className="ws-h3">4.3  Delivery Operations</h3>
          <ul className="ws-ul">
            <li>Delivery partner management and order assignment</li>
            <li>Live delivery tracking visible to customers</li>
            <li>Delivery confirmation and status management</li>
          </ul>
          <h3 className="ws-h3">4.4  Business &amp; Marketing</h3>
          <ul className="ws-ul">
            <li>Founder admin panel with platform-wide analytics</li>
            <li>All marketing campaigns and user acquisition strategies</li>
            <li>Vendor acquisition and relationship management</li>
            <li>Business expansion planning and execution</li>
          </ul>

          {/* 5. PHILOSOPHY */}
          <h2 id="philosophy" className="ws-h2">5  Philosophy &amp; Vision</h2>
          <p className="ws-p">
            Santosh's founding philosophy centres on using technology to empower local
            communities — connecting neighbourhood restaurants with nearby customers and
            creating economic opportunities for local delivery partners within a
            community-scale environment.
          </p>
          <div className="ws-quote">
            "FeedoZone is not just about delivering food. It is about building a local
            digital economy where every restaurant, every delivery partner, and every
            customer in our community benefits."
          </div>

          {/* 6. REFERENCES */}
          <h2 id="references" className="ws-h2">6  References</h2>
          <ol style={{ paddingLeft: 22, marginBottom: 12 }}>
            <li className="ws-cite">FeedoZone Website — <a href="https://feedo-ruddy.vercel.app" target="_blank" rel="noopener noreferrer">feedo-ruddy.vercel.app</a></li>
            <li className="ws-cite">Android App — <a href="https://play.google.com/store/apps/details?id=com.feedozone.app2024" target="_blank" rel="noopener noreferrer">Google Play Store</a></li>
            <li className="ws-cite">FeedoZone Encyclopedia — <a href="/wiki">FeedoZone article</a></li>
            <li className="ws-cite">Founder Profile — <a href="/founder-profile">feedo-ruddy.vercel.app/founder-profile</a></li>
            <li className="ws-cite">TKIET — Tatyasaheb Kore Institute of Engineering and Technology, Warananagar, Kolhapur</li>
          </ol>

          <div className="ws-footer">
            <a href="/wiki">← FeedoZone Article</a>
            <a href="/founder-profile">Founder Profile</a>
            <a href="/">FeedoZone App</a>
            <br /><br />
            <span style={{ fontSize: 11, color: '#aaa' }}>
              FeedoZone Encyclopedia · About Santosh Tejerao Sangnod, Founder &amp; CEO of FeedoZone
            </span>
          </div>

        </main>

        {/* SIDEBAR — desktop only */}
        <aside className="ws-aside">
          <div className="ws-stick">
            <div className="ws-stick-title">📖 Contents</div>
            <ol>
              {toc.map(item => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className={activeSection === item.id ? 'act' : ''}>{item.label}</a>
                </li>
              ))}
            </ol>
            <div className="ws-stick-rel">
              <div className="ws-stick-rel-title">Related Articles</div>
              <a href="/wiki">FeedoZone</a>
              <a href="/founder-profile">Founder Profile</a>
              <a href="https://play.google.com/store/apps/details?id=com.feedozone.app2024" target="_blank" rel="noopener noreferrer">FeedoZone on Play Store</a>
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}
