"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  ID: number;
  title: string;
  description: string;
  images: string[];
  price: number;
};

const Details = () => {
  const [products, setProducts] = useState<Product[]>();
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `http://localhost:3000/api/products?page=${page}`,
      );
      setProducts(response.data.data);
      setLastPage(response.data.meta.last_page);
    };
    fetchData();
  }, [page]);

  const next = () => {
    if (page < lastPage) {
      setPage(page + 1);
    }
  };

  const previous = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleDelte = async () => {};

  return (
    <div className="rounded-lg border bg-card mt-10">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Deals Details</h2>
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 rounded-tl-lg text-sm font-semibold text-muted-foreground">
                ID
              </th>
              <th className="p-3 text-sm font-semibold text-muted-foreground">
                Product Image
              </th>
              <th className="p-3 text-sm font-semibold text-muted-foreground">
                Product Name
              </th>
              <th className="p-3 text-sm font-semibold text-muted-foreground">
                Description
              </th>
              <th className="p-3 text-sm font-semibold text-muted-foreground">
                Price
              </th>
              <th className="p-3 text-sm font-semibold text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.ID} className="border-t">
                <td className="p-3">{product.ID}</td>
                <td className="p-3">
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    width={100}
                    height={100}
                  />
                </td>
                <td className="p-3 text-center">{product.title}</td>
                <td className="p-3 ">{product.description}</td>
                <td className="p-3 text-center">{product.price}</td>
                <td className="p-3 space-x-4">
                  <Link href={`/product/${product.ID}`}>
                    <Button>Edit Product</Button>
                  </Link>
                  <Button>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between m-4">
        <button
          className="cursor-pointer hover:scale-105 h-7 dark:hover:bg-gray-600 rounded w-16 transition-all duration-200 text-xs dark:bg-gray-700 bg-gray-200"
          onClick={previous}
        >
          Previous
        </button>
        <button
          className="cursor-pointer hover:scale-105 h-7 dark:hover:bg-gray-600 rounded w-10 transition-all duration-200 text-xs dark:bg-gray-700 bg-gray-200"
          onClick={next}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Details;
