export interface Scheme {
  id: string;
  nameEn: string;
  nameTe: string;
  category: 'farmer' | 'student' | 'women' | 'pension' | 'health' | 'housing' | 'loan';
  icon: string;
  summaryEn: string;
  summaryTe: string;
  benefitsEn: string[];
  benefitsTe: string[];
  eligibilityEn: string[];
  eligibilityTe: string[];
  documentsEn: string[];
  documentsTe: string[];
  amountEn: string;
  amountTe: string;
}

export const AP_SCHEMES: Scheme[] = [
  {
    id: "rythu-bharosa",
    nameEn: "YSR Rythu Bharosa - PM Kisan",
    nameTe: "వైఎస్సార్ రైతు భరోసా - పీఎం కిసాన్",
    category: "farmer",
    icon: "🌾",
    summaryEn: "Financial investment support for farmers, providing assistance for seeds, fertilizers, and crop expenses.",
    summaryTe: "రైతులకు పెట్టుబడి సహాయం అందించే పథకం. విత్తనాలు, ఎరువులు మరియు వ్యవసాయ ఖర్చులకు ఆర్థిక తోడ్పాటు లభిస్తుంది.",
    amountEn: "₹13,500 every year in 3 installments",
    amountTe: "ఏడాదికి ₹13,500 చొప్పున 3 విడతలలో లభిస్తుంది",
    benefitsEn: [
      "₹13,500 yearly financial assistance deposited directly in bank accounts",
      "Free crop insurance cover for major crops",
      "Free borewell drilling services for needy farmers",
      "9 hours of continuous free power supply for agricultural motors"
    ],
    benefitsTe: [
      "ఏడాదికి ₹13,500 నేరుగా మీ బ్యాంక్ ఖాతాలో జమ చేయబడుతుంది",
      "ప్రధాన పంటలకు ఉచిత పంటల బీమా సదుపాయం",
      "అవసరమైన రైతులకు ఉచితంగా బోరుబావులు తవ్వించే సదుపాయం",
      "వ్యవసాయ మోటార్లకు పగలు 9 గంటల నిరంతర ఉచిత విద్యుత్ సరఫరా"
    ],
    eligibilityEn: [
      "Must be a resident farmer of Andhra Pradesh",
      "Landholding farmers (including small, marginal, and tenant farmers)",
      "Tenant farmers belonging to SC, ST, BC, and Minority communities are also eligible"
    ],
    eligibilityTe: [
      "ఆంధ్రప్రదేశ్ నివాసి అయి ఉండి వ్యవసాయం చేసే రైతు అయి ఉండాలి",
      "సొంత భూమి కలిగిన చిన్న, సన్నకారు రైతులు మరియు కౌలు రైతులు",
      "SC, ST, BC మరియు మైనారిటీ సామాజిక వర్గాలకు చెందిన కౌలు రైతులు కూడా అర్హులు"
    ],
    documentsEn: [
      "Aadhaar Card",
      "Pattadar Passbook (Land Ownership document)",
      "Tenant Lease Agreement (C.C.R.C Card) for tenant farmers",
      "Active Bank Account linked with Aadhaar"
    ],
    documentsTe: [
      "ఆధార్ కార్డు",
      "పట్టాదారు పాస్ బుక్ (భూమి యాజమాన్య పత్రాలు)",
      "కౌలు రైతులకు సంబంధించి కౌలు ఒప్పంద పత్రం (C.C.R.C కార్డ్)",
      "ఆధార్‌తో అనుసంధానించబడిన బ్యాంక్ ఖాతా పుస్తకం"
    ]
  },
  {
    id: "amma-vodi",
    nameEn: "Jagananna Amma Vodi",
    nameTe: "జగనన్న అమ్మ ఒడి",
    category: "student",
    icon: "🎓",
    summaryEn: "Financial support directly to mothers of school-going children from Class 1 to 12 to encourage education and reduce dropouts.",
    summaryTe: "బడికి వెళ్లే పిల్లల తల్లులకు ఆర్థిక సహాయం అందించే గొప్ప పథకం. 1 నుండి 12వ తరగతి వరకు చదివే పిల్లల తల్లుల ఖాతాలో జమ అవుతుంది.",
    amountEn: "Postage/Grant of ₹15,000 per year (Colloquially calculated up to current parameters)",
    amountTe: "ఏడాదికి ₹15,000 తల్లుల ఖాతాలో జమ చేయబడుతుంది",
    benefitsEn: [
      "₹15,000 direct bank transfer to the mother's account",
      "Enables mothers to afford school uniforms, books, and educational fees",
      "Applicable for both Government and recognized Private schools"
    ],
    benefitsTe: [
      "తల్లి బ్యాంక్ ఖాతాలో నేరుగా ₹15,000 జమ చేయబడుతుంది",
      "పిల్లల బూట్లు, పుస్తకాలు మరియు స్కూల్ ఫీజుల కొరకు సహాయపడుతుంది",
      "ప్రభుత్వ మరియు గుర్తింపు పొందిన ప్రైవేట్ పాఠశాలల విద్యార్థులందరికీ వర్తిస్తుంది"
    ],
    eligibilityEn: [
      "Resident of Andhra Pradesh",
      "Mother/Guardian of school-going children (Class I to XII)",
      "The student must have a minimum of 75% attendance in school",
      "Household must belong to Below Poverty Line (BPL) with valid Ration/Rice Card"
    ],
    eligibilityTe: [
      "ఆంధ్రప్రదేశ్ నివాసి అయి ఉండాలి",
      "1 నుండి 12వ తరగతి చదువుతున్న పిల్లల తల్లులు లేదా సంరక్షకులు",
      "విద్యార్థి పాఠశాలలో కనీసం 75 శాతం హాజరు కలిగి ఉండాలి",
      "కుటుంబం దారిద్ర్యరేఖకు దిగువున ఉండి, బియ్యం కార్డు (రైస్ కార్డ్) కలిగి ఉండాలి"
    ],
    documentsEn: [
      "Aadhaar Card of Mother & Student",
      "School Admission Receipt & Study Certificate with UID/Attendance status",
      "White Ration Card / Rice Card",
      "Mother's Bank Account details linked with Aadhaar"
    ],
    documentsTe: [
      "తల్లి మరియు విద్యార్థి ఇద్దరి ఆధార్ కార్డులు",
      "స్కూల్ స్టడీ సర్టిఫికేట్ మరియు అడ్మిషన్ రసీదు",
      "తెల్ల రేషన్ కార్డు లేదా రైస్ కార్డు",
      "ఆధార్‌తో లింక్ చేయబడిన తల్లి బ్యాంక్ సేవింగ్స్ ఖాతా వివరాలు"
    ]
  },
  {
    id: "pension-kanuka",
    nameEn: "YSR Pension Kanuka",
    nameTe: "వైఎస్సార్ పెన్షన్ కానుక",
    category: "pension",
    icon: "👴",
    summaryEn: "Welfare scheme to provide direct doorstep pension delivery to elderly, disabled, widows, and weaker sections of society.",
    summaryTe: "వృద్ధులు, వికలాంగులు, వితంతువులు మరియు నిరుపేదలకు ప్రతి నెలా 1వ తేదీన ఇంటికే వచ్చి పెన్షన్ అందించే పంపిణీ పథకం.",
    amountEn: "₹3,000 per month (OAP, Widows, Weavers) up to ₹10,000 for Disabled",
    amountTe: "నెలకు ₹3,000 (వృద్ధాప్య, వితంతు, చేనేత పెన్షన్లు) మరియు దివ్యాంగులకు గరిష్టంగా ₹10,000 వరకు",
    benefitsEn: [
      "Doorstep delivery of pension cash on the 1st of every month by government volunteers",
      "Financial security for vulnerable population segments without visiting banks",
      "Regular monthly indexation to cover rising living costs"
    ],
    benefitsTe: [
      "ప్రతి నెలా 1వ తేదీన ఉదయమే మీ ఇంటి వద్దకే వచ్చి వాలంటీర్ చేతుల మీదుగా పెన్షన్ అందజేత",
      "బ్యాంకుల చుట్టూ తిరగాల్సిన అవసరం లేకుండా వృద్ధులకు పూర్తి భద్రత",
      "గౌరవప్రదంగా జీవించడానికి భరోసా కల్పిస్తుంది"
    ],
    eligibilityEn: [
      "Minimum age for Old Age Pension is 60 years",
      "Widows, Weavers, Toddy Tappers, Fishermen, Single Women, and Artisians have respective criteria",
      "Disabled persons must have a minimum of 40% disability certified by SADAREM",
      "Must hold a White Ration/Rice Card"
    ],
    eligibilityTe: [
      "వృద్ధాప్య పెన్షన్ కొరకు కనీస వయస్సు 60 సంవత్సరాలు నిండి ఉండాలి",
      "వితంతువులు, చేనేత కార్మికులు, కల్లుగీత కార్మికులు, ఒంటరి మహిళలకు తగిన ధృవీకరణలు ఉండాలి",
      "వికలాంగులకు సదరమ్ (SADAREM) సర్టిఫికేట్ ద్వారా 40% కన్నా ఎక్కువ వైకల్యం ఉండాలి",
      "కుటుంబం వైట్ రేషన్ కార్డు లేదా రైస్ కార్డు కలిగి ఉండాలి"
    ],
    documentsEn: [
      "Aadhaar Card",
      "Age Proof certificate (Voter ID, Birth certificate, or Matriculation memo)",
      "White Ration/Rice Card",
      "Disability Certificate (SADAREM) for disabled pension category",
      "Death certificate of husband (for Widow Pension)"
    ],
    documentsTe: [
      "ఆధార్ కార్డు",
      "వయస్సు ధృవీకరణ పత్రాలు (ఓటర్ కార్డ్, బర్త్ సర్టిఫికేట్ లేదా స్కూల్ టిసి)",
      "వైట్ రేషన్ కార్డు లేదా రైస్ కార్డు",
      "దివ్యాంగులకు సంబంధించి వైకల్య ధృవీకరణ పత్రం (SADAREM సర్టిఫికేట్)",
      "భర్త మరణ ధృవీకరణ పత్రం (వితంతు పెన్షన్ కొరకు)"
    ]
  },
  {
    id: "aarogyasri",
    nameEn: "YSR Aarogyasri Health Scheme",
    nameTe: "వైఎస్సార్ ఆరోగ్యశ్రీ హెల్త్ స్కీమ్",
    category: "health",
    icon: "🏥",
    summaryEn: "Universal health insurance providing completely free corporate healthcare treatment for underprivilidged families for medical surgeries.",
    summaryTe: "పేద మరియు మధ్యతరగతి కుటుంబాలకు కార్పొరేట్ ఆసుపత్రులలో ఉచితంగా వైద్యం అందించే ప్రతిష్ఠాత్మక ఆరోగ్య బీమా పథకం.",
    amountEn: "Free medical treatment limit up to ₹25 Lakhs per family",
    amountTe: "కుటుంబానికి ఏడాదికి గరిష్టంగా ₹25 లక్షల వరకు ఉచిత వైద్య సదుపాయం",
    benefitsEn: [
      "Cashless medical treatment for 3,255 surgical and medical therapies",
      "Covers specialized cardiatric, kidney, cancer, brain, and major emergency treatments",
      "Free medical post-treatment medicines, follow-up, and travel transportation allowance",
      "Aarogya Mitras present at hospital helpdesks to assist illiterate citizens"
    ],
    benefitsTe: [
      "3,255 రకాల వివిధ శస్త్రచికిత్సలు మరియు జబ్బులకు పూర్తిగా ఉచిత క్యాష్ లెస్ వైద్యం",
      "గుండె జబ్బులు, కిడ్నీల వ్యాధులు, క్యాన్సర్, బ్రెయిన్ సర్జరీల వంటి పెద్ద జబ్బులకు ఉచిత సేవలు",
      "చికిత్స తర్వాత ఉచిత మందులు, ఫాలో-అప్ సలహాలు మరియు ప్రయాణ ఖర్చులకు సహాయం",
      "ఆసుపత్రులలో సహాయం చేయడానికి హెల్ప్ డెస్కులలో ఉచిత 'ఆరోగ్య మిత్ర'ల సేవలు"
    ],
    eligibilityEn: [
      "All families holding a White Rice Card of Andhra Pradesh",
      "Annual family income below ₹5 Lakhs",
      "Landholding below 12 acres of wet land or 35 acres of dry land"
    ],
    eligibilityTe: [
      "ఆంధ్రప్రదేశ్ నివాసి అయి ఉండి వ్యవసాయం చేసే రైతు అయి ఉండాలి",
      "వార్షిక ఆదాయం ₹5 లక్షల లోపు కలిగి ఉన్న కుటుంబాలు",
      "వ్యవసాయ భూమి 12 ఎకరాల మాగాణి లేదా 35 ఎకరాల మెట్ట లోపు ఉండాలి"
    ],
    documentsEn: [
      "Aadhaar Card",
      "Rice Card / Ration Card",
      "YSR Aarogyasri Card (Optional, Aadhaar serves as main ID)"
    ],
    documentsTe: [
      "ఆధార్ కార్డు",
      "రైస్ కార్డు లేదా తెల్ల రేషన్ కార్డు",
      "వైఎస్సార్ ఆరోగ్యశ్రీ హెల్త్ కార్డు (ఒకవేళ లేకుంటే ఆధార్ కార్డు సరిపోతుంది)"
    ]
  },
  {
    id: "vidya-deevena",
    nameEn: "Jagananna Vidya Deevena & Vasathi Deevena",
    nameTe: "జగనన్న విద్యా దీవెన & వసతి దీవెన",
    category: "student",
    icon: "📚",
    summaryEn: "Full college fee reimbursement along with boarding and lodging financial support for students pursuing higher professional courses.",
    summaryTe: "ఉన్నత చదువులు (బీటెక్, డిగ్రీ, పీజీ) చదివే విద్యార్థుల పూర్తి కాలేజీ ఫీజు రీయింబర్స్మెంట్ మరియు వారి వసతి, భోజన ఖర్చులకు ఆర్థిక సాయం.",
    amountEn: "Full Fee reimbursement + ₹20,000 yearly boarding support",
    amountTe: "పూర్తి కాలేజీ ఫీజు రీయింబర్స్మెంట్ + ఏడాదికి ₹20,000 వసతి భోజన సదుపాయ సాయం",
    benefitsEn: [
      "Full tuition fee reimbursement (RTF) credited straight to college accounts to secure education",
      "Vasathi Deevena credits ₹20,000 per year directly to mother's account in two installments for mess & hostel fees",
      "Ensures low-income students can pursue quality technical, professional, and postgraduate streams"
    ],
    benefitsTe: [
      "కళాశాల పూర్తి ట్యూషన్ ఫీజు రీయింబర్స్మెంట్ (ఫీజు రద్దు) నేరుగా చెల్లింపు జరుగుతుంది",
      "వసతి దీవెన కింద ప్రతి నెలా వసతి ఖర్చుల కొరకు తల్లి ఖాతాలో ఏడాదికి ₹20,000 రెండు విడతలలో జమ",
      "నిరుపేద విద్యార్థులు కూడా పెద్ద టెక్నికల్, ఇంజినీరింగ్, మేనేజ్మెంట్ కోర్సులు చదవడానికి గొప్ప భరోసా"
    ],
    eligibilityEn: [
      "Students pursuing ITI, Polytechnic, Degree, Engineering, Medicine, and Post-Graduation (PG)",
      "Annual family income under ₹2.5 Lakhs",
      "Must have attendance above 75% in college"
    ],
    eligibilityTe: [
      "ITI, పాలిటెక్నిక్, డిగ్రీ, ఇంజినీరింగ్, మెడిసిన్, లేదా పీజీ కోర్సులు చదువుతున్న విద్యార్థులు",
      "కుటుంబ వార్షిక ఆదాయం ₹2.5 లక్షల లోపు ఉండాలి",
      "కళాశాలలో కనీసం 75 శాతం హాజరు కలిగి ఉండాలి"
    ],
    documentsEn: [
      "Aadhaar Card of Mother & Student",
      "College Admission Allotment Order & College ID Card",
      "Income Certificate issued by Secretariat/MRO",
      "Caste Certificate (for SC/ST/BC/Minority students)",
      "Mother's Rice Card"
    ],
    documentsTe: [
      "తల్లి మరియు విద్యార్థి ఇద్దరి ఆధార్ కార్డులు",
      "కళాశాల అడ్మిషన్ ఆర్డర్ రసీదు మరియు ఐడి కార్డు",
      "సచివాలయం లేదా MRO జారీ చేసిన ఆదాయ ధృవీకరణ పత్రం",
      "కులానికి సంబంధించిన ధృవీకరణ పత్రం (SC, ST, BC, మైనారిటీ విద్యార్థులకు)",
      "తల్లి తెల్ల రేషన్ కార్డు/రైస్ కార్డు వివరాలు"
    ]
  },
  {
    id: "cheyutha",
    nameEn: "YSR Cheyutha",
    nameTe: "వైఎస్సార్ చేయూత",
    category: "women",
    icon: "👩",
    summaryEn: "Welfare scheme addressing livelihood opportunities for middle-aged women, giving direct financial support to start micro-businesses.",
    summaryTe: "మధ్య వయస్సు కలిగిన మహిళలకు ఉపాధి అవకాశాలు కల్పించే పథకం. చిన్న వ్యాపారాలు (కిరాణా, పాల వ్యాపారం) ప్రారంభించుకోవడానికి ఆర్థిక సహాయం పొందుతారు.",
    amountEn: "₹75,000 over 4 years (₹18,750 every year)",
    amountTe: "4 ఏళ్లలో మొత్తం ₹75,000 (ప్రతి సంవత్సరం ₹18,750 చొప్పున లభిస్తుంది)",
    benefitsEn: [
      "₹18,750 yearly grant for four years, totaling ₹75,000",
      "Free business partnership advice from companies like Amul, ITC, P&G, and Reliance to set up shops",
      "Complete freedom to use the money for family livelihoods or cattle purchasing"
    ],
    benefitsTe: [
      "ఏడాదికి ₹18,750 చొప్పున వరుసగా 4 సంవత్సరాలు పాటు మొత్తం ₹75,000 ఉచిత సాయం",
      "అముల్, ఐటీసీ, పి అండ్ జి, రిలయన్స్ వంటి పెద్ద సంస్థలతో వ్యాపారాలు చేసుకునే ఉచిత సలహాలు, శిక్షణ",
      "లభించిన డబ్బును కుటుంబ అవసరాలు, గొర్రెలు, మేకలు, గేదెల కొనుగోలు కొరకు లేదా దుకాణానికి వాడుకోవచ్చు"
    ],
    eligibilityEn: [
      "Only Women aged between 45 and 60 years",
      "Must belong to SC, ST, BC, or Minority communities",
      "Must hold a BPL Rice/Ration Card of AP"
    ],
    eligibilityTe: [
      "45 నుండి 60 సంవత్సరాల మధ్య వయస్సు గల మహిళలు మాత్రమే అర్హులు",
      "తప్పనిసరిగా SC, ST, BC లేదా మైనారిటీ సామాజిక వర్గాలకు చెందిన మహిళ అయి ఉండాలి",
      "ఆంధ్రప్రదేశ్ ప్రభుత్వం జారీ చేసిన తెల్ల రేషన్ కార్డు కలిగి ఉండాలి"
    ],
    documentsEn: [
      "Aadhaar Card",
      "Caste Certificate issued by Secretariat",
      "Age Proof certificate (Aadhaar or Voter card showing date of birth)",
      "BPL Rice Card",
      "Bank Account Passbook (with Aadhaar linked)"
    ],
    documentsTe: [
      "ఆధార్ కార్డు",
      "కుటుంబ సచివాలయం జారీ చేసిన కుల ధృవీకరణ పత్రం",
      "వయస్సు ధృవీకరణ పత్రం (పుట్టిన తేదీ గల ఆధార్ లేదా ఓటర్ కార్డు)",
      "తెల్ల రేషన్/రైస్ కార్డు",
      "బ్యాంకు ఖాతా పుస్తకం నకలు (ఆధార్ అనుసంధానించబడినది)"
    ]
  },
  {
    id: "pedalandariki-illu",
    nameEn: "Pedalandariki Illu (Housing for All)",
    nameTe: "పేదలందరికీ ఇల్లు",
    category: "housing",
    icon: "🏠",
    summaryEn: "Free registration of housing plots in the name of women beneficiaries, accompanied by financial construction assistance.",
    summaryTe: "పేద మహిళల పేరిట ప్రభుత్వం ఉచితంగా ఇళ్ల స్థలాలను రిజిస్ట్రేషన్ చేసి, ఇల్లు కట్టుకోవడానికి ఉచితంగా ఇసుక మరియు నిధులు సమకూరుస్తుంది.",
    amountEn: "Free House Plot + ₹1.8 Lakhs structure construction grant",
    amountTe: "ఉచిత ఇళ్ల స్థలం రిజిస్ట్రేషన్ + ఇల్లు కట్టుకోవడానికి ₹1.8 లక్షల ఉచిత సాయం",
    benefitsEn: [
      "Ownership registration of house site absolutely free, registered strictly under the female head of house",
      "₹1.80 Lakhs cash grant for structural construction material costs",
      "Free high-quality building materials, including free transport of construction sand"
    ],
    benefitsTe: [
      "ఇంటి ఆడపడుచు పేరిట సంపూర్ణ యాజమాన్య హక్కులతో ఉచితంగా ఇంటి స్థలం రిజిస్ట్రేషన్",
      "ఇల్లు నిర్మించుకోవడానికి ₹1,80,000 నగదు గ్రాంట్ సాయం",
      "ఉచిత ఇసుక మరియు రాయితీ ధరలకే సిమెంట్, ఇనుము వంటి నాణ్యమైన నిర్మాణ సామగ్రి సదుపాయం"
    ],
    eligibilityEn: [
      "Must not own any land or concrete home elsewhere in Andhra Pradesh",
      "Must possess a valid White Rice/Ration Card",
      "Benefit is provided exclusively to women representing BPL households"
    ],
    eligibilityTe: [
      "ఆంధ్రప్రదేశ్ రాష్ట్రంలో ఎక్కడా సొంత ఇల్లు లేదా ఇతర గృహ నివాస స్థలం ఉండకూడదు",
      "కనీసం తెల్ల బియ్యం కార్డు (రైస్ కార్డ్) కలిగి ఉండాలి",
      "దారిద్ర్య రేఖకు దిగువన గల కుటుంబాల్లోని మహిళా లబ్ధిదారులకు మాత్రమే ఇవ్వబడుతుంది"
    ],
    documentsEn: [
      "Aadhaar Card of Applicant (Woman)",
      "Secretariat Ward/Village volunteer verification status Certificate",
      "Rice Card / Ration Card",
      "Income proof from Grama Sachivalayam"
    ],
    documentsTe: [
      "లబ్ధిదారురాలైన మహిళ ఆధార్ కార్డు",
      "గ్రామ/వార్డు సచివాలయ వాలంటీర్ ధృవీకరణ పత్రం",
      "రైస్ కార్డు లేదా రేషన్ కార్డు",
      "గ్రామ సచివాలయం నుండి పొందిన ఆదాయ ధృవీకరణ పత్రం"
    ]
  },
  {
    id: "sunna-vaddi",
    nameEn: "YSR Sunna Vaddi (Zero Interest Loans)",
    nameTe: "వైఎస్సార్ సున్నా వడ్డీ పథకం",
    category: "loan",
    icon: "💰",
    summaryEn: "Interest subvention scheme for women Self-Help Groups (DWCRA) and small farmers. Government pays the bank interest directly.",
    summaryTe: "మహిళా పొదుపు సంఘాలు (DWCRA) మరియు చిన్న రైతులకు వడ్డీ భారాన్ని తగ్గించే పథకం. సకాలంలో రుణాలు చెల్లిస్తే వడ్డీ మొత్తాన్ని ప్రభుత్వమే భరిస్తుంది.",
    amountEn: "100% interest refund on bank loans up to ₹3 Lakhs",
    amountTe: "గరిష్టంగా ₹3 లక్షల వరకు బ్యాంక్ రుణాలపై 100 శాతం వడ్డీ తిరిగి చెల్లింపు",
    benefitsEn: [
      "Eliminates interest burden on outstanding bank linkage loans for Self-Help groups (SHG)",
      "Farmers receive zero-interest crop loans up to ₹1 Lakh when repaid within 1 year",
      "Empowers village women to scale cooperative businesses and achieve financial freedom"
    ],
    benefitsTe: [
      "డ్వాక్రా (SHG) మహిళా పొదుపు సంఘాల బ్యాంక్ రుణాలపై నికర వడ్డీ భారం పూర్తిగా సున్నా",
      "పంట రుణాన్ని ఒక్క సంవత్సరంలో చెల్లించే రైతులకు ₹1 లక్ష వరకు వడ్డీ రహిత రుణాలు",
      "గ్రామీణ మహిళలు సొంతంగా చిన్న కుటీర పరిశ్రమలు ఏర్పాటు చేసుకుని ఎదగడానికి ప్రోత్సాహం"
    ],
    eligibilityEn: [
      "Self-Help Groups (SHGs) under SERP/MEPMA registered in Andhra Pradesh",
      "The SHG must have active outstanding bank linkage loans",
      "The repayment history must be regular without default delays",
      "For Farmers: Small/marginal crop loan repaid within 12 months"
    ],
    eligibilityTe: [
      "ఆంధ్రప్రదేశ్ రాష్ట్ర గ్రామీణ/పట్టణ పేదరిక నిర్మూలన సంస్థ (SERP/MEPMA) పరిధిలో రిజిస్టర్ అయిన పొదుపు సంఘాలు",
      "బ్యాంక్ నుంచి పొందిన రుణం చలామణిలో ఉండాలి",
      "బ్యాంక్ వాయిదాలను సకాలంలో నెలవారీగా డిఫాల్ట్ లేకుండా క్రమం తప్పకుండా చెల్లిస్తూ ఉండాలి",
      "రైతులకు: ఒక సంవత్సర కాలంలోగా ₹1 లక్ష లోపు పంట రుణాన్ని సకాలంలో చెల్లించి ఉండాలి"
    ],
    documentsEn: [
      "SHG Bank Linkage Passbook detailing dues",
      "Loan Account Statement from Bank Branch",
      "Aadhaar details of SHG members / Farmer Aadhaar",
      "Crop Loan receipt for farmers"
    ],
    documentsTe: [
      "పొదుపు సంఘం (SHG) బ్యాంకు లింకేజీ రుణ పుస్తకం నకలు",
      "సంబంధిత బ్యాంకు బ్రాంచ్ లేదా సొసైటీ నుండి రుణ చెల్లింపు స్టేట్‌మెంట్",
      "సంఘం సభ్యులందరి ఆధార్ కార్డు వివరాలు / రైతు ఆధార్",
      "రైతులకు పంట రుణ రశీదు పత్రాలు"
    ]
  }
];

export const FAQ_ITEMS = [
  {
    qEn: "How do I check my eligibility for any scheme?",
    qTe: "నేను ఏదైనా పథకానికి అర్హుడినో కాదో ఎలా తెలుసుకోవాలి?",
    aEn: "You can use Praja Mitra's category buttons on the home screen or ask our AI Assistant! Alternatively, your Grama Ward Sachivalayam (Village Secretariat) has volunteers who can verify your eligibility directly using your Aadhaar or Rice Card.",
    aTe: "మీరు హోమ్ స్క్రీన్‌లోని కేటగిరీ బటన్‌లను ఉపయోగించవచ్చు లేదా మా AI అసిస్టెంట్‌ని అడగవచ్చు! మీ ఆధార్ లేదా రైస్ కార్డ్ నంబర్ ద్వారా గ్రామ/వార్డు సచివాలయంలో నేరుగా మీ అర్హతను వాలంటీర్ ద్వారా ఉచితంగా సరిచూసుకోవచ్చు."
  },
  {
    qEn: "Who delivers the monthly pension under YSR Pension Kanuka?",
    qTe: "వైఎస్సార్ పెన్షన్ కానుక కింద నెలవారీ పెన్షన్‌ను ఎవరు అందజేస్తారు?",
    aEn: "Your local designated Village/Ward Secretariat volunteer will deliver the pension cash directly to your doorstep on the 1st morning of every month using biometric authentication.",
    aTe: "మీ స్థానిక గ్రామ/వార్డు సచివాలయ వాలంటీర్ ప్రతి నెలా 1వ తేదీ ఉదయాన్నే నేరుగా మీ ఇంటి వద్దకే వచ్చి బయోమెట్రిక్ వేలిముద్ర ద్వారా పెన్షన్ నగదును అందజేస్తారు."
  },
  {
    qEn: "My children are in a government school, are they eligible for Amma Vodi?",
    qTe: "నా పిల్లలు ప్రభుత్వ పాఠశాలలో చదువుతున్నారు, వారికి అమ్మ ఒడి వర్తిస్తుందా?",
    aEn: "Yes! Children studying in government schools, government-aided junior colleges, and recognized private institutions are fully eligible, provided the family holds a Rice Card and the children maintain at least 75% attendance.",
    aTe: "అవును! ప్రభుత్వ పాఠశాలలు, జూనియర్ కాలేజీలు, ప్రైవేట్ బడులలో చదువుతున్న వారందరికీ వర్తిస్తుంది. కుటుంబానికి రైస్ కార్డు ఉండాలి మరియు విద్యార్థి కనీసం 75 శాతం హాజరు కలిగి ఉండాలి."
  },
  {
    qEn: "Is there any charge for Aarogyasri medical treatment?",
    qTe: "ఆరోగ్యశ్రీ వైద్య చికిత్సకు ఏమైనా డబ్బులు చెల్లించాలా?",
    aEn: "No, the treatment under YSR Aarogyasri is 100% cashless and free. You do not have to pay a single Rupee at any empanelled hospital for listed treatments up to ₹25 Lakhs per family.",
    aTe: "లేదు, వైఎస్సార్ ఆరోగ్యశ్రీ కింద చికిత్స 100% ఉచితం మరియు క్యాష్‌లెస్‌గా అందించబడుతుంది. ఆసుపత్రిలో ఏ ఒక్క రూపాయి కూడా చెల్లించాల్సిన పనిలేదు."
  }
];

export const EMERGENCY_HELPLINES = [
  { nameEn: "Chief Minister Grievance (AP 1902)", nameTe: "ముఖ్యమంత్రి గ్రీవెన్స్ హెల్ప్ లైన్ (1902)", number: "1902", purposeEn: "Register grievances, track application issues and volunteer complaints.", purposeTe: "పథకాల ఫిర్యాదులు, వాలంటీర్ సేవలపై గ్రీవెన్స్ నమోదు మరియు ట్రాకింగ్." },
  { nameEn: "YSR Aarogyasri Health Helpline (104)", nameTe: "ఆరోగ్యశ్రీ ఉచిత వైద్య సహాయం (104)", number: "104", purposeEn: "Free medical helpdesk guidance, Aarogyasri support, and hospital navigation.", purposeTe: "ఆరోగ్యశ్రీ ఉచిత చికిత్స వివరాలు మరియు అత్యవసర వైద్య సలహాలు." },
  { nameEn: "Farmer Input Services / Rythu Bharosa (155251)", nameTe: "రైతు భరోసా సహాయ కేంద్రం (155251)", number: "155251", purposeEn: "Agricultural advice, seeds complaints, PM Kisan support, and crop health guides.", purposeTe: "వ్యవసాయ సలహాలు, రసాయనాల కొరత, విత్తనాలు మరియు రైతు బీమా సాయం." },
  { nameEn: "Pensions & Secretariat Support", nameTe: "సచివాలయ సేవలు & వాలంటీర్ల హెల్ప్ లైన్", number: "1100", purposeEn: "Inquire about MeeSeva services, certificate status, and pension delays.", purposeTe: "మీసేవ సేవలు, కులం/ఆదాయ ధృవీకరణ పత్రాలు మరియు పెన్షన్ వివరాలు." }
];

export const DAILY_UPDATES = [
  {
    date: "June 20, 2026",
    titleEn: "🌾 Farmer Insurance Registry Extended",
    titleTe: "🌾 ఉచిత పంటల బీమా గడువు పొడిగింపు",
    descEn: "Andhra Pradesh Government extends registration deadline for YSR Free Crop Insurance for Kharif crops until June 30. Register today at village Rythu Bharosa Kendras (RBKs) without charges.",
    descTe: "ఖరీఫ్ పంటలకు సంబంధించి వైఎస్సార్ ఉచిత పంటల బీమా ఉచిత నమోదు గడువును ప్రభుత్వం జూన్ 30 వరకు పొడిగించింది. రైతులు తమ గ్రామ రైతు భరోసా కేంద్రాల్లో (RBK) నమోదు చేసుకోవచ్చు."
  },
  {
    date: "June 19, 2026",
    titleEn: "🎓 Vidya Deevena Installment Credits Released",
    titleTe: "🎓 జగనన్న విద్యా దీవెన ఫీజుల విడుదల",
    descEn: "Complete tuition fee reimbursement of ₹680 Crores directly transferred to college accounts of 10.2 Lakh college students pursuing B.Tech, Degree and PG courses across the state today.",
    descTe: "రాష్ట్రవ్యాప్తంగా చదువుతున్న 10.2 లక్షల బిటెక్, డిగ్రీ విద్యార్థుల పూర్తి కళాశాల ఫీజుల రీయింబర్స్మెంట్ నిధులు ₹680 కోట్లను ముఖ్యమంత్రి గారు నేరుగా కాలేజీల ఖాతాలలో జమ చేశారు."
  },
  {
    date: "June 18, 2026",
    titleEn: "👵 Doorstep Pension Kanuka Payments Begin Tomorrow",
    titleTe: "👵 రేపటి నుండే ఇంటి వద్దకే పెన్షన్ల పంపిణీ",
    descEn: "Village ward volunteers will begin doorstep biometric pension credit delivery from 5:00 AM tomorrow, June 19th. All eligible elderly, disabled, and widows should keep biometric verification ready.",
    descTe: "రేపు ఉదయం 5 గంటల నుండే గ్రామ వార్డు వాలంటీర్లు ఇంటి వద్దకే వచ్చి పెన్షన్ సాయం పంపిణీ చేయనున్నారు. లబ్ధిదారులు వేలిముద్ర బయోమెట్రిక్ సిద్ధంగా ఉంచుకోవాలి."
  },
  {
    date: "June 17, 2026",
    titleEn: "👩 Women SHG Sunna Vaddi Funds Refund Started",
    titleTe: "👩 డ్వాక్రా మహిళల సున్నా వడ్డీ గ్రాంట్ జమ",
    descEn: "Andhra Pradesh state capital department initiates interest-refund of ₹1,200 Crores directly into savings accounts of rural and urban self-help groups (SHG) showing zero-arrears history.",
    descTe: "సకాలంలో రుణాలు చెల్లించిన గ్రామీణ మరియు పట్టణ డ్వాక్రా మహిళా సంఘాల పొదుపు ఖాతాలలో ₹1,200 కోట్ల వడ్డీ రాయితీ నిధులను ప్రభుత్వం జమ చేయడం ప్రారంభించింది."
  }
];
