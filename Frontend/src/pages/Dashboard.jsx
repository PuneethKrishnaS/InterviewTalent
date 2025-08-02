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
  Activity,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";


export default function Dashboard() {
  const navigate = useNavigate();

  const [stats] = useState({
    interviewsTaken: 12,
    resumeScore: 88,
    discussionPoints: 45,
    badgesEarned: 7,
    streak: 5,
    skillsImproved: 3,
  });

  const [performanceMetrics] = useState([
    {
      id: 1,
      title: "Interviews Completed",
      value: stats.interviewsTaken,
      icon: MessageCircle,
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      footerText: "+3 this week.",
      footerIcon: TrendingUp,
      footerIconColor: "text-green-500",
    },
    {
      id: 2,
      title: "Resume Score",
      value: `${stats.resumeScore}%`,
      icon: FileText,
      iconBg: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      footerText: "Excellent rating.",
    },
    {
      id: 3,
      title: "Skills Improved",
      value: stats.skillsImproved,
      icon: Target,
      iconBg: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      footerText: "Key areas this month.",
    },
  ]);

  const [recentActivity] = useState([
    {
      id: 1,
      type: "interview",
      title: "React Interview Practice",
      date: "2 hours ago",
      score: 92,
    },
    {
      id: 2,
      type: "resume",
      title: "Resume Optimization Complete",
      date: "1 day ago",
      score: 88,
    },
    {
      id: 3,
      type: "aptitude",
      title: "Aptitude Test: Quantitative",
      date: "2 days ago",
      score: 78,
    },

  ]);

  const explorePracticeActions = [
    {
      title: "AI Interview",
      description: "Practice with a smart AI interviewer.",
      icon: MessageCircle,
      color: "text-blue-600 dark:text-blue-400",
      path: "/interview",
    },
    {
      title: "Resume Builder",
      description: "Craft and optimize your professional resume.",
      icon: FileText,
      color: "text-green-600 dark:text-green-400",
      path: "/resume",
    },
    {
      title: "Aptitude Test", // Changed title
      description: "AI-generated tests to sharpen your skills.",
      icon: Calculator,
      color: "text-purple-600 dark:text-purple-400",
      path: "/aptitude",
    },
    {
      title: "Group Discussion", // New action
      description: "Hone your communication and leadership skills.",
      icon: Users, // Changed icon from UserCheck to Users as requested in initial prompt
      color: "text-orange-600 dark:text-orange-400",
      path: "/group-discussion",
    },
  ];

  return (
    <div>
      <MainNavbar />
      <div className="w-full">
        <div className="container mx-auto lg:px-8 px-5 py-22">
          {/* Welcome Section & Developer Integrations */}
          <div className="mb-12 border-b border-border pb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between ">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3 leading-tight">
                Welcome back,{" "}
                <span className="text-blue-700 dark:text-blue-400">John.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Your personalized dashboard to career growth and excellence.
              </p>
            </div>
            {/* Developer Integrations - Not in card, simple list */}
            <div >
              {" "}
              {/* Adjust width as needed */}
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                Developer Integrations
              </h2>
              <div className="space-y-3 md:flex md:flex-row md:gap-5 ">
                <Button
                  variant="outline"
                  className="w-full md:w-fit justify-between hover:bg-muted/50 transition-colors border-border"
                  onClick={() => navigate("/leetcode-profile")}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-md mr-3">
                      <Code className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="font-medium text-foreground">
                      LeetCode Stats
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full md:w-fit justify-between hover:bg-muted/50 transition-colors border-border"
                  onClick={() => navigate("/github-profile")}
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-md mr-3">
                      <Github className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-foreground">
                      GitHub Activity
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {" "}
 
            <div className="lg:col-span-2 space-y-10">
              {/* Your Performance Metrics */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-green-700 dark:text-green-400" />
                  Your Performance Metrics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {performanceMetrics.map((metric) => (
                    <Card
                      key={metric.id}
                      className="hover:shadow-lg transition-shadow duration-300 border border-border"
                    >
                      <CardContent >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              {metric.title}
                            </p>
                            <p className="text-4xl font-bold text-foreground">
                              {metric.value}
                            </p>
                          </div>
                          <div className={`p-3 ${metric.iconBg} rounded-lg`}>
                            <metric.icon
                              className={`w-6 h-6 ${metric.iconColor}`}
                            />
                          </div>
                        </div>
                        {metric.footerText && (
                          <p className="text-xs text-muted-foreground flex items-center">
                            {metric.footerIcon && (
                              <metric.footerIcon
                                className={`w-3 h-3 mr-1 ${metric.footerIconColor}`}
                              />
                            )}
                            {metric.footerText}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Explore & Practice */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                  <Play className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                  Explore & Practice
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {" "}
                  {/* Adjusted for 4 columns if space allows, otherwise 2 */}
                  {explorePracticeActions.map((action, index) => (
                    <Card
                      key={index}
                      className={`group cursor-pointer hover:shadow-lg transition-shadow duration-300 border border-border`}
                      onClick={() => navigate(action.path)}
                    >
                      <CardContent className=" flex flex-col items-start">
                        <div
                          className={`w-12 h-12 rounded-lg bg-muted/60 flex items-center justify-center mb-4 transition-transform duration-200`}
                        >
                          <action.icon className={`w-6 h-6 ${action.color}`} />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-snug">
                          {action.description}
                        </p>
                        <div 
                          className="mt-4 text-primary flex  text-center items-center group-hover:underline "
                        >
                          Launch <ChevronRight className="ml-1 w-3 h-3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
            {/* Right Sidebar - Right 1/3 */}
            <div className="lg:col-span-1 space-y-6">
              {/* Recent Activity - Streamlined */}

              {/* Insights & Tips */}
              <section>
                <Card className="shadow-sm border border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Lightbulb className="w-5 h-5 text-orange-700 dark:text-orange-400" />
                      Insights & Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Discover personalized insights and expert tips to boost
                      your career preparation.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full text-primary hover:bg-muted/50 border-border"
                    >
                      Explore Tips <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </section>

                            <section>
                <Card className="shadow-sm border border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Activity className="w-5 h-5 text-muted-foreground" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 bg-background border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`p-2 rounded-md ${
                                item.type === "interview"
                                  ? "bg-blue-50 dark:bg-blue-900/10"
                                  : item.type === "resume"
                                  ? "bg-green-50 dark:bg-green-900/10"
                                  : item.type === "aptitude"
                                  ? "bg-purple-50 dark:bg-purple-900/10"
                                  : "bg-yellow-50 dark:bg-yellow-900/10"
                              }`}
                            >
                              {item.type === "interview" && (
                                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              )}
                              {item.type === "resume" && (
                                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                              )}
                              {item.type === "aptitude" && (
                                <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              )}
                              {item.type === "badge" && (
                                <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {item.title}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.date}
                              </p>
                            </div>
                          </div>
                          {item.score && (
                            <Badge
                              className={`text-sm px-3 py-1 font-semibold border-none ${
                                item.score >= 90
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                                  : item.score >= 80
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                  : "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
                              }`}
                            >
                              {item.score}%
                            </Badge>
                          )}
                          {!item.score && item.type === "badge" && (
                            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 text-sm px-3 py-1 font-semibold border-none">
                              New Badge
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
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