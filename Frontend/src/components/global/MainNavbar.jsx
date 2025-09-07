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
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import SettingsDialog from "../pages/settings/SettingDialog";
export default function MainNavbar() {
  const { user, logout } = useContext(AuthContext);

  const badgeName =
    user.profileImage ||
    `https://placehold.co/30x30/2f2f2f/FFFFFF?text=${
      user.userName.first[0] + user.userName.last?.[0]
    }`;

  return (
    <div className="w-full z-10  fixed top-0 backdrop-blur-3xl border-b ">
      <div className="container mx-auto lg:px-8 px-5 flex justify-between py-2 items-center">
        <LogoFull />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className={"w-10 h-10"}>
              <AvatarImage src={badgeName} />
              <AvatarFallback>PK</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className={"flex gap-2"}>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {user.userName.first + " " + user.userName.last}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <SettingsDialog>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Settings /> Settings
              </DropdownMenuItem>
            </SettingsDialog>
            <DropdownMenuItem className={"flex gap-2"}  onClick={logout}>
                <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
