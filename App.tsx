import React, { useState, useEffect, useRef } from 'react';
import { Send, Activity, Zap, ShieldAlert, Settings, Terminal } from 'lucide-react';
import { Message, Role, OutlierStats, SarMode } from './types';
import { INITIAL_STATS } from './constants';
import { initializeChat, sendMessageToGemini, analyzeStats } from './services/gemini';
import ChatMessage from './components/ChatMessage';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<OutlierStats>(INITIAL_STATS);
  const [sarMode, setSarMode] = useState<SarMode>(SarMode.DEFAULT);
  const [showDashboard, setShowDashboard] = useState(false); // Mobile toggle
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      initializeChat();
      // Initial prompt to start the test
      handleSend("I am ready. Test me to see if I can become an outlier. Start the assessment.", true);
      hasInitialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string = input, hidden: boolean = false) => {
    if (!text.trim() && !hidden) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
    };

    if (!hidden) {
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
    }
    
    setIsLoading(true);

    try {
      // Append SAR instruction based on mode or user text
      let textToSend = text;
      if (!hidden) {
          if (text.toLowerCase().includes("sar 1")) {
              // User manually typed it, respect it
          } else if (text.toLowerCase().includes("sar")) {
              // User manually typed it
          } else {
              // Inject mode if not manually overridden
              if (sarMode === SarMode.SAR) textToSend += " (SAR)";
              if (sarMode === SarMode.SAR1) textToSend += " (SAR 1)";
          }
      }

      const responseText = await sendMessageToGemini(textToSend);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        text: responseText,
      };

      setMessages((prev) => [...prev, botMessage]);

      // Every 3 exchanges, update stats in background
      if (messages.length > 0 && messages.length % 6 === 0) {
          updateStats([...messages, userMessage, botMessage]);
      }

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
         id: Date.now().toString(),
         role: Role.MODEL,
         text: "Connection to OutlierOS interrupted. Check API Key."
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = async (currentHistory: Message[]) => {
      const historyText = currentHistory.map(m => `${m.role}: ${m.text}`).join('\n');
      const newStats = await analyzeStats(historyText);
      if (newStats) {
          setStats(newStats);
      }
  };

  const toggleSarMode = () => {
      if (sarMode === SarMode.DEFAULT) setSarMode(SarMode.SAR);
      else if (sarMode === SarMode.SAR) setSarMode(SarMode.SAR1);
      else setSarMode(SarMode.DEFAULT);
  };

  return (
    <div className="flex h-screen w-full bg-obsidian overflow-hidden font-sans text-gray-200">
      
      {/* Sidebar / Dashboard (Desktop) */}
      <div className={`fixed inset-y-0 left-0 z-20 w-80 bg-charcoal border-r border-gray-800 transform transition-transform duration-300 ease-in-out ${showDashboard ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:flex md:flex-col`}>
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white tracking-tighter flex items-center gap-2">
            <Zap className="text-neon fill-neon" size={20} />
            OUTLIER<span className="text-neon">OS</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-mono">SYSTEM ACTIVE // V3.0</p>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
           <Dashboard stats={stats} />
           
           <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <h3 className="text-xs font-mono text-gray-500 uppercase mb-2">Active Directive</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                 Break free from stagnation. Identify unfair advantages. Execute with speed.
              </p>
           </div>

           <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <h3 className="text-xs font-mono text-gray-500 uppercase mb-2">Mode Configuration</h3>
              <button 
                onClick={toggleSarMode}
                className="w-full flex items-center justify-between bg-black hover:bg-gray-900 border border-gray-700 text-xs py-2 px-3 rounded transition-colors"
              >
                  <span className="text-gray-400">Response Type</span>
                  <span className={`font-bold font-mono ${sarMode !== SarMode.DEFAULT ? 'text-neon' : 'text-white'}`}>
                      [{sarMode}]
                  </span>
              </button>
              <p className="text-[10px] text-gray-600 mt-2">
                  Click to cycle: Default &rarr; SAR (Short) &rarr; SAR 1 (One Line)
              </p>
           </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative bg-obsidian">
        
        {/* Mobile Header */}
        <div className="md:hidden h-14 border-b border-gray-800 flex items-center justify-between px-4 bg-charcoal/80 backdrop-blur-md absolute top-0 w-full z-10">
           <div className="flex items-center gap-2 font-bold text-white">
             <Zap className="text-neon" size={16} /> OUTLIEROS
           </div>
           <button onClick={() => setShowDashboard(!showDashboard)} className="p-2 text-gray-400">
             <Activity size={20} />
           </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8 scroll-smooth">
            <div className="max-w-3xl mx-auto">
                {messages.length === 0 && !isLoading && (
                   <div className="h-[60vh] flex flex-col items-center justify-center text-center opacity-50">
                      <Terminal size={48} className="text-gray-700 mb-4" />
                      <p className="text-gray-500 font-mono text-sm">INITIALIZING NEURAL LINK...</p>
                   </div>
                )}
                
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}

                {isLoading && (
                    <div className="flex justify-start w-full mb-6">
                        <div className="flex items-center gap-2 px-4 py-3 bg-charcoal rounded-2xl rounded-tl-none border border-gray-800">
                           <div className="w-2 h-2 bg-neon rounded-full animate-pulse"></div>
                           <div className="w-2 h-2 bg-neon rounded-full animate-pulse delay-75"></div>
                           <div className="w-2 h-2 bg-neon rounded-full animate-pulse delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-gradient-to-t from-obsidian via-obsidian to-transparent">
           <div className="max-w-3xl mx-auto relative">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative group"
              >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Answer the assessment..."
                    className="w-full bg-charcoal/80 backdrop-blur-sm text-white placeholder-gray-600 rounded-xl py-4 pl-5 pr-14 border border-gray-800 focus:border-neon/50 focus:ring-1 focus:ring-neon/50 outline-none transition-all shadow-lg shadow-black/50 font-sans"
                    disabled={isLoading}
                  />
                  <button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-white hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-600 text-black rounded-lg transition-all"
                  >
                    <Send size={18} />
                  </button>
              </form>
              <div className="text-center mt-2">
                 <span className="text-[10px] text-gray-600 font-mono">
                    {sarMode === SarMode.DEFAULT ? 'FULL CONTEXT MODE' : `FORCED MODE: ${sarMode}`}
                 </span>
              </div>
           </div>
        </div>

      </div>

      {/* Overlay for mobile dashboard */}
      {showDashboard && (
        <div 
          className="fixed inset-0 bg-black/80 z-10 md:hidden backdrop-blur-sm"
          onClick={() => setShowDashboard(false)}
        />
      )}
    </div>
  );
};

export default App;