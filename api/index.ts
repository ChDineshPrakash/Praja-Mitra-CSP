import "dotenv/config";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import { AP_SCHEMES } from "./_schemes.js";
import { authRouter } from "./_auth.js";

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

// Ground-truth context for schemes to prevent any AI hallucination
const schemesContext = AP_SCHEMES.map(s => `
Scheme ID: ${s.id}
Name En: ${s.nameEn}
Name Te: ${s.nameTe}
Category: ${s.category}
Amount En: ${s.amountEn}
Amount Te: ${s.amountTe}
Summary En: ${s.summaryEn}
Summary Te: ${s.summaryTe}
Benefits En:
${s.benefitsEn.map(b => `- ${b}`).join('\n')}
Benefits Te:
${s.benefitsTe.map(b => `- ${b}`).join('\n')}
Eligibility En:
${s.eligibilityEn.map(e => `- ${e}`).join('\n')}
Eligibility Te:
${s.eligibilityTe.map(e => `- ${e}`).join('\n')}
Required Documents En:
${s.documentsEn.map(d => `- ${d}`).join('\n')}
Required Documents Te:
${s.documentsTe.map(d => `- ${d}`).join('\n')}
`).join('\n---\n');

// Lazy initialization of Gemini API Client to prevent crash if key is missing on startup
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please add your Gemini API Key in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Scheme list endpoint (enables offline fallback data download if needed or inspection)
app.get("/api/schemes", (req, res) => {
  res.json(AP_SCHEMES);
});

// AI Chat Assistant endpoint
app.post("/api/chat", async (req, res) => {
  const { message, history = [], language = "te", easyMode = false } = req.body;
  try {
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required." });
    }

    let client;
    try {
      client = getGeminiClient();
    } catch (err: any) {
      // Return a helpful diagnostic response to the user instead of raw server error
      return res.json({
        response: language === "te" 
          ? "క్షమించండి, ప్రజా మిత్ర AI కనెక్ట్ కాలేదు. దయచేసి 'Settings > Secrets' విభాగంలో మీ GEMINI_API_KEYను నమోదు చేయండి."
          : "Praja Mitra AI client could not initialize. Please verify your GEMINI_API_KEY is configured in Settings > Secrets."
      });
    }

    // Official portal verified URLs mapping
    const schemeOfficialPortals: Record<string, { title: string; titleTe: string; url: string }> = {
      "rythu-bharosa": { title: "PM-Kisan Official Portal", titleTe: "పీఎం-కిసాన్ అధికారిక పోర్టల్", url: "https://pmkisan.gov.in" },
      "amma-vodi": { title: "Jnanabhumi AP Portal", titleTe: "జ్ఞానభూమి ఏపీ పోర్టల్", url: "https://jnanabhumi.ap.gov.in" },
      "pension-kanuka": { title: "AP Social Security Pensions Portal", titleTe: "ఏపీ సాంఘిక భద్రత పెన్షన్ల పోర్టల్", url: "https://sspensions.ap.gov.in" },
      "aarogyasri": { title: "Dr. YSR Aarogyasri Trust Portal", titleTe: "డాక్టర్ వైఎస్సార్ ఆరోగ్యశ్రీ ట్రస్ట్ పోర్టల్", url: "https://ysraarogyasri.ap.gov.in" },
      "vidya-deevena": { title: "Jnanabhumi Education Services Portal", titleTe: "జ్ఞానభూమి విద్యా సేవలు పోర్టల్", url: "https://jnanabhumi.ap.gov.in" },
      "cheyutha": { title: "AP Grama Ward Sachivalayam Portal", titleTe: "ఏపీ గ్రామ వార్డు సచివాలయం పోర్టల్", url: "https://gramawardsachivalayam.ap.gov.in" },
      "pedalandariki-illu": { title: "AP Housing Corporation Portal", titleTe: "ఏపీ గృహనిర్మాణ సంస్థ పోర్టల్", url: "https://housing.ap.gov.in" },
      "sunna-vaddi": { title: "AP SERP SHG Portal", titleTe: "ఏపీ సెర్ప్ పొదుపు సంఘాల పోర్టల్", url: "https://serp.ap.gov.in" },
    };

    // System Instructions that configure Praja Mitra persona and ChatGPT-style Markdown responses
    const systemInstruction = `You are "Praja Mitra" (ప్రజా మిత్ర), an AI welfare assistant for the citizens of Andhra Pradesh.
Your job is to provide clean, readable, ChatGPT-style structured explanations of government welfare schemes for ordinary citizens.

Selected User Language: ${language === "te" ? "Telugu (తెలుగు)" : "English"}.
You MUST respond strictly in ${language === "te" ? "Telugu (తెలుగు)" : "English"}.

### Certified AP Schemes Database (Use as single source of truth):
${schemesContext}

### Official Verified Portals:
- PM-Kisan / Rythu Bharosa: https://pmkisan.gov.in
- YSR Pension Kanuka: https://sspensions.ap.gov.in
- YSR Aarogyasri: https://ysraarogyasri.ap.gov.in
- Jagananna Amma Vodi & Vidya Deevena: https://jnanabhumi.ap.gov.in
- YSR Cheyutha & Village Sachivalayam: https://gramawardsachivalayam.ap.gov.in
- Pedalandariki Housing: https://housing.ap.gov.in
- General Citizen Portal: https://gramawardsachivalayam.ap.gov.in

### Mandatory 6-Section Markdown Output Format:
Whenever answering about a government scheme, you MUST structure your response into these exact 6 sections without omitting any:

**[Scheme Name] — Overview**
[1-2 sentences summarizing what the scheme does in plain, citizen-friendly language. No legal jargon or complex numbers.]

**Benefits**
- [Bullet points summarizing verified financial or service benefits]
- [Payment schedule or additional assistance]

**Eligibility**
- [Bullet points summarizing eligibility criteria]
- [Exclusions or verified conditions]

**Documents required**
- [Bullet points listing documents such as Aadhaar Card, Rice Card / White Ration Card, Passbook, etc.]

**How to apply**
1. [First step: Visit nearest Grama or Ward Sachivalayam (గ్రామ/వార్డు సచివాలయం) or portal]
2. [Second step: Submit verified documents to the Welfare & Education Assistant]
3. [Third step: Inclusion in social audit verification list]

**Official source:** [Clickable Official Portal](URL)

MANDATORY RULES:
1. ALWAYS include the "**Official source:** [Portal Name](URL)" clickable link at the bottom. Use the verified portals listed above (e.g., https://pmkisan.gov.in for PM Kisan / Rythu Bharosa, https://sspensions.ap.gov.in for Pension Kanuka, https://ysraarogyasri.ap.gov.in for Aarogyasri, https://jnanabhumi.ap.gov.in for Amma Vodi / Vidya Deevena, https://gramawardsachivalayam.ap.gov.in for Sachivalayam / Cheyutha).
2. NEVER invent benefit amounts, eligibility rules, documents, or URLs.
3. If user's language is Telugu, translate section headers into natural Telugu:
   **[పథకం పేరు] — వివరణ**
   **ప్రయోజనాలు**
   **అర్హతలు**
   **కావలసిన పత్రాలు**
   **దరఖాస్తు విధానం**
   **అధికారిక మూలం:** [పోర్టల్ పేరు](URL)
4. Never output raw HTML or code fences unless asked. Use clean standard Markdown (bold, lists, links).
5. If the user asks a general greeting or non-scheme question, respond warmly and suggest available schemes.`;

    // Format Chat history for Gemini @google/genai format
    // SDK chats expects: contents: Array of { role: string, parts: Array<{ text: string }> }
    let contents = history.map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    }));

    // Append current user message if not already present at the end
    const lastContent = contents[contents.length - 1];
    if (!lastContent || lastContent.role !== "user" || lastContent.parts[0].text !== message) {
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });
    }

    // Filter to ensure strict alternation of roles to prevent API errors from consecutive identical roles
    const cleanedContents: any[] = [];
    for (const item of contents) {
      if (cleanedContents.length === 0) {
        cleanedContents.push(item);
      } else {
        const lastItem = cleanedContents[cleanedContents.length - 1];
        if (lastItem.role === item.role) {
          // Replace the previous message of the same role to keep the latest information
          cleanedContents[cleanedContents.length - 1] = item;
        } else {
          cleanedContents.push(item);
        }
      }
    }

    console.log(`[Praja Mitra] Calling generateContent with ${cleanedContents.length} message(s).`);

    // Helper function to call Gemini with retry logic on 503 errors
    async function tryGenerateWithModel(modelName: string, retriesLeft = 2, delayMs = 600): Promise<any> {
      try {
        const resObj = await client.models.generateContent({
          model: modelName,
          contents: cleanedContents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          }
        });
        return resObj;
      } catch (err: any) {
        const is503 = err.status === 503 || 
                      (err.message && err.message.includes("503")) || 
                      (err.message && err.message.includes("high demand")) ||
                      (err.message && err.message.includes("UNAVAILABLE"));
        if (is503 && retriesLeft > 0) {
          console.log(`[Praja Mitra] Model ${modelName} is busy. Retrying in ${delayMs}ms... (${retriesLeft} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return tryGenerateWithModel(modelName, retriesLeft - 1, delayMs * 2);
        }
        throw err;
      }
    }

    // Call the correct SDK method with a fallback cascade for model availability / high demand
    let geminiResponse;
    let finalResponseText = "";

    try {
      try {
        console.log("[Praja Mitra] Trying primary model: gemini-3.5-flash");
        geminiResponse = await tryGenerateWithModel("gemini-3.5-flash");
        finalResponseText = geminiResponse.text || "";
      } catch (error1: any) {
        console.log(`[Praja Mitra] Primary model (gemini-3.5-flash) returned status ${error1?.status || "busy"}. Trying fallback model: gemini-3.1-flash-lite`);
        try {
          geminiResponse = await tryGenerateWithModel("gemini-3.1-flash-lite");
          finalResponseText = geminiResponse.text || "";
        } catch (error2: any) {
          console.log(`[Praja Mitra] Second model (gemini-3.1-flash-lite) returned status ${error2?.status || "busy"}. Trying fallback model: gemini-flash-latest`);
          try {
            geminiResponse = await tryGenerateWithModel("gemini-flash-latest");
            finalResponseText = geminiResponse.text || "";
          } catch (error3) {
            console.log("[Praja Mitra] All remote models are currently busy. Activating rule-based assistant backup.");
            finalResponseText = getRuleBasedResponse(message, language, easyMode);
          }
        }
      }

      if (!finalResponseText) {
        finalResponseText = getRuleBasedResponse(message, language, easyMode);
      }

      res.json({ response: finalResponseText });
    } catch (cascadeError: any) {
      console.log("[Praja Mitra] Exception in processing cascade, serving local backup.");
      const fallbackText = getRuleBasedResponse(message, language, easyMode);
      res.json({ response: fallbackText });
    }
  } catch (error: any) {
    console.error("General API endpoint error:", error);
    res.json({ 
      response: language === "te"
        ? "క్షమించండి, మీ ప్రశ్నను స్వీకరించడంలో సమస్య ఏర్పడింది. దయచేసి మళ్ళీ అడగండి."
        : "I apologize, there was an issue processing your query. Please try again."
    });
  }
});

// Local rule-based/keyword fallback engine for high resilience during high traffic/server failures
function getRuleBasedResponse(message: string, language: string, easyMode: boolean): string {
  const query = message.toLowerCase();
  
  // Define keywords and match them to schemes
  let matchedScheme = null;
  
  if (query.includes("రైతు") || query.includes("భరోసా") || query.includes("కిసాన్") || query.includes("వ్యవసాయం") || query.includes("పంట") || query.includes("farmer") || query.includes("rythu") || query.includes("bharosa") || query.includes("kisan") || query.includes("agriculture")) {
    matchedScheme = AP_SCHEMES.find(s => s.id === "rythu-bharosa");
  } else if (query.includes("అమ్మ ఒడి") || query.includes("అమ్మఒడి") || query.includes("తల్లి") || query.includes("బడి") || query.includes("స్కూల్") || query.includes("school") || query.includes("mother") || query.includes("amma") || query.includes("vodi") || query.includes("ammavodi")) {
    matchedScheme = AP_SCHEMES.find(s => s.id === "amma-vodi");
  } else if (query.includes("పెన్షన్") || query.includes("వృద్ధాప్య") || query.includes("వృద్ధులు") || query.includes("వితంతు") || query.includes("దివ్యాంగులు") || query.includes("సదరమ్") || query.includes("pension") || query.includes("kanuka") || query.includes("elderly") || query.includes("widow") || query.includes("disabled")) {
    matchedScheme = AP_SCHEMES.find(s => s.id === "pension-kanuka");
  } else if (query.includes("ఆరోగ్యశ్రీ") || query.includes("ఆరోగ్య శ్రీ") || query.includes("వైద్యం") || query.includes("ఆసుపత్రి") || query.includes("సర్జరీ") || query.includes("surgery") || query.includes("hospital") || query.includes("health") || query.includes("aarogyasri") || query.includes("treatment")) {
    matchedScheme = AP_SCHEMES.find(s => s.id === "aarogyasri");
  } else if (query.includes("విద్య దీవెన") || query.includes("విద్యా దీవెన") || query.includes("వసతి దీవెన") || query.includes("వసతిదీవెన") || query.includes("రీయింబర్స్మెంట్") || query.includes("కాలేజీ") || query.includes("college") || query.includes("vidya") || query.includes("deeve") || query.includes("reimbursement") || query.includes("vasathi")) {
    matchedScheme = AP_SCHEMES.find(s => s.id === "vidya-deevena");
  } else if (query.includes("చేయూత") || query.includes("మహిళ") || query.includes("ఉపాధి") || query.includes("వ్యాపారం") || query.includes("cheyutha") || query.includes("women") || query.includes("business") || query.includes("livelihood")) {
    matchedScheme = AP_SCHEMES.find(s => s.id === "cheyutha");
  } else if (query.includes("ఇల్లు") || query.includes("ఇళ్లు") || query.includes("ఇళ్ల స్థలం") || query.includes("निवास") || query.includes("housing") || query.includes("house") || query.includes("plot") || query.includes("illu") || query.includes("pedalandariki")) {
    matchedScheme = AP_SCHEMES.find(s => s.id === "pedalandariki-illu");
  } else if (query.includes("సున్నా వడ్డీ") || query.includes("డ్వాక్రా") || query.includes("పొదుపు సంఘం") || query.includes("వడ్డీ") || query.includes("interest") || query.includes("zero interest") || query.includes("sunna vaddi") || query.includes("dwcra") || query.includes("shg")) {
    matchedScheme = AP_SCHEMES.find(s => s.id === "sunna-vaddi");
  }

  const isTelugu = language === "te";

  // Official portal URLs
  const portals: Record<string, { title: string; titleTe: string; url: string }> = {
    "rythu-bharosa": { title: "PM-Kisan Official Website", titleTe: "పీఎం-కిసాన్ అధికారిక వెబ్‌సైట్", url: "https://pmkisan.gov.in" },
    "amma-vodi": { title: "Jnanabhumi AP Portal", titleTe: "జ్ఞానభూమి ఏపీ పోర్టల్", url: "https://jnanabhumi.ap.gov.in" },
    "pension-kanuka": { title: "AP Social Security Pensions Portal", titleTe: "ఏపీ సాంఘిక భద్రత పెన్షన్ల పోర్టల్", url: "https://sspensions.ap.gov.in" },
    "aarogyasri": { title: "Dr. YSR Aarogyasri Trust", titleTe: "డాక్టర్ వైఎస్సార్ ఆరోగ్యశ్రీ ట్రస్ట్", url: "https://ysraarogyasri.ap.gov.in" },
    "vidya-deevena": { title: "Jnanabhumi Vidya Deevena Portal", titleTe: "జ్ఞానభూమి విద్యా దీవెన పోర్టల్", url: "https://jnanabhumi.ap.gov.in" },
    "cheyutha": { title: "AP Grama Ward Sachivalayam Portal", titleTe: "ఏపీ గ్రామ వార్డు సచివాలయం పోర్టల్", url: "https://gramawardsachivalayam.ap.gov.in" },
    "pedalandariki-illu": { title: "AP Housing Portal", titleTe: "ఏపీ గృహనిర్మాణ పోర్టల్", url: "https://housing.ap.gov.in" },
    "sunna-vaddi": { title: "AP SERP Portal", titleTe: "ఏపీ సెర్ప్ పోర్టల్", url: "https://serp.ap.gov.in" },
  };

  if (matchedScheme) {
    const portal = portals[matchedScheme.id] || { 
      title: "AP Grama Ward Sachivalayam", 
      titleTe: "ఏపీ గ్రామ వార్డు సచివాలయం", 
      url: "https://gramawardsachivalayam.ap.gov.in" 
    };

    if (isTelugu) {
      const header = `**${matchedScheme.nameTe} — వివరణ**\n\n`;
      const overview = `${matchedScheme.summaryTe} ${matchedScheme.amountTe}.\n\n`;
      
      const benefits = `**ప్రయోజనాలు**\n` + matchedScheme.benefitsTe.map(b => `- ${b}`).join('\n') + `\n\n`;
      const eligibility = `**అర్హతలు**\n` + matchedScheme.eligibilityTe.map(e => `- ${e}`).join('\n') + `\n\n`;
      const documents = `**కావలసిన పత్రాలు**\n` + matchedScheme.documentsTe.map(d => `- ${d}`).join('\n') + `\n\n`;
      
      const apply = `**దరఖాస్తు విధానం**\n` +
        `1. మీ స్థానిక గ్రామ లేదా వార్డు సచివాలయాన్ని సందర్శించండి.\n` +
        `2. అవసరమైన పత్రాలను సంక్షేమ సహాయకుడికి (Welfare Assistant) సమర్పించండి.\n` +
        `3. అర్హుల జాబితాలో మీ పేరు నమోదు ధృవీకరణ పొందండి.\n\n`;
        
      const source = `**అధికారిక మూలం:** [${portal.titleTe}](${portal.url})\n\n` +
        `*గమనిక: తాజా మార్గదర్శకాలకు మీ సమీప సచివాలయం లేదా 1902 టోల్ ఫ్రీ నంబర్‌ను సంప్రదించండి.*`;

      return header + overview + benefits + eligibility + documents + apply + source;
    } else {
      const header = `**${matchedScheme.nameEn} — Overview**\n\n`;
      const overview = `${matchedScheme.summaryEn} Financial benefit: ${matchedScheme.amountEn}.\n\n`;
      
      const benefits = `**Benefits**\n` + matchedScheme.benefitsEn.map(b => `- ${b}`).join('\n') + `\n\n`;
      const eligibility = `**Eligibility**\n` + matchedScheme.eligibilityEn.map(e => `- ${e}`).join('\n') + `\n\n`;
      const documents = `**Documents required**\n` + matchedScheme.documentsEn.map(d => `- ${d}`).join('\n') + `\n\n`;
      
      const apply = `**How to apply**\n` +
        `1. Visit your local Grama or Ward Sachivalayam (Village/Ward Secretariat).\n` +
        `2. Submit the verified documents to your designated Welfare & Education Assistant.\n` +
        `3. Track your social audit verification and beneficiary list enrollment status.\n\n`;
        
      const source = `**Official source:** [${portal.title}](${portal.url})\n\n` +
        `*Note: For official verification and scheme rules, check the verified government portal or call the 1902 citizen helpline.*`;

      return header + overview + benefits + eligibility + documents + apply + source;
    }
  }

  // General fallback response
  if (isTelugu) {
    return `**ప్రజా మిత్ర — సంక్షేమ పథకాల సమాచారం**\n\n` +
      `నమస్కారం! నేను ఆంధ్రప్రదేశ్ ప్రభుత్వ సంక్షేమ పథకాల గురించి మీకు మార్గదర్శనం చేయగలను. మీరు క్రింది పథకాల గురించి తెలుసుకోవచ్చు:\n\n` +
      `- **రైతు భరోసా / పీఎం కిసాన్:** రైతులకు పెట్టుబడి సహాయం\n` +
      `- **తల్లికి వందనం / అమ్మ ఒడి:** పాఠశాల విద్యార్థుల తల్లులకు వార్షిక సాయం\n` +
      `- **ఎన్టీఆర్ భరోసా / పెన్షన్ కానుక:** వృద్ధాప్య, వితంతు, దివ్యాంగుల పెన్షన్లు\n` +
      `- **వైఎస్సార్ ఆరోగ్యశ్రీ:** కార్పొరేట్ ఆసుపత్రులలో ఉచిత వైద్య సేవలు\n` +
      `- **విద్యా దీవెన & వసతి దీవెన:** పూర్తి కాలేజీ ఫీజు రీయింబర్స్మెంట్\n` +
      `- **చేయూత & మహిళా సాధికారత:** ఉపాధి మరియు ఆర్థిక సహాయం\n` +
      `- **పేదలందరికీ ఇళ్లు:** ఉచిత నివాస గృహాలు\n\n` +
      `దయచేసి ఏదైనా పథకం పేరు లేదా మీ అవసరాన్ని అడగండి!\n\n` +
      `**అధికారిక మూలం:** [గ్రామ వార్డు సచివాలయం పోర్టల్](https://gramawardsachivalayam.ap.gov.in)`;
  } else {
    return `**Praja Mitra — Welfare Schemes Assistance**\n\n` +
      `Namaskaram! I can guide you on Andhra Pradesh government welfare schemes with verified information. You can ask about:\n\n` +
      `- **PM-Kisan / Rythu Bharosa:** Investment support for farmers\n` +
      `- **Thalliki Vandanam / Amma Vodi:** Financial assistance for school students' mothers\n` +
      `- **NTR Bharosa / Pension Kanuka:** Monthly doorstep social pensions\n` +
      `- **Dr. YSR Aarogyasri:** Free healthcare and corporate surgery coverage\n` +
      `- **Vidya Deevena & Vasathi Deevena:** Full college fee reimbursement and hostel aid\n` +
      `- **YSR Cheyutha:** Sustainable livelihood support for women\n` +
      `- **Pedalandariki Illu:** Housing plots and construction grants\n\n` +
      `Please ask a question about any of these schemes to view complete details.\n\n` +
      `**Official source:** [AP Grama Ward Sachivalayam Portal](https://gramawardsachivalayam.ap.gov.in)`;
  }
}

export default app;
