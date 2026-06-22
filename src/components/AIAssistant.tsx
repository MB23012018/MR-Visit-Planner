import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Mic, Play, Smile } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'g-1',
      sender: 'assistant',
      text: 'Good morning Arjun! I am **Vistra AI**, your intelligent territory planner. I have mapped CST South Mumbai traffic baselines and doctor schedules.\n\nYour active mission is ready; you have **4 visits planned today** starting with Dr. Sarah Adams at 09:30 AM. Tap any quick query below or type your questions to analyze your planning gaps.'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: `m-user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await response.json();
      const assistantMsg: Message = {
        id: `m-assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Sorry, I am having trouble compiling target data metrics right now. Please try again.',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `m-error-${Date.now()}`,
          sender: 'assistant',
          text: 'I cannot connect to the Vistra scheduling service. Please confirm the server is running on port 3000.',
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'What should I do today?',
    'Which Super Core doctors are at risk?',
    'Show missed visits needing recovery.',
    'Can I still achieve monthly goals?'
  ];

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[75vh] shadow-2xl overflow-hidden text-white">
      {/* HEADER */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-white text-base sm:text-lg uppercase tracking-tight">Vistra AI Territory Companion</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1 font-semibold uppercase tracking-wider">RAG context-aware assistant • Connected</p>
          </div>
        </div>
      </div>

      {/* MESSAGES VIEW */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/20 scrollbar-thin">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm shadow-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-blue-600 text-white font-semibold border border-blue-500/25'
                    : 'bg-slate-900 text-slate-200 border border-slate-850'
                }`}
              >
                {!isUser && (
                  <span className="text-[9px] uppercase font-black tracking-widest font-mono text-blue-400 block mb-1.5 animate-pulse">
                    Vistra Planner
                  </span>
                )}
                {/* Simple formatter for bold text markup */}
                {m.text.split('**').map((chunk, index) => {
                  if (index % 2 === 1) {
                    return <strong key={index} className="text-white font-black">{chunk}</strong>;
                  }
                  return chunk;
                })}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl p-4 bg-slate-900 text-slate-400 border border-slate-850 text-xs sm:text-sm flex items-center gap-2.5 font-mono font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>Analyzing targets and GPS logs...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* QUICK PROMPT PILLS */}
      <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/45 flex gap-2 overflow-x-auto scrollbar-none py-3">
        {quickPrompts.map((p) => (
          <button
            key={p}
            onClick={() => handleSendMessage(p)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-805 rounded-full text-[11px] font-semibold text-slate-350 hover:bg-slate-850 hover:text-white hover:border-slate-705 transition cursor-pointer text-nowrap"
          >
            {p}
          </button>
        ))}
      </div>

      {/* CHAT INPUT AREA */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 flex gap-2.5">
        <input
          type="text"
          placeholder="Ask plans, weather risk, recovery schedules..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage(inputMessage);
          }}
          id="assistant-chat-input"
          className="flex-1 px-4 py-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-semibold"
        />

        {/* MOCK VOICE SPEECH INPUT ACTION - ALERT FREE */}
        <button
          onClick={() => {
            setInputMessage('What remains pending?');
          }}
          className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-white rounded-xl transition cursor-pointer"
          title="Pre-fill voice command"
        >
          <Mic className="w-4.5 h-4.5 text-blue-400" />
        </button>

        <button
          onClick={() => handleSendMessage(inputMessage)}
          id="btn-send-chat"
          className="p-3 bg-blue-600 text-white hover:bg-blue-500 rounded-xl transition cursor-pointer shadow-lg shadow-blue-500/15"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
