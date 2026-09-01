import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api, getAnonymousId } from '../lib/api';
import CopyId from '../components/CopyId';
interface OrderBrief {
  id: string;
  orderNumber: string;
  isAssisted: boolean;
}
interface CheckoutResponse {
  order: OrderBrief;
  paymentIntentSecret?: string;
}

export default function Checkout() {
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', line1: '', city: '', state: '', postalCode: '', country: 'ZW' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<OrderBrief | null>(null);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const submit = async () => {
    setError('');
    setSubmitting(true);
    const anon = getAnonymousId();
    const res = await api.post<CheckoutResponse>(`/checkout?anonymousId=${encodeURIComponent(anon)}`, {
      shippingAddress: form,
    });
    if (!res.success || !res.data?.order) {
      setError(res.error || 'Checkout failed');
      setSubmitting(false);
      return;
    }
    // Confirm the (dev/mock) payment. In production this would follow the Stripe flow.
    const confirm = await api.post<OrderBrief>(`/checkout/${res.data.order.id}/confirm?anonymousId=${encodeURIComponent(anon)}`, {});
    if (!confirm.success || !confirm.data) {
      setError(confirm.error || 'Payment confirmation failed');
      setSubmitting(false);
      return;
    }
    setDone(confirm.data);
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-stone-800">Order placed!</h1>
        <p className="mt-2 text-stone-600">Your order number is <span className="font-mono font-semibold">{done.orderNumber}</span></p>
        <p className="text-stone-500 text-sm mt-1">Keep it handy to track your delivery.</p>
        {form.phone && (
          <p className="text-sm text-teal-700 mt-1">We sent a confirmation to <span className="font-medium">{form.phone}</span>.</p>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <CopyId
            value={done.orderNumber}
            label={`Copy ${done.orderNumber}`}
            copiedLabel="✓ Number copied"
            className="bg-white border border-stone-300 text-stone-700 px-5 py-3 rounded-lg font-medium hover:bg-stone-50"
          />
          <Link
            to={`/track?order=${encodeURIComponent(done.orderNumber)}`}
            className="bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-800"
          >
            Track my order
          </Link>
        </div>
        <button onClick={() => navigate('/')} className="mt-4 text-teal-700 text-sm font-medium hover:underline">
          Keep shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Checkout</h1>
      <div className="grid md:grid-cols-5 gap-6">
        <form
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          className="md:col-span-3 bg-white border border-stone-200 rounded-xl p-6 space-y-4"
        >
          <h2 className="font-semibold text-stone-800">Shipping address</h2>
          {(['name', 'email', 'phone', 'line1', 'city', 'state', 'postalCode', 'country'] as const).map((f) => (
            <div key={f}>
              <label className="block text-sm text-stone-600 capitalize mb-1">
                {f === 'email' ? 'Email (for order updates)' : f === 'phone' ? 'Phone (for WhatsApp updates)' : f}
              </label>
              <input
                value={form[f]}
                onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                required={f !== 'email' && f !== 'phone'}
                type={f === 'email' ? 'email' : f === 'phone' ? 'tel' : undefined}
                placeholder={f === 'email' ? 'you@example.com' : f === 'phone' ? '+263 77 123 4567' : undefined}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          ))}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={submitting} className="w-full bg-teal-700 text-white py-3 rounded-lg font-semibold hover:bg-teal-800 disabled:opacity-50">
            {submitting ? 'Placing order…' : `Place order${cart ? ` · $${cart.subtotal.toFixed(2)}` : ''}`}
          </button>
          <p className="text-xs text-stone-400 text-center">Demo checkout confirms instantly with a mock payment.</p>
        </form>

        <div className="md:col-span-2 bg-white border border-stone-200 rounded-xl p-6 h-fit">
          <h2 className="font-semibold text-stone-800 mb-3">Order summary</h2>
          {cart?.items.map((i) => (
            <div key={i.id} className="flex justify-between text-sm text-stone-700 py-1">
              <span>{i.productTitle} × {i.quantity}</span>
              <span>${i.lineTotal.toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-stone-200 mt-3 pt-3 flex justify-between font-semibold text-stone-800">
            <span>Subtotal</span>
            <span>${cart?.subtotal.toFixed(2) ?? '0.00'}</span>
          </div>
          <p className="text-xs text-stone-400 mt-3">Shipping calculated on dispatch. MTO/engraving items shown as made-to-order.</p>
        </div>
      </div>
    </div>
  );
}
