import { Link } from "react-router-dom";
import Logo from "../../../assets/Logo.jsx";
import { Button } from "@/components/ui/button";
import { Hamburger, Menu } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [toggle, setToggle] = useState(false);
  const isToggeled = () => {
    setToggle(!toggle);
  };

  return (
    <header className="w-full z-10  fixed top-0 backdrop-blur-3xl border-b ">
      <div className="container mx-auto h-20 lg:px-8 px-5 flex justify-between py-4 items-center">
        <div className="flex gap-2 items-center ">
          <Logo className="w-12" />
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text text-2xl font-bold">
            InterviewTalent
          </span>
        </div>
        <div className="lg:flex gap-8 items-center hidden ">
          <a href="#features">Features</a>
          <a href="#howitworks">How It Works?</a>

          <Link to={"login"}>
            <Button variant={"outline"} className={"cursor-pointer"}>
              {" "}
              Sign In
            </Button>
          </Link>
          <Link to={"signup"}>
            <Button
              className={
                "bg-gradient-to-r from-purple-600 to-blue-600 text-white cursor-pointer"
              }
            >
              {" "}
              Get Started
            </Button>
          </Link>
        </div>

        {/* small screen */}
        <Menu
          className="lg:hidden hover:bg-accent cursor-pointer rounded"
          onClick={isToggeled}
        />
      </div>
      {toggle ? (
        <div className="flex col-span-2 gap-8 md:gap-x-24 columns-2 lg:hidden justify-center items-center  p-5">
          <div className="gap-4 flex">
            <a href="#features">Features</a>
            <a href="#howitworks">How It Works?</a>
          </div>

          <div className="gap-4 flex">
            <Link to={"login"}>
              <Button variant={"outline"} className={"cursor-pointer"}>
                {" "}
                Sign In
              </Button>
            </Link>
            <Link to={"signup"}>
              <Button
                className={
                  "bg-gradient-to-r from-purple-600 to-blue-600 text-white cursor-pointer"
                }
              >
                {" "}
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        ""
      )}
    </header>
  );
}
