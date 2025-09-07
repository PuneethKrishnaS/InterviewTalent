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
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { interviewStore } from "../components/store/InterviewStore";
import * as faceapi from "face-api.js";

export default function InterviewSection() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(180);
  const [faceExpressions, setFaceExpressions] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

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
  const currentQuestion = interviewQuestions[currentQuestionIndex];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const navigate = useNavigate();

  // Unified effect for loading models, starting camera, and detection
  useEffect(() => {
    const loadModelsAndStartCamera = async () => {
      const MODEL_URL = "/models";
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Failed to load face-api models or camera:", error);
      }
    };

    const startDetection = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.paused || video.ended) return;

      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      detectionIntervalRef.current = setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
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
      }, 100);
    };

    if (modelsLoaded) {
      const currentVideoRef = videoRef.current;
      if (currentVideoRef) {
        currentVideoRef.addEventListener("play", startDetection);
      }
    } else {
      loadModelsAndStartCamera();
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      const currentVideoRef = videoRef.current;
      if (currentVideoRef) {
        currentVideoRef.removeEventListener("play", startDetection);
        if (currentVideoRef.srcObject) {
          currentVideoRef.srcObject.getTracks().forEach((track) => track.stop());
        }
      }
    };
  }, [modelsLoaded]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isRecording && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && isRecording) {
      handleStopRecording();
    }
    return () => clearInterval(interval);
  }, [isRecording, timer]);

  // Actions
  const handleStartRecording = () => {
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
      setTimer(currentQuestion.timer);
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
        {/* Top nav */}
        <div className="flex justify-between items-center mt-8 mb-8">
          <Button variant="link" onClick={() => navigate("/dashboard")}>
            <ArrowLeftCircle className="mr-2" /> Exit Interview
          </Button>
          <div className="text-right">
            <h1 className="font-bold text-lg md:text-xl">
              {details.InterviewType}
            </h1>
            <p className="text-muted-foreground text-sm">
              {details.JobRole} <Badge>{details.duration}</Badge>
            </p>
          </div>
        </div>
        {/* Main content */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left */}
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
                  <canvas ref={canvasRef} className="absolute top-0 left-0" />
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
                {modelsLoaded ? (
                  faceExpressions ? (
                    <>
                      <p className="text-xl font-bold capitalize mb-2">
                        {faceExpressions[0]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        **Confidence:** {(faceExpressions[1] * 100).toFixed(2)}%
                      </p>
                      <p className="mt-4 text-sm font-semibold">
                        **Suggestion:**{" "}
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