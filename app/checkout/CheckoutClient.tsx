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
  AlertCircle,
  Building2,
  Copy,
  Check,
  Upload,
  X,
  MessageSquare,
  FileImage,
  Sparkles
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
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    province: 'Punjab',
    postalCode: '',
    note: '',
  });

  // Payment Method State: 'bank_transfer' (Rs. 80 delivery) or 'cod' (Rs. 200 delivery)
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cod'>('bank_transfer');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Receipt Screenshot Upload State
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadedReceiptUrl, setUploadedReceiptUrl] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Subtotal & Total: Bank Transfer = Rs. 80, COD = Rs. 200
  const subtotal = useMemo(() => {
    return checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [checkoutItems]);

  const shippingCost = paymentMethod === 'bank_transfer' ? 80 : 200;
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

  const handleCopy = (text: string, fieldName: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setReceiptError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setReceiptError('Screenshot file size must be under 10MB.');
      return;
    }

    setReceiptFile(file);
    const localUrl = URL.createObjectURL(file);
    setReceiptPreview(localUrl);

    // Automatically upload to server
    setIsUploadingReceipt(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload-receipt', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setUploadedReceiptUrl(data.url);
      } else {
        throw new Error(data.error || 'Failed to upload screenshot');
      }
    } catch (err: any) {
      console.warn('Screenshot upload background error:', err);
      // Keep local preview, will retry or fallback upon order placement
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    setUploadedReceiptUrl(null);
    setReceiptError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Track AddPaymentInfo on user interaction with checkout form
    if (!paymentTracked) {
      setPaymentTracked(true);
      trackAddPaymentInfo({
        content_ids: checkoutItems.map((item) => item.id),
        contents: checkoutItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          item_price: item.price,
          title: item.title,
        })),
        value: totalAmount,
        currency: 'PKR',
        payment_type: paymentMethod === 'bank_transfer' ? 'Direct Bank Transfer' : 'Cash on Delivery',
        userData: {
          ph: formData.phone,
          em: formData.email,
          fn: formData.firstName.trim(),
          ln: formData.lastName.trim(),
          ct: formData.city,
          st: formData.province,
          country: 'pk',
        },
      });
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Form Validations
    if (!formData.firstName.trim()) {
      setFormError('Please enter your first name.');
      return;
    }

    if (!formData.lastName.trim()) {
      setFormError('Please enter your last name.');
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

    // Bank transfer proof validation: STRICTLY REQUIRED FOR ONLINE PAYMENT
    if (paymentMethod === 'bank_transfer') {
      if (!receiptFile && !uploadedReceiptUrl) {
        setReceiptError('Payment screenshot is strictly required when paying online. Please upload your transfer slip/receipt.');
        setFormError('Please attach your payment screenshot below to complete your order.');
        const uploadBox = document.getElementById('receipt-upload-box');
        uploadBox?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          fileInputRef.current?.click();
        }, 300);
        return;
      }
    }

    // Ensure AddPaymentInfo is tracked before order dispatch
    if (!paymentTracked) {
      setPaymentTracked(true);
      trackAddPaymentInfo({
        content_ids: checkoutItems.map((item) => item.id),
        contents: checkoutItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          item_price: item.price,
          title: item.title,
        })),
        value: totalAmount,
        currency: 'PKR',
        payment_type: paymentMethod === 'bank_transfer' ? 'Direct Bank Transfer' : 'Cash on Delivery',
        userData: {
          ph: cleanPhone,
          em: formData.email.trim(),
          fn: formData.firstName.trim(),
          ln: formData.lastName.trim(),
          ct: formData.city.trim(),
          st: formData.province,
          country: 'pk',
        },
      });
    }

    setIsSubmitting(true);

    try {
      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();

      // If Bank Transfer and receipt hasn't finished uploading yet, upload now
      let finalReceiptUrl = uploadedReceiptUrl;
      if (paymentMethod === 'bank_transfer' && !finalReceiptUrl && receiptFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', receiptFile);
        const upRes = await fetch('/api/upload-receipt', {
          method: 'POST',
          body: uploadFormData,
        });
        const upData = await upRes.json();
        if (upRes.ok && upData.url) {
          finalReceiptUrl = upData.url;
        } else {
          throw new Error(upData.error || 'Failed to upload screenshot. Please try again.');
        }
      }

      if (paymentMethod === 'bank_transfer' && !finalReceiptUrl) {
        setReceiptError('Receipt screenshot is required. Please attach your payment screenshot.');
        setFormError('Receipt image is required for online bank transfer. Please attach your screenshot.');
        setIsSubmitting(false);
        return;
      }

      const defaultNote = paymentMethod === 'bank_transfer'
        ? 'Direct Bank Transfer (Meezan Bank - Abeer Khalid)'
        : 'Cash on Delivery (Website Order)';

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
        note: formData.note.trim() ? `${formData.note.trim()} | ${defaultNote}` : defaultNote,
        totalPrice: totalAmount,
        paymentMethod,
        shippingFee: shippingCost,
        receiptUrl: finalReceiptUrl,
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
        paymentMethod: paymentMethod,
        shippingFee: shippingCost,
        receiptUrl: finalReceiptUrl,
        customer: {
          name: `${firstName} ${lastName}`.trim(),
          firstName,
          lastName,
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
        paymentMethod: paymentMethod,
        shipping: shippingCost.toString(),
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
            Shipping & Payment
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
                  {/* First & Last Name Fields (Separated) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                        First Name <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="e.g. Muhammad"
                        required
                        value={formData.firstName}
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

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
                        Last Name <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        placeholder="e.g. Ali"
                        required
                        value={formData.lastName}
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
              <div 
                id="payment-method-card"
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow)',
                }}
              >
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
                      Select how you would like to pay for your order.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* OPTION 1: Bank Transfer (Discounted Delivery Rs. 80) */}
                  <div 
                    onClick={() => setPaymentMethod('bank_transfer')}
                    style={{
                      borderRadius: '14px',
                      border: paymentMethod === 'bank_transfer' ? '2px solid #16a34a' : '1px solid var(--border)',
                      background: paymentMethod === 'bank_transfer' ? '#f0fdf4' : '#fafafa',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: paymentMethod === 'bank_transfer' ? '6px solid #16a34a' : '2px solid #cbd5e1',
                        background: '#fff',
                        marginTop: '3px',
                        flexShrink: 0,
                      }} />

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building2 size={17} color="#16a34a" />
                            Direct Bank Transfer (Advance)
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            background: '#16a34a',
                            color: '#fff',
                            padding: '3px 9px',
                            borderRadius: '20px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}>
                            <Sparkles size={11} /> Delivery Rs. 80 only (Save Rs. 120!)
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#475569', marginTop: '6px', lineHeight: 1.4 }}>
                          Transfer Rs. {totalAmount.toLocaleString()} directly via any bank app, Easypaisa, JazzCash, SadaPay or NayaPay. Delivery fee is discounted from <span style={{ textDecoration: 'line-through' }}>Rs. 200</span> to <strong>Rs. 80</strong>!
                        </p>
                      </div>
                    </div>

                    {/* Expanded Bank Account Details & Screenshot Uploader */}
                    {paymentMethod === 'bank_transfer' && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          marginTop: '16px',
                          paddingTop: '16px',
                          borderTop: '1px solid #bbf7d0',
                        }}
                      >
                        {/* Bank Details Card */}
                        <div style={{
                          background: '#ffffff',
                          border: '1px solid #86efac',
                          borderRadius: '12px',
                          padding: '16px',
                          boxShadow: '0 2px 6px rgba(22, 163, 74, 0.08)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px dashed #dcfce7', paddingBottom: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#166534', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                              🏦 Meezan Bank Limited
                            </span>
                            <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>
                              Amount: <strong>Rs. {totalAmount.toLocaleString()}</strong>
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                            {/* Account Title */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <div>
                                <span style={{ color: '#64748b', fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Account Title</span>
                                <strong style={{ color: '#0f172a', fontSize: '14px' }}>ABEER KHALID</strong>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy('ABEER KHALID', 'title')}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: '#fff',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: copiedField === 'title' ? '#16a34a' : '#475569',
                                  cursor: 'pointer',
                                }}
                              >
                                {copiedField === 'title' ? <Check size={14} /> : <Copy size={14} />}
                                {copiedField === 'title' ? 'Copied!' : 'Copy'}
                              </button>
                            </div>

                            {/* Account Number */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <div>
                                <span style={{ color: '#64748b', fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Account Number</span>
                                <strong style={{ color: '#0f172a', fontSize: '14px', letterSpacing: '0.03em' }}>00300115740934</strong>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy('00300115740934', 'accountNumber')}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: '#fff',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: copiedField === 'accountNumber' ? '#16a34a' : '#475569',
                                  cursor: 'pointer',
                                }}
                              >
                                {copiedField === 'accountNumber' ? <Check size={14} /> : <Copy size={14} />}
                                {copiedField === 'accountNumber' ? 'Copied!' : 'Copy'}
                              </button>
                            </div>

                            {/* IBAN */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <div>
                                <span style={{ color: '#64748b', fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>IBAN</span>
                                <strong style={{ color: '#0f172a', fontSize: '13px', letterSpacing: '0.02em', wordBreak: 'break-all' }}>PK68MEZN0000300115740934</strong>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy('PK68MEZN0000300115740934', 'iban')}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: '#fff',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: copiedField === 'iban' ? '#16a34a' : '#475569',
                                  cursor: 'pointer',
                                }}
                              >
                                {copiedField === 'iban' ? <Check size={14} /> : <Copy size={14} />}
                                {copiedField === 'iban' ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Screenshot Upload Dropzone (Strictly Required) */}
                        <div id="receipt-upload-box" style={{ marginTop: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: receiptError ? '#dc2626' : '#166534' }}>
                              Payment Screenshot / Receipt <span style={{ color: '#dc2626' }}>* (Strictly Required)</span>
                            </label>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              background: receiptError ? '#fee2e2' : '#dcfce7',
                              color: receiptError ? '#dc2626' : '#15803d',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              border: receiptError ? '1px solid #fca5a5' : '1px solid #bbf7d0',
                            }}>
                              {receiptError ? '⚠️ Receipt Missing' : 'Required for Bank Transfer'}
                            </span>
                          </div>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                          />

                          {!receiptPreview ? (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              style={{
                                border: receiptError ? '2px dashed #ef4444' : '2px dashed #86efac',
                                borderRadius: '12px',
                                padding: '22px 16px',
                                textAlign: 'center',
                                background: receiptError ? '#fef2f2' : '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: receiptError ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                              }}
                            >
                              <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                background: receiptError ? '#fee2e2' : '#dcfce7',
                                color: receiptError ? '#dc2626' : '#16a34a',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '8px',
                              }}>
                                <Upload size={22} style={{ margin: 'auto' }} />
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: receiptError ? '#991b1b' : '#0f172a' }}>
                                Tap to attach payment screenshot <span style={{ color: '#dc2626' }}>*</span>
                              </div>
                              <div style={{ fontSize: '12px', color: receiptError ? '#b91c1c' : '#64748b', marginTop: '4px' }}>
                                PNG, JPG, or WEBP (Max 10MB) • Upload proof of transfer
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              background: '#ffffff',
                              border: '1px solid #bbf7d0',
                              borderRadius: '12px',
                              padding: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                <img
                                  src={receiptPreview}
                                  alt="Receipt preview"
                                  style={{
                                    width: '56px',
                                    height: '56px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    flexShrink: 0,
                                  }}
                                />
                                <div style={{ minWidth: 0 }}>
                                  <div style={{
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: '#0f172a',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}>
                                    {receiptFile?.name || 'receipt-screenshot.jpg'}
                                  </div>
                                  <div style={{ fontSize: '11px', marginTop: '2px' }}>
                                    {isUploadingReceipt ? (
                                      <span style={{ color: '#d97706', fontWeight: 600 }}>
                                        Uploading to server...
                                      </span>
                                    ) : uploadedReceiptUrl ? (
                                      <span style={{ color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                        <Check size={12} /> Receipt verified & attached
                                      </span>
                                    ) : (
                                      <span style={{ color: '#16a34a', fontWeight: 600 }}>
                                        Ready to attach
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleRemoveReceipt}
                                title="Remove screenshot"
                                style={{
                                  background: '#fee2e2',
                                  border: 'none',
                                  color: '#dc2626',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                }}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}

                          {receiptError && (
                            <div style={{
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#991b1b',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              marginTop: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontWeight: 600,
                            }}>
                              <AlertCircle size={16} style={{ flexShrink: 0 }} />
                              <span>{receiptError}</span>
                            </div>
                          )}
                        </div>

                        {/* WhatsApp bank transfer helper */}
                        <div style={{ marginTop: '12px', fontSize: '12px', color: '#166534', background: '#dcfce7', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                          <span>Need help sending transfer or receipt?</span>
                          <a
                            href={`https://wa.me/923177299713?text=${encodeURIComponent(`Assalam-o-Alaikum! I am paying via bank transfer for my Kaprafix order. Amount: Rs. ${totalAmount}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#15803d', fontWeight: 700, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <MessageSquare size={13} /> Message on WhatsApp
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* OPTION 2: Cash on Delivery (COD - Rs. 200 delivery) */}
                  <div 
                    onClick={() => setPaymentMethod('cod')}
                    style={{
                      borderRadius: '14px',
                      border: paymentMethod === 'cod' ? '2px solid var(--accent)' : '1px solid var(--border)',
                      background: paymentMethod === 'cod' ? 'var(--accent-light)' : '#fafafa',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: paymentMethod === 'cod' ? '6px solid var(--accent)' : '2px solid #cbd5e1',
                        background: '#fff',
                        marginTop: '3px',
                        flexShrink: 0,
                      }} />

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>
                            Cash on Delivery (COD)
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            background: '#e2e8f0',
                            color: '#475569',
                            padding: '3px 9px',
                            borderRadius: '20px',
                            textTransform: 'uppercase',
                          }}>
                            Delivery Fee: Rs. 200
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                          Pay with cash when courier delivers your package to your doorstep. Open parcel allowed before paying.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Submit CTA Button */}
              <div style={{ marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingReceipt}
                  className="btn-luxury btn-luxury-primary"
                  style={{
                    width: '100%',
                    height: '56px',
                    fontSize: '16px',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    boxShadow: paymentMethod === 'bank_transfer'
                      ? '0 8px 24px rgba(22, 163, 74, 0.3)'
                      : '0 8px 24px rgba(95, 143, 110, 0.3)',
                    cursor: (isSubmitting || isUploadingReceipt) ? 'not-allowed' : 'pointer',
                    opacity: (isSubmitting || isUploadingReceipt) ? 0.8 : 1,
                    background: paymentMethod === 'bank_transfer' ? '#16a34a' : undefined,
                    borderColor: paymentMethod === 'bank_transfer' ? '#16a34a' : undefined,
                  }}
                >
                  {isSubmitting ? (
                    <span>Placing Your Order...</span>
                  ) : isUploadingReceipt ? (
                    <span>Uploading Screenshot...</span>
                  ) : paymentMethod === 'bank_transfer' ? (
                    !receiptFile && !uploadedReceiptUrl ? (
                      <span>📸 Attach Receipt to Complete Order — Rs. {totalAmount.toLocaleString()}</span>
                    ) : (
                      <span>✓ Complete Order (Bank Transfer) — Rs. {totalAmount.toLocaleString()}</span>
                    )
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

                {/* Direct WhatsApp Support Helper Banner */}
                <div style={{
                  marginTop: '18px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#25D366',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#166534' }}>
                        Facing any issue placing your order?
                      </div>
                      <div style={{ fontSize: '12px', color: '#15803d' }}>
                        Contact us on WhatsApp for instant assistance or order via chat.
                      </div>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/923177299713?text=Assalam-o-Alaikum!%20I%20am%20having%20trouble%20placing%20my%20order%20on%20Kaprafix.%20Please%20help."
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#25D366',
                      color: '#ffffff',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0,
                    }}
                  >
                    <MessageSquare size={15} />
                    <span>Chat on WhatsApp</span>
                  </a>
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

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
                  <span>Delivery Fee</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: paymentMethod === 'bank_transfer' ? '#16a34a' : 'var(--text)', fontWeight: 600 }}>
                      Rs. {shippingCost}
                    </span>
                    {paymentMethod === 'bank_transfer' ? (
                      <span style={{
                        display: 'inline-block',
                        marginLeft: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: '#dcfce7',
                        color: '#15803d',
                        padding: '1px 6px',
                        borderRadius: '10px',
                      }}>
                        Save Rs. 120
                      </span>
                    ) : null}
                  </div>
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
                  <span>Total ({paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'})</span>
                  <span style={{ color: paymentMethod === 'bank_transfer' ? '#16a34a' : 'var(--text)' }}>
                    Rs. {totalAmount.toLocaleString()}
                  </span>
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
