import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {

  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  // -----------------------------------
  // Send Message to Backend
  // -----------------------------------
  const sendMessage = async (customMessage = null) => {

    const finalMessage = customMessage || message;

    if (!finalMessage) return;

    try {

      const response = await axios.post(
        "http://127.0.0.1:5000/chat",
        {
          message: finalMessage
        }
      );

      setReply(response.data.reply);

    } catch (error) {

      console.log(error);

      setReply("Error connecting to backend.");
    }
  };

  // -----------------------------------
  // Browser Speech Recognition
  // -----------------------------------
  const startVoiceRecognition = () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      alert("Speech Recognition is not supported in this browser.");

      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.start();

    recognition.onstart = () => {

      setReply("Listening...");
    };

    recognition.onresult = (event) => {

      const transcript = event.results[0][0].transcript;

      setMessage(transcript);

      sendMessage(transcript);
    };

    recognition.onerror = (event) => {

      console.log(event.error);

      setReply("Microphone error.");
    };
  };

  return (

    <div className="container">

      <h1>NLP Chatbot</h1>

      <textarea
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <div className="button-group">

        <button onClick={() => sendMessage()}>
          Send
        </button>

        <button onClick={startVoiceRecognition}>
          🎤 Speak
        </button>

      </div>

      <div className="reply-box">

        {reply}

      </div>

    </div>
  );
}

export default App;