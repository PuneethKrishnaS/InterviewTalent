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
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { toast } from "sonner";

export default function InterviewSection() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(180);
  const [faceExpression, setFaceExpression] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const detectionFrameRef = useRef({ last: 0, frameId: null });
  let streamRef = useRef(null); // Store the media stream

  const {
    questions,
    details,
    addTranscript,
    getFeedback,
    transcriptsAnswers,
    loading,
  } = interviewStore();
  const interviewQuestions = questions;
  const currentQuestion = interviewQuestions?.[currentQuestionIndex] || {};

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Suppress Mediapipe logs
  useEffect(() => {
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      if (!args[0]?.includes("vision_wasm_internal.js")) {
        originalConsoleLog(...args);
      }
    };
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  // Handle case when no questions are available
  if (!questions || questions.length === 0) {
    return (
      <div className="bg-background min-h-screen text-foreground font-inter">
        <MainNavbar />
        <div className="container mx-auto px-5 py-8 md:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              Cannot access this route
            </h1>
            <p className="text-muted-foreground mb-6">
              Enter details then mock interview will start!
            </p>
            <Button
              onClick={() => navigate("/interview")}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            >
              <StepBack className="mr-2" />
              Go back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Load Mediapipe FaceLandmarker model
  useEffect(() => {
    const loadMediapipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm"
        );
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: false,
          runningMode: "VIDEO",
          numFaces: 1,
        });
        faceLandmarkerRef.current = faceLandmarker;
        setModelsLoaded(true);
        setLoadingError(null);
        console.log("Mediapipe model loaded successfully");
      } catch (error) {
        toast.error(`Failed to load Mediapipe model: ${error.message}`);
        setLoadingError(
          "Failed to load face detection model. Please check your network connection and try refreshing the page."
        );
      }
    };

    loadMediapipe();
  }, []);

  // Start camera and detection
  useEffect(() => {
    if (!modelsLoaded || loadingError) return;

    const hasCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.some((device) => device.kind === "videoinput");
      } catch {
        return false;
      }
    };

    const startCameraAndDetection = async () => {
      if (!(await hasCamera())) {
        setLoadingError("No camera detected on this device.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
        });
        streamRef.current = stream; // Store the stream
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.addEventListener("loadeddata", () => {
            video.play().then(() => {
              startDetection();
            }).catch(error => {
              toast.error(`Failed to play video: ${error}`);
              setLoadingError("Failed to start video stream: " + error.message);
            });
          });
        } else {
          setLoadingError("Video element not found.");
        }
      } catch (error) {
        console.error("Camera access error:", error.name, error.message);
        if (error.name === "NotAllowedError") {
          setLoadingError("Camera access denied. Please allow camera permissions.");
        } else if (error.name === "NotFoundError") {
          setLoadingError("No camera found on this device.");
        } else {
          setLoadingError("Camera access error: " + error.message);
        }
      }
    };

    const startDetection = () => {
      const video = videoRef.current;
      console.log("Starting detection - Video ready:", video?.readyState, "Paused:", video?.paused, "Dimensions:", video?.videoWidth, video?.videoHeight);
      if (!video || video.paused || video.ended || video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn("Video not ready, retrying in 500ms");
        setTimeout(startDetection, 500); // Retry after a short delay
        return;
      }

      const detect = async () => {
        try {
          const faceLandmarker = faceLandmarkerRef.current;
          if (!faceLandmarker || video.videoWidth === 0 || video.videoHeight === 0) {
            console.warn("FaceLandmarker or video dimensions not ready");
            return;
          }

          const now = performance.now();
          if (detectionFrameRef.current.last && now - detectionFrameRef.current.last < 250) {
            detectionFrameRef.current.frameId = requestAnimationFrame(detect);
            return;
          }
          detectionFrameRef.current.last = now;

          const results = await faceLandmarker.detectForVideo(video, now);
          console.log("Detection frame processed:", results.faceLandmarks?.length ? "Face detected" : "No face");

          if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
            const blendshapes = results.faceBlendshapes[0].categories;
            const expression = getExpressionFromBlendshapes(blendshapes);
            setFaceExpression(expression);
          } else {
            setFaceExpression(null);
          }
        } catch (error) {
          console.error("Detection error:", error);
        }
        detectionFrameRef.current.frameId = requestAnimationFrame(detect);
      };

      detect();
    };

    startCameraAndDetection();

    // Cleanup function to stop camera and detection
    return () => {
      if (detectionFrameRef.current.frameId) {
        cancelAnimationFrame(detectionFrameRef.current.frameId);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null; // Clear the stream reference
      }
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
        console.log("Graph finished closing successfully");
      }
    };
  }, [modelsLoaded, loadingError]);

  // Custom logic to map blendshapes to expressions
  const getExpressionFromBlendshapes = (blendshapes) => {
    const expressionScores = {
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      neutral: 0,
    };

    blendshapes.forEach((blendshape) => {
      const { categoryName, score } = blendshape;
      if (categoryName.includes("smile") || categoryName.includes("mouthSmile")) {
        expressionScores.happy += score * 1.5;
      } else if (
        categoryName.includes("frown") ||
        categoryName.includes("mouthFrown") ||
        categoryName.includes("sad")
      ) {
        expressionScores.sad += score * 1.2;
      } else if (categoryName.includes("anger") || categoryName.includes("browDown")) {
        expressionScores.angry += score * 1.2;
      } else if (
        categoryName.includes("eyeWide") ||
        categoryName.includes("jawOpen") ||
        categoryName.includes("mouthPucker")
      ) {
        expressionScores.surprised += score * 1.3;
      } else if (categoryName.includes("neutral")) {
        expressionScores.neutral += score;
      }
    });

    const totalScore = Object.values(expressionScores).reduce((sum, val) => sum + val, 0);
    if (totalScore > 0) {
      Object.keys(expressionScores).forEach((key) => (expressionScores[key] /= totalScore));
    }

    const maxExpression = Object.entries(expressionScores).reduce(
      (max, [key, value]) => (value > max[1] ? [key, value] : max),
      ["neutral", 0]
    );

    return maxExpression[1] > 0.4 ? { expression: maxExpression[0], confidence: maxExpression[1] } : null;
  };

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isRecording && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          const newTimer = prev - 1;
          if (newTimer <= 0) {
            handleStopRecording();
            clearInterval(interval);
          }
          return newTimer;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, timer]);

  // Actions
  const handleStartRecording = async () => {
    if (!currentQuestion.number) return;
    const hasMic = await navigator.mediaDevices.getUserMedia({ audio: true }).then(() => true).catch(() => false);
    if (!hasMic) {
      alert("Microphone access is required for speech recognition. Please allow permissions.");
      return;
    }
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
      setTimer(interviewQuestions[currentQuestionIndex + 1]?.timer || 180);
      resetTranscript();
    } else {
      try {
        await getFeedback(questions, transcriptsAnswers, details);
        if (!loading) {
          navigate("/interview/results");
        }
      } catch (error) {
        console.error("Feedback error:", error);
        alert("Failed to fetch feedback. Please try again.");
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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Speech Recognition Not Supported</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">
            Your browser does not support speech recognition. Please use Chrome or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getSuggestion = (expression) => {
    switch (expression) {
      case "sad":
      case "angry":
        return "Try to maintain a positive and calm expression.";
      case "surprised":
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
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Question {currentQuestion.number || "?"} of{" "}
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
                  {currentQuestion.question || "No question available"}
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
                </div>
              </CardContent>
            </Card>
            <hr />
            <Card>
              <CardHeader>
                <CardTitle>Real-time Feedback</CardTitle>
                <CardDescription>Facial Expression</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingError ? (
                  <p className="text-sm text-red-600">{loadingError}</p>
                ) : modelsLoaded ? (
                  faceExpression ? (
                    <>
                      <p className="text-xl font-bold capitalize mb-2">
                        {faceExpression.expression}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {(faceExpression.confidence * 100).toFixed(2)}%
                      </p>
                      <p className="mt-4 text-sm font-semibold">
                        Suggestion: <span className="text-muted-foreground font-normal">
                          {faceExpression ? getSuggestion(faceExpression.expression) : "Position your face in view."}
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