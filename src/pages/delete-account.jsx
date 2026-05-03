// File location: app/delete-account/page.jsx  (Next.js App Router)
// OR: pages/delete-account.jsx  (Next.js Pages Router)

'use client';
import { useState } from 'react';

export default function DeleteAccount() {
  const [formData, setFormData] = useState({ name: '', email: '', reason: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setLoading(true);
    // Simulate submission (replace with your actual API call)
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      color: '#e8e8e8',
      fontFamily: "'Georgia', serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '50px 20px 35px',
        textAlign: 'center',
        borderBottom: '1px solid #2a2a4a',
      }}>
        <div style={{
          fontSize: '36px',
          fontWeight: '800',
          background: 'linear-gradient(90deg, #e94560, #0f3460)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
        }}>
          FeedoZone
        </div>
        <h1 style={{
          color: '#a0a0c0',
          margin: '0 0 8px 0',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontSize: '15px',
          fontWeight: '400',
        }}>
          Account Deletion Request
        </h1>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '560px',
        margin: '0 auto',
        padding: '50px 24px',
        width: '100%',
        flex: 1,
      }}>

        {!submitted ? (
          <>
            {/* Warning Box */}
            <div style={{
              background: '#2a1010',
              border: '1px solid #e9456040',
              borderRadius: '12px',
              padding: '20px 24px',
              marginBottom: '36px',
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#e94560', fontWeight: '700', fontSize: '15px' }}>
                ⚠️ Before you proceed
              </p>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#b08080', fontSize: '14px', lineHeight: '1.8' }}>
                <li>Your account and all associated data will be permanently deleted</li>
                <li>This action cannot be undone</li>
                <li>Your posts, profile, and history will be removed</li>
                <li>Deletion will be processed within 30 days of your request</li>
              </ul>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#a0a0c0',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#1a1a2e',
                    border: '1px solid #2a2a4a',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    color: '#e8e8e8',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#a0a0c0',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                }}>
                  Email Address (used to register) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#1a1a2e',
                    border: '1px solid #2a2a4a',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    color: '#e8e8e8',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#a0a0c0',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                }}>
                  Reason for leaving (optional)
                </label>
                <textarea
                  placeholder="Tell us why you're leaving..."
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    background: '#1a1a2e',
                    border: '1px solid #2a2a4a',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    color: '#e8e8e8',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? '#333' : 'linear-gradient(135deg, #e94560, #c73652)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.5px',
                  fontFamily: 'inherit',
                }}
              >
                {loading ? 'Submitting...' : 'Submit Deletion Request'}
              </button>
            </form>

            <p style={{
              textAlign: 'center',
              marginTop: '24px',
              color: '#505070',
              fontSize: '13px',
            }}>
              Changed your mind?{' '}
              <a href="/" style={{ color: '#6060a0', textDecoration: 'underline' }}>
                Go back to FeedoZone
              </a>
            </p>
          </>
        ) : (
          /* Success State */
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#e8e8e8',
              marginBottom: '16px',
            }}>
              Request Submitted
            </h2>
            <p style={{ color: '#a0a0c0', lineHeight: '1.7', marginBottom: '12px' }}>
              We have received your account deletion request for:
            </p>
            <p style={{
              color: '#e94560',
              fontWeight: '700',
              fontSize: '16px',
              marginBottom: '24px',
            }}>
              {formData.email}
            </p>
            <div style={{
              background: '#1a1a2e',
              border: '1px solid #2a2a4a',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'left',
            }}>
              <p style={{ color: '#a0a0c0', fontSize: '14px', margin: '0 0 8px 0' }}>
                📋 <strong style={{ color: '#e8e8e8' }}>What happens next:</strong>
              </p>
              <ul style={{ color: '#808098', fontSize: '14px', lineHeight: '1.8', paddingLeft: '18px', margin: 0 }}>
                <li>You will receive a confirmation email within 24 hours</li>
                <li>Your account will be deactivated immediately</li>
                <li>All data will be permanently deleted within 30 days</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '24px',
        borderTop: '1px solid #1a1a2e',
        color: '#404060',
        fontSize: '13px',
      }}>
        Questions? Email us at{' '}
        <a href="mailto:support@feedozone.com" style={{ color: '#6060a0' }}>
          support@feedozone.com
        </a>
      </div>
    </div>
  );
}