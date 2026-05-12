import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
// Note: In production, use environment variable
// For now, use a placeholder - add your actual API key in .env
const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || 'AIzaSyCWYzUsmOcuqyXZVbox2OUQIyLtNW5m5Uk';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface GradingRequest {
    studentAnswerImageUrl?: string;
    studentAnswerImageUrls?: string[]; // Support for multiple pages
    modelAnswerText?: string;
    modelAnswerPdfUrl?: string;
    modelAnswerImageUrl?: string;
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
        if (!request.modelAnswerText && !request.modelAnswerPdfUrl && !request.modelAnswerImageUrl) {
            throw new Error('Either model answer text, PDF URL, or Image URL must be provided');
        }

        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            generationConfig: { responseMimeType: "application/json" }
        });

        // Prepare content parts for Gemini
        const contentParts: any[] = [];

        // Add student answer image(s)
        const imageUrls = request.studentAnswerImageUrls || (request.studentAnswerImageUrl ? [request.studentAnswerImageUrl] : []);
        
        if (imageUrls.length === 0) {
            throw new Error('At least one student answer image must be provided');
        }

        for (const url of imageUrls) {
            const imageResponse = await fetch(url);
            const imageBlob = await imageResponse.blob();
            const imageBase64 = await resizeImage(imageBlob, 1024);
            
            contentParts.push({
                inlineData: {
                    data: imageBase64.split(',')[1],
                    mimeType: imageBlob.type
                }
            });
        }

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
        
        // If Image model answer, fetch and add it
        if (request.modelAnswerImageUrl) {
            const imgResponse = await fetch(request.modelAnswerImageUrl);
            const imgBlob = await imgResponse.blob();
            const imgBase64 = await resizeImage(imgBlob, 1024);

            contentParts.push({
                inlineData: {
                    data: imgBase64.split(',')[1],
                    mimeType: imgBlob.type
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

    const modelAnswerSource = request.modelAnswerPdfUrl || request.modelAnswerImageUrl
        ? `The attached document/image contains the model answer.`
        : `**Model Answer (Text):**\n${request.modelAnswerText}`;

    return `You are an expert academic grader for "${request.examTitle}".

**CRITICAL TASK - IDENTIFY STUDENT:**
Before grading, you MUST first identify the student from the top of the exam paper.
1. **Student Name**: Look for "Name", "Student Name", "الاسم", "اسم الطالب". Extract the full name written next to it.
2. **Student ID**: Look for "ID", "Student ID", "Code", "الرقم الجامعي", "رقم القيد", "الكود". Extract the numeric/alphanumeric ID.
3. If the handwriting is messy, try your best to interpret it.

**Grading Task:**
1. Carefully read the handwritten student answer in the ATTACHED images (there may be multiple pages).
2. Compare it with the model answer ${request.modelAnswerPdfUrl || request.modelAnswerImageUrl ? 'in the attached document/image' : 'provided below'}
3. Grade the answer based on the rubric, considering all provided pages as a single exam submission.
4. Provide detailed analysis.

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
 * Resize image for faster upload and AI processing
 */
function resizeImage(file: Blob, maxWidth: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8)); // 80% quality jpeg
                } else {
                    resolve(e.target?.result as string); // fallback to original
                }
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
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
 * Extract student info from local file using Gemini vision
 */
export async function extractStudentInfo(file: File): Promise<{ studentId: string | null, studentName: string | null }> {
    try {
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            generationConfig: { responseMimeType: "application/json" }
        });

        // Resize image to max 1024px width for blazing fast processing
        const base64 = await resizeImage(file, 1024);

        const prompt = `Extract the student's Name and ID number from the top of this exam paper image.
The ID is typically at the top of the page and may be labeled as "Student ID", "ID", "الرقم الجامعي", "رقم الجلوس", "Code", etc.
The Name is labeled as "Name", "Student Name", "الاسم", "اسم الطالب", etc.
Respond ONLY in valid JSON format: {"studentName": "extracted name", "studentId": "extracted ID"}. If either is not found, use null.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64.split(',')[1],
                    mimeType: file.type
                }
            }
        ]);

        let text = (await result.response.text()).trim();
        if (text.startsWith('```json')) {
            text = text.replace(/```json\n?/, '').replace(/```\n?$/, '');
        } else if (text.startsWith('```')) {
            text = text.replace(/```\n?/, '').replace(/```\n?$/, '');
        }

        const parsed = JSON.parse(text);
        return {
            studentName: parsed.studentName || null,
            studentId: parsed.studentId || null
        };
    } catch (error) {
        console.error('Error extracting student info:', error);
        return { studentId: null, studentName: null };
    }
}
