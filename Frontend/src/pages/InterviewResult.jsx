import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/global/MainNavbar";
import { Button } from "../components/ui/button";
import { ArrowLeftCircle, Lightbulb, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function InterviewResult() {
  const navigate = useNavigate();

  // Mock interview data for demonstration.
  // In a real application, this data would be passed from the interview session
  // or retrieved from a state management solution/backend.
  const mockInterviewData = [
    {
      number: 1,
      question: "What is the difference between HTML, CSS, and JavaScript?",
      userTranscript: "HTML is for structure, CSS for styling, and JavaScript for interactivity. They work together to create dynamic web pages.",
      feedback: {
        score: "Good",
        message: "Clear and concise explanation. Covered all key aspects.",
      },
      tips: {
        HTML: "Talk about the structure of the webpage.",
        CSS: "Mention styling and layout responsibilities.",
        JavaScript: "Discuss behavior and interactivity.",
      },
    },
    {
      number: 2,
      question: "Can you explain how the box model works in CSS?",
      userTranscript: "The CSS box model describes the rectangular boxes generated for elements in the document tree and laid out according to the visual formatting model. It consists of content, padding, border, and margin.",
      feedback: {
        score: "Excellent",
        message: "Comprehensive answer, correctly identified all components of the box model.",
      },
      tips: {
        Definition: "Describe content, padding, border, and margin.",
        Diagram: "Optional – visualize layers from inside out.",
        Impact: "Explain how each part affects element sizing.",
      },
    },
    {
      number: 3,
      question: "How does a browser render a web page?",
      userTranscript: "A browser first parses HTML to build the DOM tree, then parses CSS to build the CSSOM tree. These two are combined to form the render tree. Then layout and paint stages occur.",
      feedback: {
        score: "Needs Improvement",
        message: "Good start, but could elaborate more on reflow/repaint and the full rendering pipeline.",
      },
      tips: {
        Process: "Mention parsing HTML, building the DOM, CSSOM, and render tree.",
        "Reflow and repaint": "Briefly explain these concepts.",
        Performance: "Relate to real-world slow loading issues.",
      },
    },
    {
      number: 4,
      question: "What are semantic HTML elements and why are they important?",
      userTranscript: "Semantic elements like <header>, <nav>, <article> provide meaning to the content, which helps with accessibility and SEO.",
      feedback: {
        score: "Good",
        message: "Correctly identified purpose and benefits. Good examples.",
      },
      tips: {
        Examples: "Use tags like <article>, <section>, <nav>, etc.",
        Purpose: "Explain accessibility and SEO benefits.",
        "Best Practice": "Recommend using them for clean, readable code.",
      },
    },
  ];

  // Calculate overall score (very basic example)
  const overallScore = mockInterviewData.reduce((acc, q) => {
    if (q.feedback.score === "Excellent") return acc + 3;
    if (q.feedback.score === "Good") return acc + 2;
    if (q.feedback.score === "Needs Improvement") return acc + 1;
    return acc;
  }, 0);

  const maxPossibleScore = mockInterviewData.length * 3; // Assuming 'Excellent' is max 3 points
  const percentageScore = ((overallScore / maxPossibleScore) * 100).toFixed(0);

  let overallFeedbackMessage = "";
  if (percentageScore >= 80) {
    overallFeedbackMessage = "Outstanding performance! You demonstrated strong knowledge.";
  } else if (percentageScore >= 50) {
    overallFeedbackMessage = "Solid effort! You have a good grasp of the concepts, with some areas for growth.";
  } else {
    overallFeedbackMessage = "Keep practicing! Focus on strengthening your foundational knowledge.";
  }


  return (
    <div>
      <MainNavbar />
      <div className="w-full">
        <div className="container mx-auto lg:px-8 px-5 py-22">
          {/* Top nav */}
          <nav className="flex justify-between items-center mb-8">
            <Button
              variant={"link"}
              onClick={() => navigate("/dashboard")}
              className="cursor-pointer"
            >
              <ArrowLeftCircle className="mr-2" />
              Back to Dashboard
            </Button>
            <div className="text-right">
              <h1 className="font-black text-md md:text-xl">
                Interview Results
              </h1>
              <p className="text-muted-foreground text-sm md:text-md">
                Your Performance Summary
              </p>
            </div>
          </nav>

          <section className="grid grid-cols-1 gap-8">
            {/* Overall Summary Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Overall Interview Performance</CardTitle>
                <CardDescription>A summary of your mock interview session.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="text-6xl font-extrabold text-primary">
                    {percentageScore}%
                  </div>
                  <p className="text-lg font-semibold text-center">
                    {overallFeedbackMessage}
                  </p>
                  <Badge
                    className={`px-4 py-2 text-base ${
                      percentageScore >= 80 ? "bg-green-500" : percentageScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                  >
                    Overall Score: {overallScore} / {maxPossibleScore}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={() => navigate("/dashboard")}>
                  Return to Dashboard
                </Button>
              </CardFooter>
            </Card>

            {/* Question by Question Review */}
            <h2 className="text-2xl font-bold mb-4">Question Breakdown</h2>
            {mockInterviewData.map((item, index) => (
              <Card key={index} className="mb-6">
                <CardHeader>
                  <CardTitle>Question {item.number}: {item.question}</CardTitle>
                  <CardDescription>Your Answer & Feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">Your Transcript:</h3>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 min-h-[60px]">
                      <p className="text-sm text-muted-foreground italic">
                        {item.userTranscript || "No transcript recorded for this question."}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2">Feedback:</h3>
                    <div className="flex items-center gap-2 mb-2">
                      {item.feedback.score === "Excellent" || item.feedback.score === "Good" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <Badge
                        className={`${
                          item.feedback.score === "Excellent"
                            ? "bg-green-600"
                            : item.feedback.score === "Good"
                            ? "bg-yellow-600"
                            : "bg-red-600"
                        }`}
                      >
                        {item.feedback.score}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {item.feedback.message}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5" /> Tips for This Question:
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                      {item.tips &&
                        Object.entries(item.tips).map(([key, value]) => (
                          <li key={key}>
                            <strong className="text-foreground">{key}:</strong> {value}
                          </li>
                        ))}
                      {!item.tips && (
                        <li>No specific tips provided for this question.</li>
                      )}
                    </ul>
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
