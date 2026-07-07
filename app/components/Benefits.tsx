const BENEFITS = [
  {
    icon: '🧵',
    title: 'No Sewing Required',
    desc: 'Hem and repair clothes without any needle, thread, or sewing machine. Perfect for everyone.',
  },
  {
    icon: '⚡',
    title: 'Quick & Easy',
    desc: 'Get professional-looking results in just minutes with a standard iron. No skills needed.',
  },
  {
    icon: '💪',
    title: 'Strong & Durable',
    desc: 'Creates a powerful bond that holds securely through everyday wear and regular washing.',
  },
  {
    icon: '👁️',
    title: 'Invisible Finish',
    desc: 'Blends seamlessly inside the fabric, leaving a clean and professional appearance.',
  },
  {
    icon: '👗',
    title: 'Multi-Fabric Compatible',
    desc: 'Works on jeans, trousers, skirts, dresses, curtains, and most other fabric types.',
  },
  {
    icon: '✈️',
    title: 'Perfect for Travel',
    desc: 'Compact and lightweight — keep it in your bag for emergency clothing fixes anywhere.',
  },
];

export default function Benefits() {
  return (
    <section className="section section-alt" id="benefits">
      <div className="container">
        <div className="section-header">
          <span className="label">Why Easy Fit Tape</span>
          <h2 className="heading mt-4">Everything You Need, Nothing You Don't</h2>
          <p>The smart solution for perfectly fitting clothes — no tailoring required.</p>
        </div>
        <div className="benefits-section__grid">
          {BENEFITS.map((b) => (
            <div key={b.title} className="benefit-card">
              <div className="benefit-card__icon">{b.icon}</div>
              <div className="benefit-card__title">{b.title}</div>
              <div className="benefit-card__desc">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
