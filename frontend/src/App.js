import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

// =========================
// Welcome Message
// =========================

const getWelcomeMessage = (lang) => {

  if (lang === "si-LK") {

    return "👋 ආයුබෝවන්! මම ඔබගේ SmartGrama AI සහායකයා.\nමම ඔබට අද කෙසේ උදව් කළ හැකිද?";
  }

  return "👋 Hello! I'm your SmartGrama AI assistant.\nHow can I help you today?";
};

function App() {

  // =========================
  // STATES
  // =========================

  const [message, setMessage] = useState("");

  const [language, setLanguage] =
    useState("en-US");

  const [loading, setLoading] =
    useState(false);

  const [listening, setListening] =
    useState(false);

  const [messages, setMessages] =
    useState([
      {
        sender: "bot",
        text: getWelcomeMessage("en-US")
      }
    ]);

  // Auto Scroll Ref
  const chatEndRef = useRef(null);

  // =========================
  // AUTO SCROLL
  // =========================

  useEffect(() => {

    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [messages, loading]);

  // =========================
  // CHANGE WELCOME MESSAGE
  // =========================

  useEffect(() => {

    setMessages([
      {
        sender: "bot",
        text: getWelcomeMessage(language)
      }
    ]);

  }, [language]);

  // =========================
  // SEND MESSAGE
  // =========================

  const sendMessage = async (
    customMessage = null
  ) => {

    const finalMessage =
      customMessage || message;

    if (!finalMessage.trim()) return;

    // User Message
    const userMessage = {
      sender: "user",
      text: finalMessage
    };

    setMessages((prev) => [
      ...prev,
      userMessage
    ]);

    setMessage("");

    setLoading(true);

    try {

      const response =
        await axios.post(
          "http://127.0.0.1:5000/chat",
          {
            message: finalMessage,
            language: language
          }
        );

      const botMessage = {
        sender: "bot",
        text: response.data.reply
      };

      setMessages((prev) => [
        ...prev,
        botMessage
      ]);

    } catch (error) {

      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "❌ Error connecting to backend."
        }
      ]);

    } finally {

      setLoading(false);

    }
  };

  // =========================
  // VOICE RECOGNITION
  // =========================

  // =========================
// VOICE RECOGNITION
// =========================

const startVoiceRecognition = async () => {

  try {

    // Request microphone permission first
    await navigator.mediaDevices.getUserMedia({
      audio: true
    });

  } catch (err) {

    alert(
      "Please allow microphone access in Chrome."
    );

    console.log(err);

    return;
  }

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {

    alert(
      "Speech Recognition is not supported in this browser."
    );

    return;
  }

  const recognition =
    new SpeechRecognition();

  recognition.lang = language;

  recognition.continuous = false;

  recognition.interimResults = false;

  recognition.maxAlternatives = 1;

  recognition.onstart = () => {

    console.log("Mic started");

    setListening(true);
  };

  recognition.onresult = (event) => {

    const transcript =
      event.results[0][0].transcript;

    console.log("Transcript:", transcript);

    setMessage(transcript);

    sendMessage(transcript);
  };

  recognition.onerror = (event) => {

    console.log(event.error);

    if (event.error === "not-allowed") {

      alert(
        "Chrome blocked microphone access."
      );

    } else {

      alert(
        "Mic Error: " + event.error
      );
    }

    setListening(false);
  };

  recognition.onend = () => {

    console.log("Mic ended");

    setListening(false);
  };

  recognition.start();
};

  // =========================
  // ENTER KEY SEND
  // =========================

  const handleKeyDown = (e) => {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      sendMessage();
    }
  };

  // =========================
  // QUICK QUESTIONS
  // =========================

  const quickQuestions = [

    "Loan eligibility",

    "Credit score",

    "Welfare info",

    "Next payment"

  ];

  // =========================
  // UI
  // =========================

  return (

    <div className="app-container">

      <div className="chat-container">

        {/* ================= HEADER ================= */}

        <div className="header">

          <div className="header-left">

            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="logo"
              className="logo"
            />

            <div>

              <h1>
                SmartGrama AI Assistant
              </h1>

              <p>
                Multilingual Welfare &
                Loan Assistant
              </p>

            </div>

          </div>

          <div className="menu-icon">

            ☰

          </div>

        </div>

        {/* ================= CHAT AREA ================= */}

        <div className="chat-box">

          {messages.map((msg, index) => (

            <div
              key={index}
              className={
                msg.sender === "user"
                  ? "message user"
                  : "message bot"
              }
            >
              {msg.text}
            </div>

          ))}

          {/* Loading */}

          {loading && (

            <div className="message bot loading">

              🤖 Thinking...

            </div>

          )}

          {/* Listening */}

          {listening && (

            <div className="listening-box">

              🎤 Listening...

            </div>

          )}

          {/* Auto Scroll */}

          <div ref={chatEndRef}></div>

        </div>

        {/* ================= BOTTOM PANEL ================= */}

        <div className="bottom-panel">

          {/* Input Row */}

          <div className="controls-row">

            <textarea
              placeholder="Type your message..."
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={handleKeyDown}
            />

            {/* MIC */}

            <button
              className={
                listening
                  ? "mic-btn listening"
                  : "mic-btn"
              }
              onClick={startVoiceRecognition}
            >
              🎤
            </button>

            {/* SEND */}

            <button
              className="send-btn"
              onClick={() => sendMessage()}
            >
              Send
            </button>

          </div>

          {/* ================= LANGUAGE ================= */}

          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value)
            }
            className="language-dropdown"
          >

            <option value="en-US">
              English
            </option>

            <option value="si-LK">
              සිංහල
            </option>

          </select>

          {/* ================= QUICK BUTTONS ================= */}

          <div className="example-box">

            {quickQuestions.map(
              (question, index) => (

                <button
                  key={index}
                  onClick={() =>
                    sendMessage(question)
                  }
                >
                  {question}
                </button>

              )
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;