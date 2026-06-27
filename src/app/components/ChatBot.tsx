import { useState } from 'react';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';

type Message = { id: number; text: string; sender: 'user' | 'bot' };

export default function ChatBot({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm your SmartGrama AI assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const getBotResponse = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes('loan')) return "You can apply for a loan from the Home tab. Our AI will evaluate your eligibility.";
    if (lower.includes('welfare')) return "Welfare programs like Samurdhi are available. Apply from the Home tab.";
    if (lower.includes('wallet')) return "Your wallet shows balance, loans, and welfare payments. Check the Wallet tab.";
    return "I'm here to help with loans, welfare, wallet, and applications. What would you like to know?";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const messageText = input;
    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const botMsg: Message = { id: Date.now() + 1, text: getBotResponse(messageText), sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-gray-700" /></button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">AI Assistant</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-xs text-green-600 font-medium">Online</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0"><Bot className="w-5 h-5 text-white" /></div>}
            <div className={`max-w-[75%] px-5 py-3 rounded-2xl text-sm shadow-md ${msg.sender === 'user' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none border border-gray-200'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 border-2 border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm transition-all"
          />
          <button onClick={handleSend} className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-4 rounded-xl shadow-lg shadow-purple-500/30 active:scale-95 transition-all">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}