import { NextRequest, NextResponse } from 'next/server';
import { createShopifyOrder } from '@/lib/shopifyAdmin';

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
