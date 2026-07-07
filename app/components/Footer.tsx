import Image from 'next/image';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__logo">
              <Image src="/images/logo.png" alt="Easy Fit Tape" width={120} height={30} />
            </div>
            <p className="footer__desc">
              Pakistan's trusted No-Stitch Hem Tape. Fix, shorten, and adjust your clothes in minutes — no sewing required.
            </p>
            <div className="footer__social">
              <a href="https://wa.me/923177299713" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">💬</a>
              <a href="#" aria-label="Instagram">📸</a>
              <a href="#" aria-label="Facebook">👍</a>
            </div>
          </div>

          <div>
            <div className="footer__col-title">Contact</div>
            <div className="footer__links">
              <a href="tel:03177299713">📞 03177299713</a>
              <a href="https://wa.me/923177299713" target="_blank" rel="noopener noreferrer">
                💬 WhatsApp Us
              </a>
              <a href="mailto:support@easyfittape.pk">✉️ Email Support</a>
            </div>
          </div>

          <div>
            <div className="footer__col-title">Policies</div>
            <div className="footer__links">
              <a href="#faq">FAQ</a>
              <a href="#">Shipping Policy</a>
              <a href="#">Return Policy</a>
              <a href="#">Privacy Policy</a>
            </div>
            <div style={{ marginTop: 20 }}>
              <div className="footer__col-title">Shipping Info</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 8 }}>
                Cash on Delivery available all over Pakistan. Orders delivered in 3–5 working days.
              </p>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {year} Easy Fit Tape. All rights reserved.</span>
          <span>Made with ❤️ in Pakistan</span>
        </div>
      </div>
    </footer>
  );
}
