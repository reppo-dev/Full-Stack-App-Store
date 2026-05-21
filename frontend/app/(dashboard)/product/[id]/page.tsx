"use client";

import { getDetailsProduct, updateProduct } from "@/app/actions/product.action";
import { s3UploadAction } from "@/app/actions/S3BucketAction";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ChangeEventHandler, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const editSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.number().min(1, "Price must be positive"),
  rating: z.number().min(0),
  description: z.string().min(1, "Description is required"),
  sku: z.string(),
  images: z.string(),
  stock: z.number().min(0),
  categoryId: z.number().min(1),
});

type EditingProduct = z.infer<typeof editSchema>;

const EditProduct = () => {
  const params = useParams();
  const productId = parseInt(params.id as string, 10);

  const [isLoading, setIsLoading] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);

  const [isImageAvalible, setIsImageAvalible] = useState(false);
  const [isImagePath, setIsImagePath] = useState(``);

  const uploadImage: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.set("file", file);
    const result = await s3UploadAction(data);

    if (result.success) {
      setIsImagePath(result.imagePath!);
      setIsImageAvalible(true);
    }
  };

  const form = useForm<EditingProduct>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: "",
      price: 0,
      rating: 0,
      description: "",
      sku: "",
      images: "",
      stock: 0,
      categoryId: 0,
    },
  });

  const { setValue, setError } = form;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const res = await getDetailsProduct(productId);
        const product = res.data;
        if (!product) return;

        const imagesArray = Array.isArray(product.images)
          ? product.images
          : product.images
            ? [product.images]
            : [];
        setProductImages(imagesArray);

        setValue("title", product.title || "");
        setValue("price", product.price || 0);
        setValue("rating", product.rating || 0);
        setValue(
          "description",
          product.description || product.Description || "",
        );
        setValue("sku", product.sku || product.SKU || "");
        setValue("stock", product.stock || product.Stock || 0);
        setValue("categoryId", product.categoryId || product.CategoryID || 0);
      } catch (err) {
        console.error("Failed to load product", err);
      }
    };
    fetchProduct();
  }, [productId, setValue]);

  const onSubmit = async (data: EditingProduct) => {
    setIsLoading(true);
    try {
      const finalImage =
        isImageAvalible && isImagePath
          ? `${isImagePath}`
          : data.images || productImages[0] || "";

      const finalData = {
        ...data,
        images: finalImage,
      };
      await updateProduct(productId, finalData);
      alert("Product updated successfully!");
    } catch {
      setError("root", { message: "Update failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        {productImages.length > 0 && (
          <div className="flex gap-2 flex-wrap p-4">
            {productImages.map((img, idx) => (
              <Image
                key={idx}
                src={img}
                alt={`product-${idx}`}
                width={200}
                height={200}
                className="object-cover rounded"
              />
            ))}
          </div>
        )}

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Upload new image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={uploadImage}
                    disabled={isLoading}
                  />
                  {isImageAvalible && isImagePath && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">
                        Image uploaded successfully!
                      </p>
                      <Image
                        src={`https://${isImagePath}`}
                        alt="New"
                        className="w-32 h-32 object-cover mt-1 rounded border"
                      />
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Title"
                          {...field}
                          className="h-11"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Description"
                          {...field}
                          className="h-11"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Price"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                          className="h-11"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Stock"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                          className="h-11"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="SKU"
                          {...field}
                          className="h-11"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Category ID"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                          className="h-11"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <p className="text-red-600 text-sm">
                    {form.formState.errors.root.message}
                  </p>
                )}

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Edit Product"}
                </Button>
              </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProduct;
