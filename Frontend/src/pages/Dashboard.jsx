import MainNavbar from "../components/global/MainNavbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Code,
  FileText,
  MessageCircle,
  Users,
  TrendingUp,
  Github,
  ChevronRight,
  Target,
  BarChart3,
  Play,
  Calculator,
  Trophy,
  Lightbulb,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../components/context/AuthContext";

import voiceConvoImage from "../assets/voice_convo_illustration.avif";
import leetCodeIllustration from "../assets/leetcode_illustration.svg"; // Example: coding desk, problems
import githubIllustration from "../assets/github_illustration.svg"; // Example: github octocat, code commits
import interviewsMetricIllustration from "../assets/interviews_metric_illustration.svg"; // Example: person talking to bot
import resumeMetricIllustration from "../assets/resume_metric_illustration.svg"; // Example: resume document
import skillsMetricIllustration from "../assets/skills_metric_illustration.svg"; // Example: dartboard, target
import interviewActionIllustration from "../assets/interview_action_illustration.svg"; // Example: person with mic
import resumeActionIllustration from "../assets/resume_action_illustration.svg"; // Example: person editing resume
import aptitudeActionIllustration from "../assets/aptitude_action_illustration.svg"; // Example: person taking test
import groupDiscussionActionIllustration from "../assets/group_discussion_action_illustration.svg"; // Example: group talking
import insightsIllustration from "../assets/insights_illustration.svg"; // Example: person with lightbulb

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats] = useState({
    interviewsTaken: user.performanceMetrics.interviewsCompleted,
    resumeScore: user.performanceMetrics.resumeScore,
    skillsImproved: user.performanceMetrics.skillsImproved,
  });

  const [performanceMetrics] = useState([
    {
      id: 1,
      title: "Interviews Completed",
      value: stats.interviewsTaken,
      illustration: interviewsMetricIllustration, // Illustration added
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      footerText: "+3 this week.",
      footerIcon: TrendingUp,
      footerIconColor: "text-green-500",
    },
    {
      id: 2,
      title: "Resume Score",
      value: `${stats.resumeScore}%`,
      illustration: resumeMetricIllustration, // Illustration added
      iconBg: "bg-green-100 dark:bg-green-900/20",
      footerText: "Excellent rating.",
    },
    {
      id: 3,
      title: "Skills Improved",
      value: stats.skillsImproved,
      illustration: skillsMetricIllustration, // Illustration added
      iconBg: "bg-purple-100 dark:bg-purple-900/20",
      footerText: "Key areas this month.",
    },
  ]);

  const developerIntegrations = [
    {
      title: "LeetCode Stats",
      icon: Code,
      color: "text-yellow-600 dark:text-yellow-400",
      path: "/leetcode-profile",
      illustration: leetCodeIllustration, // Illustration added
    },
    {
      title: "GitHub Activity",
      icon: Github,
      color: "text-foreground",
      path: "/github-profile",
      illustration: githubIllustration, // Illustration added
    },
  ];

  const explorePracticeActions = [
    {
      title: "AI Interview",
      description: "Practice with a smart AI interviewer.",
      icon: MessageCircle,
      color: "text-blue-600 dark:text-blue-400",
      path: "/interview",
      illustration: interviewActionIllustration,
    },
    {
      title: "Resume Builder",
      description: "Craft and optimize your professional resume.",
      icon: FileText,
      color: "text-green-600 dark:text-green-400",
      path: "/resume",
      illustration: resumeActionIllustration,
    },
    {
      title: "Aptitude Test",
      description: "AI-generated tests to sharpen your skills.",
      icon: Calculator,
      color: "text-purple-600 dark:text-purple-400",
      path: "/aptitude",
      illustration: aptitudeActionIllustration,
    },
    {
      title: "Group Discussion",
      description: "Hone your communication and leadership skills.",
      icon: Users,
      color: "text-orange-600 dark:text-orange-400",
      path: "/group-discussion",
      illustration: groupDiscussionActionIllustration,
    },
  ];

  return (
    <div>
      <MainNavbar />
      <div className="w-full bg-background min-h-screen">
        <div className="container mx-auto lg:px-8 px-5 py-22">
          {/* Welcome Section & Developer Integrations */}
          <div className="mb-12 border-b border-border pb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between ">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3 leading-tight">
                Welcome back,{" "}
                <span className="text-blue-700 dark:text-blue-400">
                  {user.userName.first}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Your personalized dashboard to career growth and excellence.
              </p>
            </div>
            {/* Developer Integrations Cards - Redesigned */}
            <div className="mt-8 lg:mt-0 grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-auto">
              <h2 className="sr-only">Developer Integrations</h2>{" "}
              {/* Screen reader only title */}
              {developerIntegrations.map((integration, index) => (
                <Card
                  key={index}
                  className="group cursor-pointer hover:shadow-lg transition-shadow duration-300 border border-border bg-card dark:bg-card-dark relative overflow-hidden flex flex-col justify-between items-start p-6"
                  onClick={() => navigate(integration.path)}
                >
                  <div className="relative z-10">
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      {integration.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Track and showcase your coding journey.
                    </p>
                  </div>
                  <div className="absolute bottom-0 right-0 w-28 h-28 opacity-70 group-hover:opacity-100 transition-opacity duration-300 translate-x-1/4 translate-y-1/4">
                    <img
                      src={integration.illustration}
                      alt={`${integration.title} illustration`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <ChevronRight className="absolute top-4 right-4 w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform z-10" />
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-10">
              {/* Your Performance Metrics - Redesigned */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-green-700 dark:text-green-400" />
                  Your Performance Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {performanceMetrics.map((metric) => (
                    <Card
                      key={metric.id}
                      className="group hover:shadow-lg transition-shadow duration-300 border border-border bg-card dark:bg-card-dark relative overflow-hidden p-6 flex flex-col justify-between"
                    >
                      <div className="relative z-10">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {metric.title}
                        </p>
                        <p className="text-4xl font-bold text-foreground">
                          {metric.value}
                        </p>
                        {metric.footerText && (
                          <p className="text-xs text-muted-foreground flex items-center mt-2">
                            {metric.footerIcon && (
                              <metric.footerIcon
                                className={`w-3 h-3 mr-1 ${metric.footerIconColor}`}
                              />
                            )}
                            {metric.footerText}
                          </p>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 w-38 h-48 opacity-70 group-hover:opacity-100 transition-opacity duration-300 translate-x-1/4 translate-y-1/4">
                        <img
                          src={metric.illustration}
                          alt={`${metric.title} illustration`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Explore & Practice - Redesigned */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                  <Play className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                  Explore & Practice
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {explorePracticeActions.map((action, index) => (
                    <Card
                      key={index}
                      className={`group cursor-pointer hover:shadow-lg transition-shadow duration-300 border border-border bg-card dark:bg-card-dark relative overflow-hidden flex flex-col justify-between p-6`}
                      onClick={() => navigate(action.path)}
                    >
                      <div className="relative z-10">
                        <h3 className="text-xl font-semibold text-foreground mb-1">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-snug">
                          {action.description}
                        </p>
                      </div>
                      <div className="absolute bottom-0 right-0 w-42 opacity-70 group-hover:opacity-100 transition-opacity duration-300 translate-x-1/4 translate-y-1/4">
                        <img
                          src={action.illustration}
                          alt={`${action.title} illustration`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full mt-4 text-primary flex items-center justify-start p-0 h-auto hover:bg-transparent hover:underline relative z-10"
                      >
                        Launch
                        <ChevronRight className="ml-1 w-4 h-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
            {/* Right Sidebar - Right 1/3 */}
            <div className="lg:col-span-1 space-y-6">
              {/* Insights & Tips - Redesigned */}
              <section>
                <Card className="shadow-sm border border-border bg-card dark:bg-card-dark relative overflow-hidden p-6 flex flex-col justify-between group">
                  <div className="relative z-10">
                    <CardTitle className="flex items-center gap-2 text-foreground mb-2">
                      <Lightbulb className="w-5 h-5 text-orange-700 dark:text-orange-400" />
                      Insights & Tips
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Discover personalized insights and expert tips to boost
                      your career preparation.
                    </p>
                  </div>
                  <div className="absolute bottom-0 right-0 w-36 h-36 opacity-70 group-hover:opacity-100 transition-opacity duration-300 translate-x-1/4 translate-y-1/4">
                    <img
                      src={insightsIllustration}
                      alt="Insights & Tips illustration"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-6 text-primary hover:bg-muted/50 border-border relative z-10"
                  >
                    Explore Tips <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </Card>
              </section>

              {/* New Voice Conversation Mock Interview Section - Retained unique style */}
              <section>
                <Card className="shadow-sm border border-border bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-800 dark:via-purple-950/20 dark:to-blue-950/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2">
                    <Badge
                      variant="secondary"
                      className="bg-purple-500 text-white dark:bg-purple-400 dark:text-gray-900 font-semibold text-xs animate-pulse"
                    >
                      NEW
                    </Badge>
                  </div>
                  <CardContent className="pw-6 text-center flex flex-col items-center">

                    <CardTitle className="text-xl font-bold text-foreground">
                      Voice Interview
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                      Experience a fully interactive, voice-driven mock
                      interview with our advanced AI.
                    </p>
                    <div className="w-2/4 max-w-xs mt-6">
                      <img
                        src={voiceConvoImage}
                        alt="Voice conversation mock interview illustration"
                        className="w-full h-auto mx-auto object-contain"
                      />
                    </div>
                    <Button
                      className="w-full mt-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                      onClick={() => navigate("/voice")}
                    >
                      Start Your Voice Interview
                    </Button>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
