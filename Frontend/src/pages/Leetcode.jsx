import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/global/MainNavbar";
import { Button } from "../components/ui/button";
import { ArrowLeftCircle, Trophy, Code, CalendarDays, Star, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function Leetcode() {
  const navigate = useNavigate();

  // Mock LeetCode profile data, simplified
  const mockProfileData = {
    username: "rspuneeth22",
    profileImage: "https://placehold.co/100x100/A0AEC0/FFFFFF?text=P", // Placeholder image
    rank: "~5,000,000",
    totalSolved: {
      easy: 4,
      medium: 0,
      hard: 0,
      total: 4,
    },
    communityStats: {
      views: 0,
      solutions: 0,
      discuss: 0,
      reputation: 0,
    },
    languages: [
      { name: "JavaScript", solved: 2 },
      { name: "Python3", solved: 2 },
    ],
    skills: {
      Advanced: [],
      Intermediate: [
        { name: "Hash Table", count: 1 },
        { name: "Math", count: 1 },
      ],
      Fundamental: [
        { name: "Array", count: 2 },
        { name: "Two Pointers", count: 2 },
        { name: "String", count: 1 },
      ],
    },
    badges: {
      count: 0,
      locked: "Jul LeetCoding Challenge",
    },
    recentSubmissions: [
      {
        id: 1,
        problem: "Find the Index of the First Occurrence in a String",
        timeAgo: "8 months ago",
        status: "Accepted",
      },
      {
        id: 2,
        problem: "Remove Duplicates from Sorted Array",
        timeAgo: "8 months ago",
        status: "Accepted",
      },
      {
        id: 3,
        problem: "Palindrome Number",
        timeAgo: "a year ago",
        status: "Accepted",
      },
      {
        id: 4,
        problem: "Two Sum",
        timeAgo: "a year ago",
        status: "Accepted",
      },
    ],
  };

  return (
    <div className="bg-background min-h-screen text-foreground font-inter">
      <MainNavbar />
      <div className="w-full">
        <div className="container mx-auto lg:px-8 px-5 py-8 md:py-12">
          {/* Top navigation */}
          <nav className="flex justify-between items-center mb-8">
            <Button
              variant={"link"}
              onClick={() => navigate("/dashboard")}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <ArrowLeftCircle className="mr-2 h-5 w-5" />
              Back to Dashboard
            </Button>
            <div className="text-right">
              <h1 className="font-black text-xl md:text-2xl text-foreground">
                LeetCode Profile
              </h1>
              <p className="text-muted-foreground text-sm md:text-md">
                Overview for <span className="text-primary">{mockProfileData.username}</span>
              </p>
            </div>
          </nav>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* User Profile Card */}
              <Card className="bg-card border border-border text-foreground">
                <CardContent className="flex flex-col items-center p-6">
                  <img
                    src={mockProfileData.profileImage}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-primary"
                  />
                  <CardTitle className="text-xl font-bold mb-1">
                    {mockProfileData.username}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mb-4">
                    Rank: <span className="text-primary">{mockProfileData.rank}</span>
                  </CardDescription>
                  <Button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border">
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Community Stats Card */}
              <Card className="bg-card border border-border text-foreground">
                <CardHeader>
                  <CardTitle className="text-lg">Community Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Views</span>
                    <span className="text-primary">{mockProfileData.communityStats.views}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Solution</span>
                    <span className="text-primary">{mockProfileData.communityStats.solutions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Discuss</span>
                    <span className="text-primary">{mockProfileData.communityStats.discuss}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Reputation</span>
                    <span className="text-primary">{mockProfileData.communityStats.reputation}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Languages Card */}
              <Card className="bg-card border border-border text-foreground">
                <CardHeader>
                  <CardTitle className="text-lg">Languages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {mockProfileData.languages.length > 0 ? (
                    mockProfileData.languages.map((lang, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{lang.name}</span>
                        <span className="text-primary">{lang.solved} problems solved</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No language data.</p>
                  )}
                </CardContent>
              </Card>

              {/* Skills Card */}
              <Card className="bg-card border border-border text-foreground">
                <CardHeader>
                  <CardTitle className="text-lg">Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {Object.entries(mockProfileData.skills).map(([category, skills]) => (
                    <div key={category}>
                      <p className="font-semibold text-muted-foreground mb-2">{category}</p>
                      {skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, index) => (
                            <Badge key={index} className="bg-muted text-muted-foreground border border-border px-3 py-1">
                              {skill.name} {skill.count > 0 ? `x${skill.count}` : ''}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Not enough data</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Solved Problems & Badges - Simplified */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card border border-border text-foreground p-6">
                  <CardTitle className="text-lg mb-4">Solved Problems</CardTitle>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-green-500">
                      <span className="font-semibold">Easy</span>
                      <span>{mockProfileData.totalSolved.easy}</span>
                    </div>
                    <div className="flex justify-between items-center text-yellow-500">
                      <span className="font-semibold">Medium</span>
                      <span>{mockProfileData.totalSolved.medium}</span>
                    </div>
                    <div className="flex justify-between items-center text-red-500">
                      <span className="font-semibold">Hard</span>
                      <span>{mockProfileData.totalSolved.hard}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg text-primary pt-2 border-t border-border">
                      <span>Total Solved</span>
                      <span>{mockProfileData.totalSolved.total}</span>
                    </div>
                  </div>
                </Card>

                {/* Badges Card */}
                <Card className="bg-card border border-border text-foreground p-6">
                  <CardTitle className="text-lg mb-2">Badges</CardTitle>
                  <p className="text-4xl font-bold text-primary mb-4">{mockProfileData.badges.count}</p>
                  <p className="text-sm text-muted-foreground mb-2">Locked Badge</p>
                  <p className="font-semibold text-foreground">{mockProfileData.badges.locked}</p>
                </Card>
              </div>

              {/* Recent Submissions */}
              <Card className="bg-card border border-border text-foreground p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Button variant="secondary" className="bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border px-3 py-1 h-auto">
                      Recent AC
                    </Button>
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground px-3 py-1 h-auto">
                      List
                    </Button>
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground px-3 py-1 h-auto">
                      Solutions
                    </Button>
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground px-3 py-1 h-auto">
                      Discuss
                    </Button>
                  </div>
                  <Button variant="link" className="text-primary hover:text-primary/80 text-sm">
                    View all submissions
                  </Button>
                </div>

                <ul className="space-y-3">
                  {mockProfileData.recentSubmissions.map((submission) => (
                    <li key={submission.id} className="flex justify-between items-center pb-2 border-b border-border last:border-b-0 last:pb-0">
                      <p className="font-semibold text-foreground">{submission.problem}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="mr-2">{submission.timeAgo}</span>
                        {submission.status === "Accepted" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
