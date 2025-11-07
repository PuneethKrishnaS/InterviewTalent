import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/global/MainNavbar";
import { Button } from "../components/ui/button";
import {
  ArrowLeftCircle,
  Code,
  TimerIcon,
  User,
  Briefcase,
  Sparkle,
  ChevronLeft,
} from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Switch } from "../components/ui/switch";

import { Badge } from "../components/ui/badge";
import { useState, useRef, useEffect, useContext } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { interviewStore } from "../components/store/InterviewStore";
import { toast } from "sonner";

export default function Interview() {
  const navigate = useNavigate();
  const [selectedInterviewIndex, setSelectedInterviewIndex] = useState(null);
  const [selectedDifficultIndex, setSelectedDifficultIndex] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState({
    InterviewType: "Not selected",
    JobRole: "Not selected",
    DifficultyLevel: "Not selected",
    duration: "--:--",
    isStrictMock: false,
    isResumeAnalysis: false,
  });

  const { setDetails, getQuestions, loading, error } = interviewStore();

  const interviews = [
    {
      cardName: "Technical Interview",
      cardDescription: "Coding and technical questions",
      cardIcon: "Code",
      cardContent:
        "Test your coding skills and problem-solving abilities with real-world technical questions.",
      badge: {
        name: "Time",
        time: "25-30 min",
      },
    },
    {
      cardName: "Behavioral Interview",
      cardDescription: "Situational and behavioral questions",
      cardIcon: "User",
      cardContent:
        "Prepare for questions about teamwork, leadership, and problem-solving in workplace scenarios.",
      badge: {
        name: "Time",
        time: "20-25 min",
      },
    },
    {
      cardName: "HR Interview",
      cardDescription: "General HR and fit questions",
      cardIcon: "Briefcase",
      cardContent:
        "Practice answering questions about your background, strengths, weaknesses, and company fit.",
      badge: {
        time: "15-20 min",
      },
    },
  ];

  const jobsRoles = [
    {
      value: "software_engineer",
      jobrole: "Software Engineer",
    },
    {
      value: "frontend_developer",
      jobrole: "Frontend Developer",
    },
    {
      value: "backend_developer",
      jobrole: "Backend Developer",
    },
    {
      value: "fullstack_developer",
      jobrole: "Full Stack Developer",
    },
    {
      value: "devops_engineer",
      jobrole: "DevOps Engineer",
    },
    {
      value: "qa_engineer",
      jobrole: "QA Engineer",
    },
    {
      value: "data_engineer",
      jobrole: "Data Engineer",
    },
    {
      value: "data_scientist",
      jobrole: "Data Scientist",
    },
    {
      value: "machine_learning_engineer",
      jobrole: "Machine Learning Engineer",
    },
    {
      value: "mobile_developer",
      jobrole: "Mobile Developer",
    },
    {
      value: "cloud_engineer",
      jobrole: "Cloud Engineer",
    },
    {
      value: "security_engineer",
      jobrole: "Security Engineer",
    },
    {
      value: "site_reliability_engineer",
      jobrole: "Site Reliability Engineer",
    },
    {
      value: "database_administrator",
      jobrole: "Database Administrator",
    },
    {
      value: "systems_engineer",
      jobrole: "Systems Engineer",
    },
  ];

  const DifficultyLevel = [
    { name: "Beginner", varient: "outline" },
    { name: "Intermediate", varient: "outline" },
    { name: "Advanced", varient: "outline" },
  ];

  const iconMap = {
    Code: Code,
    User: User,
    Briefcase: Briefcase,
  };

  // Camera state
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        setVideoDevices(videoInputs);
        if (videoInputs.length > 0) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      } catch (err) {
        console.error("Error getting media devices:", err);
      }
    };

    fetchDevices();
  }, []);

  // Start selected camera
  useEffect(() => {
    let stream;

    const startCamera = async () => {
      if (!selectedDeviceId) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedDeviceId } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedDeviceId]);

  return (
    <div>
      <MainNavbar />
      <div className="w-full">
        <div className="container mx-auto lg:px-8 px-5 py-22">
          {/* Top nav */}
          <nav className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
            <div className="text-right">
              <h1 className="font-black text-md md:text-xl">Mock Interview</h1>
              <p className="text-muted-foreground text-sm md:text-md">
                Practice with AI-powered interviews
              </p>
            </div>
          </nav>

          {/* Main content */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side (Interview Types & Job Role + Difficulty) */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              {/* Interview Types */}
              <div className="border border-border rounded-xl p-4">
                <div className="mb-4">
                  <h1 className="font-semibold text-md md:text-xl mb-2">
                    Choose Interview Type
                  </h1>
                  <p className="text-muted-foreground text-sm md:text-md">
                    Select the type of interview you want to practice
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {interviews.map((interview, index) => {
                    const Icon = iconMap[interview.cardIcon];
                    return (
                      <Card
                        key={index}
                        onClick={() => {
                          setSelectedInterviewIndex(index);
                          setInterviewDetails((prev) => ({
                            ...prev,
                            InterviewType: interview.cardName,
                            duration: interview.badge.time,
                          }));
                        }}
                        className={`cursor-pointer ${
                          selectedInterviewIndex === index
                            ? "bg-muted border-accent-foreground"
                            : ""
                        }`}
                      >
                        <CardHeader>
                          <CardTitle>{interview.cardName}</CardTitle>
                          <CardDescription>
                            {interview.cardDescription}
                          </CardDescription>
                          <CardAction>
                            <div className="p-2 rounded-full bg-accent text-foreground">
                              {Icon && <Icon />}
                            </div>
                          </CardAction>
                        </CardHeader>
                        <CardContent>{interview.cardContent}</CardContent>
                        <CardFooter>
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <TimerIcon className="w-4 h-4" />
                            {interview.badge.time}
                          </Badge>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Job Role + Difficulty */}
              <div className="border border-border rounded-xl p-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Job Role */}
                  <div>
                    <h1 className="font-semibold text-md md:text-xl mb-2">
                      Job Role
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-md mb-4">
                      Select your target job role for tailored questions
                    </p>
                    <Select
                      value={
                        interviewDetails.JobRole === "Not selected"
                          ? ""
                          : jobsRoles.find(
                              (j) => j.jobrole === interviewDetails.JobRole
                            )?.value
                      }
                      disabled={interviewDetails.isResumeAnalysis === true}
                      onValueChange={(value) => {
                        const selectedJob = jobsRoles.find(
                          (j) => j.value === value
                        );
                        setInterviewDetails((prev) => ({
                          ...prev,
                          JobRole: selectedJob
                            ? selectedJob.jobrole
                            : "Not selected",
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Job Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobsRoles.map((job, index) => (
                          <SelectItem value={job.value} key={index}>
                            {job.jobrole}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <h1 className="font-semibold text-md md:text-xl mb-2">
                      Difficulty Level
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-md mb-4">
                      Choose the difficulty that matches your experience
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {DifficultyLevel.map((button, index) => (
                        <Button
                          key={index}
                          variant={
                            selectedDifficultIndex === index
                              ? ""
                              : button.varient
                          }
                          onClick={() => {
                            setSelectedDifficultIndex(index);
                            setInterviewDetails((prev) => ({
                              ...prev,
                              DifficultyLevel: button.name,
                            }));
                          }}
                        >
                          {button.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex item-center gap-10 wrap-content wrap-normal ">
                <div className="flex items-center space-x-2 mt-2 ">
                  <Switch
                    id="strict-mock-switch"
                    checked={interviewDetails.isStrictMock}
                    onCheckedChange={(checked) =>
                      setInterviewDetails((prev) => ({
                        ...prev,
                        isStrictMock: checked,
                      }))
                    }
                  />
                  <label htmlFor="strict-mock-switch">
                    Strict Mock (No Hints)
                  </label>
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id="resume-analysis-switch"
                    checked={interviewDetails.isResumeAnalysis}
                    onCheckedChange={(checked) =>
                      setInterviewDetails((prev) => ({
                        ...prev,
                        isResumeAnalysis: checked,
                      }))
                    }
                  />
                  <label htmlFor="resume-analysis-switch">
                    Take Interview from resume
                  </label>
                </div>
              </div>
            </div>

            {/* Right Side (Camera & Placeholder) */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              {/* Camera */}
              <div className="border border-border rounded-xl p-4 dark:bg-accent">
                <label className="block mb-2 text-sm font-medium text-muted-foreground">
                  Select Camera
                </label>
                <select
                  className="w-full mb-3 p-2 border rounded bg-background text-foreground"
                  value={selectedDeviceId || ""}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                >
                  {videoDevices.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${index + 1}`}
                    </option>
                  ))}
                </select>

                <div className="w-full aspect-video rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Live camera preview
                </p>
              </div>

              {/* Interview Details, Start Button, and Tips */}
              <div className="border border-border rounded-xl p-4 flex flex-col gap-4">
                <h2 className="font-semibold text-lg mb-2">
                  Interview Details
                </h2>
                <ul className="text-sm text-muted-foreground mb-2">
                  <li>
                    <span className="font-medium text-foreground">Type:</span>{" "}
                    {interviewDetails.InterviewType}
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Job Role:
                    </span>{" "}
                    {interviewDetails.JobRole}
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Difficulty:
                    </span>{" "}
                    {interviewDetails.DifficultyLevel}
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Duration:
                    </span>{" "}
                    {interviewDetails.duration}
                  </li>
                </ul>
                <Button
                  className="w-full"
                  disabled={
                    loading ||
                    interviewDetails.InterviewType === "Not selected" ||
                    interviewDetails.DifficultyLevel === "Not selected" ||
                    (!interviewDetails.isResumeAnalysis &&
                      interviewDetails.JobRole === "Not selected")
                  }
                  onClick={async () => {
                    setDetails(interviewDetails);
                    await getQuestions(interviewDetails);

                    const { error, loading } = interviewStore.getState(); // read latest state

                    if (error) {
                      toast.error(error);
                      navigate("/interview");
                      return;
                    }
                    if (!loading) {
                      navigate("/interview/section");
                    }
                  }}
                >
                  {loading ? "Generating..." : "Start Interview"}
                </Button>

                <div className="mt-4">
                  <h3 className="font-semibold text-md mb-1">Interview Tips</h3>
                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                    <li>Find a quiet, well-lit place for your interview.</li>
                    <li>Test your camera and microphone before starting.</li>
                    <li>
                      Read each question carefully and think before answering.
                    </li>
                    <li>Be confident and speak clearly.</li>
                    <li>Keep your answers concise and relevant.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
