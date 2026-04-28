import BannerProduct from "../components/product/banner";
import CardProduct from "../components/product/cardProduct";

type pro = {
  id: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  rating: number;
  description: string;
  images: string[];
};

const product: pro[] = [
  {
    id: "TEST-1001",
    title: "Wireless Bluetooth Headphones",
    brand: "SoundMax",
    category: "Electronics / Audio",
    price: 2499000,
    currency: "IRR",
    rating: 4.6,
    description:
      "High-quality wireless headphones with long battery life and deep bass.",
    images: [
      "https://sibche.com/blog/wp-content/uploads/2025/05/%D8%AF%D8%A7%D8%B3%D8%AA%D8%A7%D9%86-%D8%AF%DB%8C%D8%AC%DB%8C-%DA%A9%D8%A7%D9%84%D8%A7-%DA%86%DB%8C%D8%B3%D8%AA%D8%9F.jpg",
      "https://www.webpouya.com/images/How-did-the-digikala-become-the-digikala-brand.jpg",
    ],
  },
  {
    id: "TEST-1002",
    title: "Smart 4K LED TV 55 inch",
    brand: "VisionTech",
    category: "Electronics / TV",
    price: 18999000,
    currency: "IRR",
    rating: 4.4,
    description: "55-inch 4K smart TV with HDR and streaming support.",
    images: [
      "https://sibche.com/blog/wp-content/uploads/2025/05/%D8%AF%D8%A7%D8%B3%D8%AA%D8%A7%D9%86-%D8%AF%DB%8C%D8%AC%DB%8C-%DA%A9%D8%A7%D9%84%D8%A7-%DA%86%DB%8C%D8%B3%D8%AA%D8%9F.jpg",
      "https://www.webpouya.com/images/How-did-the-digikala-become-the-digikala-brand.jpg",
    ],
  },
  {
    id: "TEST-1003",
    title: "Android Smartphone 128GB",
    brand: "NovaMobile",
    category: "Electronics / Phone",
    price: 12999000,
    currency: "IRR",
    rating: 4.2,
    description: "Mid‑range smartphone with 128GB storage and triple camera.",
    images: [
      "https://sibche.com/blog/wp-content/uploads/2025/05/%D8%AF%D8%A7%D8%B3%D8%AA%D8%A7%D9%86-%D8%AF%DB%8C%D8%AC%DB%8C-%DA%A9%D8%A7%D9%84%D8%A7-%DA%86%DB%8C%D8%B3%D8%AA%D8%9F.jpg",
      "https://www.webpouya.com/images/How-did-the-digikala-become-the-digikala-brand.jpg",
    ],
  },
  {
    id: "TEST-1004",
    title: "Gaming Laptop 15.6 inch",
    brand: "IronBook",
    category: "Electronics / Laptop",
    price: 45999000,
    currency: "IRR",
    rating: 4.8,
    description: "High‑performance laptop with RTX graphics and SSD storage.",
    images: [
      "https://sibche.com/blog/wp-content/uploads/2025/05/%D8%AF%D8%A7%D8%B3%D8%AA%D8%A7%D9%86-%D8%AF%DB%8C%D8%AC%DB%8C-%DA%A9%D8%A7%D9%84%D8%A7-%DA%86%DB%8C%D8%B3%D8%AA%D8%9F.jpg",
      "https://www.webpouya.com/images/How-did-the-digikala-become-the-digikala-brand.jpg",
    ],
  },
  {
    id: "TEST-1005",
    title: "Electric Kettle 1.7L",
    brand: "HomeChef",
    category: "Home & Kitchen",
    price: 1399000,
    currency: "IRR",
    rating: 4.5,
    description: "1.7L stainless steel electric kettle with auto shut‑off.",
    images: [
      "https://sibche.com/blog/wp-content/uploads/2025/05/%D8%AF%D8%A7%D8%B3%D8%AA%D8%A7%D9%86-%D8%AF%DB%8C%D8%AC%DB%8C-%DA%A9%D8%A7%D9%84%D8%A7-%DA%86%DB%8C%D8%B3%D8%AA%D8%9F.jpg",
      "https://www.webpouya.com/images/How-did-the-digikala-become-the-digikala-brand.jpg",
    ],
  },
  {
    id: "TEST-1006",
    title: "Air Fryer 4.5L",
    brand: "HealthyCook",
    category: "Home & Kitchen",
    price: 3299000,
    currency: "IRR",
    rating: 4.3,
    description: "4.5L air fryer with adjustable temperature and timer.",
    images: [
      "https://sibche.com/blog/wp-content/uploads/2025/05/%D8%AF%D8%A7%D8%B3%D8%AA%D8%A7%D9%86-%D8%AF%DB%8C%D8%AC%DB%8C-%DA%A9%D8%A7%D9%84%D8%A7-%DA%86%DB%8C%D8%B3%D8%AA%D8%9F.jpg",
      "https://www.webpouya.com/images/How-did-the-digikala-become-the-digikala-brand.jpg",
    ],
  },
  {
    id: "TEST-1007",
    title: "Men's Running Shoes",
    brand: "MoveFit",
    category: "Fashion / Shoes",
    price: 1899000,
    currency: "IRR",
    rating: 4.1,
    description: "Lightweight breathable running shoes for daily use.",
    images: [
      "https://sibche.com/blog/wp-content/uploads/2025/05/%D8%AF%D8%A7%D8%B3%D8%AA%D8%A7%D9%86-%D8%AF%DB%8C%D8%AC%DB%8C-%DA%A9%D8%A7%D9%84%D8%A7-%DA%86%DB%8C%D8%B3%D8%AA%D8%9F.jpg",
      "https://www.webpouya.com/images/How-did-the-digikala-become-the-digikala-brand.jpg",
    ],
  },
  {
    id: "TEST-1008",
    title: "Cotton T-Shirt Pack of 3",
    brand: "UrbanWear",
    category: "Fashion / Clothing",
    price: 799000,
    currency: "IRR",
    rating: 4.0,
    description: "Pack of three soft and breathable cotton T-shirts.",
    images: [
      "https://sibche.com/blog/wp-content/uploads/2025/05/%D8%AF%D8%A7%D8%B3%D8%AA%D8%A7%D9%86-%D8%AF%DB%8C%D8%AC%DB%8C-%DA%A9%D8%A7%D9%84%D8%A7-%DA%86%DB%8C%D8%B3%D8%AA%D8%9F.jpg",
      "https://www.webpouya.com/images/How-did-the-digikala-become-the-digikala-brand.jpg",
    ],
  },
  {
    id: "TEST-1009",
    title: "Office Desk Chair",
    brand: "ComfortSeat",
    category: "Home & Office / Furniture",
    price: 2799000,
    currency: "IRR",
    rating: 4.3,
    description:
      "Ergonomic office chair with height adjustment and lumbar support.",
    images: [
      "https://sibche.com/blog/wp-content/uploads/2025/05/%D8%AF%D8%A7%D8%B3%D8%AA%D8%A7%D9%86-%D8%AF%DB%8C%D8%AC%DB%8C-%DA%A9%D8%A7%D9%84%D8%A7-%DA%86%DB%8C%D8%B3%D8%AA%D8%9F.jpg",
      "https://www.webpouya.com/images/How-did-the-digikala-become-the-digikala-brand.jpg",
    ],
  },
  {
    id: "TEST-1010",
    title: "Power Bank 20000mAh",
    brand: "ChargePlus",
    category: "Electronics / Accessories",
    price: 999000,
    currency: "IRR",
    rating: 4.7,
    description: "Portable 20000mAh power bank with fast charging.",
    images: [
      "https://sibche.com/blog/wp-content/uploads/2025/05/%D8%AF%D8%A7%D8%B3%D8%AA%D8%A7%D9%86-%D8%AF%DB%8C%D8%AC%DB%8C-%DA%A9%D8%A7%D9%84%D8%A7-%DA%86%DB%8C%D8%B3%D8%AA%D8%9F.jpg",
      "https://www.webpouya.com/images/How-did-the-digikala-become-the-digikala-brand.jpg",
    ],
  },
];

const Product = () => {
  return (
    <div>
      <p className="text-2xl ml-7 my-8">Product</p>
      <div className="mx-5">
        <BannerProduct />
      </div>
      <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 mx-6 my-10">
        {product.map((p) => (
          <CardProduct key={p.id} props={p} />
        ))}
      </div>
    </div>
  );
};

export default Product;
