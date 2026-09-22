import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table as TableIcon, Construction } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const sampleData = [
  { id: 1, name: "Widget A", category: "Electronics", stock: 150, status: "Active" },
  { id: 2, name: "Widget B", category: "Accessories", stock: 42, status: "Active" },
  { id: 3, name: "Widget C", category: "Electronics", stock: 0, status: "Out of Stock" },
  { id: 4, name: "Widget D", category: "Home", stock: 89, status: "Active" },
  { id: 5, name: "Widget E", category: "Accessories", stock: 12, status: "Low Stock" },
];

export default function TablePage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <TableIcon className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Data Table</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Construction className="h-5 w-5 text-amber-500" />
            Sample Data Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell className="text-right">{row.stock}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        row.status === "Active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : row.status === "Low Stock"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {row.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
