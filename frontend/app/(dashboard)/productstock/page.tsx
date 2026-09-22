import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Construction } from "lucide-react";

export default function ProductStockPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Product Stock</h1>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Construction className="h-5 w-5 text-amber-500" />
            Stock Management — Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Product stock tracking, low-stock alerts, and inventory management
            features will be available here. This page will connect to the
            product inventory system to provide real-time stock levels.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
