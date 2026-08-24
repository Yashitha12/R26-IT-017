import { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import { sendChatMessage } from "../api/loanApi";

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "I'm here to help with loans, welfare, wallet, and applications. What would you like to know?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await sendChatMessage(text, "en");
      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: response.reply,
        time: response.timestamp
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: "Sorry, I am having trouble connecting to the knowledge base right now.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <Header />
      <div style={{ paddingLeft: '40px', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '20px', fontWeight: 'bold' }}>
        AI Assistant
      </div>

      <main className="content-container">
        
        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 320px', gap: '32px' }}>
          
          {/* Left Column: Chat Window */}
          <div className="card flex flex-col" style={{ padding: '0', height: 'calc(100vh - 140px)', overflow: 'hidden' }}>
            
            {/* Chat Header */}
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ background: 'var(--primary)', color: 'white', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-message"></i>
              </div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '2px' }}>SmartGrama AI Assistant</h2>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                  Online & ready to help
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', gap: '16px', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.sender === 'ai' && (
                    <div style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end' }}>
                      <i className="fa-solid fa-message" style={{ fontSize: '12px' }}></i>
                    </div>
                  )}
                  <div style={{ 
                    background: msg.sender === 'user' ? 'var(--primary)' : 'var(--background)', 
                    color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                    padding: '16px 20px', 
                    borderRadius: '16px', 
                    borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : '16px',
                    borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px',
                    maxWidth: '80%',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div style={{ display: 'flex', gap: '16px' }}>
                   <div style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end' }}>
                      <i className="fa-solid fa-message" style={{ fontSize: '12px' }}></i>
                    </div>
                  <div style={{ background: 'var(--background)', padding: '16px 20px', borderRadius: '16px', borderBottomLeftRadius: '4px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-secondary)', animation: 'bounce 1s infinite' }}></div>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-secondary)', animation: 'bounce 1s infinite 0.2s' }}></div>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-secondary)', animation: 'bounce 1s infinite 0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  style={{ flex: 1, padding: '16px 24px', borderRadius: '30px', border: '1px solid var(--border)', outline: 'none', fontSize: '14px', background: 'white' }}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                >
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </div>
            
          </div>

          {/* Right Column: Suggested & Topics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>Suggested Questions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'var(--background)', padding: '16px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', border: '1px solid var(--border)' }} onClick={() => handleSend("How do I apply for a microloan?")}>
                  How do I apply for a microloan?
                </div>
                <div style={{ background: 'var(--background)', padding: '16px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', border: '1px solid var(--border)' }} onClick={() => handleSend("What is the Samurdhi welfare program?")}>
                  What is the Samurdhi welfare program?
                </div>
                <div style={{ background: 'var(--background)', padding: '16px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', border: '1px solid var(--border)' }} onClick={() => handleSend("How can I check my loan status?")}>
                  How can I check my loan status?
                </div>
                <div style={{ background: 'var(--background)', padding: '16px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', border: '1px solid var(--border)' }} onClick={() => handleSend("What documents do I need for welfare?")}>
                  What documents do I need for welfare?
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '24px', background: 'var(--primary-light)', border: 'none' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>Topics I can help with</h3>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li>Microloan applications</li>
                <li>Welfare programs</li>
                <li>Wallet & payments</li>
                <li>Application status</li>
                <li>Document requirements</li>
              </ul>
            </div>

          </div>
          
        </div>
      </main>
    </>
  );
}
