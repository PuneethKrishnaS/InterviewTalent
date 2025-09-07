import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/global/MainNavbar";
import { Button } from "../components/ui/button";
import {
  ArrowLeftCircle,
  Users,
  GitFork,
  Star,
  BookOpen,
  Clock,
  Code,
  MapPin,
  Link,
  Twitter,
  Calendar,
  Eye,
  MoreHorizontal,
  Rocket,
  FileText,
  Hash,
  Globe,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useContext } from "react";
import { AuthContext } from "@/components/context/AuthContext";
import { githubStore } from "@/components/store/githubStore";
import { motion } from "framer-motion";

export default function Github() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const {
    githubData,
    loading,
    error,
    fetchGithubData,
    clearGithubData,
  } = githubStore();

  const [hasFetched, setHasFetched] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogType, setDialogType] = useState(null); // 'repo' or 'event'

  useEffect(() => {
    if (user.github.isConnected && !githubData && !hasFetched) {
      fetchGithubData();
      setHasFetched(true);
    } else if (!user.github.isConnected) {
      clearGithubData();
      setHasFetched(false);
    }
  }, [user.github.isConnected, githubData, hasFetched, fetchGithubData, clearGithubData]);

  if (!user.github.isConnected) {
    return (
      <div className="bg-background min-h-screen text-foreground font-inter">
        <MainNavbar />
        <div className="container mx-auto px-5 py-8 md:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              Connect Your GitHub Account
            </h1>
            <p className="text-muted-foreground mb-6">
              To view your GitHub profile, please connect your account.
            </p>
            <Button
              onClick={() => navigate("/connect-github")}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            >
              Connect with GitHub
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-background min-h-screen text-foreground font-inter">
        <MainNavbar />
        <div className="container mx-auto px-5 py-8 md:py-12 flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <p className="text-lg">Loading GitHub data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background min-h-screen text-foreground font-inter">
        <MainNavbar />
        <div className="container mx-auto px-5 py-8 md:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <p className="text-lg text-destructive">
            Error: {error}. Please try again.
          </p>
          <Button
            onClick={fetchGithubData}
            className="mt-4 bg-primary hover:bg-primary/90"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!githubData || !githubData.user) {
    return (
      <div className="bg-background min-h-screen text-foreground font-inter">
        <MainNavbar />
        <div className="container mx-auto px-5 py-8 md:py-12 flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <p className="text-lg text-muted-foreground">
            No GitHub data available.
          </p>
        </div>
      </div>
    );
  }

  const { user: ghUser, repos, events } = githubData;

  const formatRelativeTime = (isoDate) => {
    const now = new Date();
    const then = new Date(isoDate);
    const seconds = Math.floor((now - then) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? ' year ago' : ' years ago');
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? ' month ago' : ' months ago');
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? ' day ago' : ' days ago');
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? ' hour ago' : ' hours ago');
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? ' minute ago' : ' minutes ago');
    return 'just now';
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const topLanguages = () => {
    const languageCounts = repos.reduce((acc, repo) => {
      if (repo.language) {
        acc[repo.language] = (acc[repo.language] || 0) + 1;
      }
      return acc;
    }, {});

    const totalRepos = repos.length;
    const sortedLanguages = Object.entries(languageCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([name, count]) => ({
        name,
        percentage: Math.round((count / totalRepos) * 100),
      }));

    return sortedLanguages;
  };

  const allRepos = repos
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .map((repo) => ({
      ...repo,
      relativeTime: formatRelativeTime(repo.updated_at),
    }));

  const recentActivity = events
    .filter((event) => event.type === "PushEvent" || event.type === "ForkEvent" || event.type === "WatchEvent")
    .map((event) => {
      let type, repo, message, time, icon;

      switch (event.type) {
        case "PushEvent":
          type = "Pushed to";
          repo = event.repo.name;
          message = event.payload.commits[0]?.message || "No commit message";
          icon = Code;
          break;
        case "ForkEvent":
          type = "Forked";
          repo = event.repo.name;
          message = null;
          icon = GitFork;
          break;
        case "WatchEvent":
          type = event.payload.action === "started" ? "Starred" : "Unstarred";
          repo = event.repo.name;
          message = null;
          icon = Star;
          break;
        default:
          type = "Unknown event";
          repo = "N/A";
          message = null;
          icon = Clock;
      }

      time = formatRelativeTime(event.created_at);

      return {
        id: event.id,
        type,
        repo,
        message,
        time,
        icon: icon || Clock,
        created_at: event.created_at, // Keep original created_at for Dialog
      };
    });

  const displayedRepos = allRepos.slice(0, 4);
  const displayedActivity = recentActivity.slice(0, 4);

  const handleItemClick = (item, type) => {
    setSelectedItem(item);
    setDialogType(type);
    setDialogOpen(true);
  };

  return (
    <div className="bg-background min-h-screen text-foreground font-inter">
      <MainNavbar />
      <div className="w-full">
        <div className="container mx-auto lg:px-8 px-5 py-8 md:py-12">
          {/* Top navigation */}
          <nav className="flex justify-between items-center mb-8 mt-8">
            <Button
              variant="link"
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
                Overview for <span className="text-primary">@{ghUser.login}</span>
              </p>
            </div>
          </nav>

          {/* Hero Profile Section */}
          <section className="relative bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 mb-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16"></div>
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 relative z-10">
              <motion.div
                className="flex-shrink-0"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={ghUser.avatar_url}
                  alt="Profile Avatar"
                  className="w-40 h-40 rounded-full object-cover border-4 border-primary shadow-lg ring-4 ring-primary/20"
                />
              </motion.div>
              <div className="flex-1 text-center lg:text-left">
                <motion.h1
                  className="text-4xl font-bold mb-2"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {ghUser.name || ghUser.login}
                </motion.h1>
                <motion.p
                  className="text-primary text-2xl font-medium mb-4"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  @{ghUser.login}
                </motion.p>
                {ghUser.bio && (
                  <motion.p
                    className="text-lg text-muted-foreground mb-6 max-w-2xl"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {ghUser.bio}
                  </motion.p>
                )}
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="flex items-center justify-center lg:justify-start text-muted-foreground">
                    <Rocket className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-semibold">{ghUser.public_repos}</span> Repos
                  </div>
                  <div className="flex items-center justify-center lg:justify-start text-muted-foreground">
                    <Code className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-semibold">{ghUser.public_gists}</span> Gists
                  </div>
                  <div className="flex items-center justify-center lg:justify-start text-muted-foreground">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-semibold">{ghUser.followers}</span> Followers
                  </div>
                  <div className="flex items-center justify-center lg:justify-start text-muted-foreground">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-semibold">{ghUser.following}</span> Following
                  </div>
                  <div className="flex items-center justify-center lg:justify-start text-muted-foreground">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Joined {formatDate(ghUser.created_at)}
                  </div>
                  {ghUser.location && (
                    <div className="flex items-center justify-center lg:justify-start text-muted-foreground">
                      <MapPin className="h-5 w-5 mr-2 text-primary" />
                      {ghUser.location}
                    </div>
                  )}
                </motion.div>
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Button
                    onClick={() => window.open(ghUser.html_url, "_blank")}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                  >
                    View on GitHub
                  </Button>
                  {ghUser.blog && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(ghUser.blog, "_blank")}
                      className="w-full sm:w-auto"
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Website
                    </Button>
                  )}
                  {ghUser.twitter_username && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(`https://twitter.com/${ghUser.twitter_username}`, "_blank")}
                      className="w-full sm:w-auto"
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                  )}
                </motion.div>
              </div>
            </div>
          </section>

          {/* Top Languages Section */}
          <Card className="bg-card border border-border text-foreground shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Code className="mr-2 h-5 w-5 text-primary" /> Top Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topLanguages().length > 0 ? (
                  topLanguages().map((lang, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-primary mr-3"></div>
                        <span className="font-medium">{lang.name}</span>
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="bg-secondary rounded-full h-2">
                          <motion.div
                            className="bg-primary h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${lang.percentage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                          ></motion.div>
                        </div>
                      </div>
                      <span className="font-bold text-primary">{lang.percentage}%</span>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No language data available.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Repositories Section */}
          <Card className="bg-card border border-border text-foreground shadow-sm mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-primary" /> Repositories ({allRepos.length})
              </CardTitle>
              {allRepos.length > 4 && (
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-5 w-5" />
                      More
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-2xl h-screen overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Explore All Content</SheetTitle>
                    </SheetHeader>
                    <Tabs defaultValue="repos" className="mt-6">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="repos">Repositories</TabsTrigger>
                        <TabsTrigger value="events">Events</TabsTrigger>
                      </TabsList>
                      <TabsContent value="repos">
                        <div className="mt-4 space-y-4">
                          {allRepos.map((repo) => (
                            <motion.div
                              key={repo.id}
                              className="p-4 bg-secondary/50 rounded-lg border border-border hover:bg-secondary hover:shadow-lg transition-all duration-200 cursor-pointer group"
                              onClick={() => handleItemClick(repo, 'repo')}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                  {repo.name}
                                </h3>
                                <Star className="h-4 w-4 text-yellow-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                              </div>
                              {repo.description && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {repo.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                  {repo.language && (
                                    <Badge variant="outline" className="text-xs px-2 py-1">
                                      {repo.language}
                                    </Badge>
                                  )}
                                  {repo.homepage && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(repo.homepage, "_blank");
                                      }}
                                      className="h-6 p-1"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-muted-foreground">
                                  <div className="flex items-center">
                                    <Star className="h-3 w-3 mr-1 text-yellow-400" />
                                    {repo.stargazers_count}
                                  </div>
                                  <div className="flex items-center">
                                    <GitFork className="h-3 w-3 mr-1 text-blue-400" />
                                    {repo.forks_count}
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Updated {repo.relativeTime}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="events">
                        <div className="mt-4 space-y-4">
                          {recentActivity.map((activity) => {
                            const IconComponent = activity.icon;
                            return (
                              <motion.div
                                key={activity.id}
                                className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors duration-200 cursor-pointer"
                                onClick={() => handleItemClick(activity, 'event')}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="flex-shrink-0 mt-1">
                                  <IconComponent className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-foreground">
                                    {activity.type}{' '}
                                    <span className="text-primary font-medium">
                                      {activity.repo.replace(`${ghUser.login}/`, '')}
                                    </span>
                                  </p>
                                  {activity.message && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                      "{activity.message}"
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {activity.time}
                                  </p>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </SheetContent>
                </Sheet>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedRepos.map((repo) => (
                  <motion.div
                    key={repo.id}
                    className="p-4 bg-secondary/50 rounded-lg border border-border hover:bg-secondary hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    onClick={() => handleItemClick(repo, 'repo')}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {repo.name}
                      </h3>
                      <Star className="h-4 w-4 text-yellow-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {repo.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        {repo.language && (
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            {repo.language}
                          </Badge>
                        )}
                        {repo.homepage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(repo.homepage, "_blank");
                            }}
                            className="h-6 p-1"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-400" />
                          {repo.stargazers_count}
                        </div>
                        <div className="flex items-center">
                          <GitFork className="h-3 w-3 mr-1 text-blue-400" />
                          {repo.forks_count}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Updated {repo.relativeTime}
                    </p>
                  </motion.div>
                ))}
                {displayedRepos.length === 0 && (
                  <p className="text-muted-foreground text-center py-8 col-span-full">
                    No repositories to display.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Section */}
          <Card className="bg-card border border-border text-foreground shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" /> Recent Activity
              </CardTitle>
              {recentActivity.length > 4 && (
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-5 w-5" />
                      More
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-2xl h-screen overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Explore All Content</SheetTitle>
                    </SheetHeader>
                    <Tabs defaultValue="repos" className="mt-6">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="repos">Repositories</TabsTrigger>
                        <TabsTrigger value="events">Events</TabsTrigger>
                      </TabsList>
                      <TabsContent value="repos">
                        <div className="mt-4 space-y-4">
                          {allRepos.map((repo) => (
                            <motion.div
                              key={repo.id}
                              className="p-4 bg-secondary/50 rounded-lg border border-border hover:bg-secondary hover:shadow-lg transition-all duration-200 cursor-pointer group"
                              onClick={() => handleItemClick(repo, 'repo')}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                  {repo.name}
                                </h3>
                                <Star className="h-4 w-4 text-yellow-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                              </div>
                              {repo.description && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {repo.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                  {repo.language && (
                                    <Badge variant="outline" className="text-xs px-2 py-1">
                                      {repo.language}
                                    </Badge>
                                  )}
                                  {repo.homepage && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(repo.homepage, "_blank");
                                      }}
                                      className="h-6 p-1"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-muted-foreground">
                                  <div className="flex items-center">
                                    <Star className="h-3 w-3 mr-1 text-yellow-400" />
                                    {repo.stargazers_count}
                                  </div>
                                  <div className="flex items-center">
                                    <GitFork className="h-3 w-3 mr-1 text-blue-400" />
                                    {repo.forks_count}
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Updated {repo.relativeTime}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="events">
                        <div className="mt-4 space-y-4">
                          {recentActivity.map((activity) => {
                            const IconComponent = activity.icon;
                            return (
                              <motion.div
                                key={activity.id}
                                className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors duration-200 cursor-pointer"
                                onClick={() => handleItemClick(activity, 'event')}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="flex-shrink-0 mt-1">
                                  <IconComponent className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-foreground">
                                    {activity.type}{' '}
                                    <span className="text-primary font-medium">
                                      {activity.repo.replace(`${ghUser.login}/`, '')}
                                    </span>
                                  </p>
                                  {activity.message && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                      "{activity.message}"
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {activity.time}
                                  </p>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </SheetContent>
                </Sheet>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayedActivity.length > 0 ? (
                  displayedActivity.map((activity) => {
                    const IconComponent = activity.icon;
                    return (
                      <motion.div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors duration-200 cursor-pointer"
                        onClick={() => handleItemClick(activity, 'event')}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex-shrink-0 mt-1">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            {activity.type}{' '}
                            <span className="text-primary font-medium">
                              {activity.repo.replace(`${ghUser.login}/`, '')}
                            </span>
                          </p>
                          {activity.message && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              "{activity.message}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {activity.time}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No recent activity to display.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dialog for Detailed View */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {dialogType === 'repo' ? 'Repository Details' : 'Event Details'}
                </DialogTitle>
              </DialogHeader>
              {selectedItem && dialogType === 'repo' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-primary" />
                      {selectedItem.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Full name: {selectedItem.full_name}
                    </p>
                  </div>
                  {selectedItem.description && (
                    <div>
                      <p className="text-sm font-medium flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-primary" />
                        Description
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem.description}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium flex items-center">
                        <Code className="h-4 w-4 mr-2 text-primary" />
                        Language
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem.language || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium flex items-center">
                        <Star className="h-4 w-4 mr-2 text-yellow-400" />
                        Stars
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem.stargazers_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium flex items-center">
                        <GitFork className="h-4 w-4 mr-2 text-blue-400" />
                        Forks
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem.forks_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium flex items-center">
                        <Eye className="h-4 w-4 mr-2 text-primary" />
                        Watchers
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem.watchers_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium flex items-center">
                        <Hash className="h-4 w-4 mr-2 text-primary" />
                        Open Issues
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem.open_issues_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        Last Updated
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedItem.updated_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        Last Pushed
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedItem.pushed_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium flex items-center">
                        <Hash className="h-4 w-4 mr-2 text-primary" />
                        Size
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem.size} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={() => window.open(selectedItem.html_url, "_blank")}
                      className="w-full sm:w-auto"
                    >
                      View on GitHub
                    </Button>
                    {selectedItem.homepage && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedItem.homepage, "_blank")}
                        className="w-full sm:w-auto"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Visit Homepage
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {selectedItem && dialogType === 'event' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center">
                      <selectedItem.icon className="h-5 w-5 mr-2 text-primary" />
                      {selectedItem.type}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Repository: {selectedItem.repo}
                    </p>
                  </div>
                  {selectedItem.message && (
                    <div>
                      <p className="text-sm font-medium flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-primary" />
                        Commit Message
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem.message}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      Date
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedItem.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      Relative Time
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedItem.time}
                    </p>
                  </div>
                  <Button
                    onClick={() => window.open(`https://github.com/${selectedItem.repo}`, "_blank")}
                    className="w-full sm:w-auto"
                  >
                    View Repository
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}