import { GoogleGenAI, Content, Chat, Type } from "@google/genai";
import { CMEData, PerspectiveCharacter } from '../types';

let ai: GoogleGenAI | null = null;
let isInitialized = false;

// Lazily initialize the AI client, once per session.
const getAi = (): GoogleGenAI | null => {
    if (isInitialized) {
        return ai;
    }
    isInitialized = true;
    try {
        // Initialize with the API key from environment variables as per security best practices.
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set. Please check your environment variables.");
            return null;
        }
        ai = new GoogleGenAI({ apiKey });
    } catch (error) {
        console.error("Failed to initialize GoogleGenAI. Ensure the API_KEY environment variable is set.", error);
        ai = null;
    }
    return ai;
}

export const getPerspective = async (character: PerspectiveCharacter): Promise<string> => {
  const aiInstance = getAi();
  if (!aiInstance) {
    return `Hi! I'm an ${character}. Ask me about space weather later!`;
  }

  const prompt = `You are a ${character} explaining to a 7-year-old child how space weather affects your job. Write 2-3 fun, simple sentences. Don't be scary. Frame it as a cool challenge or a beautiful phenomenon.`;
  
  try {
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429")) {
        console.warn(`Gemini API rate limit reached for 'getPerspective' on ${character}.`);
        return `I'm a bit busy with cosmic traffic right now! Ask me again in a moment. 🚦`;
    }
    console.error(`Error fetching perspective for ${character}:`, errorMessage);
    return `Hi! I'm an ${character}. Ask me about space weather later!`;
  }
};

export const getAuroraStory = async (): Promise<string> => {
  const aiInstance = getAi();
  if (!aiInstance) {
    return "The sky is glowing with sleepy starlight tonight.";
  }
  
  const prompt = "Write a magical, 3-sentence mini-story for a child who has just spotted an aurora. The story should be about Sunny the Solar Flare painting the sky with cosmic colors.";

  try {
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429")) {
        console.warn("Gemini API rate limit reached for 'getAuroraStory'.");
        return "The cosmic paintbrushes are recharging! Please check for a new story in a moment. ✨";
    }
    console.error("Error fetching aurora story:", errorMessage);
    return "The sky is glowing with sleepy starlight tonight.";
  }
};

export const getChatbotResponse = async (history: Content[], newMessage: string): Promise<string> => {
  const aiInstance = getAi();
  if (!aiInstance) {
    return "Oops! My radio seems to be getting some static. Could you ask me that again? 📡";
  }
  
  try {
    const chat = aiInstance.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction: "You are Cosmo Buddy, a friendly and enthusiastic AI assistant for a kids' space education website called CosmoConnect. Your goal is to answer questions about space, astronomy, and space exploration in a way that is simple, exciting, and easy for a 7-12 year old to understand. Use fun analogies, keep your answers to 3-4 sentences, and always be encouraging and positive. Use emojis! 🚀✨🪐",
      },
    });

    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429")) {
        console.warn("Gemini API rate limit reached for 'getChatbotResponse'.");
        return "Whoa, so many questions! My circuits need a moment to cool down. Try again in a bit! 冷却";
    }
    console.error("Error getting chatbot response:", errorMessage);
    return "Oops! My radio seems to be getting some static. Could you ask me that again? 📡";
  }
};

export const getPlanetDesignerResponse = async (history: Content[], newMessage: string): Promise<string> => {
  const aiInstance = getAi();
  if (!aiInstance) {
    return "Oh dear, my comms are a bit spacey! Can you repeat that? 🛰️";
  }
  
  const systemInstruction = "You are a friendly, creative space guide named 'Nova' helping a child design a new planet. Your goal is to be encouraging, ask one question at a time to guide them, and offer two fun, imaginative suggestions. After they answer, confirm their choice with excitement and then ask the next question. Explain simple science concepts in a fun way. Your steps are: 1. Name, 2. Color/Appearance, 3. Atmosphere, 4. Unique Feature (like rings or giant volcanoes), 5. Life. Keep your responses short (2-3 sentences) and use lots of emojis. 🌟🪐🎨 Start by introducing yourself and asking for the planet's name.";

  try {
    const chat = aiInstance.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction,
      },
    });

    const response = await chat.sendMessage({ message: newMessage });
    return response.text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429")) {
        console.warn("Gemini API rate limit reached for 'getPlanetDesignerResponse'.");
        return "My planet-designing machine is overheating from all the creativity! Let's take a short break. 🛠️";
    }
    console.error("Error getting planet designer response:", errorMessage);
    return "Oh dear, my comms are a bit spacey! Can you repeat that? 🛰️";
  }
};

export const getStoryStream = (history: Content[]): Chat | null => {
    const aiInstance = getAi();
    if (!aiInstance) {
        return null;
    }
    const chat = aiInstance.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: {
            systemInstruction: `You are a master storyteller for children ages 7-12. You are telling an interactive, branching-path story about a character named Sunny the Solar Flare.
            - Your tone is exciting, wondrous, and full of positive energy. Use lots of onomatopoeia (like WHOOSH, ZAP, FWOOM) and vivid descriptions.
            - Keep each story segment very short (2-4 sentences).
            - After each segment, you MUST present the child with exactly two choices for what happens next.
            - Format the choices PERFECTLY like this, on new lines:
            [CHOICE 1: A short, exciting description of the choice]
            [CHOICE 2: Another short, exciting description]
            - Do not add any text after the second choice.
            - When the user makes a choice, continue the story based on their input with another story segment and two new choices.
            - Start the story by describing Sunny feeling a buildup of energy on the Sun, ready for an adventure.
            `
        },
    });
    return chat;
};

export const getPlanetFact = async (planetName: string): Promise<string> => {
  const aiInstance = getAi();
  if (!aiInstance) {
    return `The universe is full of wonders, and ${planetName} is one of them! ✨`;
  }
  
  const prompt = `Tell me one amazing, fun fact about the planet ${planetName}, suitable for a 7-12 year old child. Keep it to 1-2 sentences. Start with a fun greeting like "Wow!" or "Did you know?". Use an emoji.`;

  try {
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429")) {
        console.warn(`Gemini API rate limit reached for 'getPlanetFact' on ${planetName}.`);
        return `I'm searching my cosmic library for a fact about ${planetName}, but the pages are stuck! Try again in a moment. 📚`;
    }
    console.error(`Error fetching fact for ${planetName}:`, errorMessage);
    return `The universe is full of wonders, and ${planetName} is one of them! ✨`;
  }
};

export const getJWSTFact = async (partName: string): Promise<string> => {
  const aiInstance = getAi();
  if (!aiInstance) {
    return `The ${partName} is a very important part of the telescope that helps us see distant galaxies! 🌌`;
  }

  const prompt = `In 1-2 simple sentences, explain what the '${partName}' of the James Webb Space Telescope does. Make it easy for a 7-12 year old child to understand. Use a cool analogy if you can! 🔭`;

  try {
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429")) {
        console.warn(`Gemini API rate limit reached for 'getJWSTFact' on ${partName}.`);
        return `The telescope's data stream is a bit busy right now. I'll have that fact for you in a jiffy! 🛰️`;
    }
    console.error(`Error fetching fact for ${partName}:`, errorMessage);
    return `The ${partName} is a very important part of the telescope that helps us see distant galaxies! 🌌`;
  }
};

export const getBedtimeStory = async (topic?: string, mood?: string): Promise<{ story: string; imagePrompt: string; }> => {
  const aiInstance = getAi();
  if (!aiInstance) {
    return { 
      story: "The moon is softly humming a lullaby to the sleeping stars. 🌙",
      imagePrompt: "A gentle, smiling moon humming a lullaby to tiny, sleeping stars in a soft, dreamy night sky, digital art."
    };
  }
  
  const prompt = `Write a magical, 3-5 sentence bedtime story for a child.
  ${topic ? `The main character or topic should be: "${topic}".` : ''}
  The mood of the story should be ${mood || 'calming'}.
  Keep it short, sweet, and imaginative.
  Also, create a simple, descriptive prompt for an image generation model that captures the essence of the story. The prompt should describe a scene in a dreamy, whimsical, digital art style.
  `;

  try {
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            story: {
              type: Type.STRING,
              description: 'The bedtime story for the child.',
            },
            imagePrompt: {
              type: Type.STRING,
              description: 'A descriptive prompt for an image generation AI based on the story.',
            },
          },
          required: ["story", "imagePrompt"],
        },
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429")) {
        console.warn("Gemini API rate limit reached for 'getBedtimeStory'.");
        return { 
            story: "The storyteller of the stars is taking a brief pause. A new tale will be ready soon! 📖",
            imagePrompt: "A gentle, smiling moon humming a lullaby to tiny, sleeping stars in a soft, dreamy night sky, digital art."
        };
    }
    console.error("Error fetching bedtime story:", errorMessage);
    return { 
      story: "The moon is softly humming a lullaby to the sleeping stars. 🌙",
      imagePrompt: "A gentle, smiling moon humming a lullaby to tiny, sleeping stars in a soft, dreamy night sky, digital art."
    };
  }
};

export const getObscureSpaceFact = async (): Promise<string> => {
  const aiInstance = getAi();
  if (!aiInstance) {
    return "Did you know that in space, no one can hear you scream because there is no air to carry sound waves? Spooky! 👻";
  }

  const prompt = `Tell me one obscure, fun, and weird space fact. Make it short and snappy (1-2 sentences). Use an emoji.`;

  try {
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429")) {
        console.warn("Gemini API rate limit reached for 'getObscureSpaceFact'.");
        return "The universe is full of secrets, and I'm trying to grab one for you! The connection is a bit slow. Try again in a moment. ✨";
    }
    console.error("Error fetching obscure space fact:", errorMessage);
    return "Did you know that a day on Venus is longer than its year? Time gets weird out here! ⏳";
  }
};

export const getSpaceCraftInstructions = async (craftTitle: string): Promise<string> => {
  const aiInstance = getAi();
  if (!aiInstance) {
    return "My instruction manual seems to have floated away... 🛰️ Try again in a moment!";
  }
  
  const prompt = `You are a helpful guide for kids' crafts. Provide simple, step-by-step instructions for a child to make a '${craftTitle}' using common household items (like cardboard, bottles, tape, scissors). Use a numbered list. Keep the tone fun and encouraging. Use emojis! 🎨✂️🚀. The instructions should be easy to follow for a 7-10 year old.`;

  try {
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error fetching instructions for ${craftTitle}:`, errorMessage);
    return "My instruction manual seems to have floated away... 🛰️ Try again in a moment!";
  }
};


export const generateColoringPage = async (theme: string): Promise<string | null> => {
    const aiInstance = getAi();
    if (!aiInstance) {
        return null;
    }

    const prompt = `A simple black and white coloring page for a child of a ${theme}. The image should have thick, clean, bold outlines and no shading or color. The background must be white. The style should be simple, cute, and clear for coloring.`;

    try {
        const response = await aiInstance.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        return null;
    } catch (error: unknown) {
        let errorMessage = "An unknown error occurred while generating the coloring page.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error generating coloring page:", errorMessage);
        return null;
    }
};