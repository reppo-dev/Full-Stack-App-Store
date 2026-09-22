import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, User, Construction } from "lucide-react";

const teamMembers = [
  { name: "Admin User", role: "Administrator", initials: "AU" },
  { name: "Support Agent", role: "Support", initials: "SA" },
  { name: "Content Manager", role: "Editor", initials: "CM" },
];

export default function TeamPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Team</h1>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Construction className="h-5 w-5 text-amber-500" />
            Team Management — Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Full team management features including invitations, role assignments,
            and activity logs are under development.
          </p>

          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="flex items-center gap-4 p-3 rounded-lg border"
              >
                <Avatar>
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
