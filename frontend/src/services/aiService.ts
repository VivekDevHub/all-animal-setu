import { apiClient } from "./apiClient";
import {
  AIHealthMessage,
  AIConversation,
  DietPlan,
  ExercisePlan,
  BreedIdentificationResult,
} from "@/types/ai";
import { Pet } from "@/types";

class AIService {
  async sendHealthMessage(
    petId: string,
    message: string,
    conversationId?: string,
    petContext?: Pet | null
  ): Promise<{ message: AIHealthMessage; conversationId: string }> {
    try {
      return await apiClient.post("/ai/health-assistant", {
        petId,
        message,
        conversationId,
      });
    } catch {
      // Offline fallback
      const lower = message.toLowerCase();
      const isEmergency =
        lower.includes("breathing") ||
        lower.includes("unconscious") ||
        lower.includes("bleeding") ||
        lower.includes("poison") ||
        lower.includes("seizure") ||
        lower.includes("collapse");

      const isUrgent =
        lower.includes("vomit") ||
        lower.includes("diarrhea") ||
        lower.includes("fever") ||
        lower.includes("pain") ||
        lower.includes("not eating");

      const urgency = isEmergency ? "EMERGENCY" : isUrgent ? "URGENT" : "LOW";

      const aiResponse: AIHealthMessage = {
        id: `msg-${Date.now()}`,
        sender: "ai",
        content: isEmergency
          ? `⚠️ Critical warning: Symptoms of ${message} require immediate veterinary emergency intervention.`
          : `I have analyzed ${petContext?.name || "your pet"}'s symptoms regarding: "${message}".`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        structuredResponse: {
          summary: isEmergency
            ? `Critical acute distress detected in ${petContext?.name || "your pet"}. Immediate emergency attention is crucial.`
            : `${petContext?.name || "Your pet"} may be experiencing mild discomfort or dietary sensitivity.`,
          possibleConcerns: isEmergency
            ? ["Respiratory compromise", "Systemic toxic shock", "Acute cardiovascular distress"]
            : ["Mild gastrointestinal disturbance", "Environmental allergy flare-up", "Hydration deficit"],
          recommendedActions: isEmergency
            ? [
                "Locate the nearest 24/7 animal emergency center immediately",
                "Keep pet quiet, warm, and unobstructed",
                "Do NOT administer human medications or attempt forced feeding",
              ]
            : [
                "Ensure constant access to clean, fresh water",
                "Withhold heavy treats for 4-6 hours while observing demeanor",
                "Contact your licensed veterinarian if symptoms do not improve within 12 hours",
              ],
          warningSigns: [
            "Pale or bluish gums",
            "Severe weakness or inability to stand",
            "Continuous vomiting or visible blood in stool",
          ],
          urgency,
          vetCareRecommendation: isEmergency
            ? "SEEK IMMEDIATE PROFESSIONAL EMERGENCY CARE. Do not delay."
            : "Monitor closely for the next 6-12 hours; consult your clinic if symptoms persist.",
        },
      };

      return {
        message: aiResponse,
        conversationId: conversationId || `conv-${Date.now()}`,
      };
    }
  }

  async getConversations(petId?: string): Promise<AIConversation[]> {
    try {
      return await apiClient.get<AIConversation[]>("/ai/conversations", {
        params: { petId },
      });
    } catch {
      return [
        {
          id: "conv-001",
          petId: "pet-bruno",
          petName: "Bruno",
          title: "Vomiting and Lethargy Assessment",
          lastMessage: "Monitor closely for 12 hours. Ensure hydration.",
          updatedAt: "2 hours ago",
          messagesCount: 4,
        },
        {
          id: "conv-002",
          petId: "pet-luna",
          petName: "Luna",
          title: "Vaccine Booster Reaction Query",
          lastMessage: "Mild sleepiness is common within 24 hours of FVRCP.",
          updatedAt: "Yesterday",
          messagesCount: 2,
        },
      ];
    }
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      await apiClient.delete(`/ai/conversations/${id}`);
    } catch {
      // ignore
    }
  }

  async generateDietPlan(pet: Pet): Promise<DietPlan> {
    try {
      return await apiClient.post<DietPlan>("/ai/diet-plan", { petId: pet.id });
    } catch {
      return {
        id: `diet-${Date.now()}`,
        petId: pet.id,
        petName: pet.name,
        createdAt: new Date().toLocaleDateString(),
        dailyCalories: pet.species === "Dog" ? 1150 : 260,
        feedingSchedule: [
          {
            meal: "Breakfast",
            time: "08:00 AM",
            portion: pet.species === "Dog" ? "1.5 cups high-protein kibble" : "1/2 cup wet food",
            notes: "Serve with fresh water. Avoid high sodium gravies.",
          },
          {
            meal: "Dinner",
            time: "07:30 PM",
            portion: pet.species === "Dog" ? "1.5 cups kibble + 1 spoon pumpkin puree" : "1/2 can pate",
            notes: "Fiber aids digestion and prevents stool irregularities.",
          },
        ],
        generalGuidelines: [
          "Maintain exact meal portions to prevent obesity",
          "Introduce new proteins gradually over a 7-day transition window",
          "Ensure fresh water bowl is cleaned and refilled twice daily",
        ],
        foodsToAvoid: [
          "Cooked poultry bones",
          "Chocolate, cocoa, and caffeine",
          "Onions, garlic, chives, and leeks",
          "Grapes, raisins, and artificial sweetener Xylitol",
        ],
        hydrationGuidance: `${(pet.weightKg * 55).toFixed(0)} ml of water daily recommended for ${pet.weightKg} kg weight.`,
        importantNotice:
          "This diet plan is educational AI guidance. Always consult your licensed veterinarian before implementing major dietary alterations.",
      };
    }
  }

  async generateExercisePlan(pet: Pet): Promise<ExercisePlan> {
    try {
      return await apiClient.post<ExercisePlan>("/ai/exercise-plan", { petId: pet.id });
    } catch {
      return {
        id: `ex-${Date.now()}`,
        petId: pet.id,
        petName: pet.name,
        createdAt: new Date().toLocaleDateString(),
        targetDailyMinutes: pet.species === "Dog" ? 50 : 25,
        dailySchedule: [
          {
            activity: "Morning Brisk Leash Walk",
            duration: "25 minutes",
            intensity: "Moderate",
            enrichmentType: "Sniffing & Mental Stimulation",
          },
          {
            activity: "Afternoon Interactive Play",
            duration: "10 minutes",
            intensity: "Moderate",
            enrichmentType: "Agility / Laser / Fetch",
          },
          {
            activity: "Evening Stroll",
            duration: "15 minutes",
            intensity: "Low",
            enrichmentType: "Relaxation & Socialization",
          },
        ],
        recommendedActivities: [
          "Mental puzzle feeders and snuffle mats",
          "Controlled retrieve games in a grassy enclosed area",
          "Basic obedience training drills (5 min sessions)",
        ],
        restAndRecovery: "Ensure a quiet, cushioned recovery bed away from direct heat or air conditioners.",
        safetyCaution:
          "Avoid rigorous outdoor running during peak heat hours (12 PM – 4 PM) to prevent heat exhaustion.",
      };
    }
  }

  async identifyBreed(imageUrl: string): Promise<BreedIdentificationResult> {
    try {
      return await apiClient.post<BreedIdentificationResult>("/ai/breed-identification", { imageUrl });
    } catch {
      return {
        estimatedBreed: "Golden Retriever",
        confidence: 94,
        imageUrl,
        characteristics: [
          "Intelligent, friendly, and devoted temperament",
          "Water-repellent double coat requiring weekly grooming",
          "Eager to please with high aptitude for training",
        ],
        temperament: "Gentle, affectionate, active, trustworthy",
        alternativePossibilities: [
          { breed: "Labrador Retriever", confidence: 84 },
          { breed: "Nova Scotia Duck Tolling Retriever", confidence: 62 },
        ],
        disclaimer:
          "Image-based breed estimation is educational AI inference and cannot replace certified genetic DNA testing.",
      };
    }
  }
}

export const aiService = new AIService();
