import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';

interface OrderItem {
  id: string;
  sku: string;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  fulfilmentMode: string;
}

interface OrderEvent {
  id: string;
  fromState: string | null;
  toState: string;
  note: string | null;
  createdAt: string;
}

interface Tracked {
  id: string;
  orderNumber: string;
  state: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  shippingAddress: { name?: string; phone?: string; line1?: string; city?: string; state?: string; postalCode?: string };
  isAssisted: boolean;
  createdAt: string;
  updatedAt: string;
  events: OrderEvent[];
}

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [number, setNumber] = useState(searchParams.get('order') ?? '');
  const [result, setResult] = useState<Tracked | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const value = number.trim();
    if (!value) return;
    setError('');
    setLoading(true);
    const res = await api.get<Tracked>(`/orders/${encodeURIComponent(value)}`);
    setLoading(false);
    if (res.success && res.data) setResult(res.data);
    else setError(res.error || 'Order not found');
  };

  useEffect(() => {
    const fromParam = searchParams.get('order');
    if (fromParam) {
      setNumber(fromParam);
      void (async () => {
        setError('');
        setLoading(true);
        const res = await api.get<Tracked>(`/orders/${encodeURIComponent(fromParam)}`);
        setLoading(false);
        if (res.success && res.data) setResult(res.data);
        else setError(res.error || 'Order not found');
      })();
    }
  }, [searchParams]);

  const steps = [
    { key: 'OPEN', label: 'Placed', icon: '📦' },
    { key: 'PAID', label: 'Paid', icon: '💳' },
    { key: 'READY', label: 'Ready', icon: '✅' },
    { key: 'IN_PRODUCTION', label: 'In production', icon: '🏭' },
    { key: 'SHIPPED', label: 'Shipped', icon: '🚚' },
    { key: 'DELIVERED', label: 'Delivered', icon: '🏠' },
  ];
  const currentIdx = result ? steps.findIndex((s) => s.key === result.state) : -1;

  const stateLabels: Record<string, string> = {
    OPEN: 'Placed', PAID: 'Paid', READY: 'Ready', IN_PRODUCTION: 'In production',
    SHIPPED: 'Shipped', DELIVERED: 'Delivered', REFUNDED: 'Refunded',
  };

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-stone-800">Track your order</h1>
      <form onSubmit={submit} className="mt-6 flex gap-2">
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Order number (e.g. HTC-12345)"
          className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm"
        />
        <button disabled={loading} className="bg-teal-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
          {loading ? '…' : 'Track'}
        </button>
      </form>
      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      {result && (
        <div className="mt-8 space-y-6">
          {/* Order header */}
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono font-semibold text-lg">{result.orderNumber}</span>
                <div className="text-xs text-stone-400 mt-0.5">Placed {formatDate(result.createdAt)}</div>
              </div>
              <span className="text-sm px-4 py-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                {stateLabels[result.state] ?? result.state}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex items-center">
                {steps.map((s, i) => (
                  <div key={s.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${i <= currentIdx ? 'bg-teal-700 text-white' : 'bg-stone-200 text-stone-400'}`}>
                        {i < currentIdx ? '✓' : s.icon}
                      </div>
                      <span className="text-xs mt-1 text-stone-500 text-center">{s.label}</span>
                    </div>
                    {i < steps.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${i < currentIdx ? 'bg-teal-600' : 'bg-stone-200'}`} />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <h2 className="font-semibold text-stone-800 mb-3">Items</h2>
            {result.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-2 border-b border-stone-50 last:border-0">
                <div>
                  <span className="text-stone-700 font-medium">{item.title}</span>
                  <span className="text-stone-400 ml-2">× {item.quantity}</span>
                  <span className="text-stone-400 ml-2 text-xs">({item.sku})</span>
                  {item.fulfilmentMode === 'make_to_order' && (
                    <span className="text-amber-600 text-xs ml-2 bg-amber-50 px-1.5 py-0.5 rounded">Made to order</span>
                  )}
                </div>
                <span className="text-stone-600 font-medium">${item.lineTotal.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-stone-200 mt-3 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-stone-500"><span>Subtotal</span><span>${result.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-stone-500"><span>Shipping</span><span>${result.shipping.toFixed(2)}</span></div>
              <div className="flex justify-between text-stone-500"><span>Tax</span><span>${result.tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-stone-800 pt-1 border-t border-stone-100"><span>Total</span><span>${result.total.toFixed(2)}</span></div>
            </div>
          </div>

          {/* Event timeline */}
          {result.events.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <h2 className="font-semibold text-stone-800 mb-3">Order timeline</h2>
              <div className="space-y-3">
                {[...result.events].reverse().map((ev, i) => (
                  <div key={ev.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1 ${i === 0 ? 'bg-teal-600' : 'bg-stone-300'}`} />
                      {i < result.events.length - 1 && <div className="w-px flex-1 bg-stone-200 mt-1" />}
                    </div>
                    <div className="pb-3">
                      <div className="text-sm font-medium text-stone-800">
                        {stateLabels[ev.toState] ?? ev.toState}
                        {ev.fromState && <span className="text-stone-400 font-normal"> (was {stateLabels[ev.fromState] ?? ev.fromState})</span>}
                      </div>
                      <div className="text-xs text-stone-400">{formatDate(ev.createdAt)}</div>
                      {ev.note && <div className="text-xs text-stone-500 mt-0.5">{ev.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping address */}
          {result.shippingAddress?.line1 && (
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <h2 className="font-semibold text-stone-800 mb-2">Shipping to</h2>
              <div className="text-sm text-stone-600">
                <div className="font-medium">{result.shippingAddress.name}</div>
                <div>{result.shippingAddress.line1}</div>
                <div>{result.shippingAddress.city}, {result.shippingAddress.state} {result.shippingAddress.postalCode}</div>
                {result.shippingAddress.phone && <div className="text-stone-400 mt-1">{result.shippingAddress.phone}</div>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
