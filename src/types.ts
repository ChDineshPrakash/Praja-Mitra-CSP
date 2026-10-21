// Scheme data types matching the backend AP_SCHEMES structure
export interface Scheme {
  id: string;
  icon: string;
  nameEn: string;
  nameTe: string;
  category: string;
  amountEn: string;
  amountTe: string;
  summaryEn: string;
  summaryTe: string;
  benefitsEn: string[];
  benefitsTe: string[];
  eligibilityEn: string[];
  eligibilityTe: string[];
  documentsEn: string[];
  documentsTe: string[];
  image?: string;
  tag?: string;
  tagColor?: string;
  officialSource?: string;
}

export type Language = 'te' | 'en';
export type TabId = 'home' | 'checklist' | 'map' | 'helpline' | 'scan';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// User profile auto-filled from OCR and manual inputs
export interface UserProfile {
  name: string;
  dob: string;
  age: string;
  gender: string;
  address: string;
  pincode: string;
  district: string;
  occupation: string;
  annualIncome: string;
  caste: string;
  isStudent: boolean;
  hasFarmLand: boolean;
  aadhaarScanned: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  aadhaarLast4?: string;
  district: string;
  mandal?: string;
  role: 'citizen' | 'volunteer' | 'admin';
  createdAt: string;
}
