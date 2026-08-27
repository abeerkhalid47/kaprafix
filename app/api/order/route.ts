import { NextRequest, NextResponse } from 'next/server';
import { createShopifyOrder } from '@/lib/shopifyAdmin';
import { sendMetaCapiEvent } from '@/lib/metaCapi';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, shippingAddress, lineItems, note, totalPrice } = body;

    // Validation
    if (!customer?.firstName || !customer?.phone) {
      return NextResponse.json(
        { error: 'Please provide full name and valid phone number.' },
        { status: 400 }
      );
    }

    if (!shippingAddress?.address1 || !shippingAddress?.city) {
      return NextResponse.json(
        { error: 'Please provide delivery address and city.' },
        { status: 400 }
      );
    }

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty. Please add items to checkout.' },
        { status: 400 }
      );
    }

    const orderResult = await createShopifyOrder({
      customer: {
        firstName: customer.firstName.trim(),
        lastName: customer.lastName?.trim() || '',
        email: customer.email?.trim() || '',
        phone: customer.phone.trim(),
      },
      shippingAddress: {
        firstName: shippingAddress.firstName?.trim() || customer.firstName.trim(),
        lastName: shippingAddress.lastName?.trim() || customer.lastName?.trim() || '',
        phone: shippingAddress.phone?.trim() || customer.phone.trim(),
        address1: shippingAddress.address1.trim(),
        address2: shippingAddress.address2?.trim() || '',
        city: shippingAddress.city.trim(),
        province: shippingAddress.province?.trim() || '',
        country: 'Pakistan',
        zip: shippingAddress.zip?.trim() || '',
      },
      lineItems: lineItems.map((item: any) => ({
        variantId: item.variantId || item.id,
        quantity: Number(item.quantity) || 1,
        price: item.price?.amount || item.price,
        title: item.title,
      })),
      note: note?.trim() || '',
      totalPrice: totalPrice,
    });

    if (!orderResult.success) {
      return NextResponse.json(
        { error: orderResult.error || 'Failed to place order.' },
        { status: 500 }
      );
    }

    // Extract user metadata for Meta Conversions API
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIpAddress = forwardedFor ? forwardedFor.split(',')[0]?.trim() : req.headers.get('x-real-ip') || '';
    const clientUserAgent = req.headers.get('user-agent') || '';
    const fbp = req.cookies.get('_fbp')?.value || null;
    const fbc = req.cookies.get('_fbc')?.value || null;
    const referer = req.headers.get('referer') || 'https://kaprafix.com/checkout';

    const orderTotalNum = parseFloat(orderResult.totalPrice) || (typeof totalPrice === 'number' ? totalPrice : parseFloat(totalPrice || '0'));
    const formattedContents = lineItems.map((item: any) => ({
      id: String(item.variantId || item.id || 'kaprafix-tape'),
      quantity: Number(item.quantity) || 1,
      item_price: parseFloat(item.price?.amount || item.price || '0'),
      title: item.title,
    }));
    const contentIds = lineItems.map((item: any) => String(item.variantId || item.id || 'kaprafix-tape'));
    const totalQuantity = lineItems.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 1), 0);

    const userPayload = {
      clientIpAddress,
      clientUserAgent,
      fbp,
      fbc,
      email: customer.email?.trim() || null,
      phone: customer.phone.trim(),
      firstName: customer.firstName.trim(),
      lastName: customer.lastName?.trim() || null,
      city: shippingAddress.city.trim(),
      province: shippingAddress.province?.trim() || 'Punjab',
      country: 'pk',
      zip: shippingAddress.zip?.trim() || null,
    };

    // Dispatch Meta Conversions API Server Events (non-blocking)
    const eventIdentifier = orderResult.orderNumber || orderResult.orderId;

    Promise.allSettled([
      // 1. AddPaymentInfo Server Event
      sendMetaCapiEvent({
        eventName: 'AddPaymentInfo',
        eventId: `pay_${eventIdentifier}`,
        eventSourceUrl: referer,
        user: userPayload,
        customData: {
          value: orderTotalNum,
          currency: 'PKR',
          content_type: 'product',
          content_ids: contentIds,
          contents: formattedContents,
          payment_type: 'Cash on Delivery',
        },
      }),

      // 2. Purchase Server Event
      sendMetaCapiEvent({
        eventName: 'Purchase',
        eventId: eventIdentifier, // Matches client-side eventID for deduplication
        eventSourceUrl: referer,
        user: userPayload,
        customData: {
          value: orderTotalNum,
          currency: 'PKR',
          content_type: 'product',
          content_ids: contentIds,
          contents: formattedContents,
          num_items: totalQuantity,
          order_id: eventIdentifier,
        },
      }),
    ]).catch((err) => {
      console.error('[Meta CAPI Dispatch Error]:', err);
    });

    return NextResponse.json({
      success: true,
      orderId: orderResult.orderId,
      orderNumber: orderResult.orderNumber,
      totalPrice: orderResult.totalPrice,
      currency: orderResult.currency,
      statusUrl: orderResult.statusUrl,
      isMock: orderResult.isMock,
    });
  } catch (error: any) {
    console.error('Error in /api/order:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred while placing order.' },
      { status: 500 }
    );
  }
}
