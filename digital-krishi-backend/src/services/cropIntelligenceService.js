// Crop market prices & pesticide advisory dictionary
const CROP_INTELLIGENCE = {
  wheat: {
    price: 2450,
    priceTrend: "+2.8% ▲",
    unit: "₹/quintal",
    pesticides: [
      { name: "Propiconazole 25% EC", dosage: "1 ml / litre of water", type: "Fungicide (Rust/Blight Control)", status: "Recommended" },
      { name: "Sulfur 80% WDG", dosage: "2.5 g / litre of water", type: "Fungicide (Powdery Mildew)", status: "Recommended" },
      { name: "Neem Oil Extract 1500 PPM", dosage: "5 ml / litre of water", type: "Bio-Pesticide (Aphids & Borers)", status: "Recommended" }
    ],
    commonDiseases: ["Yellow Rust", "Leaf Blight", "Loose Smut", "Healthy Crop"]
  },
  rice: {
    price: 2280,
    priceTrend: "+3.4% ▲",
    unit: "₹/quintal",
    pesticides: [
      { name: "Tricyclazole 75% WP", dosage: "0.6 g / litre of water", type: "Fungicide (Blast Control)", status: "Recommended" },
      { name: "Cartap Hydrochloride 50% SP", dosage: "2 g / litre of water", type: "Insecticide (Stem Borer)", status: "Recommended" },
      { name: "Validamycin 3% L", dosage: "2.5 ml / litre of water", type: "Bio-Antibiotic (Sheath Blight)", status: "Recommended" }
    ],
    commonDiseases: ["Blast Disease", "Sheath Blight", "Brown Plant Hopper", "Healthy Crop"]
  },
  paddy: {
    price: 2280,
    priceTrend: "+3.4% ▲",
    unit: "₹/quintal",
    pesticides: [
      { name: "Tricyclazole 75% WP", dosage: "0.6 g / litre of water", type: "Fungicide (Blast Control)", status: "Recommended" },
      { name: "Cartap Hydrochloride 50% SP", dosage: "2 g / litre of water", type: "Insecticide (Stem Borer)", status: "Recommended" }
    ],
    commonDiseases: ["Blast Disease", "Sheath Blight", "Healthy Crop"]
  },
  cotton: {
    price: 7150,
    priceTrend: "+1.9% ▲",
    unit: "₹/quintal",
    pesticides: [
      { name: "Emamectin Benzoate 5% SG", dosage: "0.5 g / litre of water", type: "Insecticide (Bollworm Control)", status: "Recommended" },
      { name: "Acetamiprid 20% SP", dosage: "0.4 g / litre of water", type: "Systemic Insecticide (Whitefly/Jassid)", status: "Recommended" },
      { name: "Copper Oxychloride 50% WP", dosage: "3 g / litre of water", type: "Fungicide (Bacterial Blight)", status: "Recommended" }
    ],
    commonDiseases: ["Bacterial Blight", "Pink Bollworm", "Leaf Curl Virus", "Healthy Crop"]
  },
  soybean: {
    price: 4620,
    priceTrend: "+4.1% ▲",
    unit: "₹/quintal",
    pesticides: [
      { name: "Chlorantraniliprole 18.5% SC", dosage: "0.3 ml / litre of water", type: "Insecticide (Girdle Beetle/Semilooper)", status: "Recommended" },
      { name: "Tebuconazole 25.9% EC", dosage: "1.25 ml / litre of water", type: "Fungicide (Anthracnose/Rust)", status: "Recommended" }
    ],
    commonDiseases: ["Yellow Mosaic", "Rust", "Pod Borer", "Healthy Crop"]
  },
  maize: {
    price: 2100,
    priceTrend: "-0.8% ▼",
    unit: "₹/quintal",
    pesticides: [
      { name: "Spinetoram 11.7% SC", dosage: "0.5 ml / litre of water", type: "Insecticide (Fall Armyworm Control)", status: "Recommended" },
      { name: "Azoxystrobin 23% SC", dosage: "1 ml / litre of water", type: "Fungicide (Turcicum Leaf Blight)", status: "Recommended" }
    ],
    commonDiseases: ["Fall Armyworm", "Turcicum Blight", "Healthy Crop"]
  },
  tomato: {
    price: 1850,
    priceTrend: "+6.5% ▲",
    unit: "₹/quintal",
    pesticides: [
      { name: "Mancozeb 75% WP", dosage: "2 g / litre of water", type: "Fungicide (Early & Late Blight)", status: "Recommended" },
      { name: "Imidacloprid 17.8% SL", dosage: "0.5 ml / litre of water", type: "Insecticide (Whiteflies & Aphids)", status: "Recommended" },
      { name: "Trichoderma Viride", dosage: "5 g / litre of water", type: "Bio-Fungicide (Root Rot Control)", status: "Recommended" }
    ],
    commonDiseases: ["Early Blight", "Late Blight", "Leaf Curl", "Healthy Crop"]
  },
  mustard: {
    price: 5450,
    priceTrend: "+1.2% ▲",
    unit: "₹/quintal",
    pesticides: [
      { name: "Dimethoate 30% EC", dosage: "1.7 ml / litre of water", type: "Insecticide (Mustard Aphid)", status: "Recommended" },
      { name: "Mancozeb 75% WP", dosage: "2 g / litre of water", type: "Fungicide (Alternaria Blight)", status: "Recommended" }
    ],
    commonDiseases: ["Alternaria Blight", "White Rust", "Aphids", "Healthy Crop"]
  },
  potato: {
    price: 1400,
    priceTrend: "+2.1% ▲",
    unit: "₹/quintal",
    pesticides: [
      { name: "Cymoxanil 8% + Mancozeb 64% WP", dosage: "2.5 g / litre of water", type: "Fungicide (Late Blight Specialist)", status: "Recommended" },
      { name: "Chlorpyrifos 20% EC", dosage: "2 ml / litre of water", type: "Soil Treatment (Cutworms & Termites)", status: "Recommended" }
    ],
    commonDiseases: ["Late Blight", "Early Blight", "Black Scurf", "Healthy Crop"]
  },
  onion: {
    price: 1950,
    priceTrend: "+5.0% ▲",
    unit: "₹/quintal",
    pesticides: [
      { name: "Carbosulfan 25% EC", dosage: "2 ml / litre of water", type: "Insecticide (Thrips Control)", status: "Recommended" },
      { name: "Hexaconazole 5% EC", dosage: "1.5 ml / litre of water", type: "Fungicide (Purple Blotch)", status: "Recommended" }
    ],
    commonDiseases: ["Purple Blotch", "Thrips Attack", "Downy Mildew", "Healthy Crop"]
  },
  sugarcane: {
    price: 350,
    priceTrend: "Stable",
    unit: "₹/quintal",
    pesticides: [
      { name: "Chlorantraniliprole 0.4% GR", dosage: "7.5 kg / acre", type: "Systemic Soil Granule (Early Shoot Borer)", status: "Recommended" },
      { name: "Carbendazim 50% WP", dosage: "1 g / litre of water", type: "Set Treatment Fungicide (Red Rot)", status: "Recommended" }
    ],
    commonDiseases: ["Red Rot", "Shoot Borer", "Smut", "Healthy Crop"]
  },
  chilli: {
    price: 14200,
    priceTrend: "+3.8% ▲",
    unit: "₹/quintal",
    pesticides: [
      { name: "Diafenthiuron 50% WP", dosage: "1.2 g / litre of water", type: "Acaricide (Mites & Thrips)", status: "Recommended" },
      { name: "Copper Hydroxide 53.8% DF", dosage: "2 g / litre of water", type: "Bactericide (Bacterial Spot & Anthracnose)", status: "Recommended" }
    ],
    commonDiseases: ["Anthracnose / Dieback", "Thrips & Mites Murda Disease", "Healthy Crop"]
  }
};

const getCropIntelligence = (cropName) => {
  if (!cropName) return getFallbackCropData("General Crop");
  const key = cropName.trim().toLowerCase();
  
  for (const [k, v] of Object.entries(CROP_INTELLIGENCE)) {
    if (key.includes(k) || k.includes(key)) {
      return {
        matchedCrop: k.charAt(0).toUpperCase() + k.slice(1),
        ...v
      };
    }
  }

  return getFallbackCropData(cropName);
};

const getFallbackCropData = (name) => ({
  matchedCrop: name,
  price: 2450,
  priceTrend: "+2.0% ▲",
  unit: "₹/quintal",
  pesticides: [
    { name: "Neem Oil Organic Formulation 1500 PPM", dosage: "4-5 ml / litre of water", type: "Bio-Insecticide (Broad Spectrum)", status: "Recommended" },
    { name: "Mancozeb 75% WP Broad Spectrum", dosage: "2 g / litre of water", type: "Fungicide (Foliar Protection)", status: "Recommended" },
    { name: "Pseudomonas Fluorescens Bio-Agent", dosage: "5 g / litre of water", type: "Bio-Bactericide / Immunity Booster", status: "Recommended" }
  ],
  commonDiseases: ["Foliar Blight", "Powdery Mildew", "Healthy Crop"]
});

module.exports = {
  CROP_INTELLIGENCE,
  getCropIntelligence
};
