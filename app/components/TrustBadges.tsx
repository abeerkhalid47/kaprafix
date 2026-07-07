const BADGES = [
  { icon: '🛡️', title: 'Quality Guaranteed', sub: '100% original product' },
  { icon: '💵', title: 'Cash on Delivery', sub: 'Pay when you receive' },
  { icon: '🚚', title: 'Fast Shipping', sub: 'Delivered in 3–5 days' },
  { icon: '↩️', title: 'Easy Returns', sub: 'Hassle-free process' },
];

export default function TrustBadges() {
  return (
    <div className="trust-badges">
      <div className="container">
        <div className="trust-badges__grid">
          {BADGES.map((b) => (
            <div key={b.title} className="trust-badge-card">
              <div className="trust-badge-card__icon">{b.icon}</div>
              <div>
                <div className="trust-badge-card__title">{b.title}</div>
                <div className="trust-badge-card__sub">{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
