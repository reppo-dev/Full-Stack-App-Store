"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/models/modles";
import { useAppDispatch } from "@/lib/redux/store";
import { addToCart, openCart } from "@/lib/redux/slices/cartSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FavoriteButton from "@/features/favorites/components/button-favorite";
import CardProducts from "@/features/products/components/StorefrontProductCard";
import {
  Star,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  CreditCard,
  Plus,
  Minus,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const dispatch = useAppDispatch();

  const numId = product.id || product.ID || 0;
  const inStock = (product.stock ?? 0) > 0;
  const price = Number(product.price ?? 0);

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0] : ""
  );
  const [quantity, setQuantity] = useState(1);

  // Discount calculation
  const discountPercent = (Number(numId) * 7) % 20 + 10;
  const originalPrice = (price * (100 + discountPercent)) / 100;
  const savings = originalPrice - price;

  const handleAddToCart = () => {
    if (!inStock) return;
    dispatch(
      addToCart({
        id: numId,
        title: product.title,
        price: product.price,
        image: images[0],
        stock: product.stock ?? 99,
        quantity: quantity,
      })
    );
    toast.success(`Added ${quantity}x "${product.title}" to cart`);
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    dispatch(
      addToCart({
        id: numId,
        title: product.title,
        price: product.price,
        image: images[0],
        stock: product.stock ?? 99,
        quantity: quantity,
      })
    );
    dispatch(openCart());
  };

  const attributes = product.attributes || {};

  return (
    <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-foreground transition-colors">
          Catalog
        </Link>
        {product.category_name && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href={`/products?category_id=${product.category_id || ""}`}
              className="hover:text-foreground transition-colors capitalize"
            >
              {product.category_name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-semibold truncate max-w-sm">
          {product.title}
        </span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Interactive Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-card border border-border/80 shadow-md flex items-center justify-center p-6 group">
            {/* Active Image */}
            <Image
              src={images[activeImageIndex] || images[0]}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />

            {/* Discount Floating Pill */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
              <span className="bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                {discountPercent}% OFF
              </span>
            </div>

            {/* Wishlist Button */}
            <div className="absolute top-4 right-4 z-10">
              <FavoriteButton
                productId={Number(numId)}
                className="w-10 h-10 rounded-full bg-background/80 hover:bg-background shadow-md backdrop-blur-md transition-transform active:scale-95"
              />
            </div>
          </div>

          {/* Multiple Image Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 bg-card p-1.5 shrink-0 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? "border-red-600 shadow-sm scale-105"
                      : "border-border hover:border-muted-foreground/40 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}

          {/* Value Assurance Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/60 text-center">
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border/60">
              <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-foreground">Free Delivery</span>
              <span className="text-[10px] text-muted-foreground">Doorstep dispatch</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border/60">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold text-foreground">100% Genuine</span>
              <span className="text-[10px] text-muted-foreground">Original warranty</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border/60">
              <RotateCcw className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-bold text-foreground">7-Day Return</span>
              <span className="text-[10px] text-muted-foreground">Money-back guarantee</span>
            </div>
          </div>
        </div>

        {/* Right Column: Product Info & Purchase Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Info */}
          <div className="space-y-3 pb-6 border-b border-border/60">
            <div className="flex flex-wrap items-center gap-2">
              {product.category_name && (
                <Badge className="bg-red-600/10 text-red-600 dark:text-red-400 border-0 font-bold uppercase tracking-wider text-xs px-3 py-0.5">
                  {product.category_name}
                </Badge>
              )}
              {product.sku && (
                <span className="text-xs text-muted-foreground font-mono font-medium">
                  SKU: {product.sku}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {product.title}
            </h1>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{Number(product.rating || 4.8).toFixed(1)} / 5.0</span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                • 128 Customer Reviews
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Purchase
              </span>
            </div>
          </div>

          {/* Pricing & Stock Card */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                  <Badge className="bg-red-600 text-white font-extrabold text-xs px-2 py-0.2">
                    Save ${savings.toFixed(2)}
                  </Badge>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                  ${price.toFixed(2)}
                </div>
              </div>

              <div>
                {inStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    In Stock ({product.stock} units available)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                    Currently Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="pt-2 space-y-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Color Options: <strong className="text-foreground">{selectedColor}</strong>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedColor === c
                          ? "border-red-600 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 shadow-xs"
                          : "border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="pt-3 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="flex items-center border border-border rounded-xl bg-muted/40 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-foreground hover:bg-background disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-foreground">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock ?? 10, q + 1))}
                    disabled={quantity >= (product.stock ?? 10)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-foreground hover:bg-background disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </Button>

                <Button
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  variant="outline"
                  className="h-12 border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Buy Now
                </Button>
              </div>
            </div>
          </div>

          {/* Product Overview Description */}
          {product.description && (
            <div className="space-y-2 p-6 rounded-3xl bg-card border border-border/60">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Product Description
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Technical Specifications Grid Table */}
          {Object.keys(attributes).length > 0 && (
            <div className="space-y-3 p-6 rounded-3xl bg-card border border-border/60">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-red-600" />
                Technical Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {Object.entries(attributes).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-3 rounded-xl bg-muted/40 border border-border/40 flex flex-col justify-center"
                  >
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {key}
                    </span>
                    <span className="text-xs font-bold text-foreground mt-0.5">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Carousel / Grid */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-border/60 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-6 bg-red-600 rounded-full" />
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                You Might Also Like
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
            >
              Browse All
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((rp) => (
              <CardProducts key={rp.id || rp.ID} props={rp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
