
import { GoogleGenAI, Type } from "@google/genai";
import { ComplaintCategory, Priority, ModerationMetadata, TeachingReview } from "../types";
import { HIGH_PRIORITY_KEYWORDS } from "../constants";

let aiClient: GoogleGenAI | null = null;

const getApiKey = () => {
  const viteKey =
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    typeof import.meta.env.VITE_GEMINI_API_KEY === 'string'
      ? import.meta.env.VITE_GEMINI_API_KEY
      : '';

  const legacyKey =
    typeof process !== 'undefined' &&
    process.env &&
    typeof process.env.GEMINI_API_KEY === 'string'
      ? process.env.GEMINI_API_KEY
      : '';

  return viteKey || legacyKey;
};

const getAiClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Missing Gemini API key');
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }

  return aiClient;
};

export const classifyComplaint = async (title: string, description: string, imageBase64?: string): Promise<{
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
    const ai = getAiClient();
    const parts: any[] = [
      { text: `Classify the following college complaint.
      Title: ${title}
      Description: ${description}
      
      Instructions: 
      - Categories: INFRASTRUCTURE, ACADEMICS, RAGGING, MENTOR_RELATED.
      - Mentor-related complaints should involve specific mentions of personnel.
      - Ragging involves bullying or harassment by seniors.
      - Infrastructure involves facilities.
      - Academics involves courses, teachers, or exams.
      - If an image is provided, use it to assess the severity (Priority) and verify the category.` }
    ];

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.split(',')[1] || imageBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: ['INFRASTRUCTURE', 'ACADEMICS', 'RAGGING', 'MENTOR_RELATED'],
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
    if (fullText.includes('professor') || fullText.includes('mentor') || fullText.includes('teacher')) cat = ComplaintCategory.MENTOR_RELATED;

    return {
      category: cat,
      priority: detectedPriority,
      summary: "Classification failed. Manual summary generated."
    };
  }
};

export const moderateFeedback = async (text: string, ratings: number[]): Promise<ModerationMetadata> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following student feedback and ratings for toxicity, sentiment, profanity, and bias.
      Feedback: "${text}"
      Ratings: ${JSON.stringify(ratings)}
      
      Instructions:
      - Detect if there is an extreme rating pattern (e.g., all 1s or all 5s) that seems biased.
      - Provide a weight adjustment factor (0.0 to 1.0) where 1.0 is full weight and lower values indicate suspected bias or low quality.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentimentScore: { type: Type.NUMBER, description: 'Score from -1 (negative) to 1 (positive)' },
            toxicityScore: { type: Type.NUMBER, description: 'Score from 0 (clean) to 1 (toxic)' },
            isFlagged: { type: Type.BOOLEAN, description: 'True if high toxicity or profanity detected' },
            confidenceScore: { type: Type.NUMBER, description: 'AI confidence in this analysis' },
            biasDetected: { type: Type.BOOLEAN, description: 'True if extreme uniform ratings detected' },
            weightAdjustmentFactor: { type: Type.NUMBER, description: '0.0 to 1.0 based on quality and bias' },
            moderationNotes: { type: Type.STRING }
          },
          required: ["sentimentScore", "toxicityScore", "isFlagged", "confidenceScore", "biasDetected", "weightAdjustmentFactor"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Moderation failed", error);
    return { 
      sentimentScore: 0, 
      toxicityScore: 0, 
      isFlagged: false, 
      confidenceScore: 0, 
      biasDetected: false, 
      weightAdjustmentFactor: 1.0,
      moderationNotes: "Moderation failed." 
    };
  }
};

export const generateMentorSummary = async (reviews: TeachingReview[]): Promise<{ strengths: string; improvements: string }> => {
  try {
    const ai = getAiClient();
    const feedbackData = JSON.stringify(reviews.map(r => ({
      feedback: r.writtenFeedback,
      scores: r.ratings,
      overall: r.overallScore,
      moderation: r.moderation
    })));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a Senior Talent Intelligence Engineer.
      Task: Analyze the following student feedback data for a faculty mentor and provide a high-impact performance summary.
      
      Data: ${feedbackData}
      
      Instructions:
      - Identify "Strength Clusters": Group positive feedback into high-impact themes (e.g., "Pedagogical Clarity", "Empathetic Mentoring").
      - Identify "Growth Opportunities": Use data storytelling to explain weak signals (e.g., "Low engagement scores combined with feedback on pace suggest a need for interactive methodology").
      - Be concise, analytical, and professional.
      - Use cause -> effect reasoning.
      
      Output Format:
      {
        "strengths": "A concise, insight-driven paragraph on strengths.",
        "improvements": "A concise, actionable paragraph on growth areas."
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: { type: Type.STRING },
            improvements: { type: Type.STRING }
          },
          required: ["strengths", "improvements"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { strengths: "Unable to generate analytical strengths.", improvements: "Unable to generate strategic improvements." };
  }
};

export const generateInstitutionalReport = async (reviews: TeachingReview[], department?: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const data = JSON.stringify(reviews.map(r => ({
      mentor: r.mentorName,
      dept: r.subjectCode.substring(0, 2), // Rough dept detection
      score: r.overallScore,
      feedback: r.writtenFeedback,
      moderation: r.moderation,
      timestamp: r.timestamp
    })));

    const reportTitle = department ? `${department} Departmental Performance Intelligence Report` : "Institutional Performance Intelligence Report";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a Senior Data Analyst and Product Intelligence Engineer at a FAANG-level company.
      Task: Transform the following ${department ? `${department} departmental` : 'institutional'} teaching performance data into a high-impact, executive-grade analytical report.
      
      Data: ${data}
      
      Objectives:
      - Upgrade the report to FAANG-level quality.
      - Enhance clarity, depth, and decision-making value.
      - Integrate data analytics, metrics, and actionable insights.
      
      FORMATTING GUIDELINES (STRICT):
      - Use clean Markdown with proper headers (H1, H2, H3).
      - Use Markdown Tables for key metrics and dashboards.
      - Use bold text for emphasis on critical findings.
      - Use horizontal rules (---) to separate major sections.
      - Ensure consistent alignment and spacing.
      - Use bullet points for lists.
      - The tone should be professional, formal, and concise.
      
      REPORT STRUCTURE:
      1. # ${reportTitle}
      2. ## Executive Snapshot
         Max 5 powerful insights (e.g., "Hierarchical Efficiency", "Operational Integrity").
      3. ## Key Metrics Dashboard
         Use a Markdown table to display global KPIs (WAS, Polarity, Confidence, etc.).
      4. ## ${department ? 'Departmental' : 'Inter-Departmental'} Performance Analytics
         Benchmarking analysis.
      5. ## Faculty Performance Intelligence
         Strength clusters and weak signals.
      6. ## Sentiment & Feedback Analytics
         Qualitative themes and sentiment distribution.
      7. ## Risk & Anomaly Detection
         Outlier detection and performance risks.
      8. ## Data Reliability & Confidence Analysis
         Confidence score interpretation and sample size risk.
      9. ## Strategic Insights
         Cause -> Effect reasoning.
      10. ## Actionable Recommendations
          Clear, prioritized steps.
      11. ## Future Data Strategy
          Predictive suggestions.
      
      ANALYTICAL DEPTH:
      - Convert raw values into percentages, ratios, and inferred trends.
      - Identify strength clusters, weak signals, and hidden risks.
      - Use insight-driven statements.`,
    });

    return response.text || "Report generation failed.";
  } catch (error) {
    return "AI Report generation failed due to an error.";
  }
};
