import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/global/MainNavbar";
import { Button } from "../components/ui/button";
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
  ArrowLeftCircle,
  PlayCircle,
  StopCircle,
  CheckCircle,
  Lightbulb,
  StepBack,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { interviewStore } from "../components/store/InterviewStore";
import * as faceapi from "@vladmandic/face-api"; // Updated import to maintained fork
import * as tf from "@tensorflow/tfjs"; // Explicit tfjs import for backend control

export default function InterviewSection() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(180);
  const [faceExpressions, setFaceExpressions] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const {
    questions,
    details,
    addTranscript,
    getFeedback,
    transcriptsAnswers,
    loading,
  } = interviewStore();
  const interviewQuestions = questions;
  const currentQuestion = interviewQuestions?.[currentQuestionIndex];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-background min-h-screen text-foreground font-inter">
        <MainNavbar />
        <div className="container mx-auto px-5 py-8 md:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              Can not access this route
            </h1>
            <p className="text-muted-foreground mb-6">
              Enter details then mock interview will start!
            </p>
            <Button
              onClick={() => navigate("/interview")}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            >
              <StepBack />
              Go back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Load models only once on mount
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      try {
        await tf.setBackend("webgl");
        await tf.ready();

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setLoadingError(null);
      } catch (error) {
        console.error("Failed to load face-api models:", error);
        setLoadingError(
          "Failed to load face detection models. Please check if model files are in /public/models/ and the server is serving them correctly."
        );
      }
    };

    loadModels();
  }, []);

  // Start camera and detection when models are loaded
  useEffect(() => {
    if (!modelsLoaded || loadingError) return;

    const startCameraAndDetection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const video = videoRef.current;
        if (video) {
          // Wait for video to load metadata before adding listener
          video.addEventListener("loadedmetadata", () => {
            video.addEventListener("play", startDetection);
          });
          video.srcObject = stream;
        }
      } catch (error) {
        console.error("Failed to access camera:", error);
        setLoadingError("Camera access denied or unavailable.");
      }
    };

    const startDetection = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.paused || video.ended) return;

      // Match dimensions only after video is ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn("Video not ready yet, skipping detection");
        return;
      }

      const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight,
      };
      faceapi.matchDimensions(canvas, displaySize);

      // Clear any existing interval
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }

      // Increased interval to 250ms for stability (reduces rapid errors)
      detectionIntervalRef.current = setInterval(async () => {
        try {
          // Skip if video not ready
          if (
            video.videoWidth === 0 ||
            video.videoHeight === 0 ||
            !modelsLoaded
          )
            return;

          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

          if (detections.length > 0) {
            const expressions = detections[0].expressions;
            const sortedExpressions = Object.entries(expressions).sort(
              (a, b) => b[1] - a[1]
            );
            setFaceExpressions(sortedExpressions[0]);
          } else {
            setFaceExpressions(null);
          }
        } catch (error) {
          console.error("Detection error:", error); // Catch and log without crashing
          // Optionally stop interval on repeated errors
        }
      }, 250); // Reduced frequency
    };

    startCameraAndDetection();

    // Cleanup function
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      const video = videoRef.current;
      if (video) {
        video.removeEventListener("loadedmetadata", startCameraAndDetection);
        video.removeEventListener("play", startDetection);
        if (video.srcObject) {
          video.srcObject.getTracks().forEach((track) => track.stop());
        }
      }
      // Dispose any lingering tensors (helps with memory/backend issues)
      tf.disposeVariables();
    };
  }, [modelsLoaded, loadingError]);

  // Timer logic (unchanged)
  useEffect(() => {
    let interval = null;
    if (isRecording && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && isRecording) {
      handleStopRecording();
    }
    return () => clearInterval(interval);
  }, [isRecording, timer]);

  // Actions (unchanged)
  const handleStartRecording = () => {
    if (!currentQuestion) return;
    setIsRecording(true);
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    SpeechRecognition.stopListening();
    addTranscript(currentQuestion.number, transcript || "");
  };

  const handleNext = async () => {
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimer(interviewQuestions[currentQuestionIndex + 1].timer);
      resetTranscript();
    } else {
      await getFeedback(questions, transcriptsAnswers, details);
      if (loading) {
        return <>Loading</>;
      }
      if (!loading) {
        navigate("/interview/results");
      }
    }
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  let buttonLabel, buttonIcon, buttonColor;
  if (!isRecording && !transcript) {
    buttonLabel = "Start Recording";
    buttonIcon = <PlayCircle className="mr-2" />;
    buttonColor = "bg-green-600 hover:bg-green-700";
  } else if (isRecording) {
    buttonLabel = "Stop Recording";
    buttonIcon = <StopCircle className="mr-2" />;
    buttonColor = "bg-red-600 hover:bg-red-700";
  } else if (!isRecording && transcript) {
    buttonLabel = "Next Question";
    buttonIcon = <CheckCircle className="mr-2" />;
    buttonColor = "bg-blue-600 hover:bg-blue-700";
  }

  if (!browserSupportsSpeechRecognition) {
    return <p>Your browser does not support speech recognition.</p>;
  }

  const getSuggestion = (expression) => {
    switch (expression) {
      case "sad":
      case "angry":
      case "disgusted":
        return "Try to maintain a positive and calm expression.";
      case "surprised":
      case "fearful":
        return "Keep your facial expressions composed and professional.";
      case "happy":
        return "You look confident and friendly! Maintain this expression.";
      case "neutral":
        return "Your expression is neutral. A slight smile can be more engaging.";
      default:
        return "Focus on maintaining a positive and confident demeanor.";
    }
  };

  return (
    <div>
      <MainNavbar />
      <div className="container mx-auto px-5 lg:px-8 py-8">
        {/* Top nav (unchanged) */}
        <div className="flex justify-between items-center mt-8 mb-8">
          <Button variant="link" onClick={() => navigate("/dashboard")}>
            <ArrowLeftCircle className="mr-2" /> Exit Interview
          </Button>
          <div className="text-right">
            <h1 className="font-bold text-lg md:text-xl">
              {details.InterviewType || ""}
            </h1>
            <p className="text-muted-foreground text-sm">
              {details.JobRole} <Badge>{details.duration}</Badge>
            </p>
          </div>
        </div>
        {/* Main content */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left (unchanged) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Question {currentQuestion.number} of{" "}
                  {interviewQuestions.length}
                </CardTitle>
                <CardDescription>{details.DifficultyLevel}</CardDescription>
                <Badge>
                  {minutes}:{seconds < 10 ? "0" : ""}
                  {seconds}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-xl text-center mb-4">
                  {currentQuestion.question}
                </p>
                <div className="bg-gray-100 dark:bg-neutral-800 p-4 rounded-md mt-4 border min-h-[80px] text-center">
                  {isRecording && !transcript && (
                    <p className="text-sm italic animate-pulse text-muted-foreground">
                      Listening for your answer...
                    </p>
                  )}
                  {!isRecording && !transcript && (
                    <p className="text-sm text-muted-foreground">
                      No response yet.
                    </p>
                  )}
                  {transcript && (
                    <p className="text-sm text-muted-foreground break-words">
                      {transcript}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className={`${buttonColor} w-full`}
                  onClick={
                    isRecording
                      ? handleStopRecording
                      : transcript
                      ? handleNext
                      : handleStartRecording
                  }
                  disabled={isRecording && timer === 0}
                >
                  {buttonIcon} {buttonLabel}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Camera</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-gray-200 rounded-md overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  ></video>
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full" // Ensure canvas has full size
                  />
                </div>
              </CardContent>
            </Card>
            <hr />

            {/* Real-time Expression Feedback Card */}
            <Card>
              <CardHeader>
                <CardTitle>Real-time Feedback</CardTitle>
                <CardDescription>Facial Expression</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingError ? (
                  <p className="text-sm text-red-600">{loadingError}</p>
                ) : modelsLoaded ? (
                  faceExpressions ? (
                    <>
                      <p className="text-xl font-bold capitalize mb-2">
                        {faceExpressions[0]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-bold">Confidence:</span>
                        {(faceExpressions[1] * 100).toFixed(2)}%
                      </p>
                      <p className="mt-4 text-sm font-semibold">
                        <span className="font-bold">Suggestion:</span>
                        <span className="text-muted-foreground font-normal">
                          {getSuggestion(faceExpressions[0])}
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No face detected. Please ensure your camera is visible.
                    </p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Loading models...
                  </p>
                )}
              </CardContent>
            </Card>
            <hr />

            {details.isStrictMock ? (
              <div></div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5" /> Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentQuestion.tips ? (
                    <ul className="list-disc list-inside space-y-2">
                      {Object.entries(currentQuestion.tips).map(
                        ([key, value]) => (
                          <li
                            key={key}
                            className="text-sm text-muted-foreground"
                          >
                            <strong>{key}:</strong> {value}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No tips available.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
