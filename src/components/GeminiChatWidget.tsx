"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  User,
  ChevronDown,
  Briefcase,
  HelpCircle,
  FileText,
  Building2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function GeminiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Bonjour ! 👋 Je suis **JobFinder AI Assistant**, votre conseiller carrière officiel propulsé par **Google Gemini**.\n\nComment puis-je vous aider aujourd'hui ? (Recherche de stages au Maroc, révision de CV, opportunités d'emploi, infos entreprises...)",
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (res.status === 401) {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            role: "assistant",
            content:
              "🔒 **Accès réservé aux membres** : Pour discuter avec l'assistant IA et accéder aux opportunités, veuillez [Créer un compte](/auth/register) ou [Vous connecter](/auth/login). C'est 100% gratuit !",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const data = await res.json();
      const botReply: Message = {
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        content:
          data.reply ||
          "Je suis à votre disposition. Que souhaitez-vous savoir sur les opportunités au Maroc ?",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: "assistant",
          content:
            "Désolé, une petite erreur s'est produite lors de la connexion avec Gemini. N'hésitez pas à relancer votre question !",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    {
      label: "Stages IT Casablanca",
      query: "Quels sont les meilleurs stages en développement informatique à Casablanca ?",
      icon: Briefcase,
    },
    {
      label: "Conseils CV PFE",
      query: "Donne-moi 3 conseils clés pour un CV de stage PFE percutant au Maroc.",
      icon: FileText,
    },
    {
      label: "Entreprises Maroc",
      query: "Quelles sont les meilleures entreprises qui recrutent en ce moment au Maroc ?",
      icon: Building2,
    },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Expanded Chat Window in Moroccan Executive Tech Theme */}
      {isOpen && (
        <div className="mb-3.5 flex h-[540px] w-[370px] sm:w-[410px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-[#0B1528] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-white">JobFinder AI</h3>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] font-medium text-slate-300">
                  Conseiller Carrière Gemini
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="border-b border-slate-100 bg-[#F8FAFC] px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((p, i) => {
              const Icon = p.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSend(p.query)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-all shrink-0"
                >
                  <Icon className="h-3 w-3 text-blue-600" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8FAFC]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-700 mt-1">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "bg-blue-600 text-white font-medium rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-none font-normal"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  <div
                    className={`mt-1 text-[9px] ${
                      m.role === "user" ? "text-blue-100 text-right" : "text-slate-400"
                    }`}
                  >
                    {new Date(m.timestamp).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {m.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0B1528] text-white mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
                  <Sparkles className="h-4 w-4 text-blue-600 animate-spin" />
                </div>
                <div className="rounded-2xl rounded-bl-none border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span>Gemini réfléchit...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="border-t border-slate-200 bg-white p-3 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question (ex: stage dev à Casa)..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-300 bg-[#F8FAFC] px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B1528] hover:bg-blue-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-slate-700/50"
        title="Ouvrir l'assistant IA Gemini"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 text-[9px] font-black text-white items-center justify-center">
            AI
          </span>
        </span>
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </div>
  );
}
