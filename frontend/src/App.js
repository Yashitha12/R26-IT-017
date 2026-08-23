import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

// Multilingual Greetings
const getWelcomeMessage = (lang) => {
  if (lang === "si-LK") {
    return "ආයුබෝවන්! මම ඔබගේ SmartGrama AI සහායකයා.\nසුබසාධන සේවා, සමෘද්ධි/අස්වැසුම, ක්ෂුද්‍ර ණය සහ අයදුම් කිරීමේ ක්‍රමවේද පිළිබඳ ඕනෑම ප්‍රශ්නයක් විමසන්න.";
  }
  return "Hello! I'm your SmartGrama AI Assistant.\nAsk me anything about welfare schemes, Samurdhi/Aswesuma, micro-loans, and eligibility criteria.";
};

// Multilingual Quick Questions
const quickQuestionsMap = {
  "en-US": [
    "What welfare assistance is available?",
    "How can I apply for a micro-loan?",
    "What documents are required for eligibility?",
    "How does high monthly expense affect my loan?"
  ],
  "si-LK": [
    "මට ණයක් ලබාගන්න පුළුවන්ද?",
    "සුබසාධන ආධාර ලබාගන්නේ කෙසේද?",
    "ණය සඳහා අවශ්‍ය ලියකියවිලි මොනවාද?",
    "වැඩි වියදම් ඇති විට ණය මුදලට කුමක් සිදුවේද?"
  ]
};

function App() {
  // =========================
  // STATES
  // =========================
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [useRag, setUseRag] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: getWelcomeMessage("en-US"),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Auto Scroll Ref
  const chatEndRef = useRef(null);
  const menuRef = useRef(null);

  // AUTO SCROLL
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // CLOSE MENU ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // LANGUAGE CHANGE (Preserve conversation history, update initial welcome message if untouched)
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (messages.length === 1 && messages[0].sender === "bot") {
      setMessages([
        {
          sender: "bot",
          text: getWelcomeMessage(newLang),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // CLEAR CHAT
  const handleClearChat = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);
    setMessages([
      {
        sender: "bot",
        text: getWelcomeMessage(language),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setMenuOpen(false);
  };

  // TEXT-TO-SPEECH (TTS)
  const handleSpeak = (text, index) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "si-LK" ? "si-LK" : "en-US";
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // SEND MESSAGE
  const sendMessage = async (customMessage = null) => {
    const finalMessage = customMessage || message;
    if (!finalMessage || !finalMessage.trim() || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // User Message
    const userMessage = {
      sender: "user",
      text: finalMessage.trim(),
      time: timeStr
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/chat", {
        message: finalMessage.trim(),
        language: language,
        use_rag: useRag
      });

      const botMessage = {
        sender: "bot",
        text: response.data.reply || (language === "si-LK" ? "පිළිතුරක් නොලැබුණි." : "No response received."),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ragUsed: response.data.rag_used
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: language === "si-LK" 
            ? "පද්ධතිය සමඟ සම්බන්ධ වීමේ දෝෂයක්. කරුණාකර පසුපස සේවාදායකය (Flask Backend) ක්‍රියාත්මක දැයි පරීක්ෂා කරන්න."
            : "Error connecting to the backend server. Please verify the Flask service is running on port 5000.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // VOICE RECOGNITION (STT)
  const startVoiceRecognition = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      alert("Microphone permission denied. Please allow microphone access.");
      console.error("Mic error:", err);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "si-LK" ? "si-LK" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      sendMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  // ENTER KEY SUBMIT
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeQuickQuestions = quickQuestionsMap[language] || quickQuestionsMap["en-US"];

  return (
    <div className="app-container">
      <div className="chat-container">

        {/* ================= HEADER ================= */}
        <div className="header">
          <div className="header-left">
            <div className="logo-badge">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt="SmartGrama AI Logo"
                className="logo"
              />
              <span className="status-dot online"></span>
            </div>
            <div>
              <div className="title-row">
                <h1>SmartGrama AI Assistant</h1>
                <span className={`rag-badge ${useRag ? 'rag-on' : 'rag-off'}`}>
                  {useRag ? 'RAG Grounded' : 'Baseline LLM'}
                </span>
              </div>
              <p>Multilingual Welfare & Micro-Loan Advisory System</p>
            </div>
          </div>

          <div className="header-right" ref={menuRef}>
            <button 
              className="menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              title="Assistant Options"
            >
              ☰
            </button>

            {menuOpen && (
              <div className="menu-dropdown">
                <div className="menu-item-header">Settings & Controls</div>
                <button className="menu-item" onClick={handleClearChat}>
                  🗑️ {language === "si-LK" ? "සංවාදය මකන්න (Clear Chat)" : "Clear Conversation"}
                </button>
                <button 
                  className="menu-item"
                  onClick={() => {
                    setUseRag(!useRag);
                    setMenuOpen(false);
                  }}
                >
                  ⚡ {useRag ? "Switch to Baseline (No RAG)" : "Enable RAG Mode (Knowledge-Grounded)"}
                </button>
                <div className="menu-divider"></div>
                <div className="menu-info">
                  <strong>Stack:</strong> Flask + FAISS + SentenceTransformers + Ollama
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= CHAT AREA ================= */}
        <div className="chat-box">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-wrapper ${msg.sender === "user" ? "user-wrapper" : "bot-wrapper"}`}
            >
              <div className={`message ${msg.sender === "user" ? "user" : "bot"} ${msg.isError ? "error-bubble" : ""}`}>
                <div className="message-content">{msg.text}</div>
                <div className="message-footer">
                  <span className="timestamp">{msg.time}</span>
                  {msg.sender === "bot" && (
                    <button
                      className={`speak-btn ${speakingIndex === index ? 'speaking' : ''}`}
                      onClick={() => handleSpeak(msg.text, index)}
                      title="Read aloud"
                    >
                      {speakingIndex === index ? "⏹️ Stop" : "🔊 Listen"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="message-wrapper bot-wrapper">
              <div className="message bot loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="loading-text">
                  {language === "si-LK" ? "තොරතුරු සකසමින් පවතී..." : "Retrieving knowledge & generating answer..."}
                </span>
              </div>
            </div>
          )}

          {/* Listening State */}
          {listening && (
            <div className="listening-box">
              <span className="pulse-icon">🎙️</span>
              <span>{language === "si-LK" ? "සවන් දෙමින් පවතී... කතා කරන්න" : "Listening... speak now"}</span>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* ================= BOTTOM PANEL ================= */}
        <div className="bottom-panel">

          {/* Quick Questions Chips */}
          <div className="example-box">
            <span className="suggestions-label">
              {language === "si-LK" ? "යෝජිත ප්‍රශ්න:" : "Suggested Questions:"}
            </span>
            <div className="chips-container">
              {activeQuickQuestions.map((question, index) => (
                <button
                  key={index}
                  className="quick-chip"
                  onClick={() => sendMessage(question)}
                  disabled={loading}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Controls Row */}
          <div className="controls-row">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="language-dropdown"
              title="Select Language"
            >
              <option value="en-US">🇬🇧 English</option>
              <option value="si-LK">🇱🇰 සිංහල (Sinhala)</option>
            </select>

            <textarea
              placeholder={language === "si-LK" ? "ඔබගේ පණිවිඩය මෙහි ටයිප් කරන්න..." : "Type your welfare or loan question..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows="1"
            />

            {/* Microphone Button */}
            <button
              className={`mic-btn ${listening ? "listening" : ""}`}
              onClick={startVoiceRecognition}
              title={listening ? "Listening active..." : "Voice Input (Speech-to-Text)"}
              type="button"
            >
              🎤
            </button>

            {/* Send Button */}
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={loading || !message.trim()}
              type="button"
            >
              {language === "si-LK" ? "යවන්න" : "Send"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default App;