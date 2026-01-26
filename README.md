# 🎮 Game Icon Generator - 2025 Edition

A modern, cozy RPG-themed web application for generating game icons using AI. Built with Next.js 15, TypeScript, and Tailwind CSS v4, featuring a warm and inviting user interface inspired by casual RPG games.

## ✨ Features

- 🎨 **Modern AI Integration**: Google AI (Nano Banana) and OpenAI DALL-E support
- 🏰 **Cozy RPG Theme**: Warm color palette with cream, sage, warmwood, and sunset tones
- ⚡ **Next.js 15**: Latest React framework with Turbopack for ultra-fast development
- 🎯 **TypeScript**: Full type safety throughout the application
- 🎨 **Tailwind CSS v4**: Modern utility-first CSS framework
- 🔐 **Secure API**: Environment-based configuration with proper error handling
- 📱 **Responsive Design**: Beautiful UI that works on all devices

## 🎯 AI Providers

### Google AI (Nano Banana) - Recommended ⭐
- **Model**: Gemini 2.5 Flash Image Generation
- **Status**: Limited (Free tier restricted)
- **Cost**: $0.02-0.04 per image
- **Quality**: 4/5 stars
- **Speed**: 5/5 lightning bolts

### OpenAI (DALL-E) - Deprecated ⚠️
- **Model**: DALL-E 3 & DALL-E 2
- **Status**: Deprecated (Ends May 12, 2026)
- **Cost**: $0.040-0.080 per image
- **Quality**: 5/5 stars
- **Speed**: 3/5 lightning bolts

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- API keys for your chosen AI provider

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd icon-generator-2025
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Google AI API Key (Recommended)
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here

   # OpenAI API Key (Optional - Deprecated)
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

Our cozy RPG color palette creates a warm, inviting atmosphere:

- **Cream** (`#fefcf8` - `#765a27`): Primary background and content
- **Sage** (`#f6f8f4` - `#334529`): Accents and interactive elements
- **Warmwood** (`#faf8f5` - `#574233`): Text and borders
- **Sunset** (`#fef8f0` - `#762d14`): Highlights and warnings

## 📁 Project Structure

```
src/
├── app/                    # Next.js 13+ app directory
│   ├── api/generate/       # AI generation API endpoint
│   ├── globals.css         # Global styles with custom color system
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Home page with icon generator
├── components/             # Reusable React components
│   └── ProviderSelector.tsx # AI provider selection component
├── config/                 # Configuration files
│   └── providers.ts        # AI provider configurations
├── services/               # Business logic services
│   └── ai.ts              # AI service abstraction layer
└── types/                  # TypeScript type definitions
    └── ai.ts              # AI-related type definitions
```

## 🔧 Configuration Files

- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration with custom colors
- `next.config.ts` - Next.js configuration
- `postcss.config.mjs` - PostCSS configuration
- `eslint.config.mjs` - ESLint configuration

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_AI_API_KEY` | Google AI Studio API key | Recommended |
| `OPENAI_API_KEY` | OpenAI API key | Optional (Deprecated) |

## 🎮 Usage

1. **Select AI Provider**: Choose between Google AI (Nano Banana) or OpenAI DALL-E
2. **Configure Settings**: Select model, quality, and style options
3. **Enter Prompt**: Describe the game icon you want to generate
4. **Generate**: Click the generate button and wait for your magical creation!
5. **Download**: Save your generated icon for use in your game

## 🚨 Known Issues

- Google AI free tier is severely limited (0 requests/day as of 2025)
- OpenAI DALL-E is deprecated and will be discontinued on May 12, 2026
- Billing setup required for most AI providers

## 🔮 Future Enhancements

- Additional AI provider support
- Image editing capabilities
- Batch generation
- Icon template library
- Export in multiple formats
- Icon size optimization

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with ❤️ using Next.js 15 and Tailwind CSS v4
- AI generation powered by Google AI and OpenAI
- Cozy RPG aesthetic inspired by indie game design
- Icons and emojis for magical user experience
