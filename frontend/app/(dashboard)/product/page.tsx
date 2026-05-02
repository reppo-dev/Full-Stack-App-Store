"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import BannerProduct from "../components/product/banner";
import CardProduct from "../components/product/cardProduct";

type ProductType = {
  ID: string;
  title: string;
  price: number;
  rating: number;
  images: string[];
};

const Product = () => {
  const [products, setProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/productss");
        console.log("API response:", response.data);
        setProducts(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <p className="text-2xl ml-7 my-8">Product</p>
      <div className="mx-5">
        <BannerProduct />
      </div>
      <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 mx-6 my-10">
        {products.map((p) => (
          <CardProduct key={p.ID} props={p} />
        ))}
      </div>
    </div>
  );
};

export default Product;
