import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/logout";
import "../../assets/CSS/student/navbar.css";

function Navbar({ onToggleSidebar, sidebarOpen }) {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  const startVoiceAssistant = () => {
    const courseId = localStorage.getItem("currentCourseID");
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

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();

      if (command.includes("dashboard")) {
        speak("Opening course dashboard");
        window.location.href = `/student/course/${courseId}`;
      } else if (command.includes("student")) {
        speak("Opening students page");
        window.location.href = `/student/course/${courseId}/students`;
      } else if (command.includes("assignment")) {
        speak("Opening assignments page");
        window.location.href = `/student/course/${courseId}/assignments`;
      } else if (command.includes("notice") || command.includes("notification")) {
        speak("Opening notifications");
        window.location.href = `/student/course/${courseId}/notifications`;
      } else if (command.includes("mark")) {
        speak("Opening marks page");
        window.location.href = `/student/course/${courseId}/marks`;
      } else if (command.includes("attendance")) {
        speak("Opening attendance page");
        window.location.href = `/student/course/${courseId}/attendance`;
      } else if (command.includes("course")) {
        speak("Opening my courses");
        window.location.href = `/student`;
      } else if (command.includes("logout")) {
        speak("Logging out");
        localStorage.clear();
        window.location.href = "/";
      } else {
        speak("Sorry, I did not understand that command");
      }

      setListening(false);
    };

    recognition.onerror = () => {
      speak("Error occurred while listening");
      setListening(false);
    };

    recognition.onend = () => setListening(false);
  };

  return (
    <div className="student-navbar">
      <div className="navbar-left">
        {/* Hamburger */}
        <button
          className={`hamburger-btn ${sidebarOpen ? "open" : ""}`}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span />
          <span />
          <span />
        </button>
        <span className="navbar-brand">
          SSMS <em>Student</em>
        </span>
      </div>

      <div className="navbar-center">
        <div className="navbar-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input placeholder="Search..." />
        </div>
      </div>

      <div className="navbar-right">
        {/* Voice assistant */}
        <button
          className={`voice-btn ${listening ? "listening" : ""}`}
          onClick={startVoiceAssistant}
          aria-label={listening ? "Listening..." : "Voice assistant"}
          title={listening ? "Listening..." : "Voice Assistant"}
        >
          {listening && <span className="voice-ring" />}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        </button>

        {/* Logout */}
        <button className="logout-nav-btn" onClick={() => logout(navigate)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>

        {/* Avatar */}
        <div className="avatar">S</div>
      </div>
    </div>
  );
}

export default Navbar;