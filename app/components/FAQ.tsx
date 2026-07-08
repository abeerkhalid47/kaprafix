'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Plus } from 'lucide-react';

const FAQS = [
  { q: 'Is Cash on Delivery (COD) available?', a: 'Yes! Cash on Delivery is available all across Pakistan. You only pay when you receive your order at your doorstep.' },
  { q: 'How long does delivery take?', a: 'Orders are typically delivered within 3–5 working days. You will receive a confirmation call before courier delivery.' },
  { q: 'How do I use Easy Fit Tape?', a: 'Simply cut the tape to length, place it inside the fabric fold, and press with a warm iron for 10–15 seconds — no sewing needed!' },
  { q: 'Will it hold after washing?', a: 'Yes! Easy Fit Tape creates a strong, durable bond that holds through regular machine washing. We recommend washing on a gentle cycle.' },
  { q: 'What fabrics does it work on?', a: 'It works on most common fabrics including denim, cotton, polyester, chiffon, wool, and more. Not recommended for very delicate or heat-sensitive fabrics.' },
  { q: 'What if I\'m not satisfied?', a: 'We stand behind our quality guarantee. If you\'re not satisfied, contact us on WhatsApp at 03177299713 and we\'ll make it right.' }
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="faq-simple-section" id="faq">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="section-header" style={{ marginBottom: 60 }}>
          <span className="label">FAQ</span>
          <h2 className="heading mt-4">Frequently Asked Questions</h2>
        </div>

        <div className="faq-simple-list">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="faq-simple-item">
                <button
                  className="faq-simple-question"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <motion.span 
                    className="faq-simple-icon"
                    animate={{ rotate: isOpen ? 135 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <Plus size={20} />
                  </motion.span>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="faq-simple-answer">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* WhatsApp Link below */}
        <div className="faq-simple-footer">
          <p>Still have a specific query?</p>
          <a 
            href="https://wa.me/923177299713" 
            target="_blank" 
            rel="noopener noreferrer"
            className="faq-whatsapp-btn"
          >
            <MessageCircle size={18} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
