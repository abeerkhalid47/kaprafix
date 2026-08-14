import { ShieldCheck, Banknote, Truck, Undo2 } from 'lucide-react';

const BADGES = [
  { icon: ShieldCheck, title: 'Quality Guaranteed', sub: '100% original product' },
  { icon: Banknote, title: 'Cash on Delivery', sub: 'Pay when you receive' },
  { icon: Truck, title: 'Fast Shipping', sub: 'Delivered in 3–5 days' },
  { icon: Undo2, title: 'Easy Returns', sub: 'Hassle-free process' },
];

export default function TrustBadges() {
  return (
    <div className="trust-badges">
      <div className="container">
        <div className="trust-badges__grid">
          {BADGES.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="trust-badge-card">
                <div className="trust-badge-card__icon">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <div className="trust-badge-card__text">
                  <div className="trust-badge-card__title">{b.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
