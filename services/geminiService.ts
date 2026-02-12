
import { GoogleGenAI, Type } from "@google/genai";
import { ComplaintCategory, Priority } from "../types";
import { HIGH_PRIORITY_KEYWORDS } from "../constants";

// Corrected: Use process.env.API_KEY directly for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const classifyComplaint = async (title: string, description: string): Promise<{
  category: ComplaintCategory;
  priority: Priority;
  summary: string;
}> => {
  // Primary keyword detection for high priority
  const fullText = `${title} ${description}`.toLowerCase();
  let detectedPriority = Priority.MEDIUM;
  
  const hasHighPriorityWord = HIGH_PRIORITY_KEYWORDS.some(word => fullText.includes(word));
  if (hasHighPriorityWord) {
    detectedPriority = Priority.HIGH;
  }

  try {
    // Corrected: Use ai.models.generateContent with appropriate model and prompt
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Classify the following college complaint.
      Title: ${title}
      Description: ${description}
      
      Instructions: 
      - Categories: INFRASTRUCTURE, ACADEMICS, RAGGING, STAFF_RELATED.
      - Staff-related complaints should involve specific mentions of personnel.
      - Ragging involves bullying or harassment by seniors.
      - Infrastructure involves facilities.
      - Academics involves courses, teachers, or exams.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: ['INFRASTRUCTURE', 'ACADEMICS', 'RAGGING', 'STAFF_RELATED'],
              description: 'The classified category of the complaint.'
            },
            suggestedPriority: {
              type: Type.STRING,
              enum: ['LOW', 'MEDIUM', 'HIGH'],
              description: 'The AI detected priority level.'
            },
            summary: {
              type: Type.STRING,
              description: 'A 10-word summary of the issue.'
            }
          },
          required: ["category", "suggestedPriority", "summary"]
        }
      }
    });

    // Corrected: Access response.text directly (not as a function)
    const data = JSON.parse(response.text || '{}');
    
    // Override AI priority if keyword logic detected HIGH
    const finalPriority = detectedPriority === Priority.HIGH ? Priority.HIGH : (data.suggestedPriority as Priority);

    return {
      category: data.category as ComplaintCategory,
      priority: finalPriority,
      summary: data.summary || "No summary available."
    };
  } catch (error) {
    console.error("AI Classification failed, falling back to basic logic", error);
    // Fallback logic
    let cat = ComplaintCategory.ACADEMICS;
    if (fullText.includes('broken') || fullText.includes('fan') || fullText.includes('light')) cat = ComplaintCategory.INFRASTRUCTURE;
    if (fullText.includes('senior') || fullText.includes('ragging')) cat = ComplaintCategory.RAGGING;
    if (fullText.includes('professor') || fullText.includes('staff')) cat = ComplaintCategory.STAFF_RELATED;

    return {
      category: cat,
      priority: detectedPriority,
      summary: "Classification failed. Manual summary generated."
    };
  }
};
