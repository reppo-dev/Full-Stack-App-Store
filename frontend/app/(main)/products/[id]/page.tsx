import React from "react";
import { productsApi } from "@/lib/api/products";
import { Product } from "@/models/modles";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductDetailClient from "./ProductDetailClient";

interface ProductDetailPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const identifier = resolvedParams.id;

  let product: Product | null = null;
  let relatedProducts: Product[] = [];

  try {
    product = await productsApi.getByIdOrSlug(identifier);
    if (product) {
      const allRes = await productsApi.listAll();
      const catId = Number(product.category_id ?? product.categoryId ?? 0);
      const curId = product.id ?? product.ID;
      relatedProducts = allRes
        .filter((p) => {
          const pId = p.id ?? p.ID;
          const pCat = Number(p.category_id ?? p.categoryId ?? 0);
          return pId !== curId && (catId > 0 ? pCat === catId : true);
        })
        .slice(0, 4);
      
      if (relatedProducts.length < 4) {
        const extra = allRes.filter((p) => (p.id ?? p.ID) !== curId && !relatedProducts.some((rp) => (rp.id ?? rp.ID) === (p.id ?? p.ID)));
        relatedProducts = [...relatedProducts, ...extra].slice(0, 4);
      }
    }
  } catch (err) {
    console.error("Failed to load product details", err);
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
              We couldn't locate the product you're looking for. It may have been
              discontinued or removed from the catalog.
            </p>
          </div>
          <Button asChild className="gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl">
            <Link href="/products">
              <ArrowLeft className="w-4 h-4" />
              Back to Catalog
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
