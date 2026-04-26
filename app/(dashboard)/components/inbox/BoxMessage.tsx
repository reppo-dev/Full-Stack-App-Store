import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Star, Download, Info, Trash } from "lucide-react";
import { emails } from "./models";
import { Checkbox } from "@/components/ui/checkbox";

const BoxMessage = () => {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <div className="relative hidden md:block">
          <Input
            className="w-full p-5 rounded-full"
            placeholder="Search mail"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex">
          <Button className="rounded-r-none">
            <Download />
          </Button>
          <Button className="m-0 p-0 rounded-none">
            <Info />
          </Button>
          <Button className="rounded-l-none">
            <Trash />
          </Button>
        </div>
      </div>
      <div>
        {emails.map((email) => (
          <div
            key={email.id}
            className="grid grid-cols-[2.5rem_2.5rem_1fr_7.5rem_2fr_1fr] items-center gap-4 py-2"
          >
            <Checkbox />

            <Star className="h-5 w-5 fill-current text-gray-400" />

            <span className="font-medium">{email.name}</span>

            <span className="text-sm">{email.label}</span>

            <span className="text-sm truncate">{email.preview}</span>
            <span className="text-sm truncate">{email.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default BoxMessage;
