import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/global/MainNavbar";
import { Button } from "../components/ui/button";
import {
  ArrowLeftCircle,
  Lightbulb,
  CheckCircle,
  XCircle,
  Award,
  Zap,
  ChevronLeft,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../components/ui/accordion";
import { Progress } from "../components/ui/progress";
import { interviewStore } from "../components/store/InterviewStore";

export default function InterviewResult() {
  const { interviewFeedback } = interviewStore();
  const navigate = useNavigate();

  // Destructure interview feedback JSON
  const {
    interviewType,
    jobRole,
    difficultyLevel,
    questions,
    performanceScore,
    performanceSummary,
  } = interviewFeedback || {};

  return (
    <div>
      <MainNavbar />
      <div className="w-full">
        <div className="container mx-auto lg:px-8 px-5 py-22">
          {/* Top nav */}
          <nav className="flex justify-between items-center mt-8 mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
            <div className="text-right">
              <h1 className="font-bold text-lg md:text-xl">
                Interview Results
              </h1>
              <p className="text-muted-foreground text-sm">
                {interviewType} | {jobRole} | {difficultyLevel}
              </p>
            </div>
          </nav>

          <section className="grid grid-cols-1 gap-8">
            {/* Overall Summary Card */}
            <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 shadow-xl border-none">
              <CardHeader className="flex flex-col items-center text-center">
                <Award className="h-10 w-10 text-primary mb-2 animate-bounce" />
                <CardTitle className="text-2xl font-bold">
                  Overall Interview Performance
                </CardTitle>
                <CardDescription>
                  A summary of your mock interview session.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-6">
                <div className="text-6xl font-extrabold text-primary">
                  {performanceScore}%
                </div>
                <Progress value={performanceScore} className="w-2/3 h-3" />
                <p className="text-lg font-semibold text-center">
                  {performanceSummary}
                </p>
                <Badge
                  className={`px-4 py-2 text-base font-semibold ${
                    performanceScore >= 80
                      ? "bg-green-500 hover:bg-green-600"
                      : performanceScore >= 50
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  Score: {performanceScore}%
                </Badge>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={() => navigate("/dashboard")} size="lg">
                  Return to Dashboard
                </Button>
              </CardFooter>
            </Card>

            {/* Question by Question Review with Accordions */}
            <h2 className="text-2xl font-bold mb-4">Question Breakdown</h2>
            <Accordion type="single" collapsible className="w-full">
              {questions?.map((q, index) => (
                <AccordionItem
                  key={index}
                  value={`q-${q.number}`}
                  className="mb-4 border rounded-lg shadow-sm"
                >
                  <AccordionTrigger className="flex justify-between items-center px-4 py-3">
                    <span className="font-medium text-lg">
                      Q{q.number}: {q.question}
                    </span>
                    {q.feedbackRating === "Excellent" ||
                    q.feedbackRating === "Good" ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 space-y-6">
                    {/* Answer */}
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center">
                        <Zap className="mr-2 h-5 w-5 text-purple-500" /> Your
                        Answer:
                      </h3>
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md border-l-4 border-purple-500 min-h-[60px]">
                        <p className="text-sm text-muted-foreground italic">
                          {q.answer || "No answer recorded."}
                        </p>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center">
                        <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />{" "}
                        Feedback:
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          className={`px-3 py-1 text-sm font-semibold ${
                            q.feedbackRating === "Excellent"
                              ? "bg-green-600 hover:bg-green-700"
                              : q.feedbackRating === "Good"
                              ? "bg-yellow-600 hover:bg-yellow-700"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {q.feedbackRating}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {q.feedback}
                      </p>
                    </div>

                    {/* Tips */}
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center">
                        <Lightbulb className="mr-2 h-5 w-5 text-orange-500" />{" "}
                        Tips:
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                        {q.tips &&
                          Object.entries(q.tips).map(([key, value]) => (
                            <li key={key}>
                              <strong className="text-foreground">
                                {key}:
                              </strong>{" "}
                              {value}
                            </li>
                          ))}
                        {!q.tips && <li>No specific tips provided.</li>}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </div>
    </div>
  );
}
