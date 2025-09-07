import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { useState } from "react";
import {
  Settings,
  Bell,
  Palette,
  Fingerprint,
  User,
  Shield,
  Plug,
} from "lucide-react";

const SETTINGS_CATEGORIES = [
  {
    label: "General",
    value: "general",
    icon: Settings,
  },
  {
    label: "Notifications",
    value: "notifications",
    icon: Bell,
  },
  {
    label: "Personalization",
    value: "personalization",
    icon: Palette,
  },
  {
    label: "Connected apps",
    value: "connected-apps",
    icon: Plug,
  },
  {
    label: "Data controls",
    value: "data-controls",
    icon: Fingerprint,
  },
  {
    label: "Security",
    value: "security",
    icon: Shield,
  },
  {
    label: "Account",
    value: "account",
    icon: User,
  },
];

export default function SettingDialog({ children }) {
  const [activeCategory, setActiveCategory] = useState("general");

  const renderContent = () => {
    switch (activeCategory) {
      case "general":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">General</h2>
            <div className="space-y-4">
              {/* General settings content */}
              <p>Theme: Dark</p>
              <p>Accent color: Blue</p>
              <p>Language: Auto-detect</p>
              <p>Spoken language: Auto-detect</p>
            </div>
          </div>
        );
      case "notifications":
        return <div>Notifications content here.</div>;
      case "personalization":
        return <div>Personalization content here.</div>;
      // Add cases for other categories
      default:
        return <div>Select a category.</div>;
    }
  };

  return (
    <Dialog >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-full h-[60vh] p-0">
        <ResizablePanelGroup
          direction="horizontal"
          className="rounded-lg border"
        >
          <ResizablePanel defaultSize={25} minSize={15}>
            <ScrollArea className="h-full py-6 px-4">
              <Command>
                <CommandGroup>
                  {SETTINGS_CATEGORIES.map((category) => (
                    <CommandItem
                      key={category.value}
                      onSelect={() => setActiveCategory(category.value)}
                      className={`cursor-pointer ${
                        activeCategory === category.value
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      <category.icon className="mr-2 h-4 w-4" />
                      <span>{category.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </ScrollArea>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75} minSize={50}>
            <ScrollArea className="h-full p-6">
              {/* Settings content based on selected category */}
              {renderContent()}
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </DialogContent>
    </Dialog>
  );
}
