import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Heart } from "lucide-react";
import Image from "next/image";

type Product = {
  ID: string;
  title: string;
  price: number;
  rating: number;
  images: string[];
};
type CardProductProps = {
  props: Product;
};

const CardProduct = ({ props }: CardProductProps) => {
  return (
    <Card>
      <Carousel className="w-full max-w-7xl mx-auto">
        <CarouselContent>
          {props.images.map((img, index) => (
            <CarouselItem key={index}>
              <Image
                src={img}
                alt={`product-image-${index}`}
                width={1200}
                height={960}
                className="w-full h-80 object-cover p-2 rounded-lg"
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-6 bg-white/40 hover:bg-white/60 rounded-full" />
        <CarouselNext className="right-6 bg-white/40 hover:bg-white/60 rounded-full" />
      </Carousel>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <CardAction>
          <Button className="rounded-full">
            <Heart />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 justify-around">
          <span>${props.price}</span>
          {props.rating}
        </div>
        <Button className="mt-2">Edit Product</Button>
      </CardContent>
    </Card>
  );
};

export default CardProduct;
