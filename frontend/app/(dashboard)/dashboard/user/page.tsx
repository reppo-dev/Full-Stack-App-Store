import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import Link from "next/link";

export default function UserIndexPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Select a user from the list or navigate to a specific user profile
            using the sidebar. The full user management table with search,
            filtering, and bulk actions is coming soon.
          </p>
          <Link
            href="/contact"
            className="text-blue-600 hover:underline text-sm"
          >
            + Create a new user
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
