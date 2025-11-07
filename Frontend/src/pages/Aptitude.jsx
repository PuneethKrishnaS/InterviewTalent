import React, { useEffect, useState } from "react";
import MainNavbar from "@/components/global/MainNavbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeftCircle, BookOpen, ChevronLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/axios";

export default function Aptitude() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/v1/aptitude/summary", {
          withCredentials: true,
        });
        const data = res.data.data; // since appResponse wraps data inside .data

        // Prepare category cards
        const cats = [
          {
            name: "Quantitative",
            key: "arithmetic",
            color: "bg-blue-500",
            completed: data.categoriesSummary.quantitative.completed,
            total: data.categoriesSummary.quantitative.total,
          },
          {
            name: "Logical",
            key: "logical-reasoning",
            color: "bg-green-500",
            completed: data.categoriesSummary.logical.completed,
            total: data.categoriesSummary.logical.total,
          },
          {
            name: "Verbal",
            key: "verbal-reasoning",
            color: "bg-purple-500",
            completed: data.categoriesSummary.verbal.completed,
            total: data.categoriesSummary.verbal.total,
          },
          {
            name: "Non-Verbal",
            key: "non-verbal-reasoning",
            color: "bg-orange-500",
            completed: data.categoriesSummary.nonverbal.completed,
            total: data.categoriesSummary.nonverbal.total,
          },
        ];

        // Calculate overall %
        const totalCompleted = cats.reduce((s, c) => s + c.completed, 0);
        const totalQuestions = cats.reduce((s, c) => s + c.total, 0);
        const overall = totalQuestions ? (totalCompleted / totalQuestions) * 100 : 0;

        setCategories(cats);
        setOverallProgress(overall);
      } catch (err) {
        console.error("Error fetching aptitude summary", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const handleCategoryClick = (categoryKey) => {
    navigate(`/aptitude/type/${categoryKey}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader2 className="animate-spin w-8 h-8 mb-2" />
        <p className="text-muted-foreground">Loading your progress...</p>
      </div>
    );
  }

  return (
    <div>
      <MainNavbar />
      <div className="w-full">
        <div className="container mx-auto lg:px-8 px-5 py-22">
          {/* Top nav */}
          <nav className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
            <div className="text-right">
              <h1 className="font-black text-md md:text-xl">Aptitude Practice</h1>
              <p className="text-muted-foreground text-sm md:text-md">
                Track and practice your aptitude skills
              </p>
            </div>
          </nav>

          {/* Overall progress */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Overall Progress</CardTitle>
                <CardDescription>
                  Keep up the great work! You’re making excellent progress across all categories.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={overallProgress}></Progress>
                <p className="text-md mt-2 font-medium">
                  {overallProgress.toFixed(0)}% Completed
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Categories */}
          <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {categories.map((cat) => (
              <Card key={cat.key} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{cat.name}</CardTitle>
                  <CardDescription>
                    {cat.completed}/{cat.total} completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={
                      cat.total ? (cat.completed / cat.total) * 100 : 0
                    }
                  />
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-muted-foreground">
                      {cat.total ? (
                        `${((cat.completed / cat.total) * 100).toFixed(1)}%`
                      ) : (
                        "0%"
                      )}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleCategoryClick(cat.key)}
                      className={`${cat.color} text-white`}
                    >
                      <BookOpen className="w-4 h-4 mr-1" /> Explore Topics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
