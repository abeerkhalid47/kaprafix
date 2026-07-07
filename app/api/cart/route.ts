import { NextRequest, NextResponse } from 'next/server';
import {
  createCart,
  addToCart,
  updateCartLine,
  removeCartLine,
} from '@/lib/shopify';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, cartId, variantId, lineId, quantity } = body;

    let cart = null;

    switch (action) {
      case 'create':
        cart = await createCart(variantId, quantity);
        break;
      case 'add':
        cart = await addToCart(cartId, variantId, quantity);
        break;
      case 'update':
        cart = await updateCartLine(cartId, lineId, quantity);
        break;
      case 'remove':
        cart = await removeCartLine(cartId, lineId);
        break;
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json({ cart });
  } catch (err) {
    console.error('[Cart API]', err);
    return NextResponse.json({ error: 'Cart error' }, { status: 500 });
  }
}
