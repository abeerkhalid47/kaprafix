'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/* ─────────────────────── Premium SVG Icons ─────────────────────── */
const icons = {
  measure: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="26" height="8" rx="2"/>
      <line x1="8" y1="12" x2="8" y2="9"/>
      <line x1="13" y1="12" x2="13" y2="10"/>
      <line x1="18" y1="12" x2="18" y2="9"/>
      <line x1="23" y1="12" x2="23" y2="10"/>
    </svg>
  ),
  thread: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 25L25 7"/>
      <path d="M7 7c0 0 4 0 6 2s2 6 2 6"/>
      <path d="M19 17c0 0 0 4 2 6s6 2 6 2"/>
      <circle cx="16" cy="16" r="3"/>
    </svg>
  ),
  iron: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22h20l-4-10H10L6 22z"/>
      <path d="M22 12V9a2 2 0 00-2-2h-4"/>
      <line x1="11" y1="17" x2="11" y2="17.01"/>
      <line x1="16" y1="17" x2="16" y2="17.01"/>
      <line x1="21" y1="17" x2="21" y2="17.01"/>
      <line x1="6" y1="22" x2="26" y2="22"/>
      <line x1="8" y1="25" x2="24" y2="25"/>
    </svg>
  ),
  check: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="12"/>
      <polyline points="10,16 14,20 22,12"/>
    </svg>
  ),
  scissors: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="8" r="3"/>
      <circle cx="7" cy="20" r="3"/>
      <line x1="9.5" y1="9.5" x2="22" y2="22"/>
      <line x1="9.5" y1="18.5" x2="22" y2="6"/>
    </svg>
  ),
  droplet: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4 C14 4 6 13 6 18a8 8 0 0 0 16 0C22 13 14 4 14 4z"/>
      <path d="M10 20a4 4 0 0 0 4 3"/>
    </svg>
  ),
  eye: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 14s4-8 12-8 12 8 12 8-4 8-12 8-12-8-12-8z"/>
      <circle cx="14" cy="14" r="3"/>
    </svg>
  ),
  box: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9l10-5 10 5v10l-10 5-10-5V9z"/>
      <polyline points="4,9 14,14 24,9"/>
      <line x1="14" y1="14" x2="14" y2="24"/>
    </svg>
  ),
  bolt: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15,3 8,15 14,15 13,25 20,13 14,13"/>
    </svg>
  ),
  cut: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="8.5" r="3"/>
      <circle cx="7.5" cy="19.5" r="3"/>
      <path d="M10 7l14 7-14 7"/>
      <line x1="10" y1="10" x2="24" y2="14"/>
    </svg>
  ),
  handshake: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 11h4l3-3h6l3 3h4"/>
      <path d="M2 17h4l3 3h6l3-3h4"/>
      <line x1="6" y1="11" x2="6" y2="17"/>
      <line x1="22" y1="11" x2="22" y2="17"/>
      <line x1="10" y1="8" x2="10" y2="20"/>
      <line x1="18" y1="8" x2="18" y2="20"/>
    </svg>
  ),
  // Before/After
  warning: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.3 6.6L3.5 27a3 3 0 002.6 4.5h24a3 3 0 002.6-4.5L20.7 6.6a3 3 0 00-5.4 0z"/>
      <line x1="18" y1="15" x2="18" y2="21"/>
      <circle cx="18" cy="26" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  sparkle: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 4v4M18 28v4M4 18h4M28 18h4"/>
      <path d="M8.9 8.9l2.8 2.8M24.3 24.3l2.8 2.8M8.9 27.1l2.8-2.8M24.3 11.7l2.8-2.8"/>
      <circle cx="18" cy="18" r="5"/>
    </svg>
  ),
};

const STEPS = [
  {
    num: '01',
    title: 'Measure & Fold',
    desc: 'Mark your desired hem length, fold the fabric inward, and press it flat with your palm to create a sharp crease.',
    icon: icons.measure,
  },
  {
    num: '02',
    title: 'Insert the Tape',
    desc: 'Slide the KapraFix tape inside the folded fabric. Make sure it is completely tucked in — tape must never touch the iron directly.',
    icon: icons.thread,
  },
  {
    num: '03',
    title: 'Iron & Bond',
    desc: 'Press your iron firmly on the hem for 10–15 seconds per section. Use medium heat. Lift and move — do not slide.',
    icon: icons.iron,
  },
  {
    num: '04',
    title: 'Cool & Done',
    desc: 'Let it cool for 30 seconds. Your hem is now permanently bonded — wash-safe, iron-safe, invisible from the outside.',
    icon: icons.check,
  },
];

const BEFORE_AFTER = [
  {
    label: 'Before',
    title: 'Uneven, falling hem',
    desc: 'Fraying edges, crooked hemlines, expensive tailor visits just to fix a simple fold.',
    icon: icons.warning,
    bg: '#b5a1751a',
    accent: '#b5a175',
  },
  {
    label: 'After',
    title: 'Clean professional finish',
    desc: 'A straight, invisible bond that lasts for months — done in under 5 minutes at home.',
    icon: icons.sparkle,
    bg: '#f0f7f2',
    accent: '#3d7a56',
  },
];

const SPECS = [
  { label: 'Width', value: '2.5 cm' },
  { label: 'Roll Length', value: '10 metres' },
  { label: 'Heat Required', value: 'Medium iron (130–150°C)' },
  { label: 'Bond Type', value: 'Permanent fusible adhesive' },
  { label: 'Wash Safe', value: 'Yes — machine wash cold' },
  { label: 'Works On', value: 'Denim · Cotton · Polyester · Wool · Chiffon · Linen' },
  { label: 'Does Not Work On', value: 'Heat-sensitive synthetics · Silk · Sheer fabrics' },
  { label: 'Includes', value: '1× 10m KapraFix Hem Tape Roll' },
];

const FABRICS = [
  { name: 'Denim', works: true },
  { name: 'Cotton', works: true },
  { name: 'Polyester', works: true },
  { name: 'Wool', works: true },
  { name: 'Chiffon', works: true },
  { name: 'Linen', works: true },
  { name: 'Silk', works: false },
  { name: 'Sheer', works: false },
];

const WHY_ITEMS = [
  { icon: icons.bolt,      title: 'Done in 5 Minutes',       desc: 'No waiting. No tailor appointment. Fix any hem while you get ready.' },
  { icon: icons.droplet,   title: 'Wash-Safe Bond',          desc: 'Machine wash cold. The bond stays strong — no re-ironing needed.' },
  { icon: icons.eye,       title: 'Invisible Finish',        desc: 'Zero stitching shows on the outside. Looks like it was tailored professionally.' },
  { icon: icons.box,       title: 'Cash on Delivery',        desc: 'No card required. Pay when it arrives at your door, anywhere in Pakistan.' },
  { icon: icons.cut,       title: 'Cut to Any Length',       desc: 'One 10-metre roll handles trousers, curtains, skirts, uniforms and more.' },
  { icon: icons.handshake, title: 'Satisfaction Guarantee',  desc: "Not happy? WhatsApp us at 03177299713 and we'll sort it — no questions asked." },
];

export default function ProductDetailSections() {
  const howRef    = useRef<HTMLElement>(null);
  const specsRef  = useRef<HTMLElement>(null);
  const baRef     = useRef<HTMLElement>(null);
  const fabricRef = useRef<HTMLElement>(null);
  const whyRef    = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Animations removed as requested by the user
  });

  return (
    <>
    <section className="pds-section pds-why-section" ref={whyRef} id="why-kaprafix">
        <div className="container">
          <div className="pds-why-inner">
            <div className="pds-why-left">
              <span className="pds-eyebrow pds-why-badge">Why us</span>
              <h2 className="pds-section-title pds-why-title">Why choose KapraFix?</h2>
            </div>
            <div className="pds-why-right">
              {WHY_ITEMS.map((item, i) => (
                <div key={i} className="pds-why-item">
                  <span className="pds-why-icon">{item.icon}</span>
                  <div>
                    <h4 className="pds-why-item-title">{item.title}</h4>
                    <p className="pds-why-item-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* ══ SECTION 1 — HOW TO USE ══ */}
      <section className="pds-section pds-how" ref={howRef} id="how-to-use">
        <div className="container">
          <div className="pds-section-header">
            <span className="pds-eyebrow">Step by Step</span>
            <h2 className="pds-section-title">How to use KapraFix</h2>
            <p className="pds-section-sub">No sewing. No tools. Just iron and done — in under 5 minutes.</p>
          </div>
          <div className="pds-steps-grid">
            {STEPS.map((s, i) => (
              <div key={i} className="pds-step-card">
                <div className="pds-step-top">
                  <span className="pds-step-num">{s.num}</span>
                  <span className="pds-step-icon-wrap">{s.icon}</span>
                </div>
                <h3 className="pds-step-title">{s.title}</h3>
                {/* <p className="pds-step-desc">{s.desc}</p> */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 2 — BEFORE / AFTER ══ */}
      <section className="pds-section pds-ba-section" ref={baRef} id="before-after">
        <div className="container">
          <div className="pds-section-header">
            <span className="pds-eyebrow">Transformation</span>
            <h2 className="pds-section-title">Before & After</h2>
          </div>
          <div className="pds-ba-grid">
            {BEFORE_AFTER.map((item, i) => (
              <div
                key={i}
                className={`pds-ba-card ${i === 0 ? 'pds-ba-before' : 'pds-ba-after'}`}
                style={{ '--ba-bg': item.bg, '--ba-accent': item.accent } as React.CSSProperties}
              >
                <div className="pds-ba-icon-wrap" style={{ color: item.accent }}>
                  {item.icon}
                </div>
                <span className="pds-ba-label" style={{ color: item.accent }}>{item.label}</span>
                <h3 className="pds-ba-title">{item.title}</h3>
                <p className="pds-ba-desc">{item.desc}</p>
                {i === 1 && (
                  <div className="pds-ba-checkmarks">
                    {['Wash-safe bond', 'Invisible finish', 'Lasts for months', 'No tailor needed'].map(c => (
                      <span key={c} className="pds-ba-check">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                          <polyline points="2,8 6,12 14,4"/>
                        </svg>
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 3 — FABRIC COMPATIBILITY ══ */}
      <section className="pds-section pds-fabric-section" ref={fabricRef} id="fabric-compatibility">
        <div className="container">
          <div className="pds-section-header">
            <span className="pds-eyebrow">Compatibility</span>
            <h2 className="pds-section-title">Works on these fabrics</h2>
            <p className="pds-section-sub">KapraFix bonds to most everyday garment and home fabrics.</p>
          </div>
          <div className="pds-fabric-grid">
            <div className="pds-fabric-group">
              <p className="pds-fabric-group-label pds-ok">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,7 5,11 13,3"/></svg>
                Compatible
              </p>
              <div className="pds-fabric-pills">
                {FABRICS.filter(f => f.works).map((f, i) => (
                  <span key={i} className="pds-fabric-pill pds-fabric-pill--ok">{f.name}</span>
                ))}
              </div>
            </div>
            <div className="pds-fabric-divider" />
            <div className="pds-fabric-group">
              <p className="pds-fabric-group-label pds-no">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/></svg>
                Not recommended
              </p>
              <div className="pds-fabric-pills">
                {FABRICS.filter(f => !f.works).map((f, i) => (
                  <span key={i} className="pds-fabric-pill pds-fabric-pill--no">{f.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 4 — TECHNICAL SPECS ══ */}
      <section className="pds-section pds-specs-section" ref={specsRef} id="specs">
        <div className="container">
          <div className="pds-specs-inner">
            <div className="pds-specs-left">
              <span className="pds-eyebrow pds-specs-headline">In the box</span>
              <h2 className="pds-section-title pds-specs-headline">Technical Specifications</h2>
              <p className="pds-section-sub pds-specs-headline">
                Engineered for precision bonding with everyday household irons.
              </p>
              <div className="pds-specs-badge pds-specs-headline">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M5 8l2 2 4-4"/></svg>
                <span>Sold & shipped from Pakistan</span>
              </div>
            </div>
            <div className="pds-specs-right">
              <div className="pds-specs-table">
                {SPECS.map((s, i) => (
                  <div key={i} className="pds-spec-row">
                    <span className="pds-spec-label">{s.label}</span>
                    <span className="pds-spec-value">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 5 — WHY KAPRAFIX ══ */}
      
    </>
  );
}
