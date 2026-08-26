'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { type ShopifyProduct, formatPrice, getDiscountPercent } from '@/lib/shopify';
import { trackInitiateCheckout, trackAddPaymentInfo } from '@/lib/pixel';
import { 
  ShieldCheck, 
  Truck, 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  Package, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa (KPK)',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Jammu and Kashmir (AJK)',
  'Gilgit-Baltistan',
];

interface CheckoutClientProps {
  product: ShopifyProduct;
}

export default function CheckoutClient({ product }: CheckoutClientProps) {
  const router = useRouter();
  const { cart, clearCart } = useCart();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    province: 'Punjab',
    postalCode: '',
    note: '',
  });

  // Direct checkout fallback variant (if cart is empty)
  const [fallbackVariantId, setFallbackVariantId] = useState<string>(
    product.variants[1]?.id || product.variants[0]?.id || 'mock-variant-pack-3'
  );
  const [fallbackQty, setFallbackQty] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [paymentTracked, setPaymentTracked] = useState(false);
  const hasTrackedInit = useRef(false);

  // Check if we have active cart lines, otherwise use fallback product variant
  const hasCartItems = Boolean(cart && cart.lines && cart.lines.length > 0);

  // Calculate order items
  const checkoutItems = useMemo(() => {
    if (hasCartItems && cart) {
      return cart.lines.map((line) => ({
        id: line.merchandise.id,
        title: line.merchandise.product.title,
        variantTitle: line.merchandise.title,
        quantity: line.quantity,
        price: parseFloat(line.merchandise.price.amount) || 0,
        currency: line.merchandise.price.currencyCode || 'PKR',
        imageUrl: line.merchandise.product.imageUrl || product.images[0]?.url || '/images/product-1.png',
      }));
    }

    const selectedVar =
      product.variants.find((v) => v.id === fallbackVariantId) || product.variants[0];
    const priceNum = selectedVar ? parseFloat(selectedVar.price.amount) : 999;

    return [
      {
        id: selectedVar?.id || 'default-var',
        title: product.title,
        variantTitle: selectedVar?.title || 'Selected Package',
        quantity: fallbackQty,
        price: priceNum,
        currency: selectedVar?.price.currencyCode || 'PKR',
        imageUrl: product.images[0]?.url || '/images/product-1.png',
      },
    ];
  }, [hasCartItems, cart, product, fallbackVariantId, fallbackQty]);

  // Subtotal & Total
  const subtotal = useMemo(() => {
    return checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [checkoutItems]);

  const shippingCost = 200; // Rs. 200 Standard Delivery
  const totalAmount = subtotal + shippingCost;

  // Fire InitiateCheckout on Mount
  useEffect(() => {
    if (!hasTrackedInit.current && checkoutItems.length > 0) {
      hasTrackedInit.current = true;
      trackInitiateCheckout({
        content_ids: checkoutItems.map((item) => item.id),
        contents: checkoutItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          item_price: item.price,
          title: item.title,
        })),
        num_items: checkoutItems.reduce((sum, item) => sum + item.quantity, 0),
        value: totalAmount,
        currency: 'PKR',
      });
    }
  }, [checkoutItems, totalAmount]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Track AddPaymentInfo when user starts entering address details
    if (!paymentTracked && (name === 'phone' || name === 'address')) {
      setPaymentTracked(true);
      trackAddPaymentInfo({
        content_ids: checkoutItems.map((item) => item.id),
        contents: checkoutItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          item_price: item.price,
        })),
        value: totalAmount,
        currency: 'PKR',
        payment_type: 'Cash on Delivery',
      });
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Form Validations
    if (!formData.fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    const cleanPhone = formData.phone.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setFormError('Please enter a valid Pakistani mobile number (e.g. 0300 1234567).');
      return;
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      setFormError('Please enter your complete delivery street address / house number.');
      return;
    }

    if (!formData.city.trim()) {
      setFormError('Please enter your city.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Split name into first and last
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || '';

      const payload = {
        customer: {
          firstName,
          lastName,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        },
        shippingAddress: {
          firstName,
          lastName,
          phone: formData.phone.trim(),
          address1: formData.address.trim(),
          city: formData.city.trim(),
          province: formData.province.trim(),
          zip: formData.postalCode.trim(),
          country: 'Pakistan',
        },
        lineItems: checkoutItems.map((item) => ({
          variantId: item.id,
          quantity: item.quantity,
          price: item.price.toString(),
          title: `${item.title}${item.variantTitle ? ` (${item.variantTitle})` : ''}`,
        })),
        note: formData.note.trim() || 'Cash on Delivery (Website Order)',
        totalPrice: totalAmount,
      };

      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete order. Please try again.');
      }

      // Store order details in sessionStorage for the thank-you screen
      const orderSummaryData = {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        totalPrice: totalAmount,
        currency: 'PKR',
        customer: {
          name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          province: formData.province,
        },
        items: checkoutItems,
        createdAt: new Date().toISOString(),
      };

      sessionStorage.setItem('kaprafix_latest_order', JSON.stringify(orderSummaryData));

      // Clear local cart
      clearCart();

      // Navigate to Thank You page
      const searchParams = new URLSearchParams({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        value: totalAmount.toString(),
        name: firstName,
      });

      router.push(`/thank-you?${searchParams.toString()}`);
    } catch (err: any) {
      console.error('Order error:', err);
      setFormError(err?.message || 'Something went wrong while placing your order. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page-root" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Checkout Top Bar */}
      <header className="checkout-header" style={{
        background: '#fff',
        borderBottom: '1px solid var(--border)',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1120px',
        }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>
            <ArrowLeft size={18} />
            <span>Back to Store</span>
          </Link>

          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 800,
              fontSize: '22px',
              letterSpacing: '-0.03em',
              color: 'var(--text)',
              textTransform: 'uppercase',
            }}>
              Kapra<span style={{ color: 'var(--accent)' }}>fix</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>
            <Lock size={15} />
            <span>256-bit Secure</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Container */}
      <main className="container" style={{ maxWidth: '1120px', padding: '32px 16px 80px' }}>
        {/* Step Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '32px',
          fontSize: '13px',
          fontWeight: 600,
        }}>
          <span style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="var(--accent)" /> Cart
          </span>
          <ChevronRight size={14} color="var(--text-light)" />
          <span style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'var(--accent)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
            }}>2</span>
            Shipping & Payment (COD)
          </span>
          <ChevronRight size={14} color="var(--text-light)" />
          <span style={{ color: 'var(--text-light)' }}>3. Confirmation</span>
        </div>

        <div className="checkout-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}>
          {/* Left Column: Form Information */}
          <div className="checkout-form-container">
            <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Alert Error Box */}
              {formError && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  fontSize: '14px',
                  lineHeight: 1.5,
                }}>
                  <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>{formError}</div>
                </div>
              )}

              {/* 1. Contact & Delivery Card */}
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}>
                    1
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
                      Shipping & Contact Details
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Enter where we should deliver your Kaprafix package.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Full Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                      Full Name <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="e.g. Muhammad Ali"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        background: '#fafafa',
                      }}
                    />
                  </div>

                  {/* Phone & WhatsApp */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                      Mobile / WhatsApp Number <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="0300 1234567"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '12px 14px 12px 48px',
                          borderRadius: '10px',
                          border: '1px solid var(--border)',
                          fontSize: '15px',
                          outline: 'none',
                          background: '#fafafa',
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                      }}>
                        🇵🇰
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                      Rider will call on this number for delivery coordinates.
                    </span>
                  </div>

                  {/* Complete Street Address */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                      Complete Delivery Address <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder="House / Apartment #, Street #, Sector / Area / Landmark"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        fontSize: '15px',
                        outline: 'none',
                        background: '#fafafa',
                      }}
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                      City <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Enter city (e.g. Karachi, Lahore, Islamabad)"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        fontSize: '15px',
                        outline: 'none',
                        background: '#fafafa',
                      }}
                    />
                  </div>

                  {/* Province & Optional Postal Code */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                        Province
                      </label>
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--border)',
                          fontSize: '14px',
                          background: '#fafafa',
                          outline: 'none',
                        }}
                      >
                        {PROVINCES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="you@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--border)',
                          fontSize: '14px',
                          outline: 'none',
                          background: '#fafafa',
                        }}
                      />
                    </div>
                  </div>

                  {/* Delivery Note */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      name="note"
                      placeholder="e.g. Call before coming, leave at gate, or deliver after 3 PM"
                      rows={2}
                      value={formData.note}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        fontSize: '14px',
                        outline: 'none',
                        background: '#fafafa',
                        resize: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Payment Method Card */}
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}>
                    2
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
                      Payment Method
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Pay safely at your doorstep in cash.
                    </p>
                  </div>
                </div>

                {/* COD Card */}
                <div style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '2px solid var(--accent)',
                  background: 'var(--accent-light)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: '6px solid var(--accent)',
                    background: '#fff',
                    marginTop: '2px',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>
                        Cash on Delivery (COD)
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        background: 'var(--accent)',
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        textTransform: 'uppercase',
                      }}>
                        Recommended
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                      Pay with cash when your parcel is delivered to your address. Check the parcel and hand over payment to courier.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit CTA Button */}
              <div style={{ marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-luxury btn-luxury-primary"
                  style={{
                    width: '100%',
                    height: '56px',
                    fontSize: '16px',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    boxShadow: '0 8px 24px rgba(95, 143, 110, 0.3)',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.8 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <span>Placing Your Order...</span>
                  ) : (
                    <span>Place Order (Cash on Delivery) — Rs. {totalAmount.toLocaleString()}</span>
                  )}
                </button>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  marginTop: '14px',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Truck size={14} /> 2–3 Working Days
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={14} /> Money-back Guarantee
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Package size={14} /> Open Parcel Allowed
                  </span>
                </div>
              </div>

            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="checkout-summary-container" style={{ position: 'sticky', top: '90px' }}>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)',
            }}>
              <h3 style={{
                fontSize: '17px',
                fontWeight: 700,
                color: 'var(--text)',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span>Order Summary</span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
                  {checkoutItems.reduce((s, i) => s + i.quantity, 0)} {checkoutItems.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'items'}
                </span>
              </h3>

              {/* Bundle Switcher if starting direct checkout */}
              {!hasCartItems && product.variants.length > 1 && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    Choose Package Deal:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {product.variants.map((v) => {
                      const isSel = v.id === fallbackVariantId;
                      const disc = getDiscountPercent(v.price, v.compareAtPrice);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setFallbackVariantId(v.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: isSel ? '2px solid var(--accent)' : '1px solid var(--border)',
                            background: isSel ? 'var(--accent-light)' : '#fafafa',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                              {v.title}
                            </div>
                            {disc && (
                              <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600 }}>
                                Save {disc}%
                              </div>
                            )}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>
                            {formatPrice(v.price)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* List of items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {checkoutItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{
                      position: 'relative',
                      width: '64px',
                      height: '64px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid var(--border)',
                      flexShrink: 0,
                      background: '#f4f4f4',
                    }}>
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(0,0,0,0.75)',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 700,
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {item.quantity}
                      </span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {item.variantTitle}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '14px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Shipping Fee</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>Rs. {shippingCost}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'var(--text)',
                  fontWeight: 800,
                  fontSize: '18px',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '14px',
                  marginTop: '4px',
                }}>
                  <span>Total (Cash on Delivery)</span>
                  <span style={{ color: 'var(--text)' }}>Rs. {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Customer Guarantee Callout */}
              <div style={{
                marginTop: '20px',
                padding: '14px',
                borderRadius: '10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                color: '#475569',
                lineHeight: 1.5,
              }}>
                <strong style={{ color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                  💯 100% Risk-Free Guarantee
                </strong>
                If you are not satisfied with Kaprafix tape, message our WhatsApp helpline for an immediate replacement or full refund.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
