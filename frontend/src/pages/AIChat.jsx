import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./AIChat.css";
import botLogo from "./bot-logo.jpg";

// Multilingual Quick Topics
const categories = {
  "en-US": [
    { id: "welfare", text: "Welfare", icon: "🏛️" },
    { id: "loan", text: "Loans", icon: "💰" }
  ],
  "si-LK": [
    { id: "welfare", text: "සුබසාධන", icon: "🏛️" },
    { id: "loan", text: "ණය", icon: "💰" }
  ]
};

const quickTopics = {
  "en-US": {
    welfare: [
      { text: "What welfare assistance is available?", icon: "🏛️" },
      { text: "How to apply for Samurdhi?", icon: "📝" },
      { text: "Disability allowance eligibility?", icon: "♿" }
    ],
    loan: [
      { text: "How can I apply for a micro-loan?", icon: "💰" },
      { text: "What documents are required?", icon: "📄" },
      { text: "Loan interest rates?", icon: "📈" }
    ]
  },
  "si-LK": {
    welfare: [
      { text: "සුබසාධන ආධාර මොනවාද?", icon: "🏛️" },
      { text: "සමෘද්ධි සඳහා අයදුම් කරන්නේ කෙසේද?", icon: "📝" },
      { text: "ආබාධිත දීමනා සුදුසුකම්?", icon: "♿" }
    ],
    loan: [
      { text: "මට ක්ෂුද්‍ර ණයක් ලබාගන්නේ කෙසේද?", icon: "💰" },
      { text: "අවශ්‍ය ලියකියවිලි මොනවාද?", icon: "📄" },
      { text: "ණය පොලී අනුපාත?", icon: "📈" }
    ]
  }
};

function App() {
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [useRag, setUseRag] = useState(true);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [ttsLoadingIndex, setTtsLoadingIndex] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const chatEndRef = useRef(null);
  const audioRef = useRef(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);
    setTtsLoadingIndex(null);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    return () => stopAudio();
  }, []);

  const handleLanguageChange = (newLang) => {
    stopAudio();
    setLanguage(newLang);
  };

  const handleClearChat = () => {
    stopAudio();
    setMessages([]);
    setSelectedCategory(null);
  };

  const handleSpeak = async (text, index) => {
    if (speakingIndex === index || ttsLoadingIndex === index) {
      stopAudio();
      return;
    }
    stopAudio();
    try {
      setTtsLoadingIndex(index);
      const response = await axios.post("http://127.0.0.1:5000/tts", { text, language }, { responseType: "blob" });
      const audioBlob = new Blob([response.data], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setTtsLoadingIndex(null);
      setSpeakingIndex(index);
      audio.onended = () => { setSpeakingIndex(null); audioRef.current = null; URL.revokeObjectURL(audioUrl); };
      audio.onerror = () => { setSpeakingIndex(null); audioRef.current = null; URL.revokeObjectURL(audioUrl); };
      await audio.play();
    } catch (err) {
      console.warn("Backend TTS failed, trying browser Web Speech fallback:", err);
      setTtsLoadingIndex(null);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === "si-LK" ? "si-LK" : "en-US";
        utterance.rate = 0.95;
        utterance.onend = () => setSpeakingIndex(null);
        utterance.onerror = () => setSpeakingIndex(null);
        setSpeakingIndex(index);
        window.speechSynthesis.speak(utterance);
      } else {
        alert("Text-to-speech failed to load audio.");
      }
    }
  };

  const handleFeedback = (index, type) => {
    setMessages((prev) => prev.map((msg, i) => {
      if (i === index) {
        return { ...msg, feedback: msg.feedback === type ? null : type };
      }
      return msg;
    }));
    console.log(`[Telemetry] User rated message ${index} as ${type}`);
  };

  const sendMessage = async (customMessage = null) => {
    const finalMessage = customMessage || message;
    if (!finalMessage || !finalMessage.trim() || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { sender: "user", text: finalMessage.trim(), time: timeStr };

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
        ragUsed: response.data.rag_used,
        feedback: null
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        sender: "bot",
        text: language === "si-LK"
          ? "පද්ධතිය සමඟ සම්බන්ධ වීමේ දෝෂයක්. කරුණාකර පසුපස සේවාදායකය (Flask Backend) ක්‍රියාත්මක දැයි පරීක්ෂා කරන්න."
          : "Error connecting to the backend server. Please verify the Flask service is running on port 5000.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        feedback: null
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceRecognition = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      alert("Microphone permission denied. Please allow microphone access.");
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
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      sendMessage(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeTopics = quickTopics[language] || quickTopics["en-US"];

  const renderInputBar = () => (
    <>
      <div className="input-bar-container">
        <textarea
          placeholder={language === "si-LK" ? "ඔබගේ ප්‍රශ්නය අසන්න..." : "Ask your question..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows="1"
        />
        <button
          className={`mic-btn-inline ${listening ? "listening" : ""}`}
          onClick={startVoiceRecognition}
          title="Voice Input"
        >
          🎤
        </button>
        <button
          className="send-btn-inline"
          onClick={() => sendMessage()}
          disabled={loading || !message.trim()}
        >
          ➔
        </button>
      </div>
      <div className="input-bar-footer">
        <div className="input-helper-text">
          {language === "si-LK" 
            ? "යැවීමට Enter ඔබන්න · නව රේඛාවක් සඳහා Shift + Enter ඔබන්න"
            : "Press Enter to send · Shift + Enter for new line"}
        </div>
        <div className="input-bar-actions">
          <button className="new-chat-btn" onClick={handleClearChat}>
            + {language === "si-LK" ? "නව සංවාදයක්" : "New chat"}
          </button>
          <div className="lang-switcher">
            <span className="globe-icon">🌐</span>
            <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
              <option value="en-US">EN</option>
              <option value="si-LK">සිංහල</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="ai-chat-layout">
      {/* UNIQUE HEADER NAV */}
      <nav className="top-nav">
        <div className="nav-left">
          <img src={botLogo} alt="SmartGrama Logo" className="nav-logo" />
          <div className="nav-brand">
            <span className="brand-name">SmartGrama</span>
            <span className="brand-tag">AI ASSISTANT</span>
          </div>
        </div>
      </nav>

      <div className="main-content">
        {messages.length === 0 ? (
          /* HERO SCREEN */
          <div className="hero-screen">
            <div className="hero-content">
              <h1 className="hero-greeting">
                {language === "si-LK" ? "ආයුබෝවන්! 👋" : "Hi! 👋"}
              </h1>
              <h2 className="hero-headline">
                {language === "si-LK" ? (
                  <>මට ඔබට <span className="highlight">උපකාර කළ හැක්කේ කෙසේද?</span></>
                ) : (
                  <>How can I <span className="highlight">help you?</span></>
                )}
              </h2>
              <p className="hero-subtitle">
                {language === "si-LK" ? "සුබසාධන සේවා, සමෘද්ධි, සහ ක්ෂුද්‍ර ණය පිළිබඳ ඉක්මන් පිළිතුරු ලබා ගන්න." : "Ask about welfare schemes, micro-loans, and eligibility. Get quick answers anytime."}
              </p>

              <div className="hero-input-wrapper">
                {renderInputBar()}
              </div>

              <div className="divider-container">
                <div className="line"></div>
                <span className="divider-text">{language === "si-LK" ? "ඉක්මන් මාතෘකා" : "Quick topics"}</span>
                <div className="line"></div>
              </div>

              <div className="topics-layout">
                {!selectedCategory ? (
                  <div className="topics-row">
                    {categories[language].map(cat => (
                      <button key={cat.id} className="category-card" onClick={() => setSelectedCategory(cat.id)}>
                        <span className="category-icon">{cat.icon}</span>
                        <span className="category-text">{cat.text}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="subtopics-container">
                    <button className="back-btn" onClick={() => setSelectedCategory(null)}>
                      ← {language === "si-LK" ? "ආපසු" : "Back"}
                    </button>
                    <div className="topics-row">
                      {activeTopics[selectedCategory].map((topic, i) => (
                        <button key={i} className="topic-card-horizontal" onClick={() => sendMessage(topic.text)}>
                          <span className="topic-icon">{topic.icon}</span>
                          <span className="topic-text">{topic.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* CHAT SCREEN */
          <div className="chat-interface">
            <div className="chat-scroll-area">
              <div className="chat-messages-container">
                {messages.map((msg, index) => (
                  <div key={index} className={`message-row ${msg.sender === "user" ? "user-row" : "bot-row"}`}>
                    <div className={`message-bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"} ${msg.isError ? "error-bubble" : ""}`}>
                      <div className="message-content">{msg.text}</div>
                      <div className="message-footer">
                        <span className="timestamp">{msg.time}</span>
                        {msg.sender === "bot" && (
                          <div className="bot-controls">
                            <div className="feedback-controls">
                              <button className={`feedback-btn ${msg.feedback === 'up' ? 'active-up' : ''}`} onClick={() => handleFeedback(index, 'up')}>👍</button>
                              <button className={`feedback-btn ${msg.feedback === 'down' ? 'active-down' : ''}`} onClick={() => handleFeedback(index, 'down')}>👎</button>
                            </div>
                            <button
                              className={`speak-btn ${speakingIndex === index ? 'speaking' : ''}`}
                              onClick={() => handleSpeak(msg.text, index)}
                              disabled={ttsLoadingIndex === index}
                            >
                              {ttsLoadingIndex === index ? "⏳" : speakingIndex === index ? "⏹️" : "🔊"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="message-row bot-row">
                    <div className="message-bubble bot-bubble loading">
                      <div className="typing-dots"><span></span><span></span><span></span></div>
                    </div>
                  </div>
                )}
                {listening && (
                  <div className="listening-indicator">🎙️ {language === "si-LK" ? "සවන් දෙමින් පවතී..." : "Listening..."}</div>
                )}
                <div ref={chatEndRef}></div>
              </div>
            </div>

            <div className="chat-input-area">
              <div className="chat-input-wrapper">
                {renderInputBar()}
              </div>
              <div className="footer-note">Trusted information | Available 24/7</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;