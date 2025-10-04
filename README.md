# CosmoConnect - Space Education Platform

CosmoConnect is an interactive educational platform that helps children learn about space weather, astronomy, and space exploration through engaging stories, interactive experiences, and real-time data from NASA.

## Features

- **Interactive Stories**: Follow Sunny the Solar Flare on adventures from the Sun to Earth
- **Real-time Space Weather Data**: View current Coronal Mass Ejections (CMEs) from NASA's DONKI database
- **Astronomy Picture of the Day**: Daily stunning space images from NASA
- **Educational Games**: Learning missions including gravity slingshot, satellite rescue, and more
- **AI-Powered Content**: Personalized bedtime stories and planet design with Gemini AI
- **Augmented Reality**: AR experience to see Sunny appear in your room
- **Multilingual Support**: Available in English, Spanish, French, German, and Hindi

## APIs Used

### 1. NASA APIs
- **Astronomy Picture of the Day (APOD)**: Provides daily stunning space images
- **DONKI CME Database**: Real-time data on Coronal Mass Ejections
- **CME Analysis**: Detailed analysis of solar events

### 2. Google Gemini AI
- **Content Generation**: Creates personalized stories, educational content, and interactive experiences
- **Image Generation**: Creates coloring pages and visual content
- **Chatbot**: Interactive Cosmo Buddy assistant

## Setup Instructions

1. **Environment Variables**:
   Create a `.env.local` file in the root directory with:
   ```
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

2. **Installation**:
   ```bash
   npm install
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

4. **Build**:
   ```bash
   npm run build
   ```

## Project Structure

```
├── components/          # React components
├── contexts/            # React contexts (LanguageContext)
├── i18n/                # Internationalization files
├── services/            # API services (NASA, Gemini)
├── App.tsx              # Main application component
├── index.tsx            # Entry point
└── types.ts             # TypeScript types
```

## Key Components

- **HomePage**: Main landing page with APOD and space weather dashboard
- **SolarStories**: Interactive stories about solar phenomena
- **BedtimeStories**: AI-generated personalized bedtime stories
- **LearningMissions**: Educational games and challenges
- **Explore**: Interactive data explorers and simulations
- **CosmoBuddy**: AI chatbot assistant
- **Achievements**: Gamification system

## Technologies Used

- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **A-Frame** for AR experiences
- **Google Gemini AI** for content generation
- **NASA Open APIs** for space data

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is for educational purposes and uses NASA's public APIs which are freely available for educational use.