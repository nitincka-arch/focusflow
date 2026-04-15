# FocusFlow 🌊

FocusFlow is an AI-powered productivity architect designed for deep work. It helps you break down complex, overwhelming goals into manageable, sequential steps using the power of Google's Gemini AI.

## ✨ Features

- **AI Task Architect**: Instantly break down any goal into 3-5 actionable steps.
- **Immersive Focus Timer**: Stay in the zone with ambient sounds and a minimalist interface.
- **Progress Tracking**: Track your focus score, streaks, and total deep work time.
- **Persistence**: Your progress and current session are saved locally.
- **Responsive Design**: Works beautifully on desktop and mobile.

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **AI Engine**: [Google Gemini API](https://ai.google.dev/) (using `@google/genai`)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Components**: Custom UI built with [Base UI](https://base-ui.com/) and Tailwind.

## 🚀 Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A **Gemini API Key** (see below)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nitincka-arch/focusflow.git
   cd focusflow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
   *(Note: In the AI Studio environment, this is managed via the Secrets panel as `GEMINI_API_KEY`)*

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to `http://localhost:3000` (or the port specified in your terminal).

## 🔑 Getting a Gemini API Key

1. Go to the [Google AI Studio](https://aistudio.google.com/).
2. Click on **"Get API key"** in the sidebar.
3. Click **"Create API key in new project"**.
4. Copy your key and add it to your `.env` file as shown above.

## 📂 Project Structure

- `src/App.tsx`: The main application controller and state manager.
- `src/components/`: Individual screen components (Landing, Planning, Focus, etc.).
- `src/lib/gemini.ts`: Logic for interacting with the Gemini API.
- `src/lib/sounds.ts`: Audio management for focus music and feedback.
- `components/ui/`: Reusable low-level UI components (Button, Card, etc.).
- `public/`: Static assets like audio files.

## 🤖 AI Implementation Example

FocusFlow uses Gemini to architect your path. Here's the core logic found in `src/lib/gemini.ts`:

```typescript
// Uses gemini-3.1-flash-lite-preview for ultra-low latency
const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-lite-preview",
  contents: `Goal: "${task}". Break into 3-5 short, actionable steps.`,
  config: {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          duration: { type: Type.NUMBER }
        },
        required: ["text", "duration"]
      }
    }
  }
});
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
