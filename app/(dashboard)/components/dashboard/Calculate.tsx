import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import Image from "next/image";

import person from "@/public/Icondashboardperson.png";
import box from "@/public/Icondashboardbox.png";
import trend from "@/public/Icondashboardtrend.png";
import rimind from "@/public/Icondashboardrimind.png";

import { TrendingUp, TrendingDown } from "lucide-react";

const stats = [
  {
    title: "Total User",
    value: "40,689",
    icon: person,
    trend: "up",
    percent: "8.5%",
    text: "Up from yesterday",
  },
  {
    title: "Total Order",
    value: "10293",
    icon: box,
    trend: "up",
    percent: "1.3%",
    text: "Up from past week",
  },
  {
    title: "Total Sales",
    value: "$89,000",
    icon: trend,
    trend: "down",
    percent: "4.3%",
    text: "Down from yesterday",
  },
  {
    title: "Total Pending",
    value: "2040",
    icon: rimind,
    trend: "up",
    percent: "1.8%",
    text: "Up from yesterday",
  },
];

const Calculate = () => {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 my-10 gap-6">
      {stats.map((item, idx) => (
        <Card
          key={idx}
          className="bg-card border border-border shadow-sm rounded-xl p-4"
        >
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-base font-medium text-foreground">
              {item.title}
            </CardTitle>
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted/60">
              <Image src={item.icon} alt={item.title} width={22} height={22} />
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold text-foreground mb-2">
              {item.value}
            </p>
            <div className="flex items-center gap-2 text-sm">
              {item.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`font-medium ${
                  item.trend === "up" ? "text-green-500" : "text-red-500"
                }`}
              >
                {item.percent}
              </span>
              <span className="text-muted-foreground">{item.text}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Calculate;
