import Logo from "../../../assets/Logo.jsx";
import { Calculator, Camera, Code, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import hero from "@/assets/hero.avif";

export default function Hero() {
  return (
    <section className="min-h-fit w-full bg-gradient-to-b from-background from-50%  to-purple-400 dark:to-purple-950 dark:from-25%  items-center justify-center flex flex-col ">
      <div className="py-10 bg-background my-6"></div>
      <div className="container mx-auto lg:px-8 px-5 items-center justify-center flex flex-col ">
        <div className="flex border-1 border-accent  p-2  px-4 rounded-full gap-2 bg-gradient-to-r text-sm bg-[linear-gradient(to_right,_rgb(30_58_138_/_0.2),_rgb(88_28_135_/_0.2))] bg-opacity-20	">
          <Logo className="w-5 " />
          Complete Interview Preparation Platform
        </div>

        <div className="text-center leading-tight gap-6 flex flex-col my-8 ">
          <h1 className="md:text-5xl text-4xl xl:text-7xl font-bold">
            Master Every Aspect of{" "}
            <span className="bg-gradient-to-l to-purple-500 from-blue-600 text-transparent bg-clip-text">
              Interview Success{" "}
            </span>
          </h1>
          <p className="text-muted-foreground md:text-xl text-sm ">
            From AI-powered mock interviews to ATS-optimized resumes, coding
            practice to group discussions - everything you need to land your
            dream job in one comprehensive platform.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 text-sm md:text-md mb-8">
          <div className="flex border-1 border-gray-700 p-2  px-4 w-fit rounded-full gap-2 justify-start items-center">
            <Camera className="text-blue-500 " /> AI Interview Analysis
          </div>

          <div className="flex border-1 border-gray-700 p-2  px-4 w-fit rounded-full gap-2 	justify-start items-center">
            <Code className="text-yellow-500 size" /> Coding Practice
          </div>

          <div className="flex border-1 border-gray-700 p-2  px-4 w-fit rounded-full gap-2 	justify-start items-center">
            <Calculator className="text-green-500" /> Aptitude Tests
          </div>

          <div className="flex border-1 border-gray-700 p-2  px-4 w-fit rounded-full gap-2 	justify-start items-center">
            <Users className="text-purple-500" /> Group Discussions
          </div>
        </div>

        <Link to={"/Login"}>
          <Button
            className={
              "bg-gradient-to-r from-purple-600 to-blue-600 text-white cursor-pointer text-xl"
            }
            size={"lg"}
          >
            Start Your Journey
          </Button>
        </Link>
        <div className="my-8">
          <img
            loading="lazy"
            src={hero}
            alt="InterviewTalent Hero"
            className="rounded-xl shadow-2xl  "
          />
        </div>
      </div>
    </section>
  );
}
