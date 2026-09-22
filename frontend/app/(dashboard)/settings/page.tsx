import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Construction } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="grid gap-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Construction className="h-5 w-5 text-amber-500" />
              Settings — Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Application settings including profile management, notification preferences,
              security options, and theme customization will be available here soon.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Planned Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Profile information management
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Password and security settings
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Notification preferences
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Theme and display options
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
