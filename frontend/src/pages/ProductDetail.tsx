import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import CopyId from '../components/CopyId';
import { ProductImage } from '../components/ProductCard';
import type { ProductDetail, Variant } from '../lib/types';

const featureLabels: Record<string, string> = {
  induction_compatible: '⚡ Induction compatible',
  microwave_safe: 'Microwave safe',
  dishwasher_safe: 'Dishwasher safe',
  pfas_free: 'PFAS-free',
  oven_safe: 'Oven safe',
};

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { add } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selected, setSelected] = useState<Variant | null>(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await api.get<ProductDetail>(`/products/${slug}`);
      if (res.success && res.data) {
        setProduct(res.data);
        setSelected(res.data.variants[0] ?? null);
      }
    })();
  }, [slug]);

  if (!product) return <div className="max-w-6xl mx-auto px-4 py-16 text-stone-500">Loading…</div>;

  const isSale = selected?.compareAtPrice != null && selected.price < selected.compareAtPrice;
  const discount = isSale ? Math.round((1 - selected.price / selected.compareAtPrice!) * 100) : 0;
  const image = selected?.image || product.images[0];
  const hasStock = selected ? selected.stock !== 0 : true;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav className="text-sm text-stone-500 mb-6 flex items-center gap-1.5">
        <Link to="/" className="hover:text-teal-700">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-teal-700">Shop</Link>
        <span>/</span>
        <span className="text-stone-800 font-medium line-clamp-1">{product.title}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div className="card overflow-hidden">
          <div className="aspect-square">
            <ProductImage src={image} alt={product.title} className="w-full h-full" />
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge bg-teal-50 text-teal-800 border border-teal-200 uppercase tracking-wide">{product.type}</span>
            {product.material && (
              <span className="badge bg-stone-100 text-stone-600">{product.material.replace('_', ' ')}</span>
            )}
            {selected?.fulfilmentMode === 'make_to_order' && (
              <span className="badge bg-amber-100 text-amber-800">Made to order</span>
            )}
          </div>

          <h1 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-stone-900 leading-tight">{product.title}</h1>

          <div className="mt-4 flex items-end gap-3">
            {selected && (
              <>
                <span className="font-display text-3xl font-bold text-stone-900">${selected.price.toFixed(2)}</span>
                {isSale && (
                  <>
                    <span className="text-lg text-stone-400 line-through">${selected.compareAtPrice!.toFixed(2)}</span>
                    <span className="badge bg-red-600 text-white mb-1">Save {discount}%</span>
                  </>
                )}
              </>
            )}
          </div>

          <p className="mt-4 text-stone-600 leading-relaxed">{product.description}</p>

          {/* Features */}
          <div className="mt-5 flex flex-wrap gap-2">
            {Object.entries(product.features).filter(([, v]) => v === true).map(([k]) => (
              <span key={k} className="badge bg-white border border-stone-200 text-stone-700">
                ✓ {featureLabels[k] ?? k.replace('_', ' ')}
              </span>
            ))}
          </div>

          {/* Variants */}
          {product.variants.length > 1 && (
            <div className="mt-7">
              <div className="text-sm font-semibold text-stone-700 mb-2">Options</div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => { setSelected(v); setQty(1); }}
                    className={`px-4 py-2.5 rounded-xl text-sm border transition ${
                      selected?.id === v.id
                        ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-teal-500'
                    }`}
                  >
                    {v.title} — ${v.price.toFixed(2)}
                  </button>
                ))}
              </div>
              {selected?.fulfilmentMode === 'make_to_order' && (
                <p className="text-sm text-amber-700 mt-2">Made to order — ships in ~{selected.leadTimeDays} days.</p>
              )}
            </div>
          )}

          {/* Qty + Add */}
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2.5 text-stone-600 hover:bg-stone-50 transition" aria-label="Decrease">−</button>
              <span className="px-3 w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-4 py-2.5 text-stone-600 hover:bg-stone-50 transition" aria-label="Increase">+</button>
            </div>
            <button
              disabled={!selected || !hasStock || adding}
              onClick={async () => {
                if (!selected) return;
                setAdding(true);
                await add(selected.id, qty);
                setAdding(false);
                navigate('/cart');
              }}
              className="btn-primary !px-8 !py-3 !text-base flex-1 sm:flex-none"
            >
              {adding ? 'Adding…' : 'Add to cart'}
            </button>
          </div>
          {selected && !hasStock && (
            <p className="text-sm text-red-600 mt-2">Out of stock — check back soon.</p>
          )}

          {/* Trust row */}
          <div className="mt-7 grid grid-cols-3 gap-3 text-center">
            {[
              ['🚚', 'Free shipping', 'on orders $75+'],
              ['↩️', 'Easy returns', '14-day window'],
              ['💬', 'WhatsApp confirm', 'order updates'],
            ].map(([icon, title, sub]) => (
              <div key={title} className="card p-3">
                <div className="text-xl">{icon}</div>
                <div className="mt-1 text-xs font-semibold text-stone-800">{title}</div>
                <div className="text-[11px] text-stone-500">{sub}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <CopyId value={product.id} label={`Product ${product.id.slice(0, 8)}…`} />
            {selected && (
              <>
                <CopyId value={selected.sku} label={`SKU ${selected.sku}`} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bundles */}
      {product.bundles.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-stone-900 mb-4">Bundle & save</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {product.bundles.map((b) => (
              <div key={b.id} className="card p-6 bg-gradient-to-br from-teal-50 to-white">
                <div className="font-display text-lg font-semibold text-stone-900">{b.name}</div>
                <div className="text-sm text-stone-500 mt-1">{b.description}</div>
                <div className="mt-3">
                  <span className="badge bg-teal-700 text-white">Save {b.discountPct}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}