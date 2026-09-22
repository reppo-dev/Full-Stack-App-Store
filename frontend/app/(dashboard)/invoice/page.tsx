import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Construction } from "lucide-react";

export default function InvoicePage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Invoices</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Construction className="h-5 w-5 text-amber-500" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The invoice management system is currently under development. You will be able to
            create, send, and track invoices from this page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
