'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { trackPurchase } from '@/lib/pixel';
import { 
  CheckCircle2, 
  Truck, 
  Phone, 
  MessageSquare, 
  Package, 
  Calendar, 
  ArrowRight, 
  ShieldCheck,
  MapPin
} from 'lucide-react';

export default function ThankYouClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const orderNumber = searchParams.get('orderNumber') || `#${orderId.slice(-4) || '1001'}`;
  const totalValueParam = searchParams.get('value') || '0';
  const customerName = searchParams.get('name') || 'Valued Customer';

  const [orderData, setOrderData] = useState<any>(null);
  const purchaseTracked = useRef(false);

  useEffect(() => {
    let parsedCached: any = null;
    try {
      const cached = sessionStorage.getItem('kaprafix_latest_order');
      if (cached) {
        parsedCached = JSON.parse(cached);
        setOrderData(parsedCached);
      }
    } catch (e) {
      console.warn('[ThankYou] Could not read cached order data:', e);
    }

    if (purchaseTracked.current) return;
    const effectiveOrderId = orderNumber || orderId;
    if (!effectiveOrderId) return;

    const dedupeKey = `kaprafix_pixel_purchased_${effectiveOrderId}`;
    const alreadyTracked = typeof window !== 'undefined' && sessionStorage.getItem(dedupeKey);

    if (!alreadyTracked) {
      purchaseTracked.current = true;
      try {
        sessionStorage.setItem(dedupeKey, 'true');
      } catch {
        // ignore
      }

      const totalVal =
        parseFloat(totalValueParam) ||
        (parsedCached?.totalPrice ? parseFloat(parsedCached.totalPrice) : 0) ||
        1199;

      const itemsList = parsedCached?.items || [];
      const contentIds = itemsList.length > 0 ? itemsList.map((i: any) => String(i.id)) : ['kaprafix-hem-tape'];
      const contents =
        itemsList.length > 0
          ? itemsList.map((i: any) => ({
              id: String(i.id),
              quantity: Number(i.quantity) || 1,
              item_price: parseFloat(i.price) || 0,
              title: i.title,
            }))
          : [
              {
                id: 'kaprafix-hem-tape',
                quantity: 1,
                item_price: totalVal,
                title: 'Kaprafix Easy Fit Tape',
              },
            ];
      const numItems = itemsList.reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0) || 1;

      trackPurchase({
        content_ids: contentIds,
        contents: contents,
        num_items: numItems,
        value: totalVal,
        currency: 'PKR',
        order_id: effectiveOrderId,
        userData: {
          fn: customerName !== 'Valued Customer' ? customerName : parsedCached?.customer?.name?.split(' ')[0],
          ph: parsedCached?.customer?.phone,
          em: parsedCached?.customer?.email,
          ct: parsedCached?.customer?.city,
          st: parsedCached?.customer?.province,
          country: 'pk',
        },
      });
    }
  }, [orderId, orderNumber, totalValueParam, customerName]);

  const finalTotal = parseFloat(totalValueParam) || (orderData?.totalPrice ? parseFloat(orderData.totalPrice) : 0);
  const waMessage = encodeURIComponent(
    `Assalam-o-Alaikum! I have placed an order for Kaprafix Hem Tape.\nOrder Number: ${orderNumber}\nTotal: Rs. ${finalTotal.toLocaleString()}\nName: ${customerName}`
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 16px 80px' }}>
      <div className="container" style={{ maxWidth: '780px', margin: '0 auto' }}>
        
        {/* Success Card */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '36px 28px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
        }}>
          {/* Animated Icon */}
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: '#dcfce7',
            color: '#16a34a',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <CheckCircle2 size={44} />
          </div>

          <span style={{
            display: 'inline-block',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--accent)',
            background: 'var(--accent-light)',
            padding: '4px 12px',
            borderRadius: '20px',
            marginBottom: '12px',
          }}>
            Order Confirmed
          </span>

          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
          }}>
            Thank You, {customerName}!
          </h1>

          <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Your order has been received and is being prepared for dispatch. Our delivery partner will deliver to your doorstep within <strong>2–3 working days</strong>.
          </p>

          {/* Order ID Pill */}
          <div style={{
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '14px 20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '28px',
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
                Order Number
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                {orderNumber}
              </div>
            </div>
            <div style={{ height: '30px', width: '1px', background: '#cbd5e1' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
                Payment (Cash on Delivery)
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)' }}>
                Rs. {finalTotal.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div style={{
            background: '#fafaf8',
            borderRadius: '14px',
            padding: '20px',
            textAlign: 'left',
            marginBottom: '28px',
            border: '1px solid var(--border)',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} color="var(--accent)" />
              What Happens Next?
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>1.</span>
                <span>Our dispatch team confirms & packages your order.</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>2.</span>
                <span>Rider will call your mobile before arriving.</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>3.</span>
                <span>Check parcel & pay cash upon delivery.</span>
              </div>
            </div>
          </div>

          {/* Customer & Item Details (if cached) */}
          {orderData && (
            <div style={{ textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '24px', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>
                Delivery Summary
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', fontSize: '13px' }}>
                <div style={{ background: '#fdfdfd', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="var(--accent)" /> Shipping Address
                  </div>
                  <div style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {orderData.customer?.name}<br />
                    {orderData.customer?.address}<br />
                    {orderData.customer?.city}, {orderData.customer?.province}
                  </div>
                </div>

                <div style={{ background: '#fdfdfd', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} color="var(--accent)" /> Contact Details
                  </div>
                  <div style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    Phone: {orderData.customer?.phone}<br />
                    {orderData.customer?.email && <>Email: {orderData.customer?.email}<br /></>}
                    Delivery: Standard Courier (Rs. 200)
                  </div>
                </div>
              </div>

              {/* Items List */}
              {orderData.items && orderData.items.length > 0 && (
                <div style={{ marginTop: '16px', borderTop: '1px dashed var(--border)', paddingTop: '16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Items in this package:
                  </div>
                  {orderData.items.map((it: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', padding: '6px 0' }}>
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>
                        {it.title} ({it.variantTitle || 'Standard'}) × {it.quantity}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>
                        Rs. {(it.price * it.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <a
              href={`https://wa.me/923177299713?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-luxury btn-luxury-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                height: '52px',
                fontSize: '15px',
                background: '#25D366',
                color: '#fff',
                borderColor: '#25D366',
              }}
            >
              <MessageSquare size={18} />
              <span>Track or Inquire on WhatsApp</span>
            </a>

            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px',
                fontSize: '14px',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              <span>Return to Home</span>
              <ArrowRight size={15} />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
