"use client";

import FavoriteButton from "@/components/button-favorite";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Star, Edit3, ExternalLink, Package } from "lucide-react";

type Product = {
  ID: number;
  id?: number;
  title: string;
  price: number;
  rating: number;
  images: string[];
  stock?: number;
  slug?: string;
  category_name?: string;
};

type CardProductProps = {
  props: Product;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

const CardProduct = ({ props }: CardProductProps) => {
  const prodId = props.id ?? props.ID ?? 0;
  const primaryImage =
    Array.isArray(props.images) && props.images.length > 0
      ? props.images[0]
      : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";

  const stock = props.stock ?? 15;
  const inStock = stock > 0;
  const slug = props.slug || prodId;

  return (
    <div className="bg-card text-card-foreground rounded-2xl border border-border/60 p-4 flex flex-col justify-between hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 group relative">
      {/* Top Left: ID Badge */}
      <div className="absolute top-3 left-3 z-10">
        <Badge variant="secondary" className="bg-black/50 backdrop-blur-md text-white font-mono text-[10px] px-2 py-0.5">
          ID #{prodId}
        </Badge>
      </div>

      {/* Top Right: Wishlist Heart */}
      <div className="absolute top-3 right-3 z-10">
        <FavoriteButton
          productId={Number(prodId)}
          className="w-8 h-8 rounded-full bg-background/80 hover:bg-background shadow-xs backdrop-blur-md transition-transform active:scale-95"
        />
      </div>

      {/* Image Preview */}
      <div className="relative w-full aspect-square mb-3 bg-muted/20 rounded-xl overflow-hidden p-3 flex items-center justify-center group-hover:bg-muted/30 transition-colors">
        <Image
          src={primaryImage}
          alt={props.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-contain p-2 group-hover:scale-108 transition-transform duration-300"
          unoptimized
        />
      </div>

      {/* Rating & Stock Status */}
      <div className="flex items-center justify-between gap-2 mb-2 text-[11px]">
        <div className="flex items-center gap-1 text-amber-500 font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-500" />
          <span>{Number(props.rating || 4.8).toFixed(1)}</span>
        </div>

        <span
          className={`font-semibold flex items-center gap-1 ${
            inStock ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
          }`}
        >
          <Package className="w-3 h-3" />
          {inStock ? `${stock} in stock` : "Out of stock"}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 h-10 leading-snug mb-3">
        {props.title}
      </h3>

      {/* Price & Actions Row */}
      <div className="pt-3 border-t border-border/40 space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground font-medium">Price:</span>
          <span className="text-base font-extrabold text-foreground tracking-tight">
            ${Number(props.price || 0).toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link href={`/product/${prodId}`} className="w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8.5 text-xs font-semibold rounded-xl border-blue-600/30 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3 h-3" />
              Edit
            </Button>
          </Link>

          <Link href={`/products/${slug}`} target="_blank" className="w-full">
            <Button
              variant="secondary"
              size="sm"
              className="w-full h-8.5 text-xs font-medium rounded-xl text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
            >
              Live
              <ExternalLink className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CardProduct;
