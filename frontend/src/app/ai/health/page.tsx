"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { PetAISelector } from "@/components/ai/PetAISelector";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { aiService } from "@/services/aiService";
import { petService } from "@/services/petService";
import { Pet } from "@/types";
import { AIHealthMessage, AIConversation, UrgencyLevel } from "@/types/ai";
import {
  Send,
  Sparkles,
  AlertTriangle,
  HeartPulse,
  Clock,
  ShieldAlert,
  ArrowRight,
  Info,
  Plus,
  Trash2,
  Phone,
  CheckCircle2,
} from "lucide-react";

const createMessageId = (prefix: string) => `${prefix}-${Date.now()}`;
const getFormattedTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function AIHealthAssistantContent() {
  const searchParams = useSearchParams();
  const urlPetId = searchParams.get("petId");

  const { error: toastError } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<AIHealthMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadInitialData = useCallback(async () => {
    const petsData = await petService.getPets();
    setPets(petsData);

    const initial = urlPetId ? petsData.find((p) => p.id === urlPetId) : petsData[0];
    if (initial) setSelectedPet(initial);

    const convs = await aiService.getConversations(initial?.id);
    setConversations(convs);
  }, [urlPetId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSendMessage = useCallback(async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || !selectedPet || isSending) return;

    const userMsg: AIHealthMessage = {
      id: createMessageId("usr"),
      sender: "user",
      content: messageContent,
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsSending(true);

    try {
      const response = await aiService.sendHealthMessage(
        selectedPet.id,
        messageContent,
        activeConversationId,
        selectedPet
      );

      setMessages((prev) => [...prev, response.message]);
      setActiveConversationId(response.conversationId);

      // Refresh conversations list
      const updatedConvs = await aiService.getConversations(selectedPet.id);
      setConversations(updatedConvs);
    } catch {
      toastError("Failed to consult AI Assistant", "Please verify network connection and try again.");
    } finally {
      setIsSending(false);
    }
  }, [inputText, selectedPet, isSending, activeConversationId, toastError]);

  const handleNewConversation = () => {
    setMessages([]);
    setActiveConversationId(undefined);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await aiService.deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      handleNewConversation();
    }
  };

  const getUrgencyBadge = (urgency?: UrgencyLevel) => {
    switch (urgency) {
      case "EMERGENCY":
        return <Badge size="sm" variant="danger" className="animate-pulse">🚨 EMERGENCY</Badge>;
      case "URGENT":
        return <Badge size="sm" variant="warning">⚠️ URGENT</Badge>;
      case "MODERATE":
        return <Badge size="sm" variant="secondary">MODERATE</Badge>;
      default:
        return <Badge size="sm" variant="success">LOW RISK</Badge>;
    }
  };

  const quickPrompts = [
    `${selectedPet?.name || "My pet"} is vomiting and lethargic`,
    `${selectedPet?.name || "My dog"} has not eaten for 24 hours`,
    "What should I monitor after rabies vaccination?",
    "Why is my pet scratching their ears constantly?",
    "My pet ate some dark chocolate by accident",
  ];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row gap-6">
        {/* Left: Chat History Sidebar (Desktop) */}
        <div className="hidden lg:flex flex-col w-72 shrink-0 border border-[var(--border)] bg-[var(--card)] rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Consultation History
            </span>
            <Button variant="ghost" size="sm" onClick={handleNewConversation} className="gap-1 text-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 py-3">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex flex-col justify-between group ${
                  activeConversationId === conv.id
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)]"
                    : "border-transparent hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-[var(--foreground)] truncate">{conv.title}</span>
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-0.5"
                    aria-label="Delete consultation"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="truncate text-[10px] mt-1">{conv.lastMessage}</p>
                <span className="text-[9px] text-[var(--muted-foreground)] mt-1 block">{conv.updatedAt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Main Health Assistant Chat Area */}
        <div className="flex-1 flex flex-col border border-[var(--border)] bg-[var(--card)] rounded-3xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:px-6 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                    AI Health Assistant
                  </h2>
                  <Badge size="sm" variant="outline">Educational Triage</Badge>
                </div>
                {selectedPet && (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Assisting with <strong>{selectedPet.name}</strong> ({selectedPet.species} • {selectedPet.breed})
                  </p>
                )}
              </div>
            </div>

            {pets.length > 0 && selectedPet && (
              <div className="w-full sm:w-auto">
                <select
                  value={selectedPet.id}
                  onChange={(e) => {
                    const found = pets.find((p) => p.id === e.target.value);
                    if (found) {
                      setSelectedPet(found);
                      setMessages([]);
                    }
                  }}
                  className="w-full sm:w-auto h-9 rounded-xl border border-[var(--input)] bg-[var(--card)] px-3 text-xs font-semibold text-[var(--foreground)]"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              /* Empty Conversation State with Quick Suggestions */
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-[var(--primary)]/20 to-[var(--secondary)]/20 text-[var(--primary)] flex items-center justify-center">
                  <HeartPulse className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--foreground)]">
                    How can I help with {selectedPet?.name || "your pet"} today?
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                    Describe symptoms, behavior changes, or care questions. I will organize concerns and advise when clinical attention is needed.
                  </p>
                </div>

                <div className="w-full space-y-2 text-left">
                  <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">
                    Suggested Questions
                  </span>
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt)}
                      className="w-full text-left p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)]/50 hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 text-xs text-[var(--foreground)] transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <span>{prompt}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[var(--primary)] transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <div className="max-w-md p-3.5 rounded-2xl bg-[var(--primary)] text-white text-xs leading-relaxed shadow-xs">
                      {msg.content}
                    </div>
                  ) : (
                    /* Rich Structured AI Response Card */
                    <div className="w-full max-w-2xl space-y-3">
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xs space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                            <span className="font-bold text-[var(--foreground)]">
                              Clinical Triage Guidance
                            </span>
                          </div>
                          {getUrgencyBadge(msg.structuredResponse?.urgency)}
                        </div>

                        {/* Summary */}
                        {msg.structuredResponse?.summary && (
                          <div className="p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                            <p className="font-semibold text-[var(--foreground)] leading-relaxed">
                              {msg.structuredResponse.summary}
                            </p>
                          </div>
                        )}

                        {/* Emergency Flow Banner if Emergency urgency */}
                        {msg.structuredResponse?.urgency === "EMERGENCY" && (
                          <div className="p-4 rounded-2xl bg-red-500/10 border-2 border-red-500/30 text-red-600 dark:text-red-400 space-y-2 animate-pulse">
                            <div className="flex items-center gap-2 font-bold text-sm">
                              <ShieldAlert className="w-5 h-5" />
                              <span>Emergency Veterinary Care Recommended</span>
                            </div>
                            <p className="text-xs leading-relaxed">
                              Do not continue casual chat. Critical symptoms were identified. Please contact an emergency clinic or transport your pet right away.
                            </p>
                            <div className="pt-2 flex flex-wrap gap-2">
                              <Link href="/emergency">
                                <Button variant="danger" size="sm" className="gap-1.5 shadow-sm">
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>Find Nearest Emergency Vet</span>
                                </Button>
                              </Link>
                              {selectedPet && (
                                <Link href={`/pets/${selectedPet.id}/health-passport`}>
                                  <Button variant="outline" size="sm">
                                    View Emergency Health Card
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Possible Concerns */}
                        {msg.structuredResponse?.possibleConcerns && (
                          <div>
                            <span className="font-bold text-[var(--foreground)] block mb-1">
                              Potential Concerns:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-[var(--muted-foreground)]">
                              {msg.structuredResponse.possibleConcerns.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Recommended Actions */}
                        {msg.structuredResponse?.recommendedActions && (
                          <div>
                            <span className="font-bold text-[var(--foreground)] block mb-1">
                              What you can do right now:
                            </span>
                            <ul className="space-y-1 text-[var(--foreground)]">
                              {msg.structuredResponse.recommendedActions.map((act, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)] mt-0.5 shrink-0" />
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Warning signs */}
                        {msg.structuredResponse?.warningSigns && (
                          <div className="p-3 rounded-xl bg-[var(--warning)]/10 border border-[var(--warning)]/20 text-xs">
                            <span className="font-bold text-[var(--warning)] block mb-1 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Red-Flag Symptoms To Watch:
                            </span>
                            <p className="text-[var(--muted-foreground)]">
                              {msg.structuredResponse.warningSigns.join(" • ")}
                            </p>
                          </div>
                        )}

                        <div className="pt-2 border-t border-[var(--border)] text-[10px] text-[var(--muted-foreground)] italic">
                          {msg.structuredResponse?.vetCareRecommendation}
                        </div>
                      </div>
                    </div>
                  )}
                  <span className="text-[9px] text-[var(--muted-foreground)] mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))
            )}

            {isSending && (
              <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                <Sparkles className="w-4 h-4 text-[var(--accent)] animate-spin" />
                <span>AnimalSetu AI is analyzing pet vitals and symptoms...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-[var(--border)] bg-[var(--card)] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={`Ask anything about ${selectedPet?.name || "your pet"}'s health, diet, or symptoms...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSending}
                className="flex-1 h-11 px-4 rounded-2xl border border-[var(--input)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!inputText.trim() || isSending}
                className="rounded-2xl gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
            <p className="text-[10px] text-center text-[var(--muted-foreground)] mt-2">
              AI guidance is educational and does not replace emergency clinical veterinary diagnosis.
            </p>
          </div>
        </div>
      </div>
  );
}

export default function AIHealthAssistantPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--muted-foreground)]">Loading AI Health Assistant...</div>}>
        <AIHealthAssistantContent />
      </Suspense>
    </AppLayout>
  );
}
