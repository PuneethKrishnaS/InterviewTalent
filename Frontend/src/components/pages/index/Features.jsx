import {
  Mic,
  FileText,
  Calculator,
  Code,
  Users,
  BarChart3,
  Camera,
  Target,
  Stars,
  Github,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Features() {
  const features = [
    {
      icon: <Stars className="w-8 h-8" />,
      title: "Resume Based Interviews",
      description:
        "Practice with intelligent AI that provides real-time facial expression analysis, speech pattern evaluation, and personalized feedback.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "ATS Resume Builder",
      description:
        "Create professional, ATS-optimized resumes with AI suggestions, keyword optimization, and industry-specific templates.",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: <Calculator className="w-8 h-8" />,
      title: "Aptitude Practice Tests",
      description:
        "Master quantitative, logical, and verbal reasoning with AI-generated questions tailored to your skill level and target companies.",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Group Discussion Simulation",
      description:
        "Practice group interviews and discussions with AI-moderated scenarios, peer interaction analysis, and leadership skills development.",
      gradient: "from-pink-500 to-pink-600",
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Leetcode Profile",
      description:
        "Integrated code editor with LeetCode sync, GitHub integration, real-time execution, and technical interview preparation.",
      gradient: "from-orange-500 to-orange-600",
    },
    {
      icon: <Github className="w-8 h-8" />,
      title: "Github Profile",
      description:
        "Integrated of GitHub with realtime updates which identify your repositries and helps to build your profile",
      gradient: "from-slate-500 to-slate-600",
    },
  ];

  return (
    <section className="min-h-fit py-16 w-full  items-center justify-center flex flex-col ">
      <div className="container m-auto lg:px-8 px-5 items-center justify-center flex flex-col ">
        <div className="text-center leading-tight gap-6 flex flex-col my-8  ">
          <h1 className="md:text-3xl text-2xl xl:text-5xl font-bold text-wrap">
            Complete Interview Preparation{" "}
            <span className="bg-gradient-to-l to-purple-500 from-blue-600 text-transparent bg-clip-text">
              Ecosystem{" "}
            </span>
          </h1>
          <p className="text-muted-foreground md:text-xl text-sm ">
            Every tool and feature you need to excel in modern job interviews,
            powered by cutting-edge AI technology
          </p>{" "}
        </div>
        <div className="container mx-auto lg:px-8 px-5">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={"backdrop-blur-2xl bg-transparent"}>
                <CardHeader>
                  <div
                    className={`${feature.gradient} bg-gradient-to-b w-fit p-2 rounded-2xl text-background`}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className={"md:text-xl"}>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
