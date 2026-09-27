# Wander AI - Agentic Trip Planner ✈️🗺️

**Wander AI** is an agile, single-agent AI travel planner application built with **Next.js 16 (App Router)**, **Vercel AI SDK**, **Google Gemini 3.5**, **Tailwind CSS**, and **Leaflet.js**.

It generates customized day-by-day itineraries with estimated budgets in Indian Rupees (`₹`), clean daily schedules, interactive Leaflet route maps, recommended hotel stays, live weather forecasts, export capabilities (PDF/Print & `.ics` Calendar), and interactive stop management.

---

## 🌟 Key Features

1. **🤖 Agentic ReAct Tool-Calling**: Uses Vercel AI SDK and Google Gemini (`gemini-3.5-flash-lite`) to stream conversational summaries and populate structured itinerary cards.
2. **💰 Rupee Budget Estimation (`₹`)**: Calculates estimated total budgets and average per-day costs in Indian Rupees (`₹`).
3. **📅 Clean Day Schedules**: Simple day title formatting (`Day 1`, `Day 2`, `Day 3`) without confusing calendar date strings.
4. **🏨 Recommended Hotels & Booking Links**: Place 1 base hotel check-in on Day 1 with nightly price estimates (`₹3,500/night`) and direct links to Google Hotels.
5. **🗺️ Interactive Leaflet Route Map**: Dark-themed interactive map overlay featuring custom markers (Attractions, Dining, Stays) and dashed polyline travel routes.
6. **📥 Export & Share Suite**:
   - **Calendar (`.ics`)**: Auto-generates iCalendar files for Google Calendar, Apple Calendar, and Outlook.
   - **Print / PDF**: Optimized print layout for saving PDF trip plans.
   - **Shareable Link**: 1-click shareable URL encoder.
7. **☀️ Live Weather Badges**: Displays daily weather forecasts (temperature, sky condition, rain probability).
8. **🚗 Route Stats & Travel Times**: Estimates drive/walk durations and distances between consecutive stops (`🚗 15 mins • 3.5 km`).
9. **✏️ Interactive Stop Management**: Add custom stops or delete stops directly on the visual timeline with live state persistence.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (Turbopack, App Router, React 19)
- **AI Engine**: Vercel AI SDK (`ai@^4`, `@ai-sdk/google`) with Gemini API
- **Interactive Map**: Leaflet.js (`leaflet`, `react-leaflet`) with CartoDB Dark Matter tiles
- **Styling**: Tailwind CSS & Lucide Icons
- **Type Safety**: TypeScript & Zod schemas (`TripSchema`, `DaySchema`, `StopSchema`)

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js `v20.x` or higher
- npm or yarn

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

### Option A: Using Docker Compose (Recommended)

1. Ensure `.env.local` contains your `GOOGLE_GENERATIVE_AI_API_KEY`.
2. Build and start the container:

```bash
docker-compose up --build -d
```

3. Access the application at `http://localhost:3000`.

To stop the container:
```bash
docker-compose down
```

### Option B: Using Plain Docker CLI

```bash
# Build the Docker image
docker build -t wander-ai-trip-planner .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here \
  --name wander-ai \
  wander-ai-trip-planner
```

---

## 📦 How to Upload to GitHub (Manual Step-by-Step)

Follow these terminal commands to push this project to your GitHub repository:

```bash
# 1. Initialize Git (if not already initialized)
git init

# 2. Add all files to staging
git add .

# 3. Create initial commit
git commit -m "Initial commit: Wander AI Agentic Trip Planner with Docker & Leaflet Map"

# 4. Rename main branch
git branch -M main

# 5. Add your remote GitHub repository URL
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# 6. Push to GitHub
git push -u origin main
```

---

## 📄 License
MIT License
