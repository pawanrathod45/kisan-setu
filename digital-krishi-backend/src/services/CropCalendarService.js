const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const cropSchedules = {
  rice: (base) => [
    { activity: "Nursery Preparation", description: "Prepare seed bed and soak seeds", date: addDays(base, 7) },
    { activity: "Transplanting", description: "Transplant seedlings to main field", date: addDays(base, 25) },
    { activity: "First Fertilizer", description: "Apply Nitrogen fertilizer", date: addDays(base, 35) },
    { activity: "Pest Monitoring", description: "Check for stem borer and leaf folder", date: addDays(base, 45) },
    { activity: "Second Fertilizer", description: "Apply Potash and Phosphorus", date: addDays(base, 60) },
    { activity: "Harvest", description: "Harvest mature crop", date: addDays(base, 120) }
  ],
  
  wheat: (base) => [
    { activity: "Land Preparation", description: "Plough and level the field", date: addDays(base, 5) },
    { activity: "Sowing", description: "Sow seeds with seed drill", date: addDays(base, 10) },
    { activity: "First Irrigation", description: "Crown root irrigation", date: addDays(base, 21) },
    { activity: "First Fertilizer", description: "Apply Nitrogen top dressing", date: addDays(base, 30) },
    { activity: "Weed Control", description: "Remove weeds manually or herbicide", date: addDays(base, 40) },
    { activity: "Second Irrigation", description: "Tillering stage irrigation", date: addDays(base, 45) },
    { activity: "Pest Monitoring", description: "Check for aphids and termites", date: addDays(base, 60) },
    { activity: "Harvest", description: "Harvest when grains are hard", date: addDays(base, 130) }
  ],
  
  cotton: (base) => [
    { activity: "Land Preparation", description: "Deep ploughing and ridges", date: addDays(base, 7) },
    { activity: "Sowing", description: "Sow seeds in rows", date: addDays(base, 14) },
    { activity: "Thinning", description: "Remove weak plants", date: addDays(base, 25) },
    { activity: "First Fertilizer", description: "Apply Nitrogen and Phosphorus", date: addDays(base, 35) },
    { activity: "Pest Monitoring", description: "Check for bollworm and whitefly", date: addDays(base, 50) },
    { activity: "Second Fertilizer", description: "Apply Potash at flowering", date: addDays(base, 70) },
    { activity: "First Picking", description: "Harvest mature bolls", date: addDays(base, 150) },
    { activity: "Second Picking", description: "Harvest remaining bolls", date: addDays(base, 170) }
  ],
  
  sugarcane: (base) => [
    { activity: "Land Preparation", description: "Deep ploughing and leveling", date: addDays(base, 10) },
    { activity: "Planting", description: "Plant setts in furrows", date: addDays(base, 15) },
    { activity: "First Irrigation", description: "Light irrigation after planting", date: addDays(base, 20) },
    { activity: "Gap Filling", description: "Replace dead setts", date: addDays(base, 35) },
    { activity: "First Fertilizer", description: "Apply Nitrogen and Phosphorus", date: addDays(base, 45) },
    { activity: "Earthing Up", description: "Cover roots with soil", date: addDays(base, 90) },
    { activity: "Second Fertilizer", description: "Apply Nitrogen top dressing", date: addDays(base, 120) },
    { activity: "Pest Monitoring", description: "Check for borers and termites", date: addDays(base, 150) },
    { activity: "Harvest", description: "Harvest mature canes", date: addDays(base, 365) }
  ],
  
  maize: (base) => [
    { activity: "Land Preparation", description: "Plough and prepare seed bed", date: addDays(base, 5) },
    { activity: "Sowing", description: "Sow seeds in rows", date: addDays(base, 10) },
    { activity: "Thinning", description: "Maintain plant spacing", date: addDays(base, 20) },
    { activity: "First Fertilizer", description: "Apply Nitrogen fertilizer", date: addDays(base, 25) },
    { activity: "Weed Control", description: "Remove weeds", date: addDays(base, 35) },
    { activity: "Second Fertilizer", description: "Apply Nitrogen at knee height", date: addDays(base, 45) },
    { activity: "Pest Monitoring", description: "Check for stem borer and fall armyworm", date: addDays(base, 55) },
    { activity: "Harvest", description: "Harvest when cobs are mature", date: addDays(base, 90) }
  ],
  
  soybean: (base) => [
    { activity: "Land Preparation", description: "Plough and level field", date: addDays(base, 5) },
    { activity: "Sowing", description: "Sow seeds with seed drill", date: addDays(base, 10) },
    { activity: "Thinning", description: "Maintain plant population", date: addDays(base, 20) },
    { activity: "First Fertilizer", description: "Apply Phosphorus and Potash", date: addDays(base, 25) },
    { activity: "Weed Control", description: "Remove weeds", date: addDays(base, 30) },
    { activity: "Pest Monitoring", description: "Check for caterpillars and pod borer", date: addDays(base, 45) },
    { activity: "Flowering Stage", description: "Monitor moisture and pests", date: addDays(base, 60) },
    { activity: "Harvest", description: "Harvest when pods turn brown", date: addDays(base, 100) }
  ],
  
  tomato: (base) => [
    { activity: "Nursery Preparation", description: "Sow seeds in nursery", date: addDays(base, 5) },
    { activity: "Transplanting", description: "Transplant seedlings to field", date: addDays(base, 30) },
    { activity: "Staking", description: "Provide support to plants", date: addDays(base, 45) },
    { activity: "First Fertilizer", description: "Apply NPK fertilizer", date: addDays(base, 50) },
    { activity: "Pruning", description: "Remove side shoots", date: addDays(base, 60) },
    { activity: "Pest Monitoring", description: "Check for fruit borer and whitefly", date: addDays(base, 70) },
    { activity: "First Harvest", description: "Pick ripe fruits", date: addDays(base, 90) },
    { activity: "Continuous Harvest", description: "Pick fruits every 3-4 days", date: addDays(base, 120) }
  ],
  
  potato: (base) => [
    { activity: "Land Preparation", description: "Deep ploughing and ridges", date: addDays(base, 7) },
    { activity: "Planting", description: "Plant seed tubers", date: addDays(base, 10) },
    { activity: "Earthing Up", description: "Cover tubers with soil", date: addDays(base, 30) },
    { activity: "First Fertilizer", description: "Apply Nitrogen and Phosphorus", date: addDays(base, 35) },
    { activity: "Pest Monitoring", description: "Check for late blight and aphids", date: addDays(base, 50) },
    { activity: "Second Earthing Up", description: "Additional soil covering", date: addDays(base, 60) },
    { activity: "Harvest", description: "Harvest mature tubers", date: addDays(base, 90) }
  ],
  
  onion: (base) => [
    { activity: "Nursery Preparation", description: "Sow seeds in nursery", date: addDays(base, 5) },
    { activity: "Transplanting", description: "Transplant seedlings", date: addDays(base, 45) },
    { activity: "First Fertilizer", description: "Apply Nitrogen fertilizer", date: addDays(base, 60) },
    { activity: "Weed Control", description: "Remove weeds carefully", date: addDays(base, 70) },
    { activity: "Second Fertilizer", description: "Apply Potash for bulb development", date: addDays(base, 85) },
    { activity: "Pest Monitoring", description: "Check for thrips and purple blotch", date: addDays(base, 100) },
    { activity: "Harvest", description: "Harvest when tops fall over", date: addDays(base, 140) }
  ],
  
  groundnut: (base) => [
    { activity: "Land Preparation", description: "Plough and level field", date: addDays(base, 5) },
    { activity: "Sowing", description: "Sow seeds in rows", date: addDays(base, 10) },
    { activity: "Thinning", description: "Maintain plant spacing", date: addDays(base, 20) },
    { activity: "First Fertilizer", description: "Apply Phosphorus and Potash", date: addDays(base, 25) },
    { activity: "Weed Control", description: "Remove weeds", date: addDays(base, 35) },
    { activity: "Earthing Up", description: "Cover pegs with soil", date: addDays(base, 50) },
    { activity: "Pest Monitoring", description: "Check for leaf miner and aphids", date: addDays(base, 60) },
    { activity: "Harvest", description: "Harvest when leaves turn yellow", date: addDays(base, 120) }
  ]
};

const generateCropSchedule = (crop, sowingDate) => {
  const base = new Date(sowingDate);
  const cropLower = crop.toLowerCase();
  
  if (cropSchedules[cropLower]) {
    return cropSchedules[cropLower](base);
  }
  
  // Default schedule for unknown crops
  return [
    { activity: "Land Preparation", description: "Prepare field for sowing", date: addDays(base, 5) },
    { activity: "Sowing", description: "Sow seeds", date: addDays(base, 10) },
    { activity: "Fertilizer Application", description: "Apply fertilizers", date: addDays(base, 30) },
    { activity: "Pest Monitoring", description: "Monitor for pests and diseases", date: addDays(base, 45) },
    { activity: "Harvest", description: "Harvest crop", date: addDays(base, 90) }
  ];
};

module.exports = { generateCropSchedule };
