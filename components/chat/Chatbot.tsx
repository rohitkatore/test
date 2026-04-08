// components/chat/Chatbot.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type Intent = "accommodation" | "food" | "both";
type Step = "role" | "service" | "location" | "results" | "owner";

type BotButton = {
  label: string;
  action: string;
  color?: "blue" | "green" | "purple" | "gray" | "red";
};

type ChatMessage = {
  sender: "user" | "bot";
  text: string;
  buttons?: BotButton[];
};

// ─── Button colour map ────────────────────────────────────────────────────────

const BTN: Record<string, string> = {
  blue:   "bg-blue-600 hover:bg-blue-700 text-white",
  green:  "bg-green-600 hover:bg-green-700 text-white",
  purple: "bg-purple-600 hover:bg-purple-700 text-white",
  red:    "bg-red-500 hover:bg-red-600 text-white",
  gray:   "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300",
};

// ─── Initial greeting message ─────────────────────────────────────────────────

const greeting = (): ChatMessage => ({
  sender: "bot",
  text: "👋 Hi! I am EduBot, your student accommodation assistant.\n\nI help you find PGs, hostels, flats, and food services near your university or city.\n\nWho are you?",
  buttons: [
    { label: "🎓  I am a Student",        action: "role:student", color: "blue"  },
    { label: "🏠  I am a Property Owner", action: "role:owner",   color: "green" },
  ],
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function Chatbot() {
  const router = useRouter();

  const [isOpen,    setIsOpen]    = useState(false);
  const [messages,  setMessages]  = useState<ChatMessage[]>([greeting()]);
  const [input,     setInput]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step,      setStep]      = useState<Step>("role");
  const [intent,    setIntent]    = useState<Intent>("both");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // ── Helper: append messages without mutating previous ones ─────────────────

  const pushMessages = (msgs: ChatMessage[]) =>
    setMessages((prev) => [...prev, ...msgs]);

  // ── Central action dispatcher (called by button clicks) ────────────────────

  const handleAction = (action: string) => {
    if (action.startsWith("nav:")) {
      setIsOpen(false);
      router.push(action.slice(4));
      return;
    }

    switch (action) {
      // ── Role selection ──────────────────────────────────────────────────────
      case "role:student":
        pushMessages([
          { sender: "user", text: "🎓  I am a Student" },
          {
            sender: "bot",
            text: "Great! What are you looking for?",
            buttons: [
              { label: "🏠  Accommodation\n(PG / Hostel / Flat)", action: "service:accommodation", color: "blue"   },
              { label: "🍱  Food Services\n(Mess / Tiffin / Cafe)", action: "service:food",          color: "purple" },
              { label: "🔍  Both",                                  action: "service:both",          color: "gray"   },
            ],
          },
        ]);
        setStep("service");
        break;

      case "role:owner":
        pushMessages([
          { sender: "user", text: "🏠  I am a Property Owner" },
          {
            sender: "bot",
            text: "Welcome, Property Owner! 👋\n\nList your PG, hostel, flat, or food service on EduStay and connect with thousands of students.",
            buttons: [
              { label: "📋  List My Property",  action: "nav:/owner/add-listing", color: "green" },
              { label: "📊  Owner Dashboard",   action: "nav:/owner/dashboard",   color: "blue"  },
              { label: "🔑  Login",             action: "nav:/auth/login",        color: "gray"  },
            ],
          },
        ]);
        setStep("owner");
        break;

      // ── Service type selection ──────────────────────────────────────────────
      case "service:accommodation":
        setIntent("accommodation");
        pushMessages([
          { sender: "user", text: "🏠  Accommodation (PG / Hostel / Flat)" },
          {
            sender: "bot",
            text: "🏠 Looking for accommodation!\n\nType the city, area, or university you are near and I will find matching listings for you.\n\n📌 You can search by:\n  • University — IIT Bombay, AIIMS Delhi, NIT Trichy\n  • City       — Mumbai, Delhi, Chandigarh, Chennai\n  • Area       — Powai, Karol Bagh, Anna Nagar",
          },
        ]);
        setStep("location");
        break;

      case "service:food":
        setIntent("food");
        pushMessages([
          { sender: "user", text: "🍱  Food Services" },
          {
            sender: "bot",
            text: "🍱 Looking for food services!\n\nType the city, area, or university you are near and I will search for mess, tiffin, cafe, and canteen options.\n\n📌 Try: Mumbai, Delhi, Chandigarh, IIT Bombay, Manipal",
          },
        ]);
        setStep("location");
        break;

      case "service:both":
        setIntent("both");
        pushMessages([
          { sender: "user", text: "🔍  Both — Accommodation & Food" },
          {
            sender: "bot",
            text: "🔍 Searching for both accommodation and food!\n\nType the city, area, or university you are near.\n\n📌 Try: Mumbai, Delhi, Chandigarh, IIT Bombay, NIT Trichy",
          },
        ]);
        setStep("location");
        break;

      // ── Post-results actions ────────────────────────────────────────────────
      case "search_again":
        pushMessages([
          { sender: "user", text: "🔍  Search another location" },
          { sender: "bot",  text: "Sure! Enter the city, area or university name to search again." },
        ]);
        setStep("location");
        break;

      case "start_over":
        setMessages([greeting()]);
        setStep("role");
        setIntent("both");
        break;

      default:
        break;
    }
  };

  // ── Location search → calls /api/chatbot ────────────────────────────────────

  const searchLocation = async (location: string, currentIntent: Intent) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: location, intent: currentIntent }),
      });

      const data = await res.json();
      const found = (data.count ?? 0) > 0;

      const afterButtons: BotButton[] = [
        { label: "🔍  Search Another Location",  action: "search_again",              color: "blue"  },
        ...(found && (currentIntent === "accommodation" || currentIntent === "both")
          ? [{ label: "📋  All Accommodation", action: "nav:/student/accommodation", color: "gray" as const }]
          : []),
        ...(found && (currentIntent === "food" || currentIntent === "both")
          ? [{ label: "🍱  All Food Services",  action: "nav:/student/food",          color: "gray" as const }]
          : []),
        { label: "🔄  Start Over", action: "start_over", color: "gray" },
      ];

      pushMessages([
        {
          sender: "bot",
          text: data.reply ?? "⚠️ Unexpected error. Please try again.",
          buttons: afterButtons,
        },
      ]);
      setStep("results");
    } catch {
      pushMessages([
        {
          sender: "bot",
          text: "⚠️ Network error. Please check your connection and try again.",
          buttons: [
            { label: "🔍  Try Again",  action: "search_again", color: "blue" },
            { label: "🔄  Start Over", action: "start_over",   color: "gray" },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Text input send ─────────────────────────────────────────────────────────

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");

    // Typing "hi / hello / start / restart" always resets the flow
    if (/^(hi|hello|hey|start|restart|reset)$/i.test(text)) {
      setMessages([greeting()]);
      setStep("role");
      setIntent("both");
      return;
    }

    // If waiting for location input, perform DB search
    if (step === "location" || step === "results") {
      pushMessages([{ sender: "user", text }]);
      await searchLocation(text, intent);
      return;
    }

    // Natural language shortcuts — detect role from free text
    if (step === "role") {
      pushMessages([{ sender: "user", text }]);
      if (/student|study|accommodation|pg|hostel|food|mess|tiffin/i.test(text)) {
        handleAction("role:student");
      } else if (/owner|property|list|landlord|rent out/i.test(text)) {
        handleAction("role:owner");
      } else {
        pushMessages([{
          sender: "bot",
          text: "Please select your role using the buttons above, or type 'hi' to restart.",
        }]);
      }
      return;
    }

    // Natural language shortcuts — detect service type from free text
    if (step === "service") {
      pushMessages([{ sender: "user", text }]);
      if (/food|mess|canteen|tiffin|eat|restaurant|cafe/i.test(text)) {
        handleAction("service:food");
      } else if (/accommodation|pg|hostel|flat|room|stay|rent/i.test(text)) {
        handleAction("service:accommodation");
      } else if (/both/i.test(text)) {
        handleAction("service:both");
      } else {
        pushMessages([{
          sender: "bot",
          text: "Please choose what you are looking for using the buttons above.",
        }]);
      }
      return;
    }

    // Owner step — free text
    if (step === "owner") {
      pushMessages([
        { sender: "user", text },
        {
          sender: "bot",
          text: "Use the buttons above to navigate to the listing or dashboard pages.",
          buttons: [
            { label: "📋  List My Property", action: "nav:/owner/add-listing", color: "green" },
            { label: "🔄  Start Over",       action: "start_over",             color: "gray"  },
          ],
        },
      ]);
      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const showInput = step === "location" || step === "results";

  return (
    <div className="relative">
      {/* Floating chat bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-colors"
          aria-label="Open EduBot chat"
          title="EduBot — Find accommodation & food"
        >
          💬
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="w-96 h-[540px] rounded-2xl shadow-2xl bg-white flex flex-col overflow-hidden border border-gray-200">

          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-base">🤖</div>
              <div>
                <div className="font-semibold text-sm leading-tight">EduBot</div>
                <div className="text-xs opacity-75 leading-tight">Student Accommodation Assistant</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-500 transition-colors text-white"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 min-h-0">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                {/* Bubble */}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                  }`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {msg.text}
                </div>

                {/* Action buttons */}
                {msg.buttons && msg.buttons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.buttons.map((btn, bi) => (
                      <button
                        key={bi}
                        onClick={() => handleAction(btn.action)}
                        disabled={isLoading}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors leading-tight ${BTN[btn.color ?? "gray"]} disabled:opacity-50`}
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-white border border-gray-100 shadow-sm px-3 py-2 rounded-2xl rounded-bl-none text-sm text-gray-400 italic">
                  EduBot is searching...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t bg-white flex-shrink-0">
            {showInput ? (
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 bg-gray-50"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter city, area or university..."
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-blue-600 text-white px-4 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "..." : "Search"}
                </button>
              </div>
            ) : (
              <p className="text-center text-xs text-gray-400 py-1">
                Use the buttons above  •  or type <span className="font-medium text-blue-500">hi</span> to restart
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
