export default function PrivacyPolicy() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      color: '#e8e8e8',
      fontFamily: "'Georgia', serif",
      padding: '0',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '60px 20px 40px',
        textAlign: 'center',
        borderBottom: '1px solid #2a2a4a',
      }}>
        <div style={{
          fontSize: '42px',
          fontWeight: '800',
          background: 'linear-gradient(90deg, #e94560, #0f3460)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
          letterSpacing: '-1px',
        }}>
          FeedoZone
        </div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '400',
          color: '#a0a0c0',
          margin: '0 0 12px 0',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontSize: '16px',
        }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#606080', fontSize: '14px', margin: 0 }}>
          Last updated: May 3, 2026
        </p>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '50px 24px',
      }}>

        <Section title="1. Introduction">
          Welcome to FeedoZone. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website.
        </Section>

        <Section title="2. Information We Collect">
          We may collect the following types of information when you use FeedoZone:
          <List items={[
            'Personal Information: Name, email address, username, and profile photo when you register an account.',
            'Usage Data: Information about how you interact with the app, including pages visited, features used, and time spent.',
            'Device Information: Device type, operating system, unique device identifiers, and mobile network information.',
            'Content Data: Posts, comments, and other content you create or share within the app.',
          ]} />
        </Section>

        <Section title="3. How We Use Your Information">
          We use the information we collect to:
          <List items={[
            'Create and manage your account',
            'Provide, operate, and maintain our services',
            'Improve and personalize your experience',
            'Send you updates, security alerts, and support messages',
            'Monitor and analyze usage patterns to improve the app',
            'Comply with legal obligations',
          ]} />
        </Section>

        <Section title="4. Sharing of Information">
          We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:
          <List items={[
            'With your consent',
            'To comply with legal requirements or respond to lawful requests',
            'To protect the rights and safety of FeedoZone and its users',
            'With service providers who assist in operating our platform (under strict confidentiality agreements)',
          ]} />
        </Section>

        <Section title="5. Data Security">
          We implement industry-standard security measures to protect your personal information. All data transmitted between your device and our servers is encrypted using HTTPS/TLS. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
        </Section>

        <Section title="6. Data Retention">
          We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by visiting our account deletion page.
        </Section>

        <Section title="7. Your Rights">
          You have the right to:
          <List items={[
            'Access the personal data we hold about you',
            'Request correction of inaccurate data',
            'Request deletion of your account and personal data',
            'Withdraw consent at any time',
            'Lodge a complaint with a data protection authority',
          ]} />
        </Section>

        <Section title="8. Children's Privacy">
          FeedoZone is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
        </Section>

        <Section title="9. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last updated" date. Continued use of the app after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="10. Contact Us">
          If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:
          <div style={{
            background: '#1a1a2e',
            border: '1px solid #2a2a4a',
            borderRadius: '12px',
            padding: '20px 24px',
            marginTop: '16px',
          }}>
            <p style={{ margin: '4px 0', color: '#a0a0c0' }}>📧 <strong style={{ color: '#e8e8e8' }}>Email:</strong> support@feedozone.com</p>
            <p style={{ margin: '4px 0', color: '#a0a0c0' }}>🌐 <strong style={{ color: '#e8e8e8' }}>Website:</strong> https://feedo-ruddy.vercel.app</p>
          </div>
        </Section>

        {/* Delete Account Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '50px',
          padding: '30px',
          background: '#1a1a2e',
          borderRadius: '16px',
          border: '1px solid #2a2a4a',
        }}>
          <p style={{ color: '#a0a0c0', marginBottom: '16px' }}>
            Want to delete your account and data?
          </p>
          <a href="/delete-account" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #e94560, #c73652)',
            color: 'white',
            padding: '12px 28px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '15px',
          }}>
            Request Account Deletion →
          </a>
        </div>

      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '30px',
        borderTop: '1px solid #1a1a2e',
        color: '#404060',
        fontSize: '13px',
      }}>
        © 2026 FeedoZone. All rights reserved.
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#e94560',
        marginBottom: '14px',
        paddingBottom: '8px',
        borderBottom: '1px solid #1a1a2e',
      }}>
        {title}
      </h2>
      <div style={{ color: '#b0b0c8', lineHeight: '1.8', fontSize: '15px' }}>
        {children}
      </div>
    </div>
  );
}

function List({ items }) {
  return (
    <ul style={{ paddingLeft: '20px', marginTop: '12px' }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: '8px', color: '#b0b0c8' }}>{item}</li>
      ))}
    </ul>
  );
}