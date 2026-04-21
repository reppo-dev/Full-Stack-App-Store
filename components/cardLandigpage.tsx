import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";

type LandingCard = {
  content: string;
  price: number;
};

const items: LandingCard[] = [
  { content: "Women’s Shoe", price: 45.5 },
  { content: "Cycle Accessories", price: 105 },
  { content: "Home Accessories", price: 34 },
];

export default function CardLandingPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 m-10 mx-20 gap-6">
      {items.map((item) => (
        <Card
          key={item.content}
          className="rounded-3xl bg-[#7c4848] text-white h-80 p-4"
        >
          <CardHeader>
            <CardTitle> Start From ${item.price}</CardTitle>
            <CardAction>
              <Button className="rounded-full">
                <Heart />
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent className="flex items-center justify-center h-full">
            <span className="text-xl font-semibold">{item.content}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
