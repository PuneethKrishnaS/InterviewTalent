// AptitudeTopics.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeftCircle, ArrowRightCircle, ChevronLeft, Search } from "lucide-react";

import MainNavbar from "@/components/global/MainNavbar";
import api from "@/utils/axios";

export default function AptitudeTopics() {
  const { category } = useParams(); // e.g. arithmetic, logical
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [filteredTopics, setFilteredTopics] = useState([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.get(`/api/v1/aptitude/topics/${category}`, {
          withCredentials: true,
        });
        const data = res.data.data; 
        setTopics(data.topics);
        setFilteredTopics(data.topics);
      } catch (err) {
        console.error("Error fetching topics", err);
      }
    };
    fetchTopics();
  }, [category]);

  // Filter logic
  useEffect(() => {
    let results = topics.filter((t) =>
      t.topic.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (difficulty !== "All") {
      // NOTE: difficulty is not provided in backend data, keeping filter simple for now.
      // results = results.filter((t) => t.difficulty === difficulty); 
    }
    setFilteredTopics(results);
  }, [searchQuery, difficulty, topics]);

  return (
    <div className="min-h-screen">
      <MainNavbar />
      <div className="container mx-auto px-4 md:px-8 py-22">
        <nav className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <div className="text-right">
            <h1 className="font-black text-md md:text-xl">
              {category.charAt(0).toLocaleUpperCase() + category.substring(1)}{" "}
              Aptitude Practice
            </h1>
            <p className="text-muted-foreground text-sm md:text-md">
              Track and practice your aptitude skills
            </p>
          </div>
        </nav>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex items-center w-full relative">
            <Search className="absolute left-4" />
            <Input
              placeholder="Search Topics (e.g., Problems on Trains)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-full"
            />
          </div>
        </div>

        {/* Topics list */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredTopics.length > 0 ? (
            filteredTopics.map((topic) => (
              <Card className={"gap-2"} key={topic.topic}> 
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    {topic.topic}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{topic.completedQuestions} / {topic.totalQuestions} Questions</span>
                      <span>{topic.progressPercent.toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={topic.progressPercent} // Use the calculated progressPercent
                  />
                  <Button
                    className="mt-4 w-full font-black bg-blue-600 hover:bg-blue-700 text-white" // Primary button style
                    onClick={() =>
                      navigate(`/aptitude/practice/${category}/${topic.topic}`)
                    }
                    // Changed to default button for better visibility
                  >
                    Start Learning <ArrowRightCircle className="ml-2 h-4 w-4"/>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">
              No topics found for this category.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}