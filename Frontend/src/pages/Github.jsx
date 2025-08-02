import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/global/MainNavbar";
import { Button } from "../components/ui/button";
import { ArrowLeftCircle, Users, GitFork, Star, BookOpen, Clock, Code, TrendingUp } from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function Github() {
  const navigate = useNavigate();

  // Mock GitHub profile data
  const mockGithubData = {
    username: "dev_explorer",
    name: "Developer Explorer",
    avatarUrl: "https://placehold.co/100x100/1A202C/FFFFFF?text=DE", // Placeholder image
    bio: "Passionate about open source, web development, and learning new technologies.",
    followers: 123,
    following: 45,
    publicRepos: 78,
    starredRepos: 25,
    contributions: 1500, // Example: contributions in the last year
    topLanguages: [
      { name: "JavaScript", percentage: "60%" },
      { name: "Python", percentage: "20%" },
      { name: "TypeScript", percentage: "10%" },
      { name: "HTML", percentage: "5%" },
      { name: "CSS", percentage: "5%" },
    ],
    popularRepositories: [
      {
        id: 1,
        name: "my-portfolio",
        description: "A modern personal portfolio website built with React and Tailwind CSS.",
        stars: 120,
        forks: 30,
        language: "JavaScript",
      },
      {
        id: 2,
        name: "data-structures-algorithms",
        description: "Implementations of common data structures and algorithms in Python.",
        stars: 85,
        forks: 15,
        language: "Python",
      },
      {
        id: 3,
        name: "react-todo-app",
        description: "A simple todo application demonstrating React hooks and context API.",
        stars: 60,
        forks: 10,
        language: "JavaScript",
      },
    ],
    recentActivity: [
      {
        id: 1,
        type: "Pushed to",
        repo: "my-portfolio",
        message: "feat: add dark mode toggle",
        time: "2 hours ago",
      },
      {
        id: 2,
        type: "Forked",
        repo: "awesome-dev-tools",
        time: "1 day ago",
      },
      {
        id: 3,
        type: "Starred",
        repo: "shadcn/ui",
        time: "3 days ago",
      },
      {
        id: 4,
        type: "Created",
        repo: "new-project-idea",
        time: "1 week ago",
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
                GitHub Profile
              </h1>
              <p className="text-muted-foreground text-sm md:text-md">
                Overview for <span className="text-primary">{mockGithubData.username}</span>
              </p>
            </div>
          </nav>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Profile Info, Languages */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* User Profile Card */}
              <Card className="bg-card border border-border text-foreground">
                <CardContent className="flex flex-col items-center p-6">
                  <img
                    src={mockGithubData.avatarUrl}
                    alt="Profile Avatar"
                    className="w-28 h-28 rounded-full mb-4 object-cover border-2 border-primary"
                  />
                  <CardTitle className="text-2xl font-bold mb-1">
                    {mockGithubData.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mb-2">
                    @{mockGithubData.username}
                  </CardDescription>
                  <p className="text-sm text-center text-foreground mb-4">
                    {mockGithubData.bio}
                  </p>
                  <div className="flex justify-center gap-4 text-sm mb-4">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" /> {mockGithubData.followers} followers
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" /> {mockGithubData.following} following
                    </div>
                  </div>
                  <Button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border">
                    View on GitHub
                  </Button>
                </CardContent>
              </Card>

              {/* Overview Stats Card */}
              <Card className="bg-card border border-border text-foreground">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-primary" /> Overview Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Public Repositories</span>
                    <span className="text-primary">{mockGithubData.publicRepos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Starred Repositories</span>
                    <span className="text-primary">{mockGithubData.starredRepos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Contributions (last year)</span>
                    <span className="text-primary">{mockGithubData.contributions}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Top Languages Card */}
              <Card className="bg-card border border-border text-foreground">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Code className="mr-2 h-5 w-5 text-primary" /> Top Languages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {mockGithubData.topLanguages.length > 0 ? (
                    mockGithubData.topLanguages.map((lang, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{lang.name}</span>
                        <span className="text-muted-foreground">{lang.percentage}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No language data available.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Popular Repositories, Recent Activity */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Popular Repositories Card */}
              <Card className="bg-card border border-border text-foreground p-6">
                <CardTitle className="text-lg mb-4 flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-primary" /> Popular Repositories
                </CardTitle>
                <ul className="space-y-4">
                  {mockGithubData.popularRepositories.map((repo) => (
                    <li key={repo.id} className="pb-4 border-b border-border last:border-b-0 last:pb-0">
                      <p className="font-semibold text-primary text-lg mb-1">{repo.name}</p>
                      <p className="text-sm text-muted-foreground mb-2">{repo.description}</p>
                      <div className="flex items-center text-sm text-muted-foreground gap-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-400" /> {repo.stars}
                        </div>
                        <div className="flex items-center">
                          <GitFork className="h-4 w-4 mr-1 text-blue-400" /> {repo.forks}
                        </div>
                        <Badge variant="outline" className="text-xs px-2 py-0.5 border-primary text-primary">
                          {repo.language}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Recent Activity Card */}
              <Card className="bg-card border border-border text-foreground p-6">
                <CardTitle className="text-lg mb-4 flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-primary" /> Recent Activity
                </CardTitle>
                <ul className="space-y-3">
                  {mockGithubData.recentActivity.map((activity) => (
                    <li key={activity.id} className="flex justify-between items-center pb-2 border-b border-border last:border-b-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-foreground">
                          {activity.type} <span className="text-primary">{activity.repo}</span>
                        </p>
                        {activity.message && (
                          <p className="text-sm text-muted-foreground italic">{activity.message}</p>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
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
