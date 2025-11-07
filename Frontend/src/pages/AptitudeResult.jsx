import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import MainNavbar from "@/components/global/MainNavbar";

export default function AptitudeResult() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Sample result data (replace with actual props/state)
  const score = state?.score || 16;
  const total = state?.total || 20;
  const accuracy = ((score / total) * 100).toFixed(0);
  const timeTaken = "25 min";

  const topicAccuracy = [
    { topic: "Arithmetic", value: 90, color: "bg-green-500" },
    { topic: "Algebra", value: 80, color: "bg-blue-400" },
    { topic: "Geometry", value: 75, color: "bg-indigo-400" },
    { topic: "Data Analysis", value: 60, color: "bg-red-400" },
    { topic: "Logic", value: 85, color: "bg-yellow-400" },
  ];

  const radarData = [
    { metric: "Speed", A: 85 },
    { metric: "Accuracy", A: 80 },
    { metric: "Consistency", A: 75 },
    { metric: "Confidence", A: 90 },
    { metric: "Focus", A: 70 },
  ];

  return (
    <div className="min-h-screen ">
      <MainNavbar />

      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold mb-2">
            Great job! Here's your performance summary 🎉
          </h1>
          <p className="text-gray-600">
            Review your performance and insights from the recent test.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Score */}
          <Card className="rounded-2xl shadow-sm border-gray-200 text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-green-600">{score}/{total}</div>
              <p className="text-gray-600 mt-2">Score</p>
            </CardContent>
          </Card>

          {/* Accuracy */}
          <Card className="rounded-2xl shadow-sm border-gray-200 text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-blue-500">{accuracy}%</div>
              <p className="text-gray-600 mt-2">Accuracy</p>
            </CardContent>
          </Card>

          {/* Time */}
          <Card className="rounded-2xl shadow-sm border-gray-200 text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-yellow-500">{timeTaken}</div>
              <p className="text-gray-600 mt-2">Time Taken</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Accuracy by Topic */}
          <Card className="rounded-2xl border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Accuracy by Topic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topicAccuracy.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>{item.topic}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Strength Areas */}
          <Card className="rounded-2xl border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Strength Areas</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <Radar
                    name="Performance"
                    dataKey="A"
                    stroke="#2563eb"
                    fill="#60a5fa"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card className="rounded-2xl border-gray-200 shadow-sm mb-10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className=" text-sm leading-relaxed">
              <span className="text-green-600 font-semibold">
                You performed best in Arithmetic
              </span>
              , achieving <b>90% accuracy</b>. Keep up the great work! However, you should focus on improving your{" "}
              <span className="text-red-500 font-semibold">Data Analysis</span> skills, where your accuracy was only 60%.
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button className="bg-blue-600 text-white hover:bg-blue-700 px-8">
            Retake Test
          </Button>
          <Button
            variant="secondary"
            className="px-8"
            onClick={() => navigate(`/aptitude/practice/${category}`)}
          >
            Next Topic
          </Button>
          <Button variant="outline" className="px-8">
            View Explanation Report
          </Button>
        </div>
      </div>
    </div>
  );
}
