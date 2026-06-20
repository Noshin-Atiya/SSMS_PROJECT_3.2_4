import React, { useState } from "react";

const TeacherVoiceAssistant = () => {
  const [listening, setListening] = useState(false);

  // 🔊 Speak function
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

    setListening(true);
    speak("Listening... please say your command");

    recognition.start();

    recognition.onresult = async (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log("Voice Command:", command);

      // 🎯 SHOW STUDENTS
      if (command.includes("student")) {
        speak("Opening students page");
        window.location.href = "/teacher/students";
      }

      // 🎯 SHOW ASSIGNMENTS
      else if (command.includes("assignment")) {
        speak("Opening assignments page");
        window.location.href = "/teacher/assignments";
      }

      // 🎯 SHOW NOTICES
      else if (command.includes("notice")) {
        speak("Opening notices");
        window.location.href = "/teacher/notices";
      }
      else if(command.includes("attendance")){
        speak("Opening attendance");
        window.location.href="/teacher/attendance"

      }
      //LOGOUT
      else if(command.includes("logout")){
            speak("Logout Done")
            window.location.href="/"
      }
      //BACK TO DASHBOARD
      else if(command.includes("dashboard")){
        speak("Back to Dashboard")
        window.location.href="/teacher/dashboard"
      }
        


      // 🎯 DELETE STUDENT
      else if (command.includes("delete student")) {
        const words = command.split(" ");
        const id = words[words.length - 1]; // last word as ID

        if (!id) {
          speak("Student ID not found");
          return;
        }

        try {
          await fetch(`http://localhost:5000/deleteUser/${id}`, {
            method: "DELETE",
          });

          speak(`Student ${id} deleted successfully`);
          alert(`Student ${id} deleted`);
        } catch (err) {
          console.error(err);
          speak("Failed to delete student");
        }
      }

      // ❌ UNKNOWN COMMAND
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

export default TeacherVoiceAssistant;