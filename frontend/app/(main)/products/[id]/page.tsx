import { productsApi } from "@/lib/api/products";
import { Product } from "@/models/modles";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FavoriteButton from "@/components/button-favorite";
import AddToCartButton from "@/components/cart/AddToCartButton";

interface ProductDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const productId = resolvedParams.id;

  let product: Product | null = null;
  try {
    product = await productsApi.getById(productId);
  } catch {
    // If backend returns 404 or connection error, product remains null
  }

  if (!product || !product.title) {
    return (
      <div className="max-w-4xl mx-auto my-16 px-4 text-center">
        <div className="p-12 rounded-3xl bg-card border shadow-sm flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Product Not Found</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn’t locate the product you’re looking for. It may have been
              discontinued or removed from the catalog.
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/products">
              <ArrowLeft className="w-4 h-4" />
              Back to Catalog
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "/placeholder-product.png";

  const numId = product.id || product.ID || parseInt(productId, 10) || 0;
  const inStock = (product.stock ?? 0) > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground transition">
          Products
        </Link>
        {product.category_name && (
          <>
            <span>/</span>
            <span className="capitalize">{product.category_name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-xs">
          {product.title}
        </span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Gallery / Image Column */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-muted/40 border shadow-sm flex items-center justify-center">
            {primaryImage.startsWith("http") || primaryImage.startsWith("/") ? (
              <Image
                src={primaryImage}
                alt={product.title}
                fill
                priority
                className="object-cover object-center transition hover:scale-105 duration-300"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                <Package className="w-16 h-16 stroke-1" />
                <span className="text-sm font-medium">No Image Available</span>
              </div>
            )}

            {/* Favorite Floating Button */}
            <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md rounded-full shadow-md">
              <FavoriteButton productId={numId} />
            </div>
          </div>

          {/* Thumbnails if multiple images exist */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border bg-muted flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition"
                >
                  <Image
                    src={img}
                    alt={`${product?.title} thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="space-y-6">
          {/* Header info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {product.category_name && (
                <Badge variant="secondary" className="capitalize">
                  {product.category_name}
                </Badge>
              )}
              {product.sku && (
                <span className="text-xs text-muted-foreground uppercase font-mono">
                  SKU: {product.sku}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center text-amber-500">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                <span className="ml-1 text-sm font-semibold text-foreground">
                  {(product.rating ?? 0).toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">• Verified Product</span>
            </div>
          </div>

          {/* Price & Stock Status */}
          <div className="p-4 rounded-xl bg-card border flex items-baseline justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-medium">Price</span>
              <div className="text-3xl font-extrabold text-foreground">
                ${(product.price ?? 0).toFixed(2)}
              </div>
            </div>

            <div>
              {inStock ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  In Stock ({product.stock} units)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Overview
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Colors if available */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Available Colors
              </h2>
              <div className="flex gap-2">
                {product.colors.map((color, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-md text-xs font-medium border bg-muted/60"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <AddToCartButton product={product} inStock={inStock} />

            <Button variant="outline" size="lg" asChild>
              <Link href="/products" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                All Products
              </Link>
            </Button>
          </div>

          {/* Value Propositions / Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t text-center">
            <div className="flex flex-col items-center gap-1 p-2">
              <Truck className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">Fast Delivery</span>
              <span className="text-[10px] text-muted-foreground">Standard & Express</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2">
              <ShieldCheck className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">Guaranteed Quality</span>
              <span className="text-[10px] text-muted-foreground">100% Authentic</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2">
              <RotateCcw className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">Easy Returns</span>
              <span className="text-[10px] text-muted-foreground">30-day Policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
