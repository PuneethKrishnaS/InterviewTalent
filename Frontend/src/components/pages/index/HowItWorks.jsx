import {  TargetIcon, RocketIcon, BrainIcon, ChartSplineIcon, CheckCircle, Play, BarChart3, Target, Award,} from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      title: "Create Your Profile & Set Goals",
      description:
        "Sign up, upload your resume, connect your GitHub/LeetCode profiles, and set your career goals. Our AI analyzes your background to create a personalized preparation plan.",
      image: <TargetIcon size={50}/>,
      features: ["Profile analysis", "Goal setting", "Custom learning path"],
    },
    {
      step: "02",
      title: "Practice Across All Dimensions",
      description:
        "Engage with our comprehensive practice modules - AI interviews, coding challenges, aptitude tests, and group discussions. Each session provides real-time feedback and analysis.",
      image: <RocketIcon size={50}/>,
      features: [
        "AI mock interviews",
        "Coding practice",
        "Aptitude tests",
        "Group discussions",
      ],
    },
    {
      step: "03",
      title: "Get AI-Powered Insights",
      description:
        "Receive detailed analysis of your performance including facial expressions, speech patterns, technical skills, and communication effectiveness with actionable improvement suggestions.",
      image: <BrainIcon size={50}/>,
      features: [
        "Real-time analysis",
        "Performance insights",
        "Improvement recommendations",
      ],
    },
    {
      step: "04",
      title: "Track Progress & Achieve Success",
      description:
        "Monitor your improvement with comprehensive analytics, achieve milestones, earn badges, and build confidence for your actual interviews.",
      image: <ChartSplineIcon size={50} />,
      features: [
        "Progress tracking",
        "Achievement system",
        "Performance analytics",
      ],
    },
  ];

  return (
    <section id="how-it-works" className="min-h-fit py-16 w-full items-center justify-center flex flex-col ">
      <div className="container mx-auto lg:px-8 px-5 items-center justify-center flex flex-col ">


        <div className="text-center leading-tight gap-6 flex flex-col my-8  ">
          <h1 className="md:text-3xl text-2xl xl:text-5xl font-bold text-wrap">
            Your Journey to Interview Success
          </h1>
          <p className="text-muted-foreground md:text-xl text-sm ">
            Follow our proven 4-step process to master every aspect of job
            interviews and land your dream role
          </p>{" "}
        </div>

        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex items-center mb-16 last:mb-0"
            >
              {/* Step Number and Line */}
              <div className="flex flex-col items-center mr-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg">
                  {step.step}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-40 bg-gradient-to-b from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-border">
                <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
                  <div className="text-6xl lg:text-7xl">{step.image}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                      {step.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.features.map((feature, featureIndex) => (
                        <span
                          key={featureIndex}
                          className="inline-flex items-center px-3 py-1 bg-card rounded-full text-sm font-medium text-card-foreground border border-border"
                        >
                          <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-32 h-32 border border-white rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 border border-white rounded-full"></div>
            </div>

            <div className="relative text-center max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-4">
                  <Play className="w-8 h-8" />
                  <BarChart3 className="w-8 h-8" />
                  <Target className="w-8 h-8" />
                  <Award className="w-8 h-8" />
                </div>
              </div>

              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                Ready to Transform Your Interview Skills?
              </h3>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of successful candidates who've mastered
                interviews with our comprehensive AI-powered platform
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                  Start Your Journy
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
