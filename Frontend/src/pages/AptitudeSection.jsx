import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  CheckCircle2,
  Lightbulb,
  MoveRightIcon,
  Maximize,
  Pencil,
  Eraser,
} from "lucide-react";
import MainNavbar from "@/components/global/MainNavbar";
import api from "@/utils/axios";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// ====================================================================
// CORE COMPONENT: DrawingCanvas (unchanged)
// ====================================================================
const DrawingCanvas = ({ activeTool }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);

  // Mouse event handlers
  const handleMouseDown = useCallback(({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext("2d");
    if (activeTool === "Pencil") {
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    } else if (activeTool === "Eraser") {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      setIsErasing(true);
    }
  }, [activeTool]);

  const handleMouseMove = useCallback(({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext("2d");
    if (isDrawing) {
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    } else if (isErasing) {
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    }
  }, [isDrawing, isErasing]);

  const handleMouseUp = useCallback(() => {
    const ctx = canvasRef.current.getContext("2d");
    if (isDrawing) {
      ctx.closePath();
      setIsDrawing(false);
    }
    if (isErasing) {
      ctx.closePath();
      setIsErasing(false);
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, [isDrawing, isErasing]);

  // Function to set canvas dimensions and drawing style
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions to match the parent container
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    // Drawing settings
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = 'source-over';
  }, []);
  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [setupCanvas]);
  return (
    <div ref={containerRef} className="block w-full h-full relative">
      {/* HTML Canvas for Drawing */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="block w-full h-full bg-white absolute top-0 left-0"
        style={{ zIndex: 1 }}
      />
    </div>
  );
};

// ====================================================================
// HELPER COMPONENT: WhiteboardDrawing (unchanged)
// ====================================================================
const WhiteboardDrawing = ({ isFullscreen }) => {
  const [activeTool, setActiveTool] = useState("Pencil");
  const handleToolClick = (tool) => {
    setActiveTool(tool);
  }
  const drawingAreaClasses = isFullscreen ? "flex-grow h-full" : "h-40";
  return (
    <div className={`flex flex-col border border-gray-200 rounded-md ${drawingAreaClasses}`}>
      {/* Tool/Icon Selection Toolbar */}
      <div className="flex-shrink-0 p-2 border-b bg-gray-50 flex space-x-2">
        <Button
          variant={activeTool === "Pencil" ? "default" : "outline"}
          size="icon"
          onClick={() => handleToolClick("Pencil")}
          title="Pencil Tool (Freehand Drawing)"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant={activeTool === "Eraser" ? "default" : "outline"}
          size="icon"
          onClick={() => handleToolClick("Eraser")}
          title="Eraser Tool"
        >
          <Eraser className="h-4 w-4" />
        </Button>
      </div>
      {/* Actual Drawing/Canvas Area Container */}
      <div className={`w-full overflow-hidden ${isFullscreen ? 'flex-grow' : 'h-full'}`}>
        <DrawingCanvas activeTool={activeTool} isFullscreen={isFullscreen} />
      </div>
    </div>
  );
};

// ====================================================================
// MAIN COMPONENT: AptitudeSection (MODIFIED)
// ====================================================================
export default function AptitudeSection() {
  const { category, topic } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Refactored userAnswers to store detailed results
  const [userAnswers, setUserAnswers] = useState({}); 
  const [showExplanation, setShowExplanation] = useState(false);
  const [whiteboardMode, setWhiteboardMode] = useState("Typing");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get(
          `/api/v1/aptitude/questions/${category}/${topic}`
        );
        setQuestions(res.data.questions || []);
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };
    fetchQuestions();
  }, [category, topic]);

  if (questions.length === 0)
    return (
      <p className="text-center mt-10">Loading questions...</p>
    );

  const currentQuestion = questions[currentIndex];
  // Access selected option from the detailed userAnswers object
  const userAnswerData = userAnswers[currentIndex];
  const userAnswer = userAnswerData?.selectedOption;
  const isCorrect = userAnswerData?.isCorrect;

  // --- MODIFIED FUNCTION ---
  const handleAnswerSelect = (option) => {
    if (showExplanation) return; // Prevent changing answer after submission

    const correctAns = currentQuestion?.answer_text;
    const isAnsCorrect = option === correctAns;

    // Store the detailed attendance information
    const answerDetail = {
      questionId: currentQuestion?._id || `q-${currentIndex}`, // Use a real ID if available, otherwise a placeholder
      selectedOption: option,
      isCorrect: isAnsCorrect,
      correctAnswer: correctAns,
      // Add other data you want to track, e.g., 'timeTaken'
    };

    setUserAnswers({ ...userAnswers, [currentIndex]: answerDetail });
    setShowExplanation(true);
  };
  
  // --- NEW FUNCTION ---
  const handleFinish = async () => {
    // 1. Prepare the payload
    const totalCorrect = Object.values(userAnswers).filter(a => a.isCorrect).length;
    const resultsPayload = {
      category,
      topic,
      totalQuestions: questions.length,
      correctCount: totalCorrect,
      // Map the array of questions to include the user's result for each one
      detailedResults: questions.map((q, index) => {
        const result = userAnswers[index] || {
          questionId: q._id || `q-${index}`,
          selectedOption: null,
          isCorrect: false,
          correctAnswer: q.answer_text,
        };
        return {
          questionId: result.questionId,
          userAnswer: result.selectedOption,
          isCorrect: result.isCorrect,
        };
      }),
    };

    try {
      await api.post("/api/v1/aptitude/submit-results", resultsPayload);
    } catch (error) {
      toast.error("Failed to submit results");
    }

    navigate(`/aptitude/result/${category}/${topic}`, {
      state: { 
        total: questions.length,
        correct: totalCorrect,
        results: resultsPayload.detailedResults 
      },
    });
  };

  // --- MODIFIED FUNCTION ---
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(false);
    } else {
      // This is the last question, so call the submission handler
      handleFinish(); 
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const WhiteboardContent = whiteboardMode === "Typing" ? (
    <Textarea
      rows={isFullscreen ? "20" : "5"}
      placeholder="Use for rough work (persistent across questions)..."
      className={isFullscreen ? "flex-grow h-full" : ""}
    />
  ) : (
    <WhiteboardDrawing isFullscreen={isFullscreen} />
  );
  
  // ... (rest of the component's JSX remains the same)

  return (
    <div className="min-h-screen ">
      <MainNavbar />
      <div className="container mx-auto lg:px-8 px-5 py-22 ">
        {/* Navigation/Header */}
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
        {/* Main Content Layout */}
        <div className="container mx-auto px-5 grid md:grid-cols-3 gap-8">
          {/* Left: Question Section */}
          <div className="md:col-span-2">
            <Card className="gap-2">
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  Question {currentIndex + 1} of {questions.length}
                </CardTitle>
                <p className="text-md mt-2">
                  {currentQuestion?.question}
                </p>
                <img src={currentQuestion?.image} />
              </CardHeader>
              <CardContent>
                {/* Options Mapping and Navigation/Explanation ... */}
                <div className="space-y-3 my-4">
                  {currentQuestion?.options?.map((opt, idx) => {
                    // Check against the selected option from the detailed object
                    const isSelected = userAnswer === opt; 
                    const correct = currentQuestion.answer_text === opt;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelect(opt)}
                        disabled={!!userAnswerData} // Disable if an answer has been recorded
                        className={`w-full text-left border rounded-lg px-4 py-3 transition-all duration-200
                        ${
                          !!userAnswerData
                            ? correct
                              ? "border-green-500 bg-green-50 dark:bg-green-950"
                              : isSelected
                              ? "border-red-500 bg-red-50 dark:bg-red-950"
                              : "border-gray-200"
                            : isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "hover:bg-gray-50 dark:hover:bg-muted-foreground/50 border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{opt}</span>
                          {!!userAnswerData && correct && (
                            <CheckCircle2 className="text-green-600 h-5 w-5" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {/* Show explanation if an answer has been recorded */}
                {!!userAnswerData && (
                  <div
                    className={`my-6 p-4 rounded-lg border ${
                      isCorrect
                        ? "border-green-500 bg-green-50 dark:bg-green-950 "
                        : "border-red-500 bg-red-50 dark:bg-red-950"
                    }`}
                  >
                    <p
                      className={`font-medium ${
                        isCorrect ? "text-green-600 " : "text-red-600"
                      }`}
                    >
                      {isCorrect ? "Correct ! " : "Incorrect ! "} Here’s the
                      explanation:
                    </p>
                    <p className=" mt-2 text-sm">
                      {currentQuestion?.explanation ||
                        "Explanation not available."}
                    </p>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    disabled={currentIndex === 0}
                    onClick={() => {
                      setCurrentIndex(currentIndex - 1);
                      setShowExplanation(false);
                    }}
                  >
                    Previous
                  </Button>
                  <div className="gap-4 flex">
                    <Button variant={"outline"}>
                      <Lightbulb className="mr-2 h-4 w-4" /> Discuss
                    </Button>
                    {/* Only enable Next/Finish button after an answer is selected */}
                    <Button
                      onClick={handleNext}
                      disabled={!userAnswerData} 
                      className={
                        "select-none active:scale-95 transition-all duration-150"
                      }
                    >
                      {currentIndex === questions.length - 1
                        ? "Finish"
                        : "Next"}
                      <MoveRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right Sidebar (Progress and Whiteboard) */}
          <div className="md:col-span-1 space-y-6">
            {/* Progress Card */}
            <Card className="gap-2">
              <CardHeader>
                <CardTitle className="text-md font-semibold">
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Question {currentIndex + 1} of {questions.length}
                </p>
                <Progress
                  value={((currentIndex + 1) / questions.length) * 100}
                  className="h-2"
                />
              </CardContent>
            </Card>
            {/* Whiteboard Card */}
            <Card
              className={`gap-2 ${
                isFullscreen
                  ? "fixed inset-0 z-50 m-0 rounded-none h-screen w-screen flex flex-col"
                  : ""
              }`}
            >
              <CardHeader
                className={isFullscreen ? "flex-shrink-0" : ""}
              >
                <CardTitle className="text-md font-semibold">
                  Whiteboard
                </CardTitle>
              </CardHeader>
              <CardContent
                className={`p-4 ${
                  isFullscreen ? "flex-grow flex overflow-auto" : ""
                }`}
              >
                {WhiteboardContent}
              </CardContent>
              <CardFooter
                className={`justify-end gap-2 ${
                  isFullscreen ? "flex-shrink-0" : ""
                }`}
              >
                {/* Fullscreen Toggle Button */}
                <Button variant="outline" onClick={toggleFullscreen}>
                  <Maximize className="mr-2 h-4 w-4" />{" "}
                  {isFullscreen ? "Exit" : "Fullscreen"}
                </Button>
                {/* Canvas/Typing Buttons */}
                <Button
                  variant={whiteboardMode === "Canvas" ? "default" : "outline"}
                  onClick={() => {
                    setWhiteboardMode("Canvas");
                  }}
                >
                  Canvas
                </Button>
                <Button
                  variant={whiteboardMode === "Typing" ? "default" : "outline"}
                  onClick={() => {
                    setWhiteboardMode("Typing");
                  }}
                >
                  Typing
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}