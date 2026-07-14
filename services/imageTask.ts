import { GoogleGenAI } from "@google/genai";

export async function generateArchitectureDiagram() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: "A high-definition technical architecture diagram for 'CampusCare', an AI-powered grievance management system. The diagram should be professional, clean, and modern, suitable for a technical journal. It should show: 1. User Layer (Student, Mentor, Admin), 2. Application Layer (React, TypeScript, Tailwind), 3. AI Intelligence Layer (Google Gemini for classification and priority detection), and 4. Data Layer (Secure Storage). Use a blueprint style with professional icons and clear flow arrows. Dark theme with emerald and slate accents.",
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  return response;
}
