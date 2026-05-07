import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {

  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const sendMessage = async () => {

    if (!message) return;

    try {

      const response = await axios.post(
        "http://127.0.0.1:5000/chat",
        {
          message: message
        }
      );

      setReply(response.data.reply);

    } catch (error) {

      console.log(error);

      setReply("Error connecting to backend.");
    }
  };

  return (
    <div className="container">

      <h1>NLP Chatbot</h1>

      <textarea
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>
        Send
      </button>

      <div className="reply-box">
        {reply}
      </div>

    </div>
  );
}

export default App;