# Praja Mitra (ప్రజా మిత్ర) — AI Government Schemes Assistant

> **Andhra Pradesh Citizen Welfare & Government Schemes Discovery Portal**  
> An AI-powered, bilingual (Telugu & English) portal enabling citizens of Andhra Pradesh to discover eligible welfare schemes, find Grama/Ward Sachivalayams, verify documents, and interact with an AI Voice Assistant.

---

## 🌟 Key Features

- **🗣️ Bilingual Experience (తెలుగు & English):** Instant language toggle with native Telugu script across all modules and voice interactions.
- **🤖 Praja Mitra AI Assistant:** Powered by Google Gemini to provide instant, factual answers about AP government schemes with certified links.
- **🎙️ Voice Mitra Assistant:** Speak in Telugu or English to inquire about welfare schemes with speech-to-text and voice guidance.
- **📋 Scheme Eligibility Checker:** Personalized questionnaire matching citizens against schemes based on income, landholding, caste, occupation, and family details.
- **📍 Grama & Ward Sachivalayam Locator:** Easily find nearby Sachivalayams, ward volunteers, and welfare coordinators across all 26 AP districts.
- **🔎 Application Tracker:** Track the status of citizen applications with real-time stage progression and official helpline references.
- **📄 Aadhaar & Document Scanner:** OCR-powered scanner for fast citizen verification and eligibility pre-filling.
- **🔐 Citizen Authentication:** Secure phone/Aadhaar OTP verification for saving eligibility records and applications.

---

## 🏛️ Featured Andhra Pradesh Schemes

- **Rythu Bharosa / PM-Kisan (పీఎం కిసాన్ / రైతు భరోసా):** Financial investment support for farmers.
- **Thalliki Vandanam / Amma Vodi (తల్లికి వందనం / అమ్మ ఒడి):** Annual financial assistance for mothers of school-going children.
- **NTR Bharosa / Pension Kanuka (ఎన్టీఆర్ భరోసా / పెన్షన్ కానుక):** Monthly doorstep social pensions.
- **Dr. YSR Aarogyasri (ఆరోగ్యశ్రీ):** Cashless healthcare and corporate surgery coverage.
- **Vidya Deevena & Vasathi Deevena (విద్యా దీవెన):** Complete college tuition and hostel assistance.
- **Deepam 2.0 (దీపం 2.0 పథకం):** Free cooking gas cylinders subsidy.
- **Stree Shakthi / Serp SHG (స్త్రీ శక్తి - ఉచిత బస్సు ప్రయాణం):** Free bus travel for women and self-help group loans.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite, Lucide Icons, Motion
- **Backend:** Express.js, Node.js, TSX
- **AI / LLM:** Google Gemini API (`@google/genai`)
- **OCR:** Tesseract.js
- **PWA & Mobile Ready:** Responsive design optimized for low-end mobile devices and fast 4G/5G connections.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API Key (from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ChDineshPrakash/Praja-Mitra-CSP.git
   cd Praja-Mitra-CSP
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your keys:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   VITE_GEMINI_API_KEY="your-gemini-api-key"
   PORT=3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser:
   Visit `http://localhost:3000` to interact with Praja Mitra.

---

## 📜 Official AP Government Portals Reference
- Grama Ward Sachivalayam: [gramawardsachivalayam.ap.gov.in](https://gramawardsachivalayam.ap.gov.in)
- PM Kisan Portal: [pmkisan.gov.in](https://pmkisan.gov.in)
- Jnanabhumi Portal: [jnanabhumi.ap.gov.in](https://jnanabhumi.ap.gov.in)
- YSR Pension Kanuka: [sspensions.ap.gov.in](https://sspensions.ap.gov.in)
- Aarogyasri Trust: [ysraarogyasri.ap.gov.in](https://ysraarogyasri.ap.gov.in)
- CM Helpline: **1902**
