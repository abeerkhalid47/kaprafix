import {
  GET_PRODUCT_QUERY,
  CREATE_CART_MUTATION,
  ADD_TO_CART_MUTATION,
  UPDATE_CART_LINE_MUTATION,
  REMOVE_CART_LINE_MUTATION,
} from './queries';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ShopifyImage {
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyPrice {
  amount: string;
  currencyCode: string;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number;
  price: ShopifyPrice;
  compareAtPrice: ShopifyPrice | null;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  descriptionHtml: string;
  handle: string;
  images: ShopifyImage[];
  variants: ShopifyVariant[];
  priceRange: {
    minVariantPrice: ShopifyPrice;
    maxVariantPrice: ShopifyPrice;
  };
  compareAtPriceRange: {
    minVariantPrice: ShopifyPrice;
  };
}

export interface CartLineItem {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: ShopifyPrice;
    product: {
      title: string;
      imageUrl: string | null;
      imageAlt: string | null;
    };
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  lines: CartLineItem[];
  totalAmount: ShopifyPrice;
}

// ─── Mock Data (used when Shopify credentials not set) ───────────────────────

const MOCK_PRODUCT: ShopifyProduct = {
  id: 'mock-product-id',
  title: 'Easy Fit Tape — No-Stitch Hem Tape',
  description:
    'No-Stitch Hem Tape is a premium iron-on fabric adhesive designed to shorten, repair, and adjust clothing without the need for sewing. Whether your pants are too long, a skirt needs hemming, or a dress requires a quick adjustment, this tape creates a strong, clean, and nearly invisible bond in just minutes.',
  descriptionHtml: '<p>No-Stitch Hem Tape is a premium iron-on fabric adhesive.</p>',
  handle: 'easy-fit-tape',
  images: [
    { id: '1', url: '/images/product-1.png', altText: 'Easy Fit Tape Roll', width: 1024, height: 1024 },
    { id: '2', url: '/images/product-2.png', altText: 'How to use Easy Fit Tape', width: 1024, height: 1024 },
    { id: '3', url: '/images/product-3.png', altText: 'Before and After Results', width: 1024, height: 1024 },
  ],
  variants: [
    {
      id: 'mock-variant-id',
      title: 'Default Title',
      availableForSale: true,
      quantityAvailable: 99,
      price: { amount: '999.00', currencyCode: 'PKR' },
      compareAtPrice: { amount: '1999.00', currencyCode: 'PKR' },
    },
  ],
  priceRange: {
    minVariantPrice: { amount: '999.00', currencyCode: 'PKR' },
    maxVariantPrice: { amount: '999.00', currencyCode: 'PKR' },
  },
  compareAtPriceRange: {
    minVariantPrice: { amount: '1999.00', currencyCode: 'PKR' },
  },
};

// ─── API Client ───────────────────────────────────────────────────────────────

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const isMockMode =
  !domain ||
  !token ||
  domain === 'your-store.myshopify.com' ||
  token === 'your_storefront_access_token_here';

async function shopifyFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  if (isMockMode) {
    throw new Error('MOCK_MODE');
  }

  const endpoint = `https://${domain}/api/2024-10/graphql.json`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token!,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0]?.message ?? 'Shopify GraphQL error');
  }

  return json.data as T;
}

// ─── Product ─────────────────────────────────────────────────────────────────

function normalizeProduct(raw: Record<string, unknown>): ShopifyProduct {
  const product = raw as {
    id: string;
    title: string;
    description: string;
    descriptionHtml: string;
    handle: string;
    images: { edges: { node: ShopifyImage }[] };
    variants: { edges: { node: ShopifyVariant }[] };
    priceRange: ShopifyProduct['priceRange'];
    compareAtPriceRange: ShopifyProduct['compareAtPriceRange'];
  };
  return {
    ...product,
    images: product.images.edges.map((e) => e.node),
    variants: product.variants.edges.map((e) => e.node),
  };
}

export async function getProduct(handle?: string): Promise<ShopifyProduct> {
  const productHandle =
    handle ?? process.env.SHOPIFY_PRODUCT_HANDLE ?? 'easy-fit-tape';

  if (isMockMode) {
    return MOCK_PRODUCT;
  }

  try {
    const data = await shopifyFetch<{ product: Record<string, unknown> }>({
      query: GET_PRODUCT_QUERY,
      variables: { handle: productHandle },
    });

    if (!data.product) {
      throw new Error(`Product "${productHandle}" not found in Shopify`);
    }

    return normalizeProduct(data.product);
  } catch {
    return MOCK_PRODUCT;
  }
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

type RawCartData = {
  id: string;
  checkoutUrl: string;
  lines: {
    edges: {
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          price: ShopifyPrice;
          product: {
            title: string;
            images: { edges: { node: { url: string; altText: string | null } }[] };
          };
        };
      };
    }[];
  };
  cost: { totalAmount: ShopifyPrice };
};

function normalizeCart(raw: RawCartData): ShopifyCart {
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    lines: raw.lines.edges.map((e) => ({
      id: e.node.id,
      quantity: e.node.quantity,
      merchandise: {
        id: e.node.merchandise.id,
        title: e.node.merchandise.title,
        price: e.node.merchandise.price,
        product: {
          title: e.node.merchandise.product.title,
          imageUrl: e.node.merchandise.product.images.edges[0]?.node.url ?? null,
          imageAlt: e.node.merchandise.product.images.edges[0]?.node.altText ?? null,
        },
      },
    })),
    totalAmount: raw.cost.totalAmount,
  };
}

export async function createCart(
  variantId: string,
  quantity: number
): Promise<ShopifyCart | null> {
  if (isMockMode) return null;

  try {
    const data = await shopifyFetch<{ cartCreate: { cart: RawCartData } }>({
      query: CREATE_CART_MUTATION,
      variables: { lines: [{ merchandiseId: variantId, quantity }] },
    });
    return normalizeCart(data.cartCreate.cart);
  } catch {
    return null;
  }
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<ShopifyCart | null> {
  if (isMockMode) return null;

  try {
    const data = await shopifyFetch<{ cartLinesAdd: { cart: RawCartData } }>({
      query: ADD_TO_CART_MUTATION,
      variables: { cartId, lines: [{ merchandiseId: variantId, quantity }] },
    });
    return normalizeCart(data.cartLinesAdd.cart);
  } catch {
    return null;
  }
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<ShopifyCart | null> {
  if (isMockMode) return null;

  try {
    const data = await shopifyFetch<{ cartLinesUpdate: { cart: RawCartData } }>({
      query: UPDATE_CART_LINE_MUTATION,
      variables: { cartId, lines: [{ id: lineId, quantity }] },
    });
    return normalizeCart(data.cartLinesUpdate.cart);
  } catch {
    return null;
  }
}

export async function removeCartLine(
  cartId: string,
  lineId: string
): Promise<ShopifyCart | null> {
  if (isMockMode) return null;

  try {
    const data = await shopifyFetch<{ cartLinesRemove: { cart: RawCartData } }>({
      query: REMOVE_CART_LINE_MUTATION,
      variables: { cartId, lineIds: [lineId] },
    });
    return normalizeCart(data.cartLinesRemove.cart);
  } catch {
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatPrice(price: ShopifyPrice): string {
  const amount = parseFloat(price.amount);
  if (price.currencyCode === 'PKR') {
    return `Rs. ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currencyCode,
  }).format(amount);
}

export function getDiscountPercent(
  price: ShopifyPrice,
  compareAtPrice: ShopifyPrice | null
): number | null {
  if (!compareAtPrice) return null;
  const sale = parseFloat(price.amount);
  const original = parseFloat(compareAtPrice.amount);
  if (original <= sale) return null;
  return Math.round(((original - sale) / original) * 100);
}
