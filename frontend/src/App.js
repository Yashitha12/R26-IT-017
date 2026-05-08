import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Language selector
  const [language, setLanguage] = useState("en-US");

  // -------------------------
  // Send Message
  // -------------------------
  const sendMessage = async (customMessage = null) => {

    const finalMessage = customMessage || message;

    if (!finalMessage.trim()) return;

    const userMessage = {
      sender: "user",
      text: finalMessage
    };

    setMessages((prev) => [...prev, userMessage]);

    setMessage("");

    setLoading(true);

    try {

      const response = await axios.post(
        "http://127.0.0.1:5000/chat",
        {
          message: finalMessage
        }
      );

      const botMessage = {
        sender: "bot",
        text: response.data.reply
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {

      console.error(error);

      const errorMessage = {
        sender: "bot",
        text: "Error connecting to backend."
      };

      setMessages((prev) => [...prev, errorMessage]);

    } finally {

      setLoading(false);

    }
  };

  // -------------------------
  // Speech Recognition
  // -------------------------
  const startVoiceRecognition = () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      alert("Speech Recognition is not supported in this browser.");

      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = language;

    recognition.start();

    recognition.onresult = (event) => {

      const transcript =
        event.results[0][0].transcript;

      setMessage(transcript);

      sendMessage(transcript);
    };

    recognition.onerror = () => {

      alert("Microphone error.");
    };
  };

  return (

    <div className="app-container">

      <div className="chat-container">

        <h1>🌿 SmartGrama Assistant</h1>

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

          {loading && (
            <div className="message bot">
              Thinking...
            </div>
          )}

        </div>

        <div className="bottom-panel">

          <textarea
            placeholder="Ask about loans, welfare services, Samurdhi, eligibility, wallet balance..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="controls-row">

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="language-dropdown"
            >
              <option value="en-US">
                English
              </option>

              <option value="si-LK">
                සිංහල
              </option>
            </select>

            <button
              className="mic-btn"
              onClick={startVoiceRecognition}
            >
              🎤
            </button>

            <button
              className="send-btn"
              onClick={() => sendMessage()}
            >
              Send
            </button>

          </div>

          <div className="example-box">

            <p>Example Questions:</p>

            <ul>
              <li>
                How do I apply for a loan?
              </li>

              <li>
                What is welfare eligibility?
              </li>

              <li>
                How can I check my wallet?
              </li>

              <li>
                Why was my loan amount reduced?
              </li>
            </ul>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;