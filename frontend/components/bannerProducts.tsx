"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

export default function BannerProducts() {
  return (
    <div className="mx-2">
      <Carousel className="w-full max-w-7xl mx-auto">
        <CarouselContent>
          <CarouselItem>
            <div className="bg-blue-600 text-white rounded-3xl p-16 flex flex-col items-center justify-center text-center gap-6">
              <p className="text-sm opacity-80">September 12-22</p>

              <h2 className="text-3xl font-bold">
                Enjoy free home delivery in this summer
              </h2>

              <p className="opacity-80">
                Designer Dresses – Pick from trendy Designer Dress.
              </p>

              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Get Started
              </Button>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="bg-blue-600 text-white rounded-3xl p-16 flex flex-col items-center justify-center text-center gap-6">
              <p className="text-sm opacity-80">September 12-22</p>

              <h2 className="text-3xl font-bold">
                Enjoy free home delivery in this summer
              </h2>

              <p className="opacity-80">
                Designer Dresses – Pick from trendy Designer Dress.
              </p>

              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Get Started
              </Button>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="bg-blue-600 text-white rounded-3xl p-16 flex flex-col items-center justify-center text-center gap-6">
              <p className="text-sm opacity-80">September 12-22</p>

              <h2 className="text-3xl font-bold">
                Enjoy free home delivery in this summer
              </h2>

              <p className="opacity-80">
                Designer Dresses – Pick from trendy Designer Dress.
              </p>

              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Get Started
              </Button>
            </div>
          </CarouselItem>
        </CarouselContent>

        <CarouselPrevious className="left-6 bg-white/40 hover:bg-white/60 rounded-full" />
        <CarouselNext className="right-6 bg-white/40 hover:bg-white/60 rounded-full" />
      </Carousel>
    </div>
  );
}
