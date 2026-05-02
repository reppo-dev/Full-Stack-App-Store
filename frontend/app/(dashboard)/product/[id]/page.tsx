"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const editSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.number().min(1, "Price must be positive"),
  rating: z.number().min(0),
  description: z.string().min(1, "Description is required"),
  sku: z.string(),
  stock: z.number().min(0),
  categoryId: z.number(),
});

type Editingproduct = z.infer<typeof editSchema>;

const EditProduct = () => {
  const params = useParams();
  const productId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<Editingproduct>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: "",
      price: 0,
      rating: 0,
      description: "",
      sku: "",
      stock: 0,
      categoryId: 0,
    },
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/products/${productId}`,
        );
        const data = res.data;
        setProductImages(data.images || []);
        reset({
          title: data.title || "",
          price: data.price || 0,
          rating: data.rating || 0,
          description: data.Description || "",
          sku: data.SKU || "",
          stock: data.Stock || 0,
          categoryId: data.CategoryID || 0,
        });
      } catch (err) {
        console.error("Failed to load product", err);
      }
    };
    if (productId) fetchProduct();
  }, [productId, reset]);

  async function onSubmit(data: Editingproduct) {
    setLoading(true);
    try {
      await axios.put(`http://localhost:3000/api/products/${productId}`, data);
      alert("Product updated successfully!");
    } catch (err) {
      console.error(err);
      setError("root", { message: "Update failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex gap-2 flex-wrap p-4">
          {productImages.map((img) => (
            <Image
              key={img}
              src={img}
              alt="product"
              width={200}
              height={200}
              className="object-cover rounded"
            />
          ))}
        </div>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel>Title</FieldLabel>
                <Input
                  id="title"
                  type="text"
                  placeholder="Title"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Description"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">
                    {errors.description.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel>Price</FieldLabel>
                <Input
                  id="price"
                  type="text"
                  placeholder="Price"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm">{errors.price.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel>Stock</FieldLabel>
                <Input
                  id="stock"
                  type="text"
                  placeholder="Stock"
                  {...register("stock", { valueAsNumber: true })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm">{errors.stock.message}</p>
                )}
              </Field>

              <Field>
                <FieldLabel>SKU</FieldLabel>
                <Input
                  id="sku"
                  type="text"
                  placeholder="SKU"
                  {...register("sku")}
                />
              </Field>

              <Field>
                <FieldLabel>Category ID</FieldLabel>
                <Input
                  id="categoryId"
                  type="number"
                  placeholder="Category ID"
                  {...register("categoryId")}
                />
              </Field>

              {errors.root && (
                <p className="text-red-500 text-sm text-center">
                  {errors.root.message}
                </p>
              )}

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Edit Product"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProduct;
