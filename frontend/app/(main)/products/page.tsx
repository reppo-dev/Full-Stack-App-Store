import { getProducts } from "@/app/actions/product.action";
import BannerProducts from "@/components/bannerProducts";
import CardProducts from "@/components/cardProductsmain";
import { Product } from "@/models/modles";

const Products = async () => {
  const products = await getProducts();
  const product: Product[] = products.product;
  return (
    <div>
      <p className="text-2xl ml-7 my-8">Product</p>
      <div className="mx-5">
        <BannerProducts />
      </div>
      <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 mx-6 my-10">
        {product.map((p: Product) => (
          <CardProducts key={p.ID} props={p} />
        ))}
      </div>
    </div>
  );
};

export default Products;
