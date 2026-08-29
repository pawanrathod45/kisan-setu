/**
 * 🌾 Kisan Setu — Official Maharashtra Government Farmer Schemes Seeder
 * Data strictly sourced from Official MahaDBT Portal (https://mahadbt.maharashtra.gov.in)
 * and Department of Agriculture, Government of Maharashtra.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Scheme = require("./src/models/Scheme");

const verifiedSchemes = [
  {
    schemeId: "MAHA-PMKSY-MI-01",
    name: "PMKSY – Per Drop More Crop (Micro-Irrigation)",
    nameHi: "प्रधानमंत्री कृषि सिंचाई योजना – प्रति बूंद अधिक फसल (सूक्ष्म सिंचाई)",
    nameMr: "प्रधानमंत्री कृषी सिंचन योजना – प्रति थेंब अधिक पीक (सूक्ष्म सिंचन)",
    department: "Department of Agriculture, Govt. of Maharashtra & MoA&FW, Govt. of India",
    category: "irrigation",
    description: "Financial assistance for installation of Drip Irrigation (ठिबक सिंचन) and Sprinkler Irrigation (तुषार सिंचन) systems to optimize water use efficiency, improve crop yield, and reduce input costs.",
    descriptionHi: "पानी के कुशल उपयोग और फसल उत्पादन बढ़ाने के लिए ड्रिप (टपक) और स्प्रिंकलर (फव्वारा) सिंचाई प्रणाली पर सब्सिडी।",
    descriptionMr: "पाण्याचा कार्यक्षम वापर आणि पीक उत्पादन वाढवण्यासाठी ठिबक सिंचन व तुषार सिंचन संचासाठी थेट अनुदान.",
    eligibility: {
      farmerCategories: ["all", "small", "marginal", "sc", "st", "women"],
      maxLandHectares: 5,
      minLandHectares: 0.1,
      irrigationRequired: true,
      applicableCrops: ["all", "Sugarcane", "Cotton", "Vegetables", "Fruits", "Pomegranate", "Banana", "Wheat", "Soybean", "Onion"],
      applicableDistricts: [],
      residencyRequired: "Maharashtra",
      aadhaarRequired: true,
      bankAccountRequired: true,
      landDocumentsRequired: true,
      additionalCriteria: [
        "Farmer must possess 7/12 extract and 8-A holding records.",
        "Assured source of irrigation (well, borewell, canal, farm pond) on the farmland.",
        "Beneficiary must not have received micro-irrigation subsidy for the same survey number in the last 7 years."
      ],
      additionalCriteriaHi: [
        "किसान के पास 7/12 और 8-अ खाता उतारा होना चाहिए।",
        "खेत पर सुनिश्चित जल स्रोत (कुआं, बोरवेल, नहर, शेततले) उपलब्ध होना चाहिए।",
        "पिछले 7 वर्षों में उसी जमीन पर सूक्ष्म सिंचाई सब्सिडी नहीं ली होनी चाहिए।"
      ],
      additionalCriteriaMr: [
        "शेतकऱ्याकडे ७/१२ आणि ८-अ उतारा असणे आवश्यक.",
        "शेतावर पाण्याचा शाश्वत स्त्रोत (विहीर, कूपनलिका, कालवा, शेततळे) उपलब्ध असावा.",
        "मागील ७ वर्षात संबंधित गट क्रमांकावर सूक्ष्म सिंचनाचा लाभ घेतलेला नसावा."
      ]
    },
    benefits: {
      subsidyPercentage: "55% for Small/Marginal Farmers; 45% for Other Farmers + 25% Top-Up Subsidy by Govt. of Maharashtra (Total up to 75-80%)",
      maxSubsidyAmount: "As per unit cost norms prescribed in Govt. guidelines (up to ₹1,00,000/ha)",
      benefitType: "subsidy",
      benefitDescription: "Direct Benefit Transfer (DBT) directly into Aadhaar-linked bank account upon verification of installed ISI-marked micro-irrigation system.",
      benefitDescriptionHi: "आईएसआई मार्क उपकरण स्थापना सत्यापन के बाद सीधे आधार लिंक बैंक खाते में डीबीटी सब्सिडी।",
      benefitDescriptionMr: "आयएसआय प्रमाणित संच बसविल्याच्या पडताळणीनंतर थेट बँक खात्यात डीबीटी अनुदान जमा."
    },
    requiredDocuments: [
      "7/12 Extract (7/12 उतारा)",
      "8-A Land Holding Extract (8-अ नोंद)",
      "Aadhaar Card (आधार कार्ड)",
      "Bank Passbook copy with IFSC (बँक पासबुक)",
      "Water Availability Certificate / Electricity Bill of Pump (पाणी उपलब्धतेचा पुरावा / वीज बिल)",
      "Quotation / Bill from Empanelled Micro-Irrigation Dealer (मान्यताप्राप्त विक्रेत्याचे कोटेशन)"
    ],
    officialLink: "https://mahadbt.maharashtra.gov.in",
    sourceGrLink: "https://krishi.maharashtra.gov.in",
    helplineNumber: "022-61316429",
    applicationStatus: "open",
    lastVerifiedDate: new Date("2025-01-15"),
    verifiedSource: "MahaDBT Agriculture Portal & Dept. of Agriculture Maharashtra",
    isActive: true
  },
  {
    schemeId: "MAHA-SMAM-02",
    name: "Sub-Mission on Agricultural Mechanization (SMAM)",
    nameHi: "कृषि यंत्रीकरण उप-मिशन (SMAM)",
    nameMr: "कृषी यांत्रिकीकरण उप-अभियान (SMAM)",
    department: "Department of Agriculture, Govt. of Maharashtra",
    category: "mechanization",
    description: "Financial subsidy on procurement of Tractors, Power Tillers, Rotavators, Seed Drills, Harvesters, Threshers, and specialized farm implements to reduce human drudgery and increase farm productivity.",
    descriptionHi: "ट्रैक्टर, पावर टिलर, रोटावेटर, कल्टीवेटर और कटाई उपकरणों की खरीद पर आकर्षक सब्सिडी।",
    descriptionMr: "ट्रॅक्टर, पॉवर टिलर, रोटाव्हेटर, पेरणी यंत्र आणि शेती औजारांच्या खरेदीवर भरीव शासकीय अनुदान.",
    eligibility: {
      farmerCategories: ["all", "sc", "st", "women", "small", "marginal"],
      maxLandHectares: null,
      minLandHectares: 0.2,
      irrigationRequired: false,
      applicableCrops: ["all"],
      applicableDistricts: [],
      residencyRequired: "Maharashtra",
      aadhaarRequired: true,
      bankAccountRequired: true,
      landDocumentsRequired: true,
      additionalCriteria: [
        "Farmer must be an individual landholder in Maharashtra.",
        "One tractor subsidy per family once in 10 years.",
        "Equipment must be purchased only after pre-sanction lottery selection on MahaDBT."
      ],
      additionalCriteriaHi: [
        "किसान महाराष्ट्र का भूमिधारक होना चाहिए।",
        "एक परिवार को 10 वर्ष में केवल एक बार ट्रैक्टर सब्सिडी अनुज्ञेय।",
        "महाडीबीटी पूर्व-संमति मिलने के बाद ही मान्यता प्राप्त विक्रेता से खरीद करें।"
      ],
      additionalCriteriaMr: [
        "शेतकरी महाराष्ट्रातील खातेदार असावा.",
        "कुटुंबातील एकाच व्यक्तीला १० वर्षांतून एकदा ट्रॅक्टर अनुदानाचा लाभ.",
        "महाडीबीटीवर पूर्वसंमती पत्र मिळाल्यानंतरच अधिकृत विक्रेत्याकडून खरेदी आवश्यक."
      ]
    },
    benefits: {
      subsidyPercentage: "40% to 50% depending on farmer category (50% for SC/ST/Women/Small farmers, 40% for General)",
      maxSubsidyAmount: "Up to ₹1,25,000 for Tractors; up to ₹50,000 for Rotavators & Power Tillers",
      benefitType: "subsidy",
      benefitDescription: "Subsidy credited directly into beneficiary's bank account via DBT post physical verification and invoice upload.",
      benefitDescriptionHi: "उपकरण सत्यापन और बिल अपलोड के बाद डीबीटी द्वारा बैंक खाते में राशि हस्तांतरित।",
      benefitDescriptionMr: "उपकरण तपासणी व बिल पडताळणीनंतर थेट बँक खात्यात अनुदान वर्ग."
    },
    requiredDocuments: [
      "7/12 & 8-A Extract (७/१२ आणि ८-अ उतारा)",
      "Aadhaar Card (आधार कार्ड)",
      "Caste Certificate (for SC/ST categories) (जातीचे प्रमाणपत्र)",
      "Bank Account details / Cancelled Cheque (बँक तपशील)",
      "Quotation of machinery from registered dealer (कोटेशन)"
    ],
    officialLink: "https://mahadbt.maharashtra.gov.in",
    sourceGrLink: "https://krishi.maharashtra.gov.in",
    helplineNumber: "022-61316429",
    applicationStatus: "open",
    lastVerifiedDate: new Date("2025-01-15"),
    verifiedSource: "MahaDBT Agriculture Portal",
    isActive: true
  },
  {
    schemeId: "MAHA-NFSM-03",
    name: "National Food Security Mission (NFSM)",
    nameHi: "राष्ट्रीय खाद्य सुरक्षा मिशन (NFSM)",
    nameMr: "राष्ट्रीय अन्न सुरक्षा अभियान (NFSM)",
    department: "Department of Agriculture, Govt. of Maharashtra",
    category: "food-security",
    description: "Assistance for certified high-yielding seeds, bio-fertilizers, micronutrients, plant protection chemicals, pipeline distribution systems, and crop demonstrations for Rice, Wheat, Pulses, Coarse Cereals, and Nutri-Cereals.",
    descriptionHi: "चावल, गेहूं, दलहन और मोटे अनाजों के लिए प्रमाणित उन्नत बीज, जैव उर्वरक, पाइपलाइन और फसल प्रदर्शन हेतु सहायता।",
    descriptionMr: "भात, गहू, कडधान्ये, तृणधान्य पिकांसाठी प्रमाणित बियाणे, सूक्ष्म अन्नद्रव्ये, पीव्हीसी पाईपलाईन आणि पीक प्रात्यक्षिकांसाठी अनुदान.",
    eligibility: {
      farmerCategories: ["all", "small", "marginal"],
      maxLandHectares: 2,
      minLandHectares: 0.1,
      irrigationRequired: false,
      applicableCrops: ["Rice", "Wheat", "Gram (चना)", "Pigeon Pea (तुअर)", "Moong", "Urad", "Soybean", "Maize", "Bajra", "Jowar"],
      applicableDistricts: [],
      residencyRequired: "Maharashtra",
      aadhaarRequired: true,
      bankAccountRequired: true,
      landDocumentsRequired: true,
      additionalCriteria: [
        "Farmer cultivating notified food grains and pulse crops in identified districts.",
        "Small & marginal farmers given priority in seed minikit distribution and demo plots."
      ],
      additionalCriteriaHi: [
        "अधिसूचित जिलों में खाद्यान्न व दलहन फसलें उगाने वाले किसान।",
        "लघु एवं सीमांत किसानों को बीज वितरण एवं प्रदर्शन में प्राथमिकता।"
      ],
      additionalCriteriaMr: [
        "अधिसूचित जिल्ह्यांमध्ये तृणधान्य व कडधान्य लागवड करणारे शेतकरी.",
        "बियाणे मिनीकिट व पीक प्रात्यक्षिक वाटपात अल्प व अल्पभूधारक शेतकऱ्यांना प्राधान्य."
      ]
    },
    benefits: {
      subsidyPercentage: "50% to 100% on seed minikits; 50% subsidy up to ₹10,000 for PVC water carrying pipes",
      maxSubsidyAmount: "₹10,000 for HDPE/PVC pipes (up to 800m); Seed subsidies as per MSP norms",
      benefitType: "mixed",
      benefitDescription: "Subsidized certified seeds via Krishi Seva Kendras and DBT financial grants for pipelines and crop management inputs.",
      benefitDescriptionHi: "कृषि सेवा केंद्रों के माध्यम से रियायती बीज एवं पाइपलाइन अनुदान।",
      benefitDescriptionMr: "कृषी केंद्रांमार्फत सवलतीत बियाणे वाटप आणि पाईपलाईनसाठी डीबीटी अनुदान."
    },
    requiredDocuments: [
      "7/12 Extract with crop entry (७/१२ पीक पाहणी उतारा)",
      "8-A Extract (८-अ उतारा)",
      "Aadhaar Card (आधार कार्ड)",
      "Bank Passbook (बँक पासबुक)"
    ],
    officialLink: "https://mahadbt.maharashtra.gov.in",
    sourceGrLink: "https://krishi.maharashtra.gov.in",
    helplineNumber: "1800-233-4000",
    applicationStatus: "year-round",
    lastVerifiedDate: new Date("2025-01-15"),
    verifiedSource: "MahaDBT Agriculture Portal",
    isActive: true
  },
  {
    schemeId: "MAHA-BIRSA-MUNDA-04",
    name: "Birsa Munda Krishi Kranti Yojana",
    nameHi: "बिरसा मुंडा कृषि क्रांति योजना (अनुसूचित जनजाति)",
    nameMr: "बिरसा मुंडा कृषी क्रांती योजना (अनुसूचित जमाती - ST)",
    department: "Tribal Development Dept & Agriculture Dept, Govt. of Maharashtra",
    category: "tribal-welfare",
    description: "100% financial assistance for Scheduled Tribe (ST) farmers to create sustainable irrigation assets including New Wells, In-well Borewells, Solar/Electric Pumpsets, Farm Ponds, Micro-Irrigation, and Polyhouse cultivation.",
    descriptionHi: "अनुसूचित जनजाति (ST) किसानों के लिए नए कुएं, बोरवेल, पंपसेट, शेततले और ड्रिप सिंचाई पर 100% तक सरकारी अनुदान।",
    descriptionMr: "अनुसूचित जमाती (ST) प्रवर्गातील शेतकऱ्यांना नवीन विहीर, बोरवेल, वीज/सौर पंप, शेततळे आणि ठिबक सिंचनासाठी १००% पर्यंत अनुदान.",
    eligibility: {
      farmerCategories: ["st"],
      maxLandHectares: 6,
      minLandHectares: 0.2,
      irrigationRequired: false,
      applicableCrops: ["all"],
      applicableDistricts: [],
      residencyRequired: "Maharashtra",
      aadhaarRequired: true,
      bankAccountRequired: true,
      landDocumentsRequired: true,
      additionalCriteria: [
        "Applicant must belong to Scheduled Tribe (ST) category and hold valid Tribe/Caste Certificate.",
        "Annual family income must not exceed ₹1,50,000 (relaxed in notified ITDP tribal areas).",
        "Must possess land between 0.20 ha and 6.0 ha."
      ],
      additionalCriteriaHi: [
        "आवेदक अनुसूचित जनजाति (ST) का होना चाहिए तथा वैध जाति प्रमाण पत्र आवश्यक।",
        "वार्षिक पारिवारिक आय ₹1,50,000 से अधिक नहीं होनी चाहिए।",
        "भूमि धारक 0.20 से 6.00 हेक्टेयर के बीच होनी चाहिए।"
      ],
      additionalCriteriaMr: [
        "अर्जदार अनुसूचित जमाती (ST) प्रवर्गातील असणे व वैध जात प्रमाणपत्र असणे अनिवार्य.",
        "वार्षिक कौटुंबिक उत्पन्न ₹१,५०,००० च्या मर्यादेत असावे.",
        "जमीन धारणा किमान ०.२० हेक्टर ते कमाल ६.०० हेक्टर दरम्यान असावी."
      ]
    },
    benefits: {
      subsidyPercentage: "100% grant for well construction & components (as per approved standard estimates)",
      maxSubsidyAmount: "Up to ₹2,50,000 for New Well; up to ₹25,000 for Pump; up to ₹50,000 for Micro-Irrigation",
      benefitType: "grant",
      benefitDescription: "Stage-wise grant credited via DBT directly to farmer bank account upon geo-tagged physical milestone completion.",
      benefitDescriptionHi: "जियो-टैग्ड कार्य पूर्णता के आधार पर सीधे बैंक खाते में चरणबद्ध अनुदान।",
      benefitDescriptionMr: "कामाच्या प्रत्यक्ष टप्प्यानुसार जिओ-टॅगिंगनंतर थेट बँक खात्यात अनुदान जमा."
    },
    requiredDocuments: [
      "Caste / Tribe Certificate (सक्षम प्राधिकाऱ्याचे जात प्रमाणपत्र)",
      "7/12 & 8-A Extract (७/१२ आणि ८-अ उतारा)",
      "Income Certificate from Tehsildar (उत्पन्नाचा दाखला)",
      "Affidavit of No Existing Well on Land (विहीर नसल्याबाबतचे प्रतिज्ञापत्र)",
      "Aadhaar Card & Bank Passbook (आधार व बँक पासबुक)"
    ],
    officialLink: "https://mahadbt.maharashtra.gov.in",
    sourceGrLink: "https://krishi.maharashtra.gov.in",
    helplineNumber: "022-61316429",
    applicationStatus: "open",
    lastVerifiedDate: new Date("2025-01-15"),
    verifiedSource: "MahaDBT Agriculture Portal & Tribal Development Dept.",
    isActive: true
  },
  {
    schemeId: "MAHA-AMBEDKAR-SWAVALAMBAN-05",
    name: "Dr. Babasaheb Ambedkar Krushi Swavalamban Yojana",
    nameHi: "डॉ. बाबासाहेब आंबेडकर कृषि स्वावलंबन योजना (अनुसूचित जाति)",
    nameMr: "डॉ. बाबासाहेब आंबेडकर कृषी स्वावलंबन योजना (अनुसूचित जाती - SC)",
    department: "Social Justice & Special Assistance Dept & Agriculture Dept, Govt. of Maharashtra",
    category: "sc-welfare",
    description: "Comprehensive financial support for Scheduled Caste (SC) and Nav-Bouddha farmers to establish irrigation infrastructure including New Wells, Old Well Repairs, In-well Borewells, Pumpsets, Farm Ponds, Drip & Sprinkler sets.",
    descriptionHi: "अनुसूचित जाति (SC) व नवबौद्ध किसानों के लिए नए कुएं, कुआं मरम्मत, सोलर पंप, शेततले और ड्रिप सिंचाई हेतु विशेष आर्थिक पैकेज।",
    descriptionMr: "अनुसूचित जाती (SC) व नवबौद्ध शेतकऱ्यांना नवीन विहीर, जुनी विहीर दुरुस्ती, पंपसेट, शेततळे आणि ठिबक संचासाठी विशेष शासकीय अनुदान.",
    eligibility: {
      farmerCategories: ["sc"],
      maxLandHectares: 6,
      minLandHectares: 0.2,
      irrigationRequired: false,
      applicableCrops: ["all"],
      applicableDistricts: [],
      residencyRequired: "Maharashtra",
      aadhaarRequired: true,
      bankAccountRequired: true,
      landDocumentsRequired: true,
      additionalCriteria: [
        "Applicant must belong to Scheduled Caste (SC) or Nav-Bouddha community with verified caste certificate.",
        "Annual family income should be within ₹1,50,000.",
        "Land holding must be between 0.20 ha and 6.0 ha."
      ],
      additionalCriteriaHi: [
        "आवेदक अनुसूचित जाति (SC) अथवा नवबौद्ध वर्ग का होना चाहिए।",
        "पारिवारिक वार्षिक आय ₹1,50,000 तक होनी चाहिए।",
        "जमीन 0.20 से 6.00 हेक्टेयर के बीच होनी चाहिए।"
      ],
      additionalCriteriaMr: [
        "अर्जदार अनुसूचित जाती (SC) किंवा नवबौद्ध प्रवर्गातील असणे बंधनकारक.",
        "कुटुंबाचे वार्षिक उत्पन्न ₹१.५० लाखांच्या मर्यादेत असावे.",
        "किमान ०.२० हेक्टर ते कमाल ६ हेक्टर जमीन मालकी असावी."
      ]
    },
    benefits: {
      subsidyPercentage: "100% financial assistance within prescribed cost ceilings",
      maxSubsidyAmount: "Up to ₹2,50,000 for New Well; up to ₹50,000 for Well Repairs; up to ₹25,000 for Pumpset",
      benefitType: "grant",
      benefitDescription: "Direct Benefit Transfer disbursed directly in 3 installments based on verification of work progress.",
      benefitDescriptionHi: "कार्य प्रगति सत्यापन के आधार पर 3 किस्तों में सीधे बैंक खाते में डीबीटी।",
      benefitDescriptionMr: "विहीर कामाच्या प्रत्यक्ष पाहणीनुसार ३ हप्त्यांमध्ये थेट बँक खात्यात निधी जमा."
    },
    requiredDocuments: [
      "Caste Certificate (सक्षम अधिकाऱ्याचे जात प्रमाणपत्र)",
      "7/12 & 8-A Extract (७/१२ आणि ८-अ उतारा)",
      "Income Certificate (तहसीलदारांचा उत्पन्नाचा दाखला)",
      "Affidavit regarding no prior well benefit (प्रतिज्ञापत्र)",
      "Aadhaar Card & Bank Details (आधार व बँक खाते)"
    ],
    officialLink: "https://mahadbt.maharashtra.gov.in",
    sourceGrLink: "https://krishi.maharashtra.gov.in",
    helplineNumber: "022-61316429",
    applicationStatus: "open",
    lastVerifiedDate: new Date("2025-01-15"),
    verifiedSource: "MahaDBT Agriculture Portal",
    isActive: true
  },
  {
    schemeId: "MAHA-MIDH-HORTI-06",
    name: "Mission for Integrated Development of Horticulture (MIDH)",
    nameHi: "एकीकृत बागवानी विकास मिशन (MIDH)",
    nameMr: "एकात्मिक फलोत्पादन विकास अभियान (MIDH)",
    department: "State Horticulture Mission, Dept. of Agriculture, Maharashtra",
    category: "horticulture",
    description: "Centrally sponsored scheme promoting holistic growth of horticulture: cultivation of fruit crops, spices, flowers, establishment of hi-tech nurseries, protected cultivation (Polyhouses & Shade Net Houses), post-harvest pack houses, and cold storages.",
    descriptionHi: "फलों, मसालों, फूलों की खेती, पॉलीहाउस/शेडनेट, पैक हाउस और कोल्ड स्टोरेज निर्माण हेतु विशाल अनुदान।",
    descriptionMr: "फळपिके, फुले, मसाले लागवड, हरितगृह (पॉलीहाउस), शेडनेट हाऊस, पॅक हाऊस व शीतगृहासाठी भरीव अनुदान.",
    eligibility: {
      farmerCategories: ["all", "small", "marginal", "women", "sc", "st"],
      maxLandHectares: 4,
      minLandHectares: 0.1,
      irrigationRequired: true,
      applicableCrops: ["Mango", "Pomegranate", "Banana", "Guava", "Custard Apple", "Grapes", "Citrus (संतरा/मोसंबी)", "Flowers", "Vegetables"],
      applicableDistricts: [],
      residencyRequired: "Maharashtra",
      aadhaarRequired: true,
      bankAccountRequired: true,
      landDocumentsRequired: true,
      additionalCriteria: [
        "Farmer must own agricultural land suitable for horticulture crops.",
        "Assured irrigation facility is mandatory for protected cultivation and fruit orchards.",
        "Detailed project plan / quotation required for Polyhouse and Cold Storage components."
      ],
      additionalCriteriaHi: [
        "बागवानी फसलों के लिए उपयुक्त कृषि भूमि होनी चाहिए।",
        "संरक्षित खेती व फलबाग के लिए सिंचाई की पक्की सुविधा आवश्यक।",
        "पॉलीहाउस व शेडनेट के लिए प्राधिकृत तकनीकी एस्टीमेट आवश्यक।"
      ],
      additionalCriteriaMr: [
        "फलोत्पादन पिकांसाठी योग्य शेतजमीन उपलब्ध असावी.",
        "हरितगृह व फळबागांसाठी बारमाही पाण्याचा स्त्रोत अनिवार्य.",
        "पॉलीहाउस व शेडनेट उभारणीसाठी तांत्रिक अंदाजपत्रक आवश्यक."
      ]
    },
    benefits: {
      subsidyPercentage: "40% to 50% of cost norm for fruit crops; 50% (up to ₹710/sq.m) for Shade Net Houses and Polyhouses",
      maxSubsidyAmount: "Up to ₹2,00,000/ha for fruit plantation; up to ₹16,00,000 for 4000 sq.m Polyhouse; ₹2,00,000 for Pack House",
      benefitType: "subsidy",
      benefitDescription: "DBT payment released upon joint site inspection by Taluka Agriculture Officer and geo-tagging of assets.",
      benefitDescriptionHi: "तालुका कृषि अधिकारी के निरीक्षण और जियो-टैगिंग के बाद सीधे बैंक में डीबीटी।",
      benefitDescriptionMr: "कृषी अधिकाऱ्यांच्या प्रत्यक्ष जागेवरील तपासणी व जिओ-टॅगिंगनंतर थेट डीबीटी."
    },
    requiredDocuments: [
      "7/12 Extract with horticulture entry (७/१२ उतारा)",
      "8-A Holding Extract (८-अ उतारा)",
      "Aadhaar Card (आधार कार्ड)",
      "Bank Account details (बँक पासबुक)",
      "Water testing / Soil testing report (माती-पाणी परीक्षण अहवाल)",
      "Structure blueprint and quotation from registered fabricator (पॉलीहाउस/शेडनेट कोटेशन)"
    ],
    officialLink: "https://mahadbt.maharashtra.gov.in",
    sourceGrLink: "https://krishi.maharashtra.gov.in",
    helplineNumber: "1800-233-4000",
    applicationStatus: "open",
    lastVerifiedDate: new Date("2025-01-15"),
    verifiedSource: "State Horticulture Mission Maharashtra & MahaDBT",
    isActive: true
  },
  {
    schemeId: "MAHA-BHAUSAHEB-FUNDKAR-07",
    name: "Bhausaheb Fundkar Phalbaag Lagvad Yojana",
    nameHi: "भाऊसाहेब फुंडकर फलबाग लागवड़ योजना",
    nameMr: "भाऊसाहेब फुंडकर फळबाग लागवड योजना",
    department: "Department of Agriculture, Govt. of Maharashtra",
    category: "horticulture",
    description: "100% state-funded flagship scheme for planting 16 notified perennial fruit crops (Mango, Pomegranate, Cashew, Guava, Custard Apple, Orange, Lemon, Chikoo, Jamun, Amla, Kokum, etc.) covering pit digging, saplings, manure, and 3-year maintenance.",
    descriptionHi: "महाराष्ट्र राज्य द्वारा 16 प्रकार की बहुवर्षीय फल फसलों के रोपण, गड्ढे खुदाई, खाद और 3 साल की देखभाल पर 100% तक अनुदान।",
    descriptionMr: "महाराष्ट्र शासनाची १००% राज्य पुरस्कृत योजना: आंबा, डाळिंब, काजू, पेरू, सीताफळ, संत्रा, मोसंबीसह १६ फळपिकांच्या लागवड व ३ वर्षांच्या संगोपनासाठी अनुदान.",
    eligibility: {
      farmerCategories: ["all", "small", "marginal", "women", "sc", "st"],
      maxLandHectares: 6,
      minLandHectares: 0.1,
      irrigationRequired: true,
      applicableCrops: ["Mango (आंबा)", "Pomegranate (डाळिंब)", "Cashew (काजू)", "Guava (पेरू)", "Custard Apple (सीताफळ)", "Orange (संत्रा)", "Sweet Lime (मोसंबी)", "Lemon (लिंबू)", "Chikoo (चिकू)", "Amla (आवळा)", "Kokum (कोकम)", "Jamun (जांभूळ)"],
      applicableDistricts: [],
      residencyRequired: "Maharashtra",
      aadhaarRequired: true,
      bankAccountRequired: true,
      landDocumentsRequired: true,
      additionalCriteria: [
        "Farmer holding agricultural land in Maharashtra.",
        "Farmers not covered under MGNREGS fruit plantation can directly apply on MahaDBT.",
        "Minimum survival rate of plants (75% for small/marginal, 70% for others) mandatory in 2nd and 3rd years for installment release."
      ],
      additionalCriteriaHi: [
        "महाराष्ट्र का भूमिधारक किसान।",
        "जो किसान मनरेगा के तहत पात्र नहीं हैं वे सीधे महाडीबीटी से आवेदन कर सकते हैं।",
        "दूसरे और तीसरे वर्ष अनुदान हेतु पौधों का 70-75% जीवित रहना आवश्यक।"
      ],
      additionalCriteriaMr: [
        "महाराष्ट्रातील शेतजमीन मालक शेतकरी.",
        "रोजगार हमी योजनेखाली (MGNREGS) न बसणारे शेतकरी महाडीबीटीवर थेट अर्ज करू शकतात.",
        "दुसऱ्या व तिसऱ्या वर्षाच्या अनुदानासाठी झाडांची जगण्याची टक्केवारी ७० ते ७५% असणे अनिवार्य."
      ]
    },
    benefits: {
      subsidyPercentage: "100% financial subsidy spread over 3 years: 50% (1st year), 30% (2nd year), 20% (3rd year)",
      maxSubsidyAmount: "Up to ₹1,50,000 to ₹2,50,000 per hectare depending upon crop variety and spacing norms",
      benefitType: "subsidy",
      benefitDescription: "Three annual tranches directly into farmer bank account via DBT based on survival count verification.",
      benefitDescriptionHi: "पौधों के जीवित रहने की गणना के आधार पर 3 वर्षों में 50:30:20 के अनुपात में डीबीटी।",
      benefitDescriptionMr: "झाडांच्या जगण्याच्या प्रमाणानुसार ३ वर्षांत ५०:३०:२० या प्रमाणात थेट बँकेत अनुदान."
    },
    requiredDocuments: [
      "7/12 & 8-A Extract (७/१२ आणि ८-अ उतारा)",
      "Aadhaar Card (आधार कार्ड)",
      "Bank Account details (बँक पासबुक)",
      "Water Availability Undertaking (पाण्याची सोय असल्याबाबतचे हमीपत्र)",
      "Undertaking regarding no MGNREGS benefit for the same plot (हमीपत्र)"
    ],
    officialLink: "https://mahadbt.maharashtra.gov.in",
    sourceGrLink: "https://krishi.maharashtra.gov.in",
    helplineNumber: "1800-233-4000",
    applicationStatus: "open",
    lastVerifiedDate: new Date("2025-01-15"),
    verifiedSource: "Department of Agriculture, Maharashtra & MahaDBT",
    isActive: true
  },
  {
    schemeId: "MAHA-RAD-RAIN FED-08",
    name: "Rainfed Area Development Programme (RAD)",
    nameHi: "वर्षा सिंचित क्षेत्र विकास कार्यक्रम (RAD - NMSA)",
    nameMr: "कोरडवाहू क्षेत्र विकास कार्यक्रम (RAD)",
    department: "National Mission for Sustainable Agriculture (NMSA) & Dept of Agriculture Maharashtra",
    category: "rainfed",
    description: "Promotion of Integrated Farming System (IFS) combining horticulture, agroforestry, livestock, vermicomposting, and water harvesting to ensure climate resilience and sustained income in rainfed/dryland belts.",
    descriptionHi: "वर्षा आधारित क्षेत्रों में समग्र कृषि प्रणाली (फसल + बागवानी + पशुपालन + वर्मीकम्पोस्ट) के माध्यम से किसानों की आय में वृद्धि हेतु सहायता।",
    descriptionMr: "कोरडवाहू पट्ट्यात हवामान अनुकूल एकात्मिक शेती पद्धती (पिके + फळबाग + पशुपालन + गांडूळ खत + जलसंधारण) साठी सर्वसमावेशक अनुदान.",
    eligibility: {
      farmerCategories: ["all", "small", "marginal"],
      maxLandHectares: 2,
      minLandHectares: 0.2,
      irrigationRequired: false,
      applicableCrops: ["Pulses", "Oilseeds", "Cotton", "Millets", "Soybean", "Jowar", "Bajra"],
      applicableDistricts: [],
      residencyRequired: "Maharashtra",
      aadhaarRequired: true,
      bankAccountRequired: true,
      landDocumentsRequired: true,
      additionalCriteria: [
        "Farmer located in notified rainfed/dryland cluster zones.",
        "Willingness to adopt Integrated Farming System (IFS) model."
      ],
      additionalCriteriaHi: [
        "वर्षा आधारित गैर-सिंचित सूखा संभावित क्षेत्रों के किसान।",
        "एकीकृत कृषि प्रणाली मॉडल अपनाने की सहमति।"
      ],
      additionalCriteriaMr: [
        "अधिसूचित कोरडवाहू व अवर्षणप्रवण क्षेत्रातील शेतकरी.",
        "एकात्मिक शेती पद्धती (IFS) चा अवलंब करण्याची तयारी."
      ]
    },
    benefits: {
      subsidyPercentage: "50% of cost of IFS components up to prescribed ceilings",
      maxSubsidyAmount: "Up to ₹25,000 for Vermicompost unit; up to ₹50,000 for Agroforestry/Horticulture IFS; ₹25,000 for Green Fodder unit",
      benefitType: "grant",
      benefitDescription: "Financial assistance credited to bank account for IFS components upon cluster project validation.",
      benefitDescriptionHi: "क्लस्टर सत्यापन उपरांत विभिन्न घटकों हेतु प्रत्यक्ष डीबीटी लाभ।",
      benefitDescriptionMr: "क्लस्टर पडताळणीनंतर विविध घटकांसाठी थेट डीबीटी अनुदान."
    },
    requiredDocuments: [
      "7/12 Extract (७/१२ उतारा)",
      "8-A Extract (८-अ उतारा)",
      "Aadhaar Card & Bank Details (आधार व बँक खाते)",
      "Cluster membership / registration form (क्लस्टर अर्ज)"
    ],
    officialLink: "https://mahadbt.maharashtra.gov.in",
    sourceGrLink: "https://krishi.maharashtra.gov.in",
    helplineNumber: "022-61316429",
    applicationStatus: "year-round",
    lastVerifiedDate: new Date("2025-01-15"),
    verifiedSource: "National Mission for Sustainable Agriculture & MahaDBT",
    isActive: true
  },
  {
    schemeId: "MAHA-RKVY-RAFTAAR-09",
    name: "RKVY – RAFTAAR (Remunerative Approaches for Agriculture)",
    nameHi: "राष्ट्रीय कृषि विकास योजना – रफ्तार (RKVY-RAFTAAR)",
    nameMr: "राष्ट्रीय कृषी विकास योजना – रफ्तार (RKVY-RAFTAAR)",
    department: "Department of Agriculture, Govt. of Maharashtra & Govt. of India",
    category: "infrastructure",
    description: "Support for agri-infrastructure, farm mechanization, community ponds, onion storage structures (कांदा चाळ), post-harvest processing, and agri-business startup funding.",
    descriptionHi: "कृषि अधोसंरचना, प्याज भंडारण (कांदा चाल), पोस्ट-हार्वेस्ट प्रसंस्करण और कृषि स्टार्टअप्स के लिए वित्तीय सहायता।",
    descriptionMr: "शेती पायाभूत सुविधा, कांदा चाळ उभारणी, शेतमाल प्रक्रिया, सामूहिक शेततळे आणि कृषी स्टार्टअप्ससाठी अर्थसहाय्य.",
    eligibility: {
      farmerCategories: ["all", "small", "marginal", "women"],
      maxLandHectares: null,
      minLandHectares: 0.1,
      irrigationRequired: false,
      applicableCrops: ["Onion (कांदा)", "Paddy", "Wheat", "Fruits", "Vegetables", "Spices"],
      applicableDistricts: [],
      residencyRequired: "Maharashtra",
      aadhaarRequired: true,
      bankAccountRequired: true,
      landDocumentsRequired: true,
      additionalCriteria: [
        "Individual farmer, FPO, or SHG possessing eligible farmland in Maharashtra.",
        "For Onion Storage Structure (कांदा चाळ): Must cultivate onion crop with entry in 7/12 record."
      ],
      additionalCriteriaHi: [
        "महाराष्ट्र के किसान, एफपीओ या महिला स्वयं सहायता समूह।",
        "प्याज भंडारण हेतु 7/12 पर प्याज फसल की प्रविष्टि अनिवार्य।"
      ],
      additionalCriteriaMr: [
        "महाराष्ट्रातील शेतकरी, शेतकरी उत्पादक कंपनी (FPO) किंवा बचत गट.",
        "कांदा चाळ अनुदानासाठी ७/१२ वर कांदा पीक पाहणी नोंद आवश्यक."
      ]
    },
    benefits: {
      subsidyPercentage: "50% of the cost for Onion Storage (कांदा चाळ); up to 50% for post-harvest equipment",
      maxSubsidyAmount: "Up to ₹87,500 for 25 MT Onion Storage Unit; up to ₹1,75,000 for 50 MT Unit",
      benefitType: "subsidy",
      benefitDescription: "DBT credit after technical physical inspection and geotagging of the completed storage facility.",
      benefitDescriptionHi: "कांदा चाळ निर्माण और तकनीकी सत्यापन के बाद सीधे बैंक में डीबीटी।",
      benefitDescriptionMr: "कांदा चाळ पूर्ण झाल्यानंतर कृषी अधिकाऱ्यांच्या तपासणीअंती थेट बँक खात्यात रक्कम."
    },
    requiredDocuments: [
      "7/12 Extract with crop entry (७/१२ पीक नोंद उतारा)",
      "8-A Extract (८-अ उतारा)",
      "Aadhaar Card (आधार कार्ड)",
      "Bank Passbook (बँक पासबुक)",
      "Technical layout blueprint & site photo (कांदा चाळ आराखडा व जागा फोटो)"
    ],
    officialLink: "https://mahadbt.maharashtra.gov.in",
    sourceGrLink: "https://krishi.maharashtra.gov.in",
    helplineNumber: "022-61316429",
    applicationStatus: "open",
    lastVerifiedDate: new Date("2025-01-15"),
    verifiedSource: "MahaDBT Agriculture Portal",
    isActive: true
  },
  {
    schemeId: "MAHA-STATE-MECH-10",
    name: "State Agriculture Mechanization Scheme",
    nameHi: "राज्य पुरस्कृत कृषि यंत्रीकरण योजना",
    nameMr: "राज्य पुरस्कृत कृषी यांत्रिकीकरण योजना",
    department: "Department of Agriculture, Govt. of Maharashtra",
    category: "mechanization",
    description: "State-funded mechanization initiative providing subsidy on purchase of Tractor-drawn implements, Cultivators, MB Ploughs, Seed-cum-Fertilizer Drills, Sprayers (HTP/Battery), and processing equipment to non-SMAM beneficiaries.",
    descriptionHi: "कल्टीवेटर, रोटावेटर, प्लाउ, बैटरी स्प्रेयर और कृषि यंत्रों की खरीद पर राज्य सरकार द्वारा विशेष सब्सिडी।",
    descriptionMr: "नांगर, कल्टीव्हेटर, रोटाव्हेटर, पेरणी यंत्र, एचटीपी/बॅटरी फवारणी यंत्र खरेदीसाठी राज्य शासनाचे विशेष अनुदान.",
    eligibility: {
      farmerCategories: ["all", "sc", "st", "women", "small", "marginal"],
      maxLandHectares: null,
      minLandHectares: 0.1,
      irrigationRequired: false,
      applicableCrops: ["all"],
      applicableDistricts: [],
      residencyRequired: "Maharashtra",
      aadhaarRequired: true,
      bankAccountRequired: true,
      landDocumentsRequired: true,
      additionalCriteria: [
        "Farmer possessing 7/12 land records in Maharashtra.",
        "Pre-sanction letter from MahaDBT mandatory before purchasing equipment from authorized dealer."
      ],
      additionalCriteriaHi: [
        "महाराष्ट्र के पंजीकृत भूमिधारक किसान।",
        "महाडीबीटी पूर्व-संमति पत्र मिलने के बाद ही अधिकृत डीलर से खरीदारी करें।"
      ],
      additionalCriteriaMr: [
        "महाराष्ट्रातील शेतजमीनधारक शेतकरी.",
        "महाडीबीटीवर पूर्वसंमती पत्र मिळाल्यानंतरच अधिकृत विक्रेत्याकडून यंत्र खरेदी आवश्यक."
      ]
    },
    benefits: {
      subsidyPercentage: "50% for SC/ST/Women/Small & Marginal Farmers; 40% for General Farmers",
      maxSubsidyAmount: "Up to ₹50,000 for heavy implements; up to ₹10,000 for power sprayers",
      benefitType: "subsidy",
      benefitDescription: "DBT directly into bank account upon GPS-enabled app inspection and dealer tax invoice upload.",
      benefitDescriptionHi: "जीपीएस निरीक्षण एवं टैक्स इनवॉइस अपलोड के बाद बैंक खाते में डीबीटी।",
      benefitDescriptionMr: "जीपीएस तपासणी व बिल पडताळणीनंतर थेट बँक खात्यात अनुदान."
    },
    requiredDocuments: [
      "7/12 & 8-A Extract (७/१२ आणि ८-अ उतारा)",
      "Aadhaar Card (आधार कार्ड)",
      "Bank Passbook copy (बँक पासबुक)",
      "Dealer Quotation / Tax Invoice (विक्रेत्याचे कोटेशन/बिल)"
    ],
    officialLink: "https://mahadbt.maharashtra.gov.in",
    sourceGrLink: "https://krishi.maharashtra.gov.in",
    helplineNumber: "022-61316429",
    applicationStatus: "open",
    lastVerifiedDate: new Date("2025-01-15"),
    verifiedSource: "Department of Agriculture Maharashtra & MahaDBT",
    isActive: true
  },
  {
    schemeId: "MAHA-CMSKIS-11",
    name: "Chief Minister Sustainable Agriculture Irrigation Scheme",
    nameHi: "मुख्यमंत्री शाश्वत कृषि सिंचाई योजना",
    nameMr: "मुख्यमंत्री शाश्वत कृषी सिंचन योजना",
    department: "Department of Agriculture, Govt. of Maharashtra",
    category: "irrigation",
    description: "Flagship Maharashtra state initiative providing 25% supplementary top-up subsidy for micro-irrigation in suicide-prone/drought-affected districts, financial assistance for individual Farm Ponds (शेततळे), and Farm Pond Plastic Lining (शेततळे प्लास्टिक अस्तर).",
    descriptionHi: "सूखा प्रभावित जिलों में ड्रिप/स्प्रिंकलर हेतु 25% अतिरिक्त टॉप-अप सब्सिडी, व्यक्तिगत शेततले एवं शेततले प्लास्टिक अस्तर हेतु भारी सहायता।",
    descriptionMr: "अवर्षणप्रवण व आत्महत्याग्रस्त जिल्ह्यांमध्ये सूक्ष्म सिंचनासाठी २५% अतिरिक्त पूरक अनुदान, वैयक्तिक शेततळे व शेततळे प्लास्टिक अस्तरीकरणासाठी विशेष अनुदान.",
    eligibility: {
      farmerCategories: ["all", "small", "marginal", "women", "sc", "st"],
      maxLandHectares: 5,
      minLandHectares: 0.2,
      irrigationRequired: false,
      applicableCrops: ["all", "Cotton", "Soybean", "Pomegranate", "Sugarcane", "Gram", "Vegetables"],
      applicableDistricts: [],
      residencyRequired: "Maharashtra",
      aadhaarRequired: true,
      bankAccountRequired: true,
      landDocumentsRequired: true,
      additionalCriteria: [
        "Available across all districts of Maharashtra, with priority to 14 suicide-affected and drought-prone districts of Vidarbha and Marathwada.",
        "Farmer must possess own land suitable for farm pond excavation.",
        "Farm pond must have an inlet/outlet structure as per standard agriculture engineering norms."
      ],
      additionalCriteriaHi: [
        "विदर्भ व मराठवाड़ा के सूखा संभावित जिलों सहित पूरे महाराष्ट्र में लागू।",
        "शेततले निर्माण हेतु उपयुक्त स्वयं की कृषि भूमि होनी चाहिए।",
        "मानक तकनीकी मापदंडों के अनुसार शेततले का निर्माण आवश्यक।"
      ],
      additionalCriteriaMr: [
        "विदर्भ, मराठवाड्यासह संपूर्ण महाराष्ट्रातील शेतकरी पात्र.",
        "शेततळे खोदकामासाठी स्वतःच्या नावावर किमान ०.२० हेक्टर शेतजमीन असावी.",
        "कृषी विभागाच्या तांत्रिक निकषांनुसार शेततळे खोदकाम व प्लास्टिक अस्तरीकरण आवश्यक."
      ]
    },
    benefits: {
      subsidyPercentage: "25% Top-Up on Micro-Irrigation (total up to 75-80%); up to ₹75,000 for Plastic Lining; ₹50,000 for Farm Pond",
      maxSubsidyAmount: "Up to ₹75,000 for Plastic Lining; up to ₹50,000 for Individual Farm Pond (30x30x3m)",
      benefitType: "subsidy",
      benefitDescription: "DBT released directly to farmer account post measurement by Taluka Agriculture Officer and satellite/GPS geotagging.",
      benefitDescriptionHi: "तालुका कृषि अधिकारी द्वारा नापजोख व जीपीएस जियो-टैगिंग के बाद सीधे बैंक में डीबीटी।",
      benefitDescriptionMr: "तालुका कृषी अधिकाऱ्यांच्या मोजमाप व जिओ-टॅगिंगनंतर थेट बँक खात्यात रक्कम वर्ग."
    },
    requiredDocuments: [
      "7/12 & 8-A Extract (७/१२ आणि ८-अ उतारा)",
      "Aadhaar Card (आधार कार्ड)",
      "Bank Account details (बँक पासबुक)",
      "Self-declaration / Affidavit of land suitability (हमीपत्र)"
    ],
    officialLink: "https://mahadbt.maharashtra.gov.in",
    sourceGrLink: "https://krishi.maharashtra.gov.in",
    helplineNumber: "022-61316429",
    applicationStatus: "open",
    lastVerifiedDate: new Date("2025-01-15"),
    verifiedSource: "MahaDBT Agriculture Portal & Government Resolution (GR)",
    isActive: true
  }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGO_URI is missing in environment.");
      process.exit(1);
    }

    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB:", mongoose.connection.name);

    console.log("🌱 Seeding verified official Maharashtra Government schemes...");

    for (const data of verifiedSchemes) {
      await Scheme.findOneAndUpdate(
        { schemeId: data.schemeId },
        { $set: data },
        { upsert: true, new: true }
      );
      console.log(`  ✓ Seeded: [${data.schemeId}] ${data.name}`);
    }

    const count = await Scheme.countDocuments();
    console.log(`\n🎉 Successfully seeded all ${count} official Maharashtra schemes into MongoDB!`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding schemes:", err);
    process.exit(1);
  }
}

seed();
