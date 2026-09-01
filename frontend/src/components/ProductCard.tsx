import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { Product } from '../lib/types';

function ProductImage({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`bg-gradient-to-br from-teal-100 via-emerald-50 to-amber-50 grid place-items-center ${className}`}>
        <span className="text-5xl">🍽️</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

export { ProductImage };

export default function ProductCard({ product, className = '' }: { product: Product; className?: string }) {
  const { add } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [openVariant, setOpenVariant] = useState(false);

  const hasSale = product.compareAtPrice != null && product.compareAtPrice > 0 && (product.price ?? 0) < product.compareAtPrice;
  const discount = hasSale && product.compareAtPrice ? Math.round((1 - (product.price ?? 0) / product.compareAtPrice) * 100) : 0;
  const image = product.images?.[0];

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const vid = product.defaultVariantId;
    if (!vid) {
      navigate(`/product/${product.slug}`);
      return;
    }
    setAdding(true);
    await add(vid, 1);
    setAdding(false);
    setOpenVariant(false);
    navigate('/cart');
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      onMouseEnter={() => setOpenVariant(true)}
      onMouseLeave={() => setOpenVariant(false)}
      className={`group relative flex flex-col bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200 ${className}`}
    >
      <div className="relative aspect-square overflow-hidden bg-stone-100">
        <ProductImage src={image} alt={product.title} className="w-full h-full group-hover:scale-105 transition-transform duration-300" />
        {hasSale && (
          <span className="absolute top-2.5 left-2.5 badge bg-red-600 text-white shadow-sm">-{discount}%</span>
        )}
        {product.type === 'bakeware' && (
          <span className="absolute top-2.5 right-2.5 badge bg-amber-500 text-white shadow-sm">🍞 Oven</span>
        )}
        {openVariant && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-900/80 to-transparent p-3">
            {product.features?.induction_compatible && (
              <span className="badge bg-white/90 text-stone-700 mr-1">⚡ Induction</span>
            )}
            {product.features?.dishwasher_safe && (
              <span className="badge bg-white/90 text-stone-700">✓ Dishwasher safe</span>
            )}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="text-[11px] uppercase tracking-widest text-stone-400 font-semibold">{product.type}</div>
        <div className="font-display font-medium text-stone-900 mt-1 line-clamp-2 leading-snug">{product.title}</div>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-stone-900">${(product.price ?? 0).toFixed(2)}</span>
          {hasSale && (
            <span className="text-sm text-stone-400 line-through">${product.compareAtPrice!.toFixed(2)}</span>
          )}
        </div>
        <div className="mt-auto pt-3">
          <button
            onClick={handleAdd}
            disabled={adding}
            className="w-full inline-flex items-center justify-center gap-1.5 bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-800 active:scale-[0.98] transition disabled:opacity-60"
          >
            {adding ? 'Adding…' : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> Add to cart</>}
          </button>
        </div>
      </div>
    </Link>
  );
}