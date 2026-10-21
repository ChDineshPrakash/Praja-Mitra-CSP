/**
 * Gemini Vision OCR Fallback — Name, DOB, Gender only
 *
 * When Tesseract confidence is low, use Gemini Vision for high-accuracy
 * text extraction. Returns only the 3 fields needed for eligibility.
 */

import type { OCRResult } from './aadhaarOcr';

/**
 * Extract name, dob, gender from a document image using Gemini Vision.
 */
export async function extractWithGemini(
  imageSource: File | string,
): Promise<OCRResult | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (window as any).__GEMINI_API_KEY__;
  if (!apiKey) {
    console.log('[GeminiOCR] No API key, skipping');
    return null;
  }

  try {
    let base64Image: string;
    let mimeType: string;

    if (imageSource instanceof File) {
      mimeType = imageSource.type || 'image/jpeg';
      base64Image = await fileToBase64(imageSource);
    } else {
      base64Image = imageSource;
      mimeType = 'image/jpeg';
    }

    const prompt = `You are an OCR engine for Indian identity documents. Extract ONLY these fields from the document image.

Return ONLY valid JSON, no markdown, no explanation:
{
  "name": "Full name exactly as printed on the document",
  "dob": "Date of birth in DD/MM/YYYY format, or YYYY if only year visible",
  "gender": "Male, Female, or Other"
}

Rules:
- If a field is not visible, use empty string ""
- Do NOT guess or infer information not in the image
- Use exact spelling as printed
- Return ONLY the JSON object`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64Image.split(',')[1] || base64Image } },
            ],
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 256 },
        }),
      },
    );

    if (!response.ok) return null;
    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) return null;

    // Parse JSON response
    let jsonStr = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];
    const parsed = JSON.parse(jsonStr);

    const name = (parsed.name || '').trim();
    const dob = (parsed.dob || '').trim();
    const gender = (parsed.gender || '').trim();

    return {
      name,
      dob,
      gender,
      confidence: {
        name: name ? 0.95 : 0,
        dob: dob ? 0.95 : 0,
        gender: gender ? 0.95 : 0,
      },
    };
  } catch (err) {
    console.error('[GeminiOCR] Failed:', err);
    return null;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
