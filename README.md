<div align="center">

# 🌾 किसान सेतु • Kisan Setu
### *Precision Agriculture, Real-Time Mandi Intelligence & Multi-Modal Cloud AI*

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%202.5-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

<p align="center">
  <b>Empowering Indian Farmers with Artificial Intelligence, Automated Agronomy & Direct Market Transparency.</b>
</p>

</div>

---

## 📖 Overview

**Kisan Setu (किसान सेतु)** is an enterprise-grade, full-stack Agricultural SaaS Platform built specifically to digitize, modernize, and empower farmers across India. Combining cutting-edge **Google Gemini 2.5 Multi-Modal AI**, live **AGMARKNET APMC Mandi rates**, hourly **Micro-Climate Weather Radars**, and interactive **5-Stage Crop Calendars**, Kisan Setu acts as an all-in-one digital agronomist and farm management companion.

---

## ✨ Core Features & Workflows

```
                                 ┌────────────────────────────────────────────────┐
                                 │            🌾 KISAN SETU ECOSYSTEM             │
                                 └───────────────────────┬────────────────────────┘
                                                         │
         ┌───────────────────┬───────────────────┼───────────────────┬───────────────────┐
         │                   │                   │                   │                   │
         ▼                   ▼                   ▼                   ▼                   ▼
  🩺 AI Crop Doctor    🗣️ Voice Assistant   📈 Mandi Arbitrage   🗓️ Crop Calendar    🌦️ Weather Radar
  (Gemini 2.5 Multi-   (Bilingual Speech   (2,800+ APMC Live    (5-Stage Milestone   (Hourly Precision
   Modal Diagnostics)   Sanitized Engine)   Price Forecasts)     Harvest Tracker)     Rain / Spray Alert)
```

### 1. 🩺 Google Gemini 2.5 Crop Disease Diagnostics
- **Multi-Modal Vision Engine:** Farmers can upload leaf photos or drag-and-drop sample crop images.
- **Precision Triage:** Instant diagnosis returning disease identity, scientific name, severity score, cause analysis, and dual **Chemical vs. Organic Remedies**.

### 2. 🗣️ AI Krishi Sathi — Bilingual Voice Assistant
- **Hands-Free Agronomy:** Instant Marathi, Hindi, and English voice queries powered by Google Gemini 2.5.
- **Natural Audio Synthesis:** Strips raw Markdown, emojis, and symbols prior to Web Speech synthesis for human-like conversational delivery.

### 3. 📈 AGMARKNET Live Mandi Arbitrage
- **2,800+ APMC Markets:** Real-time commodity spot rates, modal prices, daily price trends, and profitable mandi arbitrage recommendations.

### 4. 🗓️ 5-Stage Milestone Crop Calendar & Planner
- **Growth Stage Engine:** Tracks crops from *Germination → Vegetative → Flowering → Grain Filling → Harvest*.
- **Interactive Matrix:** Visual calendar with color-coded milestone dots, harvest countdowns, and daily task drawers.

### 5. 🌦️ Micro-Climate Meteorological Radar
- **Hourly Weather Radar:** Real-time temperature, wind velocity, precipitation probability, and humidity with actionable spraying advice.

### 6. 🎥 Cinematic Full-Viewport Video Auth Portal
- **Realistic Indian Farmer Welcome:** Full-viewport continuous video background (`<video autoPlay muted loop playsInline>`) with dark emerald gradient overlay.
- **Centered Glassmorphic Console:** Rounded 32px floating card with `🇮🇳 +91` mobile validation, eye password toggles, **1-Click Auto-Fill Demo Login**, and multi-language dialect switching (**English, हिन्दी, मराठी**).

### 7. 💎 Universal React SaaS Confirmation Modals
- **Zero Browser Popups:** Replaced all native `window.confirm()` and `window.alert()` calls with modern, spring-animated glassmorphic dialogs for safe logout and deletion workflows.

---

## 🏛️ System Architecture

```
digital-krishi-frontend/
├── src/
│   ├── components/
│   │   ├── common/              # Sidebar (336px), DashboardHeader, ConfirmModal, ProfileDropdown
│   │   ├── dashboard/           # SummaryMetricCard, FeaturePreviewCard
│   │   ├── market/              # MandiRateTable, PriceChart
│   │   ├── profile/             # ProfileCard, EditProfileModal
│   │   └── weather/             # WeatherForecastCard, RadarWidget
│   ├── pages/                   # Login, Register, Dashboard, CropsPage, TasksPage,
│   │                            # CropCalendarPage, DiseaseDetectionPage, VoiceAssistantPage, SettingsPage
│   ├── services/                # Axios API instance, ProfileService, WeatherService, MarketService
│   ├── styles/                  # Dashboard.css, Login.css, Settings.css, VoiceAssistant.css
│   └── utils/                   # Multilingual translation dictionaries (EN, HI, MR)
│
digital-krishi-backend/
├── src/
│   ├── ai/                      # Google Gemini 2.5 integration & prompt engineering
│   ├── controllers/             # AuthController, ProfileController, CropController, TaskController
│   ├── models/                  # User, Crop, Task, Market, Alert schemas (Mongoose)
│   ├── routes/                  # RESTful API route gateways (/api/auth, /api/crops, /api/tasks, etc.)
│   └── services/                # CropIntelligenceService, WeatherService, MarketService
├── server.js                    # Express gateway with static uploads & CORS handling
└── seed.js                      # Automated mock data seeder
```

---

## ⚙️ Environment Configuration

### Backend Setup (`digital-krishi-backend/.env`)
Copy `.env.example` to `.env` in the backend directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/kisan-setu

# JWT Authentication
JWT_SECRET=your_jwt_super_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# Google Gemini AI Key
GEMINI_API_KEY=your_gemini_api_key_here

# Weather API (OpenWeatherMap)
WEATHER_API_KEY=your_openweather_api_key_here

# Client URL for CORS
CLIENT_URL=http://localhost:5173
```

### Frontend Setup (`digital-krishi-frontend/.env`)
Copy `.env.example` to `.env` in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/pawanrathod45/kisan-setu.git
cd kisan-setu
```

### 2. Start the Backend API Server
```bash
cd digital-krishi-backend
npm install
node seed.js         # Optional: seed sample crops, tasks, and users
npm run dev          # Starts server on http://localhost:5000
```

### 3. Start the Frontend Application
```bash
cd ../digital-krishi-frontend
npm install
npm run dev          # Starts Vite dev server on http://localhost:5173
```

### 4. Demo Login Credentials
For instant preview, use the built-in **1-Click Auto-Fill** button on `/login`:
- **Mobile:** `7972822860`
- **Password:** `password123`
- **Role:** Farmer (Redirects to `/farmer/dashboard`)

---

## 📱 REST API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate farmer/officer & return JWT tokens |
| `POST` | `/api/auth/register` | Register new farmer account |
| `GET` | `/api/profile` | Retrieve farmer dossier & farm statistics |
| `PUT` | `/api/profile` | Update profile details & location |
| `POST` | `/api/profile/upload` | Upload avatar / farm photo to `/uploads` |
| `GET` | `/api/crops` | Retrieve active crop portfolio |
| `POST` | `/api/crops` | Add new crop with sowing date & acreage |
| `DELETE` | `/api/crops/:id` | Remove crop & spray history |
| `GET` | `/api/tasks` | Get sowing, irrigation, and pesticide tasks |
| `POST` | `/api/tasks` | Schedule a new task |
| `POST` | `/api/chat` | Google Gemini 2.5 multi-lingual Agronomy Assistant |
| `POST` | `/api/detect` | Multi-modal crop disease image analysis |
| `GET` | `/api/weather?city=Pune` | Fetch micro-climate weather radar |
| `GET` | `/api/market?crop=Wheat` | Fetch APMC mandi rates & price forecast |

---

## 🌐 Multi-Lingual Dialect Support

Kisan Setu natively supports instant real-time translation with local storage persistence across:
- 🇬🇧 **English (IN)**
- 🇮🇳 **हिन्दी (Hindi)**
- 🚩 **मराठी (Marathi)**

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).

<div align="center">
  <b>🌾 Dedicated to the Hardworking Farmers of India 🇮🇳</b>
</div>
