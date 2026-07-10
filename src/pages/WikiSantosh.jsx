import { useEffect, useState } from 'react'

/**
 * Wikipedia-style encyclopaedia article for Santosh Tejerao Sangnod.
 * Public page — no login required. Fully crawlable by Google.
 * URL: /wiki/santosh-sangnod
 *
 * Optimised for Google Knowledge Panel trigger on:
 * "Santosh Sangnod", "Who is founder of FeedoZone", "Santosh Tejerao Sangnod"
 */
export default function WikiSantosh() {
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    document.title = 'Santosh Sangnod - Founder & CEO of FeedoZone | Encyclopedia'
    const desc = document.querySelector('meta[name="description"]')
    if (desc) {
      desc.setAttribute(
        'content',
        'Santosh Tejerao Sangnod is the Founder and CEO of FeedoZone. He single-handedly built the entire food-delivery platform — app, vendor system, tracking, payments, marketing — all by himself. B.Tech CSBS student at TKIET Warananagar.'
      )
    }
    // Inject article-level structured data for this page
    const existing = document.getElementById('wiki-person-schema')
    if (!existing) {
      const script = document.createElement('script')
      script.id = 'wiki-person-schema'
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': 'https://feedo-ruddy.vercel.app/#founder',
        name: 'Santosh Tejerao Sangnod',
        givenName: 'Santosh',
        additionalName: 'Tejerao',
        familyName: 'Sangnod',
        alternateName: ['Santosh Sangnod', 'Santosh T. Sangnod'],
        jobTitle: 'Founder & CEO',
        description:
          'Santosh Tejerao Sangnod is the sole Founder and CEO of FeedoZone, a hyperlocal food-delivery platform in Warananagar, Kolhapur, Maharashtra. He single-handedly built the entire system — customer app, vendor onboarding, live tracking, delivery management, payments, and marketing — all by himself while studying B.Tech CSBS at TKIET Warananagar.',
        image: {
          '@type': 'ImageObject',
          url: 'https://feedo-ruddy.vercel.app/santosh-sangnod-founder-feedozone.jpg',
          caption: 'Santosh Sangnod — Founder & CEO of FeedoZone',
          width: 800,
          height: 1000,
        },
        url: 'https://feedo-ruddy.vercel.app/wiki/santosh-sangnod',
        mainEntityOfPage: 'https://feedo-ruddy.vercel.app/wiki/santosh-sangnod',
        nationality: 'Indian',
        worksFor: { '@id': 'https://feedo-ruddy.vercel.app/#organization' },
        founderOf: { '@id': 'https://feedo-ruddy.vercel.app/#organization' },
        alumniOf: {
          '@type': 'CollegeOrUniversity',
          name: 'Tatyasaheb Kore Institute of Engineering and Technology (TKIET)',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Warananagar',
            addressRegion: 'Maharashtra',
            addressCountry: 'IN',
          },
        },
        knowsAbout: [
          'Food Delivery App Development', 'React.js', 'Firebase',
          'Hyperlocal Logistics', 'FoodTech Startups', 'Vendor Onboarding',
          'Mobile App Development', 'Business Strategy', 'Marketing',
        ],
        sameAs: [
          'https://feedo-ruddy.vercel.app/',
          'https://feedo-ruddy.vercel.app/wiki/santosh-sangnod',
          'https://feedo-ruddy.vercel.app/founder-profile',
        ],
      })
      document.head.appendChild(script)
    }
    return () => {
      const s = document.getElementById('wiki-person-schema')
      if (s) s.remove()
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id) }) },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    document.querySelectorAll('h2[id], h3[id]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const toc = [
    { id: 'early-life', label: '1  Early Life & Education' },
    { id: 'feedozone', label: '2  FeedoZone' },
    { id: 'solo-builder', label: '3  Solo Builder Achievement' },
    { id: 'what-he-built', label: '4  What He Built' },
    { id: 'philosophy', label: '5  Philosophy & Vision' },
    { id: 'references', label: '6  References' },
  ]

  const S = {
    root: { fontFamily: '"Linux Libertine","Georgia","Times",serif', background: '#fff', color: '#202122', minHeight: '100vh' },
    topBar: { background: '#f8f9fa', borderBottom: '1px solid #a2a9b1', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 },
    logo: { fontWeight: 700, color: '#E24B4A', fontSize: 16, textDecoration: 'none' },
    topBarLink: { color: '#0645ad', textDecoration: 'none', fontSize: 12 },
    layout: { maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 0, padding: '0 16px' },
    main: { flex: 1, minWidth: 0, padding: '20px 24px 60px 0' },
    aside: { width: 260, flexShrink: 0, padding: '20px 0 0 0' },
    h1: { fontFamily: '"Linux Libertine","Georgia",serif', fontSize: 28, fontWeight: 400, borderBottom: '1px solid #a2a9b1', paddingBottom: 4, marginBottom: 16, color: '#000' },
    tagLine: { fontStyle: 'italic', color: '#555', fontSize: 14, marginBottom: 16 },
    shortDesc: { fontSize: 14, color: '#54595d', borderBottom: '1px solid #eaecf0', paddingBottom: 12, marginBottom: 16 },
    infobox: {
      float: 'right', clear: 'right', margin: '0 0 20px 24px',
      border: '1px solid #a2a9b1', background: '#f8f9fa',
      fontSize: 13, width: 280,
    },
    infoboxTitle: { background: '#1a1a1a', color: '#fff', padding: '8px 10px', fontWeight: 700, fontSize: 14, textAlign: 'center' },
    infoboxImg: { width: '100%', height: 260, objectFit: 'cover', objectPosition: 'top', display: 'block' },
    infoboxImgCaption: { fontSize: 11, color: '#555', padding: '4px 8px', textAlign: 'center', borderBottom: '1px solid #a2a9b1', fontStyle: 'italic' },
    infoboxRow: { display: 'flex', borderBottom: '1px solid #eaecf0' },
    infoboxLabel: { fontWeight: 700, padding: '5px 8px', width: 110, flexShrink: 0, color: '#555', fontSize: 12 },
    infoboxVal: { padding: '5px 8px', color: '#202122', fontSize: 12 },
    toc: { border: '1px solid #a2a9b1', background: '#f8f9fa', display: 'inline-block', padding: '12px 20px', margin: '16px 0', fontSize: 13, minWidth: 200 },
    tocTitle: { fontWeight: 700, textAlign: 'center', marginBottom: 8, fontSize: 14 },
    tocLink: { color: '#0645ad', textDecoration: 'none', fontSize: 13 },
    tocLinkActive: { color: '#E24B4A', fontWeight: 600 },
    h2: { fontFamily: '"Linux Libertine","Georgia",serif', fontSize: 22, fontWeight: 400, borderBottom: '1px solid #a2a9b1', margin: '28px 0 12px', paddingBottom: 4, color: '#000' },
    h3: { fontSize: 17, fontWeight: 700, margin: '20px 0 8px', color: '#000' },
    p: { fontSize: 14, lineHeight: 1.8, marginBottom: 12, color: '#202122' },
    ul: { fontSize: 14, lineHeight: 2, paddingLeft: 28, color: '#202122', marginBottom: 12 },
    cite: { fontSize: 12, color: '#555', lineHeight: 1.8 },
    navFooter: { borderTop: '1px solid #a2a9b1', marginTop: 40, paddingTop: 16, fontSize: 13, color: '#555', textAlign: 'center' },
    navLink: { color: '#0645ad', textDecoration: 'none', margin: '0 8px' },
    stickyToc: { position: 'sticky', top: 20, border: '1px solid #a2a9b1', background: '#f8f9fa', padding: '12px 16px', borderRadius: 4, fontSize: 13 },
    wikiTag: { display: 'inline-block', background: '#eaf3ff', border: '1px solid #a2a9b1', borderRadius: 3, padding: '2px 8px', fontSize: 11, color: '#0645ad', marginRight: 6, marginBottom: 4 },
    achievementBox: {
      background: '#fff9f0', border: '2px solid #E24B4A', borderRadius: 8,
      padding: '16px 20px', margin: '16px 0', fontSize: 14,
    },
    achievementTitle: { fontWeight: 700, color: '#E24B4A', marginBottom: 8, fontSize: 15 },
    quote: { fontStyle: 'italic', color: '#555', borderLeft: '3px solid #E24B4A', paddingLeft: 14, margin: '16px 0', fontSize: 14, lineHeight: 1.8 },
  }

  return (
    <div style={S.root}>
      {/* ── TOP BAR ── */}
      <div style={S.topBar}>
        <a href="/" style={S.logo}>🍽 FeedoZone</a>
        <span style={{ color: '#a2a9b1' }}>|</span>
        <a href="/wiki" style={S.topBarLink}>FeedoZone Article</a>
        <span style={{ color: '#a2a9b1' }}>|</span>
        <a href="/wiki/santosh-sangnod" style={{ ...S.topBarLink, color: '#E24B4A', fontWeight: 700 }}>Santosh Sangnod</a>
        <span style={{ color: '#a2a9b1' }}>|</span>
        <a href="/founder-profile" style={S.topBarLink}>Founder Profile</a>
        <div style={{ marginLeft: 'auto' }}>
          <a href="/" style={S.topBarLink}>← Back to App</a>
        </div>
      </div>

      <div style={S.layout}>
        <main style={S.main}>
          {/* Category tags */}
          <div style={{ marginBottom: 8 }}>
            <span style={S.wikiTag}>Indian Entrepreneurs</span>
            <span style={S.wikiTag}>Solo Founders</span>
            <span style={S.wikiTag}>FoodTech</span>
            <span style={S.wikiTag}>Maharashtra</span>
            <span style={S.wikiTag}>Student Entrepreneur</span>
          </div>

          <h1 style={S.h1}>Santosh Tejerao Sangnod</h1>
          <p style={S.tagLine}>Indian entrepreneur, software developer, and founder of FeedoZone</p>
          <p style={S.shortDesc}>
            For the company he founded, see{' '}
            <a href="/wiki" style={{ color: '#0645ad' }}>FeedoZone</a>.
          </p>

          {/* ── INFOBOX ── */}
          <div style={S.infobox}>
            <div style={S.infoboxTitle}>Santosh Tejerao Sangnod</div>
            <img
              src="/santosh-sangnod-founder-feedozone.jpg"
              alt="Santosh Tejerao Sangnod, Founder and CEO of FeedoZone"
              style={S.infoboxImg}
              width="280"
              height="260"
            />
            <div style={S.infoboxImgCaption}>Santosh Sangnod, Founder &amp; CEO of FeedoZone</div>
            {[
              ['Full name', 'Santosh Tejerao Sangnod'],
              ['Also known as', 'Santosh Sangnod'],
              ['Nationality', 'Indian'],
              ['Occupation', 'Entrepreneur, Software Developer'],
              ['Title', 'Founder & CEO, FeedoZone'],
              ['Education', 'B.Tech CSBS — TKIET Warananagar'],
              ['Founded', 'FeedoZone (2026)'],
              ['Role', 'Solo Founder & Solo Builder'],
              ['Location', 'Warananagar, Kolhapur, MH'],
            ].map(([label, val]) => (
              <div key={label} style={S.infoboxRow}>
                <div style={S.infoboxLabel}>{label}</div>
                <div style={S.infoboxVal}>{val}</div>
              </div>
            ))}
          </div>

          {/* ── LEAD ── */}
          <p style={S.p}>
            <b>Santosh Tejerao Sangnod</b> (commonly known as <b>Santosh Sangnod</b>) is an
            Indian entrepreneur, software developer, and the <b>Founder and CEO of{' '}
            <a href="/wiki" style={{ color: '#0645ad' }}>FeedoZone</a></b>, a hyperlocal
            food-delivery platform based in Warananagar, Kolhapur, Maharashtra, India.
          </p>
          <p style={S.p}>
            Santosh is best known as a <b>solo builder</b> — he single-handedly conceived,
            designed, developed, launched, and operates the entire FeedoZone platform. This
            includes the customer-facing ordering application, vendor onboarding system,
            real-time order tracking, delivery management, payment integration, push
            notification infrastructure, multi-language support, marketing, and all business
            expansion efforts — all built by one person.
          </p>
          <p style={S.p}>
            He is currently pursuing a Bachelor of Technology (B.Tech) in Computer Science
            and Business Systems (CSBS) at Tatyasaheb Kore Institute of Engineering and
            Technology (<b>TKIET</b>), Warananagar, Kolhapur.
          </p>

          {/* ── TABLE OF CONTENTS ── */}
          <div style={S.toc}>
            <div style={S.tocTitle}>Contents</div>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {toc.map((item) => (
                <li key={item.id} style={{ lineHeight: 1.9 }}>
                  <a
                    href={`#${item.id}`}
                    style={activeSection === item.id ? { ...S.tocLink, ...S.tocLinkActive } : S.tocLink}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>

          {/* ── 1. EARLY LIFE ── */}
          <h2 id="early-life" style={S.h2}>1  Early Life &amp; Education</h2>
          <p style={S.p}>
            Santosh Tejerao Sangnod grew up in Maharashtra, India. He developed an early
            interest in technology and software development, which led him to pursue
            engineering at the university level.
          </p>
          <p style={S.p}>
            He is currently enrolled in the <b>B.Tech program in Computer Science and
            Business Systems (CSBS)</b> at <b>Tatyasaheb Kore Institute of Engineering
            and Technology (TKIET)</b>, Warananagar, Kolhapur, Maharashtra. The CSBS
            program combines core computer science with business fundamentals, providing
            Santosh with the dual skill set required to both build and manage a technology
            startup simultaneously.
          </p>
          <p style={S.p}>
            Santosh founded FeedoZone while attending university full-time, balancing
            his academic commitments with the full responsibilities of a startup founder,
            developer, and business operator.
          </p>

          {/* ── 2. FEEDOZONE ── */}
          <h2 id="feedozone" style={S.h2}>2  FeedoZone</h2>
          <h3 style={S.h3}>2.1  Founding</h3>
          <p style={S.p}>
            Santosh founded <a href="/wiki" style={{ color: '#0645ad' }}>FeedoZone</a> in
            early 2026 after identifying the absence of a reliable, localised food-delivery
            service in Warananagar. Rather than waiting for a co-founder or external
            investment, he immediately began building the platform himself.
          </p>
          <p style={S.p}>
            The FeedoZone website officially launched on <b>26 March 2026</b>, becoming
            the first dedicated hyperlocal food-delivery platform in Warananagar. The
            Android application followed on <b>21 May 2026</b> on the Google Play Store.
          </p>
          <h3 style={S.h3}>2.2  Role at FeedoZone</h3>
          <p style={S.p}>
            As the sole founder and CEO, Santosh holds full responsibility across every
            function of the company. He is simultaneously the lead developer, product
            designer, business strategist, marketing manager, and operations head — a
            rare combination that reflects the depth of his commitment and capability.
          </p>

          {/* ── 3. SOLO BUILDER ── */}
          <h2 id="solo-builder" style={S.h2}>3  Solo Builder Achievement</h2>
          <div style={S.achievementBox}>
            <div style={S.achievementTitle}>🏆 The Solo Builder Feat</div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: '#333' }}>
              Santosh Sangnod built the <strong>entire FeedoZone technology platform
              and business by himself</strong> — no co-founders, no development team,
              no outsourcing. Every system described below was designed, developed,
              tested, deployed, and is maintained by a single person.
            </p>
          </div>
          <p style={S.p}>
            Building a complete food-delivery ecosystem — spanning customer mobile apps,
            real-time tracking systems, vendor management dashboards, payment gateways,
            push notification infrastructure, and business operations — typically requires
            teams of engineers, designers, product managers, and operations staff.
            Santosh accomplished this alone.
          </p>
          <p style={S.p}>
            His approach demonstrates that with the right combination of technical skill,
            business understanding, determination, and modern cloud platforms, a single
            motivated individual can build and launch a full-scale technology product that
            serves a real community need.
          </p>
          <div style={S.quote}>
            "One person. One vision. A complete food-delivery system built from scratch."
          </div>

          {/* ── 4. WHAT HE BUILT ── */}
          <h2 id="what-he-built" style={S.h2}>4  What He Built</h2>
          <p style={S.p}>
            The following lists every major system and component of FeedoZone, all of
            which were designed and developed solely by Santosh Sangnod:
          </p>
          <h3 style={S.h3}>4.1  Customer-Facing Platform</h3>
          <ul style={S.ul}>
            <li>Full-featured customer web app (Progressive Web App / PWA)</li>
            <li>Native Android application on Google Play Store</li>
            <li>Restaurant browsing, search, and menu ordering interface</li>
            <li>Live real-time order tracking from preparation to delivery</li>
            <li>UPI payment integration and cash-on-delivery system</li>
            <li>Order history, reorder, and customer account management</li>
            <li>Multi-language support — English, Marathi, Hindi</li>
          </ul>
          <h3 style={S.h3}>4.2  Vendor Onboarding &amp; Management</h3>
          <ul style={S.ul}>
            <li>Complete vendor onboarding workflow for restaurant owners</li>
            <li>Vendor dashboard — menu management, pricing, availability controls</li>
            <li>Incoming order management (accept, reject, status updates)</li>
            <li>Real-time order notification system for vendors</li>
            <li>Vendor earnings, billing, and order history tracking</li>
          </ul>
          <h3 style={S.h3}>4.3  Delivery Operations</h3>
          <ul style={S.ul}>
            <li>Delivery partner management system</li>
            <li>Order assignment, routing, and pickup coordination</li>
            <li>Live delivery tracking visible to customers in real time</li>
            <li>Delivery confirmation and status management</li>
          </ul>
          <h3 style={S.h3}>4.4  Business Infrastructure</h3>
          <ul style={S.ul}>
            <li>Founder / admin control panel with platform-wide analytics</li>
            <li>User management for customers, vendors, and delivery partners</li>
            <li>Push notification broadcasting (Firebase Cloud Messaging)</li>
            <li>Order lifecycle management (placed → confirmed → prepared → delivered)</li>
            <li>Revenue tracking and financial reporting tools</li>
          </ul>
          <h3 style={S.h3}>4.5  Marketing &amp; Expansion</h3>
          <ul style={S.ul}>
            <li>All marketing campaigns and user acquisition strategies</li>
            <li>Social media presence and community outreach</li>
            <li>Vendor acquisition and relationship management</li>
            <li>Business expansion planning and execution</li>
            <li>SEO implementation and Google Search visibility</li>
          </ul>

          {/* ── 5. PHILOSOPHY ── */}
          <h2 id="philosophy" style={S.h2}>5  Philosophy &amp; Vision</h2>
          <p style={S.p}>
            Santosh's founding philosophy centres on the idea that technology can be
            used to empower local communities — connecting neighbourhood restaurants with
            nearby customers and creating economic opportunities for local delivery
            partners, all within a familiar, community-scale environment.
          </p>
          <p style={S.p}>
            His vision for FeedoZone is to grow beyond Warananagar and expand across
            the Kolhapur region, while maintaining the personal, community-first approach
            that differentiates FeedoZone from large national food-delivery platforms.
          </p>
          <div style={S.quote}>
            "FeedoZone is not just about delivering food. It is about building a local
            digital economy where every restaurant, every delivery partner, and every
            customer in our community benefits."
          </div>

          {/* ── 6. REFERENCES ── */}
          <h2 id="references" style={S.h2}>6  References</h2>
          <ol style={{ ...S.ul, listStyleType: 'decimal' }}>
            <li style={S.cite}>
              FeedoZone Official Website —{' '}
              <a href="https://feedo-ruddy.vercel.app" style={{ color: '#0645ad' }} target="_blank" rel="noopener noreferrer">
                feedo-ruddy.vercel.app
              </a>
            </li>
            <li style={S.cite}>
              FeedoZone Android App — Google Play Store —{' '}
              <a href="https://play.google.com/store/apps/details?id=com.feedozone.app2024" style={{ color: '#0645ad' }} target="_blank" rel="noopener noreferrer">
                Play Store listing
              </a>
            </li>
            <li style={S.cite}>
              FeedoZone Encyclopedia Article —{' '}
              <a href="/wiki" style={{ color: '#0645ad' }}>FeedoZone article</a>
            </li>
            <li style={S.cite}>
              Santosh Sangnod Founder Profile —{' '}
              <a href="/founder-profile" style={{ color: '#0645ad' }}>feedo-ruddy.vercel.app/founder-profile</a>
            </li>
            <li style={S.cite}>
              TKIET Warananagar — Tatyasaheb Kore Institute of Engineering and Technology,
              Warananagar, Kolhapur, Maharashtra, India
            </li>
          </ol>

          {/* ── NAV FOOTER ── */}
          <div style={S.navFooter}>
            <a href="/wiki" style={S.navLink}>← FeedoZone Article</a>
            &nbsp;·&nbsp;
            <a href="/founder-profile" style={S.navLink}>Founder Profile</a>
            &nbsp;·&nbsp;
            <a href="/" style={S.navLink}>FeedoZone App</a>
            <br /><br />
            <span style={{ fontSize: 11, color: '#aaa' }}>
              FeedoZone Encyclopedia · Article about Santosh Tejerao Sangnod, Founder &amp; CEO of FeedoZone
            </span>
          </div>
        </main>

        {/* ── SIDEBAR ── */}
        <aside style={S.aside}>
          <div style={S.stickyToc}>
            <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13, borderBottom: '1px solid #a2a9b1', paddingBottom: 6 }}>
              📖 Contents
            </div>
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {toc.map((item) => (
                <li key={item.id} style={{ lineHeight: 2.1 }}>
                  <a
                    href={`#${item.id}`}
                    style={activeSection === item.id
                      ? { color: '#E24B4A', fontWeight: 700, textDecoration: 'none', fontSize: 12 }
                      : { color: '#0645ad', textDecoration: 'none', fontSize: 12 }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
            <div style={{ marginTop: 16, borderTop: '1px solid #eaecf0', paddingTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 6 }}>RELATED ARTICLES</div>
              <a href="/wiki" style={{ display: 'block', color: '#0645ad', fontSize: 12, lineHeight: 2 }}>FeedoZone</a>
              <a href="/founder-profile" style={{ display: 'block', color: '#0645ad', fontSize: 12, lineHeight: 2 }}>Founder Profile</a>
              <a href="https://play.google.com/store/apps/details?id=com.feedozone.app2024" style={{ display: 'block', color: '#0645ad', fontSize: 12, lineHeight: 2 }} target="_blank" rel="noopener noreferrer">FeedoZone on Play Store</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
