export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="footer-luxury">
      <div className="container">
        <div className="footer-luxury__grid">
          {/* Brand Signature Card */}
          <div className="footer-luxury__col">
            <div className="footer-luxury__brand">
              K A P R A F I X
            </div>
            <p className="footer-luxury__desc">
              Pakistan's trusted No-Stitch Hem Tape. Fix, shorten, and adjust your garments in minutes — no sewing required.
            </p>
            <div className="footer-luxury__social">
              <a href="https://wa.me/923177299713" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </a>
              <a href="https://www.instagram.com/kaprafix.online/" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://www.facebook.com/kaprafix" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            </div>
          </div>

          {/* Contact Details Column */}
          <div className="footer-luxury__col">
            <h4 className="footer-luxury__title">Contact Support</h4>
            <div className="footer-luxury__links">
              <a href="tel:03177299713" className="footer-luxury__link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>03177299713</span>
              </a>
              <a href="https://wa.me/923177299713" target="_blank" rel="noopener noreferrer" className="footer-luxury__link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                <span>WhatsApp Support</span>
              </a>
              <a href="mailto:kaprafix@gmail.com" className="footer-luxury__link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span>kaprafix@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Logistics & Policies Column */}
          <div className="footer-luxury__col">
            <h4 className="footer-luxury__title">Policies & Shipping</h4>
            <div className="faq-visual-steps-grid" style={{ gap: 8, maxWidth: '100%' }}>
              <div style={{ padding: '8px 12px', fontSize: '13px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.03)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }}><rect width="16" height="12" x="2" y="6" rx="2"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M12 12h.01"/></svg>
                <span>COD Pakistan (3–5 working days)</span>
              </div>
            </div>
            <div className="footer-luxury__links" style={{ marginTop: 20 }}>
              <a href="#faq" className="footer-luxury__link-policy">FAQ</a>
              <a href="#" className="footer-luxury__link-policy">Shipping Policy</a>
              <a href="#" className="footer-luxury__link-policy">Return Policy</a>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="footer-luxury__bottom">
          <span>© {year} Kaprafix. All rights reserved.</span>
          <span>Made in Pakistan</span>
        </div>
      </div>
    </footer>
  );
}
