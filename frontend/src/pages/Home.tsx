import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';
import type { Category, ListResult, Product } from '../lib/types';

const CATEGORY_EMOJI: Record<string, string> = {
  cookware: '🍳',
  dinnerware: '🍽️',
  bakeware: '🧁',
  drinkware: '🍷',
  flatware: '🥄',
  utensils: '🥢',
  storage: '🏺',
};

const CATEGORY_IMAGES: Record<string, string> = {
  cookware: 'https://images.unsplash.com/photo-1584990347449-124c1fff1b1a?auto=format&fit=crop&w=600&q=80',
  dinnerware: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=600&q=80',
  bakeware: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=600&q=80',
  drinkware: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=600&q=80',
  flatware: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=600&q=80',
  utensils: 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?auto=format&fit=crop&w=600&q=80',
  storage: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=600&q=80',
};

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<ListResult<Product>>({ items: [], total: 0, page: 1, pageSize: 24 });

  useEffect(() => {
    (async () => {
      const [c, f] = await Promise.all([
        api.get<Category[]>('/categories'),
        api.get<ListResult<Product>>('/products?pageSize=8&sort=new'),
      ]);
      if (c.success && c.data) setCategories(c.data);
      if (f.success && f.data) setFeatured(f.data);
    })();
  }, []);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="bg-gradient-to-br from-stone-900 via-teal-950 to-emerald-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-center relative">
          <div className="animate-fade-in-up">
            <span className="badge bg-teal-400/20 text-teal-200 border border-teal-300/30">✦ New season collection</span>
            <h1 className="mt-4 font-display text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              Beautiful tables,<br />built to <span className="text-teal-300 italic">last.</span>
            </h1>
            <p className="mt-5 text-teal-100/90 text-lg max-w-lg leading-relaxed">
              Stoneware, porcelain, glass and wood — thoughtful tableware and serveware curated for everyday dining and special occasions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 bg-amber-400 text-stone-900 px-6 py-3 rounded-xl font-semibold hover:bg-amber-300 transition shadow-lg">
                Shop the range
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" /></svg>
              </Link>
              <button
                onClick={() => (window as unknown as { htc?: { open: () => void } }).htc?.open()}
                className="inline-flex items-center gap-2 border border-teal-300/50 text-teal-100 px-6 py-3 rounded-xl font-semibold hover:bg-teal-800/50 transition"
              >
                ✦ Ask Charm
              </button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-teal-200/80">
              <span>🛡️ Free shipping over $75</span>
              <span>↩️ 14-day returns</span>
              <span>⚡ In stock now</span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4 rotate-1">
              <img src={CATEGORY_IMAGES.dinnerware} alt="Porcelain tableware" loading="lazy" className="rounded-2xl aspect-[3/4] object-cover shadow-2xl shadow-black/40 translate-y-4" />
              <img src={CATEGORY_IMAGES.cookware} alt="Cookware" loading="lazy" className="rounded-2xl aspect-[3/4] object-cover shadow-2xl shadow-black/40 -translate-y-2" />
              <img src={CATEGORY_IMAGES.drinkware} alt="Glassware" loading="lazy" className="rounded-2xl aspect-[4/3] object-cover shadow-2xl shadow-black/40 -translate-y-2" />
              <img src={CATEGORY_IMAGES.bakeware} alt="Bakeware" loading="lazy" className="rounded-2xl aspect-[4/3] object-cover shadow-2xl shadow-black/40 translate-y-4" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== PERKS STRIP ===== */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ['🚚', 'Free shipping', 'On orders over $75'],
            ['✨', 'Easy returns', '14-day return window'],
            ['🤝', 'Asked & answered', 'Personal guidance by Charm'],
            ['🛡️', 'Durable & safe', 'Food-safe materials'],
          ].map(([icon, title, sub]) => (
            <div key={title}>
              <div className="text-2xl">{icon}</div>
              <div className="mt-1 font-semibold text-stone-800 text-sm">{title}</div>
              <div className="text-xs text-stone-500 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl font-semibold text-stone-900">Shop by category</h2>
            <p className="text-stone-500 mt-1">Everything for setting a beautiful table</p>
          </div>
          <Link to="/shop" className="hidden sm:inline-flex items-center gap-1 text-teal-700 font-medium text-sm hover:gap-2 transition-all">View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
          {categories.map((c) => {
            const img = CATEGORY_IMAGES[c.slug] ?? c.image;
            return (
              <Link
                key={c.id}
                to={`/shop?category=${c.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-stone-200 shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-200"
              >
                {img ? (
                  <img src={img} alt={c.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-4xl bg-gradient-to-br from-teal-100 to-amber-50">{CATEGORY_EMOJI[c.slug] ?? '🍽️'}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-teal-200 font-semibold">{CATEGORY_EMOJI[c.slug] ?? ''}</div>
                  <div className="text-white font-display font-medium text-sm leading-tight">{c.name}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== FEATURED ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl font-semibold text-stone-900">Featured this week</h2>
            <p className="text-stone-500 mt-1">Hand-picked pieces our customers love</p>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-1 text-teal-700 font-medium text-sm hover:gap-2 transition-all">See all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ===== CHARM CTA BANNER ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-teal-800 to-emerald-900 text-white relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '22px 22px' }} />
          <div className="relative px-6 py-12 md:px-12 md:py-16 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="badge bg-white/15 text-teal-100 border border-white/20">✦ Meet Charm</span>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold leading-tight">
                Not sure what to choose?
              </h2>
              <p className="mt-3 text-teal-100/90 max-w-md">
                Tell Charm about your space and how you cook, dine, or entertain. It'll match you with the perfect pieces — no guesswork.
              </p>
              <button
                onClick={() => (window as unknown as { htc?: { open: () => void } }).htc?.open()}
                className="mt-6 inline-flex items-center gap-2 bg-amber-400 text-stone-900 px-6 py-3 rounded-xl font-semibold hover:bg-amber-300 transition shadow-lg"
              >
                ✦ Start a conversation
              </button>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 border border-white/15 rounded-2xl p-6 backdrop-blur">
                <p className="text-teal-200 text-sm font-medium">Charm said…</p>
                <p className="mt-2 text-teal-50 italic text-lg leading-relaxed">
                  "For a dinner party of six, I'd pair the Porcelain Dinner Set with the Ceramic Serving Platters and a set of stoneware bowls. Let me show you —"
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="badge bg-white/15 text-teal-100">Add to cart</span>
                  <span className="badge bg-white/15 text-teal-100">View bundle</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}