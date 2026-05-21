"use client";

import {
  addToFavorites,
  isFavorite,
  removeFromFavorites,
} from "@/app/actions/favorite";
import { useTransition, useEffect, useState, useRef } from "react";

interface FavoriteButtonProps {
  productId: number;
}

export default function FavoriteButton({ productId }: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isMounted = useRef(true);
  const initialized = useRef(false); // برای جلوگیری از چندبار مقداردهی

  // مقداردهی اولیه فقط یک بار
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    isFavorite(productId)
      .then((result) => {
        if (isMounted.current) setFavorite(result);
      })
      .catch(() => {
        // در صورت خطا، مقدار پیش‌فرض false بماند (یا می‌توانی true هم فرض کنی)
      });
  }, [productId]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const toggleFavorite = () => {
    if (isPending) return;

    // ذخیره وضعیت قبلی
    const previousState = favorite;
    // به‌روزرسانی خوش‌بینانه
    setFavorite(!previousState);

    startTransition(async () => {
      if (previousState) {
        // درخواست حذف
        const res = await removeFromFavorites(productId);
        if (res.success) {
          // حذف موفق: وضعیت نهایی false
          if (isMounted.current) setFavorite(false);
        } else {
          // خطا: اگر خطای 404 بود، یعنی محصول وجود نداشته => وضعیت نهایی false
          if (res.error === "This product was not found in the wishlist") {
            if (isMounted.current) setFavorite(false);
          } else {
            // سایر خطاها: برگردان به حالت قبل
            if (isMounted.current) setFavorite(previousState);
          }
        }
      } else {
        // درخواست افزودن
        const res = await addToFavorites(productId);
        if (res.success) {
          // افزودن موفق: وضعیت نهایی true
          if (isMounted.current) setFavorite(true);
        } else {
          // خطا: اگر 409 بود، یعنی قبلاً وجود داشته => وضعیت نهایی true
          if (
            res.error === "This product has already been added to favorites"
          ) {
            if (isMounted.current) setFavorite(true);
          } else {
            if (isMounted.current) setFavorite(previousState);
          }
        }
      }
    });
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={isPending}
      className="p-2 rounded-full hover:bg-gray-100 transition"
    >
      {isPending ? (
        <div className="w-5 h-5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
      ) : favorite ? (
        <span className="text-red-500 text-xl">❤️</span>
      ) : (
        <span className="text-gray-500 text-xl">🤍</span>
      )}
    </button>
  );
}
