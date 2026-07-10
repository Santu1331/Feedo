import { useEffect, useState } from 'react'

/**
 * Wikipedia-style encyclopaedia article for FeedoZone.
 * Public page — no login required. Fully crawlable by Google.
 * URL: /wiki
 */
export default function WikiFeedozone() {
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    document.title = 'FeedoZone - Wikipedia-style Encyclopedia | Food Delivery Warananagar'
    const desc = document.querySelector('meta[name="description"]')
    if (desc) {
      desc.setAttribute(
        'content',
        'FeedoZone is a hyperlocal food-delivery platform founded by Santosh Tejerao Sangnod in Warananagar, Kolhapur, Maharashtra. Launched March 2026. Built entirely by one person.'
      )
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id) })
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    document.querySelectorAll('h2[id], h3[id]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const toc = [
    { id: 'overview', label: '1  Overview' },
    { id: 'history', label: '2  History' },
    { id: 'founder', label: '3  Founder' },
    { id: 'platform', label: '4  Platform & Features' },
    { id: 'technology', label: '5  Technology' },
    { id: 'business', label: '6  Business Model' },
    { id: 'expansion', label: '7  Growth & Expansion' },
    { id: 'references', label: '8  References' },
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
      fontSize: 13, width: 280, borderCollapse: 'collapse',
    },
    infoboxTitle: { background: '#1a1a1a', color: '#fff', padding: '8px 10px', fontWeight: 700, fontSize: 14, textAlign: 'center' },
    infoboxImg: { width: '100%', height: 200, objectFit: 'cover', display: 'block' },
    infoboxImgCaption: { fontSize: 11, color: '#555', padding: '4px 8px', textAlign: 'center', borderBottom: '1px solid #a2a9b1', fontStyle: 'italic' },
    infoboxRow: { display: 'flex', borderBottom: '1px solid #eaecf0' },
    infoboxLabel: { fontWeight: 700, padding: '5px 8px', width: 100, flexShrink: 0, color: '#555', fontSize: 12 },
    infoboxVal: { padding: '5px 8px', color: '#202122', fontSize: 12 },
    toc: { border: '1px solid #a2a9b1', background: '#f8f9fa', display: 'inline-block', padding: '12px 20px', margin: '16px 0', fontSize: 13, minWidth: 200 },
    tocTitle: { fontWeight: 700, textAlign: 'center', marginBottom: 8, fontSize: 14 },
    tocItem: { lineHeight: 1.9 },
    tocLink: { color: '#0645ad', textDecoration: 'none', fontSize: 13 },
    tocLinkActive: { color: '#E24B4A', fontWeight: 600 },
    h2: { fontFamily: '"Linux Libertine","Georgia",serif', fontSize: 22, fontWeight: 400, borderBottom: '1px solid #a2a9b1', margin: '28px 0 12px', paddingBottom: 4, color: '#000' },
    h3: { fontSize: 17, fontWeight: 700, margin: '20px 0 8px', color: '#000' },
    p: { fontSize: 14, lineHeight: 1.8, marginBottom: 12, color: '#202122' },
    ul: { fontSize: 14, lineHeight: 2, paddingLeft: 28, color: '#202122', marginBottom: 12 },
    refNote: { fontSize: 12, color: '#0645ad', verticalAlign: 'super', cursor: 'pointer' },
    cite: { fontSize: 12, color: '#555', lineHeight: 1.8 },
    navFooter: { borderTop: '1px solid #a2a9b1', marginTop: 40, paddingTop: 16, fontSize: 13, color: '#555', textAlign: 'center' },
    navLink: { color: '#0645ad', textDecoration: 'none', margin: '0 8px' },
    stickyToc: {
      position: 'sticky', top: 20, border: '1px solid #a2a9b1',
      background: '#f8f9fa', padding: '12px 16px', borderRadius: 4,
      fontSize: 13,
    },
    wikiTag: { display: 'inline-block', background: '#eaf3ff', border: '1px solid #a2a9b1', borderRadius: 3, padding: '2px 8px', fontSize: 11, color: '#0645ad', marginRight: 6, marginBottom: 4 },
  }

  return (
    <div style={S.root}>
      {/* ── TOP BAR ── */}
      <div style={S.topBar}>
        <a href="/" style={S.logo}>🍽 FeedoZone</a>
        <span style={{ color: '#a2a9b1' }}>|</span>
        <a href="/wiki" style={S.topBarLink}>Encyclopedia</a>
        <span style={{ color: '#a2a9b1' }}>|</span>
        <a href="/wiki/santosh-sangnod" style={S.topBarLink}>Santosh Sangnod</a>
        <span style={{ color: '#a2a9b1' }}>|</span>
        <a href="/founder-profile" style={S.topBarLink}>Founder Profile</a>
        <div style={{ marginLeft: 'auto' }}>
          <a href="/" style={S.topBarLink}>← Back to App</a>
        </div>
      </div>

      <div style={S.layout}>
        {/* ── MAIN CONTENT ── */}
        <main style={S.main}>
          {/* Category tags */}
          <div style={{ marginBottom: 8 }}>
            <span style={S.wikiTag}>FoodTech</span>
            <span style={S.wikiTag}>Indian Startups</span>
            <span style={S.wikiTag}>Food Delivery</span>
            <span style={S.wikiTag}>Maharashtra</span>
            <span style={S.wikiTag}>Hyperlocal</span>
          </div>

          <h1 style={S.h1}>FeedoZone</h1>
          <p style={S.tagLine}>Hyperlocal food-delivery platform, Warananagar, Kolhapur</p>
          <p style={S.shortDesc}>
            This article is about the food-delivery startup. For the founder, see{' '}
            <a href="/wiki/santosh-sangnod" style={{ color: '#0645ad' }}>Santosh Sangnod</a>.
          </p>

          {/* ── INFOBOX ── */}
          <div style={S.infobox}>
            <div style={S.infoboxTitle}>FeedoZone</div>
            <img
              src="/santosh-sangnod-founder-feedozone.jpg"
              alt="Santosh Sangnod, Founder & CEO of FeedoZone"
              style={S.infoboxImg}
            />
            <div style={S.infoboxImgCaption}>Santosh Sangnod, Founder &amp; CEO</div>
            {[
              ['Type', 'Private — Startup'],
              ['Industry', 'Food Technology, Hyperlocal Delivery'],
              ['Founded', '26 March 2026'],
              ['App Launch', '21 May 2026'],
              ['Founder', 'Santosh Tejerao Sangnod'],
              ['CEO', 'Santosh Tejerao Sangnod'],
              ['Headquarters', 'Warananagar, Kolhapur, Maharashtra, India'],
              ['Area served', 'Warananagar (4 km radius)'],
              ['Platform', 'Web (PWA) · Android'],
              ['Language', 'English · Marathi · Hindi'],
              ['Website', 'feedo-ruddy.vercel.app'],
            ].map(([label, val]) => (
              <div key={label} style={S.infoboxRow}>
                <div style={S.infoboxLabel}>{label}</div>
                <div style={S.infoboxVal}>
                  {label === 'Website'
                    ? <a href="https://feedo-ruddy.vercel.app" style={{ color: '#0645ad' }} target="_blank" rel="noopener noreferrer">{val}</a>
                    : val}
                </div>
              </div>
            ))}
          </div>

          {/* ── LEAD ── */}
          <p style={S.p}>
            <b>FeedoZone</b> (stylised as <i>Feedo Zone</i>) is an Indian hyperlocal food-delivery
            platform headquartered in <b>Warananagar</b>, <b>Kolhapur</b>, Maharashtra, India.
            The platform connects customers with local restaurants for home-delivery orders,
            offering live order tracking, UPI and cash-on-delivery payments, and a typical
            delivery time of 25–45 minutes within a 4 km radius.
          </p>
          <p style={S.p}>
            FeedoZone was founded, designed, and built entirely by{' '}
            <a href="/wiki/santosh-sangnod" style={{ color: '#0645ad' }}>
              <b>Santosh Tejerao Sangnod</b>
            </a>
            , a solo founder and B.Tech student at Tatyasaheb Kore Institute of Engineering
            and Technology (TKIET), Warananagar. The website went live on 26 March 2026
            and the Android application was published on the Google Play Store on 21 May 2026.
          </p>
          <p style={S.p}>
            FeedoZone is notable for being built by a single person — Santosh Sangnod
            conceived, developed, deployed, and operates every part of the system alone,
            including vendor onboarding, customer experience, delivery management, payment
            integration, marketing, and business expansion.
          </p>

          {/* ── TABLE OF CONTENTS ── */}
          <div style={S.toc}>
            <div style={S.tocTitle}>Contents</div>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {toc.map((item) => (
                <li key={item.id} style={S.tocItem}>
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

          {/* ── 1. OVERVIEW ── */}
          <h2 id="overview" style={S.h2}>1  Overview</h2>
          <p style={S.p}>
            FeedoZone operates as a <b>hyperlocal food-delivery marketplace</b>, aggregating
            local restaurants in Warananagar and fulfilling delivery orders through its own
            delivery network. The platform serves customers via a Progressive Web App (PWA)
            accessible through any browser and a native Android application available on
            Google Play Store.
          </p>
          <p style={S.p}>
            The service supports multiple payment methods including UPI (Unified Payments
            Interface) and cash-on-delivery, catering to the local digital and non-digital
            customer base. The platform is available in three languages: English, Marathi,
            and Hindi, reflecting the linguistic diversity of the Kolhapur region.
          </p>
          <p style={S.p}>
            Unlike large-scale delivery platforms, FeedoZone is specifically designed for
            the hyperlocal market of Warananagar, providing faster delivery times and a more
            personal connection between customers, local restaurant vendors, and delivery
            partners within the community.
          </p>

          {/* ── 2. HISTORY ── */}
          <h2 id="history" style={S.h2}>2  History</h2>
          <h3 id="founding" style={S.h3}>2.1  Founding</h3>
          <p style={S.p}>
            FeedoZone was conceived and founded by <a href="/wiki/santosh-sangnod" style={{ color: '#0645ad' }}>Santosh Tejerao Sangnod</a> in
            early 2026. Observing the lack of a reliable, localised food-delivery service in
            Warananagar, Santosh decided to build the solution himself — designing the
            entire product architecture, developing both the frontend and backend systems,
            and managing the business launch independently.
          </p>
          <p style={S.p}>
            The FeedoZone website officially launched on <b>26 March 2026</b> at{' '}
            <a href="https://feedo-ruddy.vercel.app" style={{ color: '#0645ad' }} target="_blank" rel="noopener noreferrer">
              feedo-ruddy.vercel.app
            </a>
            , making FeedoZone the first dedicated hyperlocal food-delivery platform in
            Warananagar.
          </p>
          <h3 id="app-launch" style={S.h3}>2.2  Android App Launch</h3>
          <p style={S.p}>
            Following the web platform launch, Santosh developed and published the FeedoZone
            Android application on the <b>Google Play Store on 21 May 2026</b>. The app
            provides a native mobile experience with push notifications for order updates,
            real-time order tracking, and a streamlined ordering interface.
          </p>

          {/* ── 3. FOUNDER ── */}
          <h2 id="founder" style={S.h2}>3  Founder</h2>
          <p style={S.p}>
            <a href="/wiki/santosh-sangnod" style={{ color: '#0645ad' }}>
              <b>Santosh Tejerao Sangnod</b>
            </a>{' '}
            (born in Maharashtra, India) is the <b>sole founder and CEO</b> of FeedoZone.
            He is currently pursuing a Bachelor of Technology (B.Tech) in Computer Science
            and Business Systems (CSBS) at Tatyasaheb Kore Institute of Engineering and
            Technology (<b>TKIET</b>), Warananagar, Kolhapur.
          </p>
          <p style={S.p}>
            Santosh is widely regarded as a <b>solo builder</b> — he independently
            conceptualised, designed, developed, launched, and continues to operate every
            component of FeedoZone. This includes the customer-facing application, vendor
            management system, delivery operations, payment integrations, push notification
            infrastructure, multi-language support, and all marketing and business growth
            efforts.
          </p>
          <p style={S.p}>
            The fact that a single person built an end-to-end food-delivery ecosystem —
            spanning mobile apps, real-time tracking, vendor dashboards, and business
            operations — while simultaneously attending university full-time is a defining
            characteristic of FeedoZone's founding story.
          </p>
          <p style={{ ...S.p, fontStyle: 'italic', color: '#555', borderLeft: '3px solid #E24B4A', paddingLeft: 12 }}>
            "FeedoZone is not just an app. It is proof that one determined person can build
            a complete technology business from the ground up." — Santosh Sangnod, Founder
          </p>
          <p style={S.p}>
            For a detailed biography, see the{' '}
            <a href="/wiki/santosh-sangnod" style={{ color: '#0645ad' }}>
              Santosh Sangnod encyclopedia article
            </a>.
          </p>

          {/* ── 4. PLATFORM ── */}
          <h2 id="platform" style={S.h2}>4  Platform &amp; Features</h2>
          <h3 style={S.h3}>4.1  Customer Application</h3>
          <ul style={S.ul}>
            <li>Browse local restaurants and menus in Warananagar</li>
            <li>Place food orders with real-time confirmation</li>
            <li>Live order tracking from preparation to doorstep delivery</li>
            <li>UPI payment and cash-on-delivery options</li>
            <li>Order history and reorder functionality</li>
            <li>Multi-language interface (English, Marathi, Hindi)</li>
            <li>Progressive Web App (PWA) — works on any browser</li>
            <li>Native Android app on Google Play Store</li>
          </ul>
          <h3 style={S.h3}>4.2  Vendor Dashboard</h3>
          <ul style={S.ul}>
            <li>Restaurant onboarding and profile management</li>
            <li>Menu creation and management (items, prices, availability)</li>
            <li>Incoming order management with accept/reject controls</li>
            <li>Real-time order status updates</li>
            <li>Earnings tracking and billing history</li>
            <li>Push notifications for new orders</li>
          </ul>
          <h3 style={S.h3}>4.3  Delivery Management</h3>
          <ul style={S.ul}>
            <li>Delivery partner assignment system</li>
            <li>Order routing and pickup coordination</li>
            <li>Live delivery tracking for customers</li>
            <li>Delivery confirmation and proof-of-delivery system</li>
          </ul>
          <h3 style={S.h3}>4.4  Founder / Admin Dashboard</h3>
          <ul style={S.ul}>
            <li>Platform-wide analytics — orders, revenue, active vendors</li>
            <li>User management (customers, vendors, delivery partners)</li>
            <li>Notification broadcasting</li>
            <li>Order dispute and support management</li>
            <li>Business metrics and growth tracking</li>
          </ul>

          {/* ── 5. TECHNOLOGY ── */}
          <h2 id="technology" style={S.h2}>5  Technology</h2>
          <p style={S.p}>
            FeedoZone is built on a modern web technology stack, chosen by Santosh Sangnod
            to enable rapid development by a single engineer while maintaining production
            quality.
          </p>
          <ul style={S.ul}>
            <li><b>Frontend:</b> React.js with Vite, deployed on Vercel</li>
            <li><b>Backend / Database:</b> Google Firebase (Firestore, Realtime Database, Authentication)</li>
            <li><b>Push Notifications:</b> Firebase Cloud Messaging (FCM)</li>
            <li><b>Payments:</b> UPI (Unified Payments Interface) integration</li>
            <li><b>Mobile App:</b> Android (published on Google Play Store)</li>
            <li><b>Hosting:</b> Vercel (web), Firebase Hosting (service worker)</li>
            <li><b>Internationalisation:</b> Custom i18n system (English, Marathi, Hindi)</li>
            <li><b>PWA:</b> Service worker with offline capabilities and app manifest</li>
          </ul>
          <p style={S.p}>
            The entire technology architecture was designed and implemented by Santosh
            Sangnod as a solo developer.
          </p>

          {/* ── 6. BUSINESS ── */}
          <h2 id="business" style={S.h2}>6  Business Model</h2>
          <p style={S.p}>
            FeedoZone operates on a <b>commission-based marketplace model</b>, earning
            revenue by taking a percentage of each order placed through the platform.
            Additional revenue streams include delivery fees charged to customers and
            promotional placements for vendor restaurants.
          </p>
          <p style={S.p}>
            The platform focuses on <b>hyperlocal commerce</b> — serving a defined
            geographic radius of approximately 4 km around Warananagar — which enables
            faster delivery times and stronger relationships with local businesses compared
            to large national platforms.
          </p>

          {/* ── 7. EXPANSION ── */}
          <h2 id="expansion" style={S.h2}>7  Growth &amp; Expansion</h2>
          <p style={S.p}>
            Since launching in March 2026, FeedoZone has focused on onboarding local
            restaurants in Warananagar and growing its customer base within the community.
            All vendor acquisition, customer growth campaigns, and marketing activities
            have been managed solely by the founder, Santosh Sangnod.
          </p>
          <p style={S.p}>
            The platform continues to expand its vendor network and delivery coverage within
            the Kolhapur region, with plans to grow into neighbouring areas while
            maintaining the personalised, community-first approach that differentiates
            FeedoZone from large national delivery platforms.
          </p>

          {/* ── 8. REFERENCES ── */}
          <h2 id="references" style={S.h2}>8  References</h2>
          <ol style={{ ...S.ul, listStyleType: 'decimal' }}>
            <li style={S.cite}>
              FeedoZone Official Website —{' '}
              <a href="https://feedo-ruddy.vercel.app" style={{ color: '#0645ad' }} target="_blank" rel="noopener noreferrer">
                feedo-ruddy.vercel.app
              </a>{' '}
              (launched 26 March 2026)
            </li>
            <li style={S.cite}>
              FeedoZone Android App — Google Play Store,{' '}
              <a href="https://play.google.com/store/apps/details?id=com.feedozone.app2024" style={{ color: '#0645ad' }} target="_blank" rel="noopener noreferrer">
                com.feedozone.app2024
              </a>{' '}
              (published 21 May 2026)
            </li>
            <li style={S.cite}>
              Santosh Tejerao Sangnod — Founder &amp; CEO, FeedoZone —{' '}
              <a href="/wiki/santosh-sangnod" style={{ color: '#0645ad' }}>
                See Santosh Sangnod article
              </a>
            </li>
            <li style={S.cite}>
              TKIET Warananagar — Tatyasaheb Kore Institute of Engineering and Technology,
              Warananagar, Kolhapur, Maharashtra, India
            </li>
          </ol>

          {/* ── NAV FOOTER ── */}
          <div style={S.navFooter}>
            <a href="/wiki/santosh-sangnod" style={S.navLink}>Santosh Sangnod →</a>
            &nbsp;·&nbsp;
            <a href="/founder-profile" style={S.navLink}>Founder Profile</a>
            &nbsp;·&nbsp;
            <a href="/" style={S.navLink}>FeedoZone App</a>
            &nbsp;·&nbsp;
            <a href="/privacy-policy" style={S.navLink}>Privacy Policy</a>
            <br /><br />
            <span style={{ fontSize: 11, color: '#aaa' }}>
              FeedoZone Encyclopedia · Content verified by Santosh Tejerao Sangnod, Founder &amp; CEO
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
              <div style={{ fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 6 }}>RELATED</div>
              <a href="/wiki/santosh-sangnod" style={{ display: 'block', color: '#0645ad', fontSize: 12, lineHeight: 2 }}>Santosh Sangnod</a>
              <a href="/founder-profile" style={{ display: 'block', color: '#0645ad', fontSize: 12, lineHeight: 2 }}>Founder Profile</a>
              <a href="https://play.google.com/store/apps/details?id=com.feedozone.app2024" style={{ display: 'block', color: '#0645ad', fontSize: 12, lineHeight: 2 }} target="_blank" rel="noopener noreferrer">FeedoZone on Play Store</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
