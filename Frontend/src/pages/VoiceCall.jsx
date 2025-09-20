import React, { useContext, useEffect, useState, useRef } from "react";
import MainNavbar from "@/components/global/MainNavbar";
import { Ripple } from "@/components/magicui/ripple";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle, PhoneOff, StepBack } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Vapi from "@vapi-ai/web";
import { voiceInterviewStore } from "@/components/store/voiceInterviewstore";
import { AuthContext } from "@/components/context/AuthContext";

export default function VoiceCall() {
  const navigate = useNavigate();
  const { questions, details } = voiceInterviewStore();
  const { user } = useContext(AuthContext);

  // Use useRef to persist the Vapi instance across renders
  const vapiRef = useRef(null);

  if (!questions) {
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
              onClick={() => navigate("/voice")}
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

  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [inCall, setInCall] = useState(false);

  // Initialize Vapi only once and store it in the ref
  if (!vapiRef.current) {
    vapiRef.current = new Vapi(import.meta.env.VITE_VAPI_API);
  }
  const vapi = vapiRef.current;
  const assistentID = import.meta.env.VITE_ASSISTANT_ID;

  const assistentOptions = {
    name: "InterviewTalent",
    voice: {
      voiceId: "Elliot",
      provider: "vapi",
    },

    model: {
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `"[Identity]  \nYou are a supportive and professional interview AI assistant, designed to facilitate technical interviews for candidates applying for a job role.\n\n[Style]  \n- Use a warm and friendly tone throughout the interview.  \n- Maintain professionalism and clarity in language.\n\n[Response Guidelines]  \n- Ask questions one at a time, waiting for a complete response before proceeding to the next question.  \n- Keep questions straightforward and uncluttered.  \n- Provide concise feedback after each response.\n\n[Task & Goals]  \n1. Begin the session with a welcoming and professional greeting.  \n   Example: \"Hey there! Welcome to your ${details.JobRole} interview. Let’s get started with a few questions.\"  \n2. Proceed to ask one question from the provided list at a time.  \n   - Use ${questions} to access and ask the specific question.  \n   - <wait for candidate response>  \n3. If the candidate struggles, offer a hint or rephrase the question.  \n   Example: “Need a hint? Think about how React tracks component updates.”  \n4. Provide short, encouraging feedback after each answer:  \n   - Examples:  \n     - “Nice! That’s a solid answer.”  \n     - “Hmm, not quite. Want to try again?”  \n5. Transition smoothly between questions using conversational phrases.  \n   Examples:  \n   - “Alright, next up…”  \n   - “Let’s tackle a tricky one!”  \n6. After two questions, wrap up the session:  \n   - Summarize the candidate’s performance positively.  \n   Example: “That was great! You handled some tough questions well. Keep sharpening your skills. Thanks for chatting—I hope to see you crushing projects soon!”\n\n[Error Handling / Fallback]  \n- If the candidate has trouble understanding a question, offer to clarify or rephrase it.  \n- Should any errors or miscommunication happen, politely guide the candidate back to the earlier point of clarity and continue the interview."`,
        },
      ],
      provider: "groq",
    },
    firstMessage: `Hi ${user.userName.first}, how are you? Ready for your interview on ${details.JobRole} `,
    voicemailMessage: "Please call back when you're available.",
    endCallMessage: "Goodbye.",
    transcriber: {
      model: "nova-2",
      language: "en",
      provider: "deepgram",
      confidenceThreshold: 1,
    },
    voicemailDetection: {
      provider: "vapi",
      backoffPlan: {
        maxRetries: 6,
        startAtSeconds: 5,
        frequencySeconds: 5,
      },
      beepMaxAwaitSeconds: 0,
    },
  };
  useEffect(() => {
    // Start the call only when the component mounts and questions are available
    if (questions) {
      vapi.start(assistentOptions);
    }

    vapi.on("call-start", () => {
      setInCall(true);
    });

    vapi.on("speech-start", () => {
      setAiSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setAiSpeaking(false);
    });

    vapi.on("local-speech-start", () => {
      setUserSpeaking(true);
    });

    vapi.on("local-speech-end", () => {
      setUserSpeaking(false);
    });

    vapi.on("call-start-failed", () => {
      setInCall(false);
    });

    vapi.on("call-end", () => {
      console.log("Call ended");
      setInCall(false);
      setAiSpeaking(false);
      setUserSpeaking(false);
    });

    // Cleanup function for useEffect
    return () => {
      vapi.stop();
      vapi.off("call-start");
      vapi.off("speech-start");
      vapi.off("speech-end");
      vapi.off("local-speech-start");
      vapi.off("local-speech-end");
      vapi.off("call-start-success");
      vapi.off("call-start-failed");
      vapi.off("call-end");
    };
  }, [questions, navigate]);

  const stopInterview = () => {
    vapi.stop();
    navigate("/dashboard");
  };

  return (
    <div className="bg-background min-h-screen justify-center items-center text-foreground font-inter">
      <MainNavbar />
      <div className="w-full">
        <div className="container mx-auto lg:px-8 px-5 py-8 md:py-12">
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
                Voice Conversation
              </h1>
            </div>
          </nav>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-20 w-full md:mb-20">
            {/* ... (Your existing circles for AI and user) */}
            <div className="col-span-1 md:col-span-6 relative flex justify-center items-center border-accent border h-[40vh] md:h-[60vh] rounded-4xl">
              <Ripple
                bgColor="#002fff"
                numCircles={aiSpeaking ? 5 : 1}
                mainCircleSize={aiSpeaking ? 150 : 120}
              />
              <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center bg-[#002fff28] rounded-full opacity-70 text-lg md:text-xl font-bold">
                AI
              </div>
            </div>
            <div className="col-span-1 md:col-span-6 relative flex justify-center items-center border-accent border h-[40vh] md:h-[60vh] rounded-4xl">
              <Ripple
                bgColor="#ff03f2"
                numCircles={userSpeaking ? 5 : 1}
                mainCircleSize={userSpeaking ? 150 : 120}
              />
              <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center bg-[#ff03f228] rounded-full opacity-70 text-lg md:text-xl font-bold">
                PK
              </div>
            </div>
          </div>
          <div className="w-full justify-center items-center flex">
            <Button
              className={`${"bg-destructive hover:bg-destructive/75"} text-white cursor-pointer`}
              size="lg"
              onClick={stopInterview}
            >
              <PhoneOff className="mr-2" />
              {"End Call"}
            </Button>
          </div>
          <div className="mt-6 text-center text-muted-foreground">
            {!inCall
              ? "Connecting...."
              : aiSpeaking
              ? "AI is speaking..."
              : userSpeaking
              ? "User is speaking..."
              : "...."}
          </div>
        </div>
      </div>
    </div>
  );
}
