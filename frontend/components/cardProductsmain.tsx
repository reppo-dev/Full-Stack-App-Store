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
import { Product } from "@/models/modles";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const CardProducts = ({ props }: { props: Product }) => {
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
          {/* <Button className="rounded-full" onClick={onToggleFavorite}>
            <Heart fill={isFavorite ? "red" : "none"} color="red" />
          </Button> */}
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 justify-around">
          <span>${props.price}</span>
          {props.rating}
        </div>
        <Button className="mt-2" asChild>
          <Link href={`/products/${props.ID}`} className="mt-2">
            see more
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default CardProducts;
