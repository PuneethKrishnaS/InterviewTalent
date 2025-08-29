import React, { useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export default function Speech() {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const [isRecording, setIsRecording] = useState(false);

  if (!browserSupportsSpeechRecognition) {
    return <span>Your browser does not support speech recognition.</span>;
  }

  const handleToggle = () => {
    if (!isRecording) {
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
      setIsRecording(true);
    } else {
      SpeechRecognition.stopListening();
      setIsRecording(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>🎤 Speech Recognition Test</h2>
      <p>Status: {listening ? "Listening..." : "Not listening"}</p>
      <button onClick={handleToggle}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      <button onClick={resetTranscript} style={{ marginLeft: "10px" }}>
        Reset Transcript
      </button>
      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          border: "1px solid gray",
          borderRadius: "5px",
          minHeight: "80px",
        }}
      >
        <strong>Transcript:</strong>
        <p>{transcript || "Say something..."}</p>
      </div>
    </div>
  );
}
