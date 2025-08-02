import LogoFull from "../LogoFull";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
export default function MainNavbar() {
  return (
    <div className="w-full z-10  fixed top-0 backdrop-blur-3xl border-b ">
      <div className="container mx-auto lg:px-8 px-5 flex justify-between py-2 items-center">
        <LogoFull />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className={"w-10 h-10"}>
              <AvatarImage src="https://avatars.githubusercontent.com/u/111770848?v=4" />
              <AvatarFallback>PK</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className={"flex gap-2"}>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">
                  john@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className={"flex gap-2"}>
              <User /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem><Settings/> Settings</DropdownMenuItem>
            <DropdownMenuItem><LogOut/> Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
