import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client with secure environment variables
const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface GradingResult {
  studentName: string;
  seatNumber: string;
  finalScore: number;
  confidenceScore: number;
  analyticalFeedback: {
    correctPoints: string[];
    missedPoints: string[];
  };
}

/**
 * Helper to convert browser-level image Blob to base64 string
 * Enforces Capacitor and browser compatibility without relying on Node-specific Buffer API
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Automated grading and metadata extraction service using Gemini 2.5 Flash
 * Enforces structured JSON schemas to match departmental assessment grading rubrics
 *
 * @param studentSheetUrl Cloudinary CDN secure URL pointing to the scanned paper image
 * @param modelAnswerText Master answer key model text provided by the instructor
 * @param totalMarks Maximum possible exam marks
 */
export const executeAutoGrading = async (
  studentSheetUrl: string,
  modelAnswerText: string,
  totalMarks: number
): Promise<GradingResult | null> => {
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key is not configured in environment variables.');
    }

    // 1. Fetch image content as binary blob
    const imageResponse = await fetch(studentSheetUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch student answer sheet from URL: ${imageResponse.statusText}`);
    }
    const imageBlob = await imageResponse.blob();
    const base64Data = await blobToBase64(imageBlob);

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: imageBlob.type,
      },
    };

    // 2. Prepare user prompt parameters
    const userPrompt = `
      Please grade this student sheet based on the following criteria:
      - Model Answer Blueprint: "${modelAnswerText}"
      - Maximum Total Marks: ${totalMarks}
    `;

    const systemInstruction = `
      You are an expert academic evaluator and precise Data Extraction Engine for the Business Information Systems (BIS) university department.
      Your task is to analyze the uploaded image of a student's exam answer sheet, compare it against the provided strict "Model Answer", extract student metadata, and calculate the final grade.

      # Strict Processing Pipeline

      ## 1. Metadata Extraction (OCR Layer)
      - Locate and extract the Student's Full Name (usually in Arabic or English at the top).
      - Locate and extract the Student's Seat Number (رقم الجلوس) accurately.
      - If any metadata field is physically unreadable or missing, set its JSON value to "Unknown" (Do not hallucinate names).

      ## 2. Comparative Grading Logic
      - Evaluate each student answer against the "Model Answer" step-by-step.
      - Award marks proportionally based on correctness, partial answers, and academic keywords.
      - Be objective: if an answer is completely wrong, award 0 for that specific point.
      - Calculate the total sum of awarded marks. Ensure "finalScore" NEVER exceeds the provided Maximum Total Marks (${totalMarks}).

      ## 3. Confidence Score Calculation
      - Calculate a "confidenceScore" between 0.0 and 1.0 representing your certainty regarding the handwriting readability and OCR extraction precision.

      # Output Format Specifications (Mandatory JSON)
      You MUST return a single, valid JSON object matching the schema below.
      Do not include markdown wrappers (e.g., do not wrap the JSON in \`\`\`json ... \`\`\` code blocks).
      Strictly follow this JSON interface structure:
      {
        "studentName": string,
        "seatNumber": string,
        "finalScore": number,
        "confidenceScore": number,
        "analyticalFeedback": {
          "correctPoints": string[],
          "missedPoints": string[]
        }
      }
    `;

    // 3. Configure the generative model
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
      systemInstruction: systemInstruction,
    });

    // 4. Generate content from AI
    const result = await model.generateContent([imagePart, userPrompt]);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new Error('Gemini returned an empty payload');
    }

    // 5. Parse response safely
    let cleanText = responseText.trim();
    // Support parsing clean fallback even if formatting boundaries are somehow violated
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/, '').replace(/```\n?$/, '');
    }

    const rawResult = JSON.parse(cleanText);

    // Validate parameters boundary checking
    const finalScore = Math.max(0, Math.min(totalMarks, typeof rawResult.finalScore === 'number' ? rawResult.finalScore : 0));
    const confidenceScore = Math.max(0, Math.min(1.0, typeof rawResult.confidenceScore === 'number' ? rawResult.confidenceScore : 0));

    const finalResult: GradingResult = {
      studentName: typeof rawResult.studentName === 'string' ? rawResult.studentName : 'Unknown',
      seatNumber: typeof rawResult.seatNumber === 'string' ? rawResult.seatNumber : 'Unknown',
      finalScore: finalScore,
      confidenceScore: confidenceScore,
      analyticalFeedback: {
        correctPoints: Array.isArray(rawResult.analyticalFeedback?.correctPoints) ? rawResult.analyticalFeedback.correctPoints : [],
        missedPoints: Array.isArray(rawResult.analyticalFeedback?.missedPoints) ? rawResult.analyticalFeedback.missedPoints : [],
      },
    };

    return finalResult;
  } catch (error) {
    console.error('Critical error in Gemini Automation Service:', error);
    return null;
  }
};
