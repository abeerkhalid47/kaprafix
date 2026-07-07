'use client';
import { useState } from 'react';

const FAQS = [
  { q: 'Is Cash on Delivery (COD) available?', a: 'Yes! Cash on Delivery is available all across Pakistan. You only pay when you receive your order.' },
  { q: 'How long does delivery take?', a: 'Orders are typically delivered within 3–5 working days. You will receive a confirmation call before delivery.' },
  { q: 'How do I use Easy Fit Tape?', a: 'Simply cut the tape to the required length, place it inside the fabric fold, and press with a warm iron for 10–15 seconds. That\'s it — no sewing needed!' },
  { q: 'Will it hold after washing?', a: 'Yes! Easy Fit Tape creates a strong, durable bond that holds through regular washing. We recommend washing on a gentle cycle for best results.' },
  { q: 'What fabrics does it work on?', a: 'It works on most common fabrics including denim, cotton, polyester, chiffon, wool, and more. Not recommended for very delicate or heat-sensitive fabrics.' },
  { q: 'What if I\'m not satisfied with the product?', a: 'We stand behind our quality guarantee. If you\'re not satisfied, contact us on WhatsApp at 03177299713 and we\'ll make it right.' },
  { q: 'How much tape is in one roll?', a: 'Each roll contains enough tape to hem multiple garments. Exact length depends on the variant — check the product description for details.' },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="section" id="faq">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="section-header">
          <span className="label">FAQ</span>
          <h2 className="heading mt-4">Frequently Asked Questions</h2>
        </div>
        <div className="faq-list">
          {FAQS.map((item, i) => (
            <div key={i} className="faq-item">
              <button
                id={`faq-${i}`}
                className={`faq-question${open === i ? ' open' : ''}`}
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                {item.q}
                <span className="icon">+</span>
              </button>
              <div className={`faq-answer${open === i ? ' open' : ''}`} aria-hidden={open !== i}>
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
