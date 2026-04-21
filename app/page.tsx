import BannerCarousel from "@/components/BannerCarousel";
import CardLandingPage from "@/components/cardLandigpage";
import Header from "@/components/Header";

const items = [
  { content: "Women’s Shoe", price: 45.5 },
  { content: "Cycle Accessories", price: 105 },
  { content: "Home Accessories", price: 34 },
];

const Home = () => {
  return (
    <div>
      <Header />
      <BannerCarousel />
      <CardLandingPage items={items} />
    </div>
  );
};

export default Home;
