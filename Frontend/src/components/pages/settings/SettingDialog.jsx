import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  BoxIcon,
  Chrome,
  Edit,
  Github,
  HouseIcon,
  Key,
  LockKeyhole,
  Mail,
  PanelsTopLeftIcon,
  Settings,
  User,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContext } from "react";
import { AuthContext } from "@/components/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/context/mode-toggle";
import { Button } from "@/components/ui/button";

export default function SettingDialog({ children }) {
  const { user } = useContext(AuthContext);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={" md:h-[46vh]"}>
        <Tabs defaultValue="tab-1" className="items-center w-full">
          <TabsList className="h-auto rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="tab-1"
              className="data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <User
                className="mb-1.5 opacity-60"
                size={16}
                aria-hidden="true"
              />
              Account
            </TabsTrigger>
            <TabsTrigger
              value="tab-2"
              className="data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Settings
                className="mb-1.5 opacity-60"
                size={16}
                aria-hidden="true"
              />
              Settings
            </TabsTrigger>
            <TabsTrigger
              value="tab-3"
              className="data-[state=active]:after:bg-primary relative flex-col rounded-none px-4 py-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <LockKeyhole
                className="mb-1.5 opacity-60"
                size={16}
                aria-hidden="true"
              />
              Privacy
            </TabsTrigger>
          </TabsList>
          <div className="min-w-full">
            <TabsContent value="tab-1">
              <div className="flex gap-4 md:flex-row flex-col wrap-anywhere justify-center items-center w-full">
                <div className="m-4 w-2/6 flex justify-center items-center">
                  <div className="relative group cursor-pointer w-24 h-24">
                    {/* Profile Image */}
                    <img
                      className="rounded-full w-24 h-24 object-cover transition-opacity duration-300 group-hover:opacity-50"
                      src={
                        user.profileImage ||
                        `https://placehold.co/80x80/2f2f2f/FFFFFF?text=${
                          user.userName.first[0] +
                          (user.userName.last?.[0] || "")
                        }`
                      }
                      alt="Profile"
                    />

                    {/* Edit Icon */}
                    <Edit className="absolute inset-0 m-auto w-8 h-8 text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Hidden File Input */}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // handle upload logic here
                          console.log("Selected file:", file);
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="my-4 w-4/6 gap-y-4 flex flex-col">
                  <p className="p-0 text-start flex justify-start items-center gap-2">
                    <User size={16} /> {user.userName.first}{" "}
                    {user.userName.last}
                  </p>
                  <Separator />
                  <p className="p-0 text-start flex justify-start items-center gap-2">
                    <Mail size={16} /> {user.email}
                  </p>
                  <Separator />
                  <p className="p-0 text-center flex justify-between items-center gap-2">
                    <div className="flex justify-between items-center gap-2">
                      <Github size={16} /> Github
                    </div>
                    {user.isGithubLinked ? (
                      <Badge>Connected</Badge>
                    ) : (
                      <Badge variant={"outline"}>Connect</Badge>
                    )}
                  </p>
                  <Separator />
                  <p className="p-0 text-center flex justify-between items-center gap-2">
                    <div className="flex justify-between items-center gap-2">
                      <Chrome size={16} /> Google
                    </div>
                    {user.isGoogleLinked ? (
                      <Badge>Connected</Badge>
                    ) : (
                      <Badge variant={"outline"}>Connect</Badge>
                    )}
                  </p>
                  <Separator />
                  <Button variant={"outline"}>
                    {" "}
                    <Key /> Change password
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="tab-2">
              <div className="flex gap-4 md:flex-row flex-col wrap-anywhere">
                <div className="flex m-4 w-full">
                  <div className="w-1/2 flex items-center">
                    <p className="py-2">Theme</p>
                  </div>
                  <div className="w-1/2 flex justify-end items-center">
                    <ModeToggle />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tab-3">
              <p className="text-muted-foreground p-4 text-center text-xs">
                Comming soon
              </p>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
