import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Puzzle, Construction } from "lucide-react";

export default function UIElementsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Puzzle className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">UI Elements</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Construction className="h-5 w-5 text-amber-500" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            A showcase of all available UI components and design system elements
            will be available here soon.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
