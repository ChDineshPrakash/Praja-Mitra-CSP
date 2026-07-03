import "dotenv/config";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import { AP_SCHEMES } from "./schemes.js";

const app = express();
app.use(express.json());

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

    // System Instructions that configure Praja Mitra persona, Telugu first, and Easy Mode support.
    const systemInstruction = `You are "Praja Mitra" (ప్రజా మిత్ర), a warm, highly respectful, compassionate, and wise village secretariat partner (గ్రామ సచివాలయం ఉద్యోగి) dedicated to helping Andhra Pradesh citizens.
Your job is to guide citizens, rural farmers, elderly grandmothers/grandfathers, women, students, and workers in understanding official government schemes.

The user's current selected language preference is: ${language === "te" ? "Telugu (తెలుగు)" : "English"}.
Easy Mode / Elder Mode state is: ${easyMode ? "ACTIVE (Very simple terms, larger spacing intent, high empathy, slow and ultra-clear language)" : "INACTIVE (Friendly, professional, and clear language)"}.

Here are the certified facts about official AP Government Schemes you MUST use as your single source of correct information:
${schemesContext}

Rules for response:
1. Speak in a warm, welcoming tone. If easyMode is active, talk with deep respect to an elder (e.g., using honorifics like "అయ్యగారు", "అమ్మగారు", "మీకు ఎలాంటి భయం వద్దు", "నేను సహాయం చేస్తాను").
2. Answer based on the matching scheme details. If the query is related to farming, point clearly to "వైఎస్సార్ రైతు భరోసా". If it is related to school/college, talk about "జగనన్న అమ్మ ఒడి" or "జగనన్న విద్యా దీవెన".
3. Avoid all legal/technical phrases or GO numbers. Do NOT say: "Satisfying criteria under GO Ms No 127". Instead show everyday human explanations: "మీరు ₹15,000 పొందేందుకు అర్హులు ఎందుకంటే మీ కుటుంబ వార్షిక ఆదాయం పరిమితి లోపలే ఉంది."
4. Always list:
   - What benefits they receive (e.g. ₹15,000 yearly or ₹3,000 per month).
   - The key eligibility factors.
   - EXACT documents they should carry to their Secretariat (ఆధార్ కార్డ్, రైస్ కార్డ్, పట్టాదారు పాస్ బుక్, etc.).
5. If the user's inquiry does NOT match any of these schemes, reply politely in the selected language. Remind them of the schemes you support (Rythu Bharosa, Amma Vodi, Pension Kanuka, Aarogyasri Free corporate surgery, Vidya Deevena fee reimbursement, Cheyutha, Pedalandariki Housing, Sunna Vaddi) and ask them to explain their livelihood, school stage, or personal age so you can find the perfect match.
6. Keep your formatting clean and readable. Use simple paragraphs, short sentences, and bullet points. Do not write massive blocks of text. No heavy markdown layers.
7. End your response by offering them to check the "📍 Nearby Office" map on our app or contact the CM helpline 1902 if they have further questions.`;

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

  if (matchedScheme) {
    if (isTelugu) {
      const intro = easyMode 
        ? `నమస్కారం అమ్మగారు/అయ్యగారు. నేను మీ గ్రామ సచివాలయ ఉద్యోగిని (ప్రజా మిత్ర). మీకు సహాయం చేయడానికి నేను ఇక్కడే ఉన్నాను. మీకు ${matchedScheme.nameTe} పథకం గురించి పూర్తి వివరాలు తెలియజేస్తాను, దయచేసి వినండి:\n\n`
        : `నమస్కారం! నేను ప్రజా మిత్రను. ${matchedScheme.nameTe} గురించి వివరణ ఇక్కడ ఇస్తున్నాను:\n\n`;
      
      const summary = `**పథకం వివరణ:** ${matchedScheme.summaryTe}\n\n`;
      const amount = `**లభించే ఆర్థిక సహాయం:** ${matchedScheme.amountTe}\n\n`;
      
      const benefits = `**పథకం ప్రయోజనాలు:**\n${matchedScheme.benefitsTe.map(b => `${b}`).join('\n')}\n\n`;
      const eligibility = `**అర్హత ప్రమాణాలు:**\n${matchedScheme.eligibilityTe.map(e => `${e}`).join('\n')}\n\n`;
      const documents = `**కావలసిన పత్రాలు (సచివాలయానికి తీసుకురావాల్సినవి):**\n${matchedScheme.documentsTe.map(d => `${d}`).join('\n')}\n\n`;
      
      const outro = `మీరు ఈ పత్రాలతో మీ స్థానిక సచివాలయానికి వస్తే మేము దరఖాస్తు చేయిస్తాము. ఇంకా ఏవైనా సందేహాలు ఉంటే హెల్ప్‌లైన్ నంబర్ 1902 కి ఫోన్ చేయవచ్చు లేదా మా యాప్‌లోని "📍 Nearby Office" మ్యాప్‌ను చూడవచ్చు!`;
      
      return intro + summary + amount + benefits + eligibility + documents + outro;
    } else {
      const intro = easyMode
        ? `Namaskaram. I am your Village Secretariat partner (Praja Mitra). I am here to assist you. Here are the simple details of the ${matchedScheme.nameEn} scheme:\n\n`
        : `Namaskaram! I am Praja Mitra. Here are the details for ${matchedScheme.nameEn}:\n\n`;
        
      const summary = `**Scheme Summary:** ${matchedScheme.summaryEn}\n\n`;
      const amount = `**Financial Benefit:** ${matchedScheme.amountEn}\n\n`;
      
      const benefits = `**Key Benefits:**\n${matchedScheme.benefitsEn.map(b => `${b}`).join('\n')}\n\n`;
      const eligibility = `**Eligibility Criteria:**\n${matchedScheme.eligibilityEn.map(e => `${e}`).join('\n')}\n\n`;
      const documents = `**Required Documents (Bring to Secretariat):**\n${matchedScheme.documentsEn.map(d => `${d}`).join('\n')}\n\n`;
      
      const outro = `Please visit your nearest Grama Sachivalayam with these documents to register. For further queries, dial CM Helpline 1902 or check the "📍 Nearby Office" map on our app!`;
      
      return intro + summary + amount + benefits + eligibility + documents + outro;
    }
  }

  // General fallback response
  if (isTelugu) {
    return easyMode
      ? `నమస్కారం అమ్మగారు/అయ్యగారు. ప్రస్తుతానికి సర్వర్ కనెక్ట్ కావడంలో చిన్న తాత్కాలిక సమస్య ఉన్నందున నేను మీ ప్రశ్నకు నేరుగా సమాధానం చెప్పలేకపోతున్నాను. కానీ కంగారు పడకండి! మన యాప్ లో క్రింది పథకాల వివరాలు అందుబాటులో ఉన్నాయి:\n\n` +
        `🌾 రైతు భరోసా, 🎓 అమ్మ ఒడి, 👴 పెన్ชั่น కానుక, 🏥 ఆరోగ్యశ్రీ వైద్యం, 📚 విద్యా దీవెన, 👩 చేయూత, 🏠 పేదలందరికీ ఇల్లు, 💰 సున్నా వడ్డీ.\n\n` +
        `దయచేసి వీటిలో ఏదైనా ఒక పథకం పేరును లేదా మీ వయస్సు, చేసే పనిని చెబితే నేను వివరాలు అందిస్తాను. మీ సేవలో నేను సదా సిద్ధంగా ఉంటాను.`
      : `నమస్కారం! సర్వర్ తాత్కాలికంగా కనెక్ట్ కాకపోవడంతో ప్రజా మిత్ర ఆఫ్ లైన్ సహాయం అందిస్తోంది. నేను ఈ క్రింది ముఖ్య పథకాలపై మీకు సహాయం చేయగలను:\n\n` +
        `- వైఎస్సార్ రైతు భరోసా (రైతు పెట్టుబడి సాయం)\n` +
        `- జగనన్న అమ్మ ఒడి (పాఠశాల పిల్లల తల్లులకు సాయం)\n` +
        `- వైఎస్సార్ పెన్షన్ కానుక (వృద్ధాప్య, వితంతు, దివ్యాంగుల పెన్షన్లు)\n` +
        `- వైఎస్సార్ ఆరోగ్యశ్రీ (₹25 లక్షల ఉచిత కార్పొరేట్ వైద్యం)\n` +
        `- జగనన్న విద్యా దీవెన & వసతి దీవెన (కాలేజీ ఫీజు రీయింబర్స్మెంట్)\n` +
        `- వైఎస్సార్ చేయూత (45-60 ఏళ్ల మహిళల ఉపాధి సాయం)\n` +
        `- పేదలందరికీ ఇల్లు (ఉచిత ఇళ్ల స్థలం మరియు నిర్మాణ గ్రాంట్)\n` +
        `- వైఎస్సార్ సున్నా వడ్డీ (పొదుపు సంఘాలు & పంట రుణాలపై వడ్డీ రద్దు)\n\n` +
        `దయచేసి ఈ పథకాల్లో దేని గురించైనా ప్రశ్న అడగండి. మీకు పూర్తి వివరాలు అందిస్తాను!`;
  } else {
    return easyMode
      ? `Namaskaram. Currently, our AI servers are experiencing a small temporary delay, but don't worry! I can still assist you with information about our major welfare schemes:\n\n` +
        `🌾 Rythu Bharosa (Farmers), 🎓 Amma Vodi (Students/Mothers), 👴 Pension Kanuka (Elderly/Widows), 🏥 Aarogyasri (Free Corporate Health), 📚 Vidya Deevena (Fee Reimbursement), 👩 Cheyutha (Women empowerment), 🏠 Housing Scheme, 💰 Zero Interest Loans.\n\n` +
        `Please mention any of these schemes or tell me about your family needs so I can guide you.`
      : `Namaskaram! Our AI servers are experiencing temporary high demand, but Praja Mitra is online with built-in assistant support. I can guide you on the following schemes:\n\n` +
        `- YSR Rythu Bharosa (Farmer investment support)\n` +
        `- Jagananna Amma Vodi (School student mothers support)\n` +
        `- YSR Pension Kanuka (Doorstep doorstep elderly/disabled pension)\n` +
        `- YSR Aarogyasri (Free corporate healthcare up to ₹25 Lakhs)\n` +
        `- Jagananna Vidya Deevena & Vasathi Deevena (College fee reimbursement)\n` +
        `- YSR Cheyutha (Welfare livelihood support for women aged 45-60)\n` +
        `- Pedalandariki Illu (Free house plots & construction grants)\n` +
        `- YSR Sunna Vaddi (Zero interest SHG bank linkage & crop loans)\n\n` +
        `Please ask a question about any of these schemes to view complete details immediately!`;
  }
}

export default app;
