import React, { useState } from "react";

const StudentVoiceAssistant = () => {
  const [listening, setListening] = useState(false);

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  const startVoiceAssistant = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support voice recognition!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;

    const courseId = localStorage.getItem("currentCourseID"); // 🔥 important

    setListening(true);
    speak("Listening... please say your command");

    recognition.start();

    recognition.onresult = async (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log("Voice Command:", command);

      // 🎯 DASHBOARD
      if (command.includes("dashboard")) {
        speak("Opening course dashboard");
        window.location.href = `/student/course/${courseId}`;
      }

      // 🎯 STUDENTS
      else if (command.includes("student")) {
        speak("Opening students page");
        window.location.href = `/student/course/${courseId}/students`;
      }

      // 🎯 ASSIGNMENTS
      else if (command.includes("assignment")) {
        speak("Opening assignments page");
        window.location.href = `/student/course/${courseId}/assignments`;
      }

      // 🎯 NOTIFICATIONS
      else if (command.includes("notice") || command.includes("notification")) {
        speak("Opening notifications");
        window.location.href = `/student/course/${courseId}/notifications`;
      }

      // 🎯 MARKS
      else if (command.includes("mark")) {
        speak("Opening marks page");
        window.location.href = `/student/course/${courseId}/marks`;
      }

      // 🎯 ATTENDANCE
      else if (command.includes("attendance")) {
        speak("Opening attendance page");
        window.location.href = `/student/course/${courseId}/attendance`;
      }

      // 🎯 MY COURSES
      else if (command.includes("course")) {
        speak("Opening my courses");
        window.location.href = `/student`;
      }

      // 🎯 LOGOUT
      else if (command.includes("logout")) {
        speak("Logging out");
        localStorage.clear();
        window.location.href = "/";
      }

      // ❌ UNKNOWN
      else {
        speak("Sorry, I did not understand that command");
      }

      setListening(false);
    };

    recognition.onerror = () => {
      speak("Error occurred while listening");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <button
        onClick={startVoiceAssistant}
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          background: listening ? "red" : "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {listening ? "🎤 Listening..." : "🎤 Start Voice Assistant"}
      </button>
    </div>
  );
};

export default StudentVoiceAssistant;