import { NextRequest, NextResponse } from 'next/server';
import {
  createCart,
  addToCart,
  updateCartLine,
  removeCartLine,
} from '@/lib/shopify';

function getMockCartFromCookie(req: NextRequest) {
  const cookie = req.cookies.get('mock_cart');
  if (cookie) {
    try {
      return JSON.parse(cookie.value);
    } catch {
      return null;
    }
  }
  return null;
}

function setMockCartCookie(res: NextResponse, cart: any) {
  res.cookies.set('mock_cart', JSON.stringify(cart), {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, cartId, variantId, lineId, quantity } = body;

    const isMock = !process.env.SHOPIFY_STORE_DOMAIN || 
                   !process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || 
                   process.env.SHOPIFY_STORE_DOMAIN === 'your-store.myshopify.com';

    if (isMock) {
      let cart = getMockCartFromCookie(req);

      if (!cart) {
        cart = {
          id: 'mock-cart-id',
          checkoutUrl: 'https://checkout.easyfittape.pk/mock-checkout',
          lines: [],
          totalAmount: { amount: '0.00', currencyCode: 'PKR' }
        };
      }

      if (action === 'create' || action === 'add') {
        const existingLineIdx = cart.lines.findIndex((l: any) => l.merchandise.id === variantId);
        if (existingLineIdx > -1) {
          cart.lines[existingLineIdx].quantity += quantity;
        } else {
          cart.lines.push({
            id: `mock-line-${Date.now()}`,
            quantity: quantity,
            merchandise: {
              id: variantId || 'mock-variant-id',
              title: 'Default Title',
              price: { amount: '999.00', currencyCode: 'PKR' },
              product: {
                title: 'Kaprafix — No-Stitch Hem Tape',
                imageUrl: '/images/product-1.png',
                imageAlt: 'Kaprafix Hem Tape Roll'
              }
            }
          });
        }
      } else if (action === 'update') {
        const lineIdx = cart.lines.findIndex((l: any) => l.id === lineId);
        if (lineIdx > -1) {
          cart.lines[lineIdx].quantity = quantity;
        }
      } else if (action === 'remove') {
        cart.lines = cart.lines.filter((l: any) => l.id !== lineId);
      }

      const total = cart.lines.reduce((sum: number, l: any) => {
        return sum + parseFloat(l.merchandise.price.amount) * l.quantity;
      }, 0);
      cart.totalAmount.amount = total.toFixed(2);

      const response = NextResponse.json({ cart });
      setMockCartCookie(response, cart);
      return response;
    }

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
