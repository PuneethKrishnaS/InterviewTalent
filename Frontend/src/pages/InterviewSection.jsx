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

export default function InterviewSection() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(180);

  const videoRef = useRef(null);
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

  // Enable Camera
  useEffect(() => {
    const enableStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    enableStream();
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Timer
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
    addTranscript(currentQuestion.number, transcript || ""); // save transcript
  };

  const handleNext = async () => {
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimer(currentQuestion.timer);
      resetTranscript();
      console.log(interviewQuestions);
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

  // Button state
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

  return (
    <div>
      <MainNavbar />
      <div className="container mx-auto px-5 lg:px-8 py-8">
        {/* Top nav */}
        <div className="flex justify-between items-center mb-8">
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
                </div>
              </CardContent>
            </Card>

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
                        <li key={key} className="text-sm text-muted-foreground">
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
          </div>
        </section>
      </div>
    </div>
  );
}
