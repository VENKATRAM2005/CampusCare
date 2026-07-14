import { GoogleGenAI } from "@google/genai";

async function generateDiagram() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: "A professional, high-definition technical architecture diagram for an AI-powered grievance management system called 'CampusCare'. The diagram features a clean, modern aesthetic with a professional slate and emerald palette. It shows four main layers: 1. User Access Layer (Student, Mentor, Admin portals), 2. Application Layer (React.js, TypeScript), 3. AI Intelligence Layer (Google Gemini 3 Flash for classification and priority detection), and 4. Data Layer (Secure Storage). Use clear technical icons, connecting arrows showing bidirectional data flow, and professional sans-serif typography. The style is 'Enterprise Blueprint'—minimalist and precise.",
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  const part = response.candidates[0].content.parts.find(p => p.inlineData);
  if (part) {
    console.log("IMAGE_DATA:" + part.inlineData.data);
  }
}

generateDiagram();
