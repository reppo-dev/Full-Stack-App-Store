import BannerCarousel from "@/components/BannerCarousel";
import CardLandingPage from "@/components/cardLandigpage";

const Home = () => {
  return (
    <div className="mx-0 md:mx-20">
      <div className="mx-10 md:mx-0">
        <BannerCarousel />
      </div>
      <CardLandingPage />
    </div>
  );
};

export default Home;
