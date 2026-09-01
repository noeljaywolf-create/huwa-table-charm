import { Router } from 'express';
import { cartAddSchema, cartUpdateSchema } from '@huwa/shared';
import { validate, asyncHandler } from '../middleware/validate';
import { optionalAuth } from '../middleware/auth';
import * as cart from '../controllers/cart.controller';

const router = Router();

router.use(optionalAuth);

router.get('/cart', asyncHandler(cart.getCart));
router.post('/cart/items', validate(cartAddSchema), asyncHandler(cart.addItem));
router.patch('/cart/items/:itemId', validate(cartUpdateSchema), asyncHandler(cart.updateItem));
router.delete('/cart', asyncHandler(cart.clearCart));

export default router;
