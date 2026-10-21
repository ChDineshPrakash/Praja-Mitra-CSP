/**
 * OCR Utility — Name, DOB, Gender only
 *
 * Image preprocessing + multi-pass Tesseract + Gemini Vision fallback.
 * Focused on the 3 fields needed for scheme eligibility.
 */

import { createWorker } from 'tesseract.js';
import { extractWithGemini } from './geminiOcr';

// ── Types ───────────────────────────────────────────────────────────────────

export interface OCRResult {
  name: string;
  dob: string;
  gender: string;
  confidence: { name: number; dob: number; gender: number };
}

export function calculateAge(dob: string): string {
  try {
    let birthDate: Date;
    if (/^\d{4}$/.test(dob)) {
      birthDate = new Date(parseInt(dob), 0, 1);
    } else if (/\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(dob)) {
      const parts = dob.split(/[\/\-]/);
      birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else { return ''; }
    const today = new Date();
    if (birthDate > today) return '';
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 0 || age > 120) return '';
    return String(age);
  } catch { return ''; }
}

// ── Image Preprocessing ─────────────────────────────────────────────────────

function preprocessImage(
  source: HTMLImageElement | string,
  options: { binarize?: boolean; contrast?: number } = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) { reject(new Error('Canvas not supported')); return; }

    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = src;
      });

    const process = (img: HTMLImageElement) => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const contrast = options.contrast ?? 1.5;
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      for (let i = 0; i < data.length; i += 4) {
        let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        gray = Math.max(0, Math.min(255, factor * (gray - 128) + 128));
        data[i] = data[i + 1] = data[i + 2] = gray;
      }
      if (options.binarize !== false) {
        const histogram = new Array(256).fill(0);
        for (let i = 0; i < data.length; i += 4) histogram[Math.round(data[i])]++;
        let sum = 0;
        for (let i = 0; i < 256; i++) sum += i * histogram[i];
        let sumB = 0, wB = 0, wF = 0, maxVar = 0, threshold = 0;
        const total = data.length / 4;
        for (let i = 0; i < 256; i++) {
          wB += histogram[i]; if (wB === 0) continue;
          wF = total - wB; if (wF === 0) break;
          sumB += i * histogram[i];
          const mB = sumB / wB, mF = (sum - sumB) / wF;
          const variance = wB * wF * (mB - mF) * (mB - mF);
          if (variance > maxVar) { maxVar = variance; threshold = i; }
        }
        for (let i = 0; i < data.length; i += 4) {
          const val = data[i] < threshold ? 0 : 255;
          data[i] = data[i + 1] = data[i + 2] = val;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    if (typeof source === 'string') loadImage(source).then(process).catch(reject);
    else process(source);
  });
}

// ── Field Extraction ─────────────────────────────────────────────────────────

const RE = {
  dobLabel: /(?:DOB|D\.O\.B|Date of Birth|జన్మ తేదీ|జన్మతేదీ)[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4})/i,
  dobAny: /\b(\d{2}[\/\-]\d{2}[\/\-]\d{4})\b/,
  yob: /(?:Year of Birth|జన్మ సంవత్సరం|YOB)[:\s]*(\d{4})/i,
  male: /\b(Male|పురుషుడు|MALE|男)\b/i,
  female: /\b(Female|స్త్రీ|FEMALE|女|Mahila)\b/i,
  other: /\b(Transgender|Third Gender|ఇతర|Other)\b/i,
  nameTag: /(?:Name|పేరు)[:\s]+([A-Za-z\s]{3,50})/i,
};

function extractName(text: string, lines: string[]): { name: string; confidence: number } {
  const tag = text.match(RE.nameTag);
  if (tag) {
    const n = tag[1].trim().replace(/\s+/g, ' ');
    if (n.length >= 3 && n.length <= 50 && !/\d/.test(n)) return { name: n, confidence: 0.9 };
  }
  for (let i = 0; i < lines.length - 1; i++) {
    if (/^(Name|పేరు)[:\s]*$/i.test(lines[i].trim())) {
      const next = lines[i + 1].trim();
      if (/^[A-Z][a-zA-Z\s]{4,40}$/.test(next) && !/(?:govt|india|uidai|aadhaar|card|number|date)/i.test(next)) {
        return { name: next, confidence: 0.85 };
      }
    }
  }
  const dobIdx = lines.findIndex(l => /DOB|D\.O\.B|\d{2}[\/\-]\d{2}[\/\-]\d{4}/i.test(l));
  const until = dobIdx > 0 ? dobIdx : Math.min(8, lines.length);
  for (let i = 1; i < until; i++) {
    if (/^[A-Z][a-zA-Z\s]{4,40}$/.test(lines[i]) && lines[i].split(' ').length >= 2 && lines[i].split(' ').length <= 5) {
      if (!/(?:govt|india|uidai|aadhaar|card|number|date|election|commission)/i.test(lines[i])) {
        return { name: lines[i].trim(), confidence: 0.7 };
      }
    }
  }
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (/^[A-Z][a-zA-Z\s]{5,40}$/.test(lines[i]) && lines[i].split(' ').length >= 2) {
      if (!/(?:govt|india|republic|ministry|dept|form|application|certificate)/i.test(lines[i])) {
        return { name: lines[i].trim(), confidence: 0.55 };
      }
    }
  }
  return { name: '', confidence: 0 };
}

function extractDob(text: string): { dob: string; confidence: number } {
  const m = text.match(RE.dobLabel);
  if (m) return { dob: m[1], confidence: 0.9 };
  const y = text.match(RE.yob);
  if (y) return { dob: y[1], confidence: 0.5 };
  const f = text.match(RE.dobAny);
  if (f) return { dob: f[1], confidence: 0.6 };
  return { dob: '', confidence: 0 };
}

function extractGender(text: string): { gender: string; confidence: number } {
  if (RE.male.test(text)) return { gender: 'Male', confidence: 0.95 };
  if (RE.female.test(text)) return { gender: 'Female', confidence: 0.95 };
  if (RE.other.test(text)) return { gender: 'Other', confidence: 0.8 };
  return { gender: '', confidence: 0 };
}

export function parseOCRText(rawText: string): OCRResult {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const name = extractName(rawText, lines);
  const dob = extractDob(rawText);
  const gender = extractGender(rawText);
  return {
    name: name.name,
    dob: dob.dob,
    gender: gender.gender,
    confidence: { name: name.confidence, dob: dob.confidence, gender: gender.confidence },
  };
}

function mergeResults(results: OCRResult[]): OCRResult {
  if (results.length === 0) return { name: '', dob: '', gender: '', confidence: { name: 0, dob: 0, gender: 0 } };
  return results.reduce((acc, r) => ({
    name: r.confidence.name > acc.confidence.name ? r.name : acc.name,
    dob: r.confidence.dob > acc.confidence.dob ? r.dob : acc.dob,
    gender: r.confidence.gender > acc.confidence.gender ? r.gender : acc.gender,
    confidence: {
      name: Math.max(acc.confidence.name, r.confidence.name),
      dob: Math.max(acc.confidence.dob, r.confidence.dob),
      gender: Math.max(acc.confidence.gender, r.confidence.gender),
    },
  }), { name: '', dob: '', gender: '', confidence: { name: 0, dob: 0, gender: 0 } });
}

// ── Worker Cache ────────────────────────────────────────────────────────────

let cachedWorker: any = null;

async function getWorker(): Promise<any> {
  if (cachedWorker) return cachedWorker;
  cachedWorker = await createWorker(['eng', 'tel'], 1, { logger: () => {} });
  return cachedWorker;
}

function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = source instanceof File ? URL.createObjectURL(source) : source;
    img.onload = () => { if (source instanceof File) URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { if (source instanceof File) URL.revokeObjectURL(url); reject(new Error('Load failed')); };
    img.src = url;
  });
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function runOCR(
  imageSource: File | string,
  onProgress?: (pct: number, status: string) => void,
): Promise<OCRResult> {
  const worker = await getWorker();
  try {
    if (onProgress) onProgress(0, 'Loading image...');
    const img = await loadImage(imageSource);
    if (onProgress) onProgress(5, 'Preprocessing...');
    const preprocessed = await preprocessImage(img);

    // Pass 1: PSM_AUTO
    if (onProgress) onProgress(15, 'OCR pass 1...');
    await worker.setParameters({ tessedit_pageseg_mode: '3', preserve_interword_spaces: '1' });
    const p1 = await worker.recognize(preprocessed);
    const r1 = parseOCRText(p1.data.text);
    const score1 = (r1.confidence.name + r1.confidence.dob + r1.confidence.gender) / 3;

    let final = r1;
    const all = [r1];

    // Pass 2 if low confidence
    if (score1 < 0.6) {
      if (onProgress) onProgress(45, 'OCR pass 2...');
      await worker.setParameters({ tessedit_pageseg_mode: '6', preserve_interword_spaces: '1' });
      const p2 = await worker.recognize(preprocessed);
      const r2 = parseOCRText(p2.data.text);
      all.push(r2);
    }

    const merged = mergeResults(all);
    const mergedScore = (merged.confidence.name + merged.confidence.dob + merged.confidence.gender) / 3;

    // Gemini Vision fallback
    if (mergedScore < 0.4) {
      if (onProgress) onProgress(70, 'AI vision fallback...');
      const geminiResult = await extractWithGemini(imageSource);
      if (geminiResult) {
        all.push(geminiResult);
        final = mergeResults(all);
      } else {
        final = merged;
      }
    } else {
      final = merged;
    }

    if (onProgress) onProgress(100, 'Done');
    if (preprocessed.startsWith('blob:')) URL.revokeObjectURL(preprocessed);
    return final;
  } finally { /* keep worker cached */ }
}

export async function terminateOCRWorker(): Promise<void> {
  if (cachedWorker) {
    try { await cachedWorker.terminate(); } catch { /* */ }
    cachedWorker = null;
  }
}
