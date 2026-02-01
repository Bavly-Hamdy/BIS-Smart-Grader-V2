import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
// Note: In production, use environment variable
// For now, use a placeholder - add your actual API key in .env
const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || 'AIzaSyCWYzUsmOcuqyXZVbox2OUQIyLtNW5m5Uk';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface GradingRequest {
    studentAnswerImageUrl: string;
    modelAnswerText?: string;
    modelAnswerPdfUrl?: string;
    maxScore: number;
    gradingRubric?: string;
    examTitle: string;
}

export interface GradingResponse {
    grade: number;
    confidence: number;
    analysis: string;
    matchedPoints: string[];
    missedPoints: string[];
    detectedStudentName?: string;
    detectedStudentId?: string;
}

// ... (gradeSubmission function remains mostly same, just checking lines)

/**
 * Grade a student submission using Gemini Vision API
 */
export async function gradeSubmission(request: GradingRequest): Promise<GradingResponse> {
    try {
        if (!request.modelAnswerText && !request.modelAnswerPdfUrl) {
            throw new Error('Either model answer text or PDF URL must be provided');
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Fetch the student answer image as base64
        const imageResponse = await fetch(request.studentAnswerImageUrl);
        const imageBlob = await imageResponse.blob();
        const imageBase64 = await blobToBase64(imageBlob);

        // Prepare content parts for Gemini
        const contentParts: any[] = [];

        // Add student answer image
        contentParts.push({
            inlineData: {
                data: imageBase64.split(',')[1], // Remove data:image/... prefix
                mimeType: imageBlob.type
            }
        });

        // If PDF model answer, fetch and add it
        if (request.modelAnswerPdfUrl) {
            const pdfResponse = await fetch(request.modelAnswerPdfUrl);
            const pdfBlob = await pdfResponse.blob();
            const pdfBase64 = await blobToBase64(pdfBlob);

            contentParts.push({
                inlineData: {
                    data: pdfBase64.split(',')[1],
                    mimeType: 'application/pdf'
                }
            });
        }

        // Construct the prompt
        const prompt = buildGradingPromptWithPdf(request);

        // Add prompt as first element
        contentParts.unshift(prompt);

        // Call Gemini API with vision
        const result = await model.generateContent(contentParts);

        const response = await result.response;
        const text = response.text();

        // Parse JSON response from Gemini
        const gradingResult = parseGeminiResponse(text, request.maxScore);

        return gradingResult;
    } catch (error) {
        console.error('Error grading submission:', error);
        throw new Error('فشل في تصحيح الورقة. يرجى المحاولة مرة أخرى.');
    }
}

/**
 * Build the grading prompt for Gemini
 */
function buildGradingPrompt(request: GradingRequest): string {
    const rubric = request.gradingRubric || 'Grade based on accuracy, completeness, and clarity.';

    return `You are an expert academic grader for "${request.examTitle}".

**CRITICAL TASK - IDENTIFY STUDENT:**
Before grading, you MUST first identify the student from the top of the exam paper.
1. **Student Name**: Look for "Name", "Student Name", "الاسم", "اسم الطالب". Extract the full name written next to it.
2. **Student ID**: Look for "ID", "Student ID", "Code", "الرقم الجامعي", "رقم القيد", "الكود". Extract the numeric/alphanumeric ID.
3. If the handwriting is messy, try your best to interpret it.

**Grading Task:**
1. Carefully read the handwritten student answer in the attached image
2. Compare it with the model answer below
3. Grade the answer based on the rubric
4. Provide detailed analysis

**Model Answer:**
${request.modelAnswerText}

**Grading Rubric:**
${rubric}

**Maximum Score:** ${request.maxScore}

**Instructions:**
- Read the student's handwriting carefully (it may be in Arabic or English)
- Award partial credit for partially correct answers
- Be fair and consistent
- Identify specific points the student got right and wrong
- If you find the Name or ID, include them in the response. If absolutely not found, return null.

**Response Format (JSON only):**
{
  "studentName": "<extracted name or null>",
  "studentId": "<extracted ID or null>",
  "grade": <number between 0 and ${request.maxScore}>,
  "confidence": <number between 0 and 100 indicating your confidence>,
  "analysis": "<detailed explanation of grading decision>",
  "matchedPoints": ["<point 1 student got correct>", "<point 2>", ...],
  "missedPoints": ["<point 1 student missed>", "<point 2>", ...]
}

Respond ONLY with valid JSON, no additional text.`;
}

/**
 * Build the grading prompt for Gemini (supports both text and PDF)
 */
function buildGradingPromptWithPdf(request: GradingRequest): string {
    const rubric = request.gradingRubric || 'Grade based on accuracy, completeness, and clarity.';

    const modelAnswerSource = request.modelAnswerPdfUrl
        ? `The attached PDF document contains the model answer.`
        : `**Model Answer (Text):**\n${request.modelAnswerText}`;

    return `You are an expert academic grader for "${request.examTitle}".

**CRITICAL TASK - IDENTIFY STUDENT:**
Before grading, you MUST first identify the student from the top of the exam paper.
1. **Student Name**: Look for "Name", "Student Name", "الاسم", "اسم الطالب". Extract the full name written next to it.
2. **Student ID**: Look for "ID", "Student ID", "Code", "الرقم الجامعي", "رقم القيد", "الكود". Extract the numeric/alphanumeric ID.
3. If the handwriting is messy, try your best to interpret it.

**Grading Task:**
1. Carefully read the handwritten student answer in the FIRST image
2. Compare it with the model answer ${request.modelAnswerPdfUrl ? 'in the PDF document' : 'provided below'}
3. Grade the answer based on the rubric
4. Provide detailed analysis

${modelAnswerSource}

**Grading Rubric:**
${rubric}

**Maximum Score:** ${request.maxScore}

**Instructions:**
- Read the student's handwriting carefully (it may be in Arabic or English)
- Award partial credit for partially correct answers
- Be fair and consistent
- Identify specific points the student got right and wrong
- If you find the Name or ID, include them in the response. If absolutely not found, return null.

**Response Format (JSON only):**
{
  "studentName": "<extracted name or null>",
  "studentId": "<extracted ID or null>",
  "grade": <number between 0 and ${request.maxScore}>,
  "confidence": <number between 0 and 100 indicating your confidence>,
  "analysis": "<detailed explanation of grading decision>",
  "matchedPoints": ["<point 1 student got correct>", "<point 2>", ...],
  "missedPoints": ["<point 1 student missed>", "<point 2>", ...]
}

Respond ONLY with valid JSON, no additional text.`;
}

/**
 * Parse Gemini's response into structured format
 */
function parseGeminiResponse(text: string, maxScore: number): GradingResponse {
    try {
        // Remove markdown code blocks if present
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/```json\n?/, '').replace(/```\n?$/, '');
        } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/```\n?/, '').replace(/```\n?$/, '');
        }

        const parsed = JSON.parse(cleanText);

        // Validate and constrain values
        const grade = Math.max(0, Math.min(maxScore, parsed.grade || 0));
        const confidence = Math.max(0, Math.min(100, parsed.confidence || 0));

        return {
            grade,
            confidence,
            analysis: parsed.analysis || 'No analysis provided',
            matchedPoints: Array.isArray(parsed.matchedPoints) ? parsed.matchedPoints : [],
            missedPoints: Array.isArray(parsed.missedPoints) ? parsed.missedPoints : [],
            detectedStudentName: parsed.studentName || undefined,
            detectedStudentId: parsed.studentId || undefined
        };
    } catch (error) {
        console.error('Error parsing Gemini response:', error);
        console.error('Raw response:', text);

        // Fallback response
        return {
            grade: 0,
            confidence: 0,
            analysis: 'Failed to parse AI response. Manual grading required.',
            matchedPoints: [],
            missedPoints: []
        };
    }
}

/**
 * Convert blob to base64
 */
function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Batch grade multiple submissions
 */
export async function batchGradeSubmissions(
    requests: GradingRequest[],
    onProgress?: (current: number, total: number) => void
): Promise<GradingResponse[]> {
    const results: GradingResponse[] = [];

    for (let i = 0; i < requests.length; i++) {
        const result = await gradeSubmission(requests[i]);
        results.push(result);

        if (onProgress) {
            onProgress(i + 1, requests.length);
        }

        // Add delay to avoid rate limiting (adjust as needed)
        if (i < requests.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return results;
}

/**
 * Extract student ID from image using OCR (placeholder)
 * In production, use a proper OCR service or Gemini vision
 */
export async function extractStudentId(imageUrl: string): Promise<string | null> {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();
        const imageBase64 = await blobToBase64(imageBlob);

        const prompt = `Extract the student ID number from this exam paper image. 
The ID is typically at the top of the page and may be labeled as "Student ID", "ID", "الرقم الجامعي", etc.
Return ONLY the ID number, nothing else. If no ID is found, return "NOT_FOUND".`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64.split(',')[1],
                    mimeType: imageBlob.type
                }
            }
        ]);

        const text = (await result.response.text()).trim();
        return text === 'NOT_FOUND' ? null : text;
    } catch (error) {
        console.error('Error extracting student ID:', error);
        return null;
    }
}
