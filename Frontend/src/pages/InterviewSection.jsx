import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/global/MainNavbar";
import { Button } from "../components/ui/button";
import {
  ArrowLeftCircle,
  PlayCircle,
  StopCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useEffect, useState, useRef } from "react";

export default function InterviewSection() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(180);
  const [transcript, setTranscript] = useState(""); // State for live transcript
  const [hasRecorded, setHasRecorded] = useState(false);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null); // Ref for SpeechRecognition object

  const interviewQuestions = [
    {
      number: 1,
      question: "What is the difference between HTML, CSS, and JavaScript?",
      timer: 180,
      tips: {
        HTML: "Talk about the structure of the webpage.",
        CSS: "Mention styling and layout responsibilities.",
        JavaScript: "Discuss behavior and interactivity.",
      },
    },
    {
      number: 2,
      question: "Can you explain how the box model works in CSS?",
      timer: 150,
      tips: {
        Definition: "Describe content, padding, border, and margin.",
        Diagram: "Optional – visualize layers from inside out.",
        Impact: "Explain how each part affects element sizing.",
      },
    },
    {
      number: 3,
      question: "How does a browser render a web page?",
      timer: 240,
      tips: {
        Process:
          "Mention parsing HTML, building the DOM, CSSOM, and render tree.",
        "Reflow and repaint": "Briefly explain these concepts.",
        Performance: "Relate to real-world slow loading issues.",
      },
    },
    {
      number: 4,
      question: "What are semantic HTML elements and why are they important?",
      timer: 150,
      tips: {
        Examples: "Use tags like <article>, <section>, <nav>, etc.",
        Purpose: "Explain accessibility and SEO benefits.",
        "Best Practice": "Recommend using them for clean, readable code.",
      },
    },
    {
      number: 5,
      question: "Explain the difference between 'id' and 'class' in HTML/CSS.",
      timer: 120,
      tips: {
        Uniqueness: "'id' is unique; 'class' can be reused.",
        "CSS Specificity": "'id' has higher specificity.",
        "Use Cases": "Talk about when to use each.",
      },
    },
    {
      number: 6,
      question: "What is the difference between '==' and '===' in JavaScript?",
      timer: 120,
      tips: {
        "Loose vs Strict": "'==' allows type coercion; '===' does not.",
        Example: "Show sample comparisons.",
        Recommendation: "Prefer '===' for cleaner code.",
      },
    },
    {
      number: 7,
      question: "How do you add interactivity to a webpage using JavaScript?",
      timer: 180,
      tips: {
        "Event Listeners": "Explain how to use addEventListener.",
        "DOM Manipulation": "Mention changing HTML or styles dynamically.",
        Example: "Use a button click example.",
      },
    },
    {
      number: 8,
      question: "What is responsive design and how do you implement it?",
      timer: 180,
      tips: {
        Definition: "Websites that work across devices.",
        Techniques: "Use media queries, flexbox, percentages.",
        Tools: "Mention frameworks like Bootstrap if applicable.",
      },
    },
    {
      number: 9,
      question: "Explain the purpose of version control and Git basics.",
      timer: 180,
      tips: {
        Versioning: "Track code history and collaboration.",
        Commands: "Know init, clone, add, commit, push, pull.",
        Platforms: "Mention GitHub, GitLab, etc.",
      },
    },
    {
      number: 10,
      question: "What happens when you enter a URL in the browser?",
      timer: 240,
      tips: {
        Steps: "DNS lookup, HTTP request, server response.",
        Rendering: "Browser processes HTML, CSS, JS.",
        Security: "Briefly mention HTTPS if time permits.",
      },
    },
  ];

  const currentQuestion = interviewQuestions[currentQuestionIndex];

  // Effect to manage camera access
  useEffect(() => {
    const enableStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        // Optionally, inform the user that camera access is required
      }
    };

    enableStream();

    // Cleanup function: stop camera stream when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []); // Run only once on component mount

  // Effect to manage the timer
  useEffect(() => {
    let timerId;
    if (isRecording) {
      if (timer > 0) {
        timerId = setInterval(() => {
          setTimer((prev) => prev - 1);
        }, 1000);
      } else {
        // Timer reached 0, stop recording and mark as recorded
        setIsRecording(false);
        setHasRecorded(true); // Mark that this question has been recorded
        if (recognitionRef.current) {
          recognitionRef.current.stop(); // Stop speech recognition
        }
      }
    }
    return () => clearInterval(timerId);
  }, [timer, isRecording]);

  // Effect to reset timer and transcript when question changes
  useEffect(() => {
    setTimer(currentQuestion.timer);
    setTranscript(""); // Clear transcript for new question
    setHasRecorded(false); // Reset hasRecorded state for new question
  }, [currentQuestionIndex, currentQuestion.timer]);

  // Speech Recognition setup
  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Keep listening
      recognition.interimResults = true; // Get results while speaking
      recognition.lang = "en-US"; // Set language

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptSegment + " ";
          } else {
            interimTranscript += transcriptSegment;
          }
        }
        setTranscript(finalTranscript + interimTranscript);
        console.log("Current Transcript:", finalTranscript + interimTranscript); // Add this
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          console.warn(
            "Microphone access denied. Please allow microphone in browser settings."
          );
        }
        // If an error occurs, ensure recording state is consistent
        if (isRecording) {
          setIsRecording(false);
          setHasRecorded(true);
        }
      };

      recognition.onend = () => {
        // Restart recognition if still recording and it ended unexpectedly
        if (isRecording) {
          recognitionRef.current.start();
        }
      };

      recognitionRef.current = recognition; // Store recognition object in ref
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }

    // Cleanup: stop recognition when component unmounts
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]); // Added isRecording to dependency array to handle recognition restart logic

  const handleActionButton = () => {
    if (!isRecording && !hasRecorded) {
      setIsRecording(true);
      if (recognitionRef.current) {
        setTranscript("..."); 
        recognitionRef.current.start();
      }
    } else if (isRecording) {
      setIsRecording(false);
      setHasRecorded(true); 
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else if (!isRecording && hasRecorded) {
      if (currentQuestionIndex < interviewQuestions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setTranscript("");
        setHasRecorded(false);
      } else {
        navigate("/interview-results");
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setIsRecording(false);
      setTranscript("");
      setHasRecorded(false);
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNextQuestionExplicit = () => {
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setIsRecording(false); 
      setTranscript("");
      setHasRecorded(false);
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      navigate("/interview-results");
    }
  };

  const navigate = useNavigate();

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  let buttonText = "";
  let buttonIcon = null;
  let buttonColorClass = "";

  if (!isRecording && !hasRecorded) {
    buttonText = "Start Recording";
    buttonIcon = <PlayCircle className="mr-2" />;
    buttonColorClass = "bg-green-600 hover:bg-green-900";
  } else if (isRecording) {
    buttonText = "Stop Recording";
    buttonIcon = <StopCircle className="mr-2" />;
    buttonColorClass = "bg-red-600 hover:bg-red-900";
  } else if (!isRecording && hasRecorded) {
    buttonText = "Next Question";
    buttonIcon = <CheckCircle className="mr-2" />;
    buttonColorClass = "bg-blue-600 hover:bg-blue-900";
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
              Exit Interview
            </Button>
            <div className="text-right">
              <h1 className="font-black text-md md:text-xl">
                Technical Mock Interview
              </h1>
              <p className="text-muted-foreground text-sm md:text-md">
                On Software Engineering
              </p>
            </div>
          </nav>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Question and Controls */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              <div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={handlePreviousQuestion}
                        className={`cursor-pointer ${
                          currentQuestionIndex === 0
                            ? "pointer-events-none opacity-50"
                            : ""
                        }`}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                      </PaginationPrevious>
                    </PaginationItem>
                    <PaginationItem className="px-4 text-lg font-semibold">
                      Question {currentQuestion.number} of{" "}
                      {interviewQuestions.length}
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={handleNextQuestionExplicit}
                        className={`cursor-pointer ${
                          currentQuestionIndex === interviewQuestions.length - 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }`}
                      >
                        Next <ChevronRight className="ml-1 h-4 w-4" />
                      </PaginationNext>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Question {currentQuestion.number}</CardTitle>
                    <CardDescription>Intermediate Level</CardDescription>
                    <CardAction>
                      <Badge>
                        {minutes}:{seconds < 10 ? "0" : ""}
                        {seconds}
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl text-center mb-4">
                      {currentQuestion.question}
                    </p>
                    {/* Transcript Display Area */}
                    <div className="bg-gray-100 dark:bg-neutral-800 p-4 rounded-md mt-4 border border-gray-200 dark:border-neutral-700 min-h-[80px] flex items-center justify-center">
                      {isRecording && !transcript ? (
                        <p className="text-muted-foreground text-sm italic animate-pulse">
                          Listening for your answer...
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground break-words text-center">
                          {transcript}
                          {isRecording && transcript && (
                            <span className="animate-pulse ml-1">...</span>
                          )}
                          {!isRecording && !transcript && hasRecorded && (
                            <span className="text-red-500">
                              No audio detected.
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="justify-center gap-2 items-center flex w-full flex-col">
                      <Button
                        className={`${buttonColorClass}`}
                        onClick={handleActionButton}
                        disabled={isRecording && timer === 0}
                      >
                        {buttonIcon} {buttonText}
                      </Button>
                      <p className="text-muted-foreground text-sm">
                        {isRecording
                          ? "Recording in progress..."
                          : hasRecorded
                          ? "Transcript ready. Click Next Question."
                          : "Click 'Start Recording' to begin."}
                      </p>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>

            {/* Right Column: Camera and Tips */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Your Live Camera</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-auto bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover rounded-md"
                    ></video>
                    {!videoRef.current?.srcObject && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                        Camera Feed Unavailable
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5" /> Tips for This
                    Question
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2">
                    {currentQuestion.tips &&
                      Object.entries(currentQuestion.tips).map(
                        ([key, value]) => (
                          <li
                            key={key}
                            className="text-muted-foreground text-sm"
                          >
                            <strong className="text-foreground">{key}:</strong>{" "}
                            {value}
                          </li>
                        )
                      )}
                    {!currentQuestion.tips && (
                      <p className="text-muted-foreground text-sm">
                        No specific tips available for this question.
                      </p>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
