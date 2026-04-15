import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

// Initialize the Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
const isApiKeyValid = apiKey && apiKey !== "undefined" && apiKey !== "";
const ai = new GoogleGenAI({ apiKey: isApiKeyValid ? apiKey : "dummy-key" });

/**
 * breakdownTask: Uses Gemini to architect a path for a given goal.
 * It returns a structured JSON array of steps with text and duration.
 */
export async function breakdownTask(task: string) {
  if (!isApiKeyValid) {
    console.warn("GEMINI_API_KEY is missing or invalid. Using fallback plan.");
    return getDefaultPlan();
  }

  // Create a timeout promise to prevent hanging indefinitely
  const timeoutPromise = new Promise<null>((_, reject) => 
    setTimeout(() => reject(new Error("Gemini API request timed out")), 15000)
  );

  try {
    const apiCall = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Goal: "${task}". Break into 3-5 short, actionable steps. Assign a priority (high, medium, low) to each.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "Max 8 words" },
              duration: { type: Type.NUMBER, description: "Minutes (default 25)" },
              priority: { type: Type.STRING, enum: ["high", "medium", "low"] }
            },
            required: ["text", "duration", "priority"]
          }
        }
      }
    });

    // Race the API call against the timeout
    const response = await Promise.race([apiCall, timeoutPromise]);
    
    if (!response || !response.text) {
      throw new Error("Invalid response from Gemini API");
    }

    return JSON.parse(response.text.trim()) as { text: string; duration: number; priority: 'high' | 'medium' | 'low' }[];
  } catch (error) {
    console.error("Error breaking down task:", error);
    return getDefaultPlan();
  }
}

function getDefaultPlan(): { text: string; duration: number; priority: 'high' | 'medium' | 'low' }[] {
  return [
    { text: "Break the goal into smaller pieces", duration: 15, priority: 'high' },
    { text: "Focus on the most important first step", duration: 25, priority: 'high' },
    { text: "Take a short break to recharge", duration: 5, priority: 'medium' },
    { text: "Review progress and adjust plan", duration: 10, priority: 'low' }
  ];
}

export async function getReflection(notes: string) {
  const timeoutPromise = new Promise<null>((_, reject) => 
    setTimeout(() => reject(new Error("Gemini API request timed out")), 10000)
  );

  try {
    const apiCall = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        User just finished a focus session. Notes: "${notes}".
        Provide a 2-line max encouraging insight. 
        Focus on momentum and psychology.
      `,
    });
    
    const response = await Promise.race([apiCall, timeoutPromise]);
    return response?.text?.trim() || "Solid work. You're building a powerful habit.";
  } catch (error) {
    console.error("Error getting reflection:", error);
    return "Solid work. You're building a powerful habit.";
  }
}

/**
 * focusedSearch: Uses Gemini with Google Search to find information
 * strictly related to the current task.
 */
export async function focusedSearch(query: string, context: string) {
  const timeoutPromise = new Promise<null>((_, reject) => 
    setTimeout(() => reject(new Error("Gemini API request timed out")), 60000)
  );

  if (!isApiKeyValid) {
    return "Search is unavailable because the API key is missing. Please check your settings.";
  }

  try {
    const apiCall = (ai.models as any).generateContent({
      model: "gemini-1.5-flash",
      contents: `
        Task Context: ${context}
        Search Query: ${query}
        
        Please provide focused information strictly related to the task context.
      `,
      tools: [{ googleSearch: {} }],
      config: {
        systemInstruction: "You are a Focus Search Engine. Provide concise, actionable knowledge directly relevant to the user's current task. If the query is unrelated, explain that you are staying focused on the goal. Use Google Search to find accurate information.",
      },
    });
    
    const response = await Promise.race([apiCall, timeoutPromise]);
    
    if (!response) {
      throw new Error("No response from Gemini API");
    }

    return response.text || "I couldn't find any specific information for that query. Try rephrasing or focusing on your current task.";
  } catch (error) {
    console.error("Error in focused search:", error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("timed out")) {
      return "The search took too long. Please try again with a simpler query.";
    }
    return "I encountered an error while searching. This might be due to a connection issue or an invalid query. Please try again.";
  }
}
