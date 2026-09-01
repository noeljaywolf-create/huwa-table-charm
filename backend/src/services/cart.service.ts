import { v4 as uuid } from 'uuid';
import db from '../config/database';
import { toVariant, toCents, cents, type VariantRow } from './catalog.mapper';
import { ensureVariantExists } from './catalog.service';
import { badRequest } from '../middleware/errors';
import type { CartDto, CartItemDto } from '@huwa/shared';

interface CartRow {
  id: string;
  user_id: string | null;
  anonymous_id: string;
}

interface CartItemRow {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
}

/**
 * Resolve or create a cart for a user or an anonymous session.
 */
export async function getOrCreateCart(userId: string | null, anonymousId: string): Promise<CartDto> {
  if (!anonymousId) throw badRequest('anonymousId is required');

  let row: CartRow | undefined;
  if (userId) {
    row = await db('carts').where({ user_id: userId }).first() as CartRow | undefined;
    if (!row) {
      const id = uuid();
      await db('carts').insert({ id, user_id: userId, anonymous_id: anonymousId });
      row = { id, user_id: userId, anonymous_id: anonymousId };
    }
  } else {
    row = await db('carts').where({ anonymous_id: anonymousId }).first() as CartRow | undefined;
    if (!row) {
      const id = uuid();
      await db('carts').insert({ id, user_id: null, anonymous_id: anonymousId });
      row = { id, user_id: null, anonymous_id: anonymousId };
    }
  }

  return composeCart(row);
}

async function composeCart(cart: CartRow): Promise<CartDto> {
  const items = await db('cart_items').where({ cart_id: cart.id }).select('*') as CartItemRow[];
  const cartItems: CartItemDto[] = [];
  let subtotal = 0;

  for (const item of items) {
    const variant = await db('variants').where({ id: item.variant_id }).first() as VariantRow | undefined;
    if (!variant) continue;
    const v = toVariant(variant);
    const product = await db('products').where({ id: variant.product_id }).first() as any;
    const unitPriceCents = variant.price_cents;
    const lineTotalCents = unitPriceCents * item.quantity;
    subtotal += lineTotalCents;
    cartItems.push({
      id: item.id,
      variantId: item.variant_id,
      productTitle: product?.title ?? v.title,
      sku: v.sku,
      title: v.title,
      quantity: item.quantity,
      unitPrice: cents(unitPriceCents),
      lineTotal: cents(lineTotalCents),
      image: v.image,
    });
  }

  return {
    id: cart.id,
    userId: cart.user_id,
    anonymousId: cart.anonymous_id,
    items: cartItems,
    subtotal: cents(subtotal),
    itemCount: cartItems.reduce((sum, i) => sum + i.quantity, 0),
  };
}

export async function getCart(userId: string | null, anonymousId: string): Promise<CartDto> {
  const cart = await getOrCreateCart(userId, anonymousId);
  return cart;
}

export async function addItem(
  userId: string | null,
  anonymousId: string,
  variantId: string,
  quantity = 1,
): Promise<CartDto> {
  const variant = await ensureVariantExists(variantId);
  const cart = await getOrCreateCart(userId, anonymousId);

  // Enforce stock availability for stocked variants
  if (variant.fulfilmentMode === 'stocked') {
    const inv = await db('inventory_stock').where({ variant_id: variantId }).first();
    const available = inv ? Number(inv.sellable) : variant.stock ?? 0;
    if (available < quantity) throw badRequest('Insufficient stock available');
  }

  const existing = await db('cart_items').where({ cart_id: cart.id, variant_id: variantId }).first();
  if (existing) {
    await db('cart_items')
      .where({ id: existing.id })
      .update({ quantity: existing.quantity + quantity });
  } else {
    await db('cart_items').insert({
      id: uuid(),
      cart_id: cart.id,
      variant_id: variantId,
      quantity,
    });
  }
  return composeCart(await db('carts').where({ id: cart.id }).first() as CartRow);
}

export async function updateItem(
  userId: string | null,
  anonymousId: string,
  itemId: string,
  quantity: number,
): Promise<CartDto> {
  const cart = await getOrCreateCart(userId, anonymousId);
  const item = await db('cart_items').where({ id: itemId, cart_id: cart.id }).first() as CartItemRow | undefined;
  if (!item) throw badRequest('Cart item not found');

  if (quantity <= 0) {
    await db('cart_items').where({ id: itemId }).del();
  } else {
    await db('cart_items').where({ id: itemId }).update({ quantity });
  }
  return composeCart(await db('carts').where({ id: cart.id }).first() as CartRow);
}

export async function clearCart(userId: string | null, anonymousId: string): Promise<void> {
  const cart = await getOrCreateCart(userId, anonymousId);
  await db('cart_items').where({ cart_id: cart.id }).del();
}
