// Simple test for Gemini API key
const { GoogleGenAI } = require("@google/genai");

// Use the API key from the .env.local file
const apiKey = "AIzaSyAXsGfrzl2dRMxessOvuGdjOC3BJfHGTrI";
console.log("Using API Key:", apiKey.substring(0, 10) + "...");

async function testGeminiAPI() {
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Test with a simple prompt
    const prompt = "Say hello in 3 different languages";
    
    console.log("Testing Gemini API...");
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    console.log("✅ Gemini API is working!");
    console.log("Response:", response.text);
  } catch (error) {
    console.error("❌ Gemini API failed:", error.message);
  }
}

testGeminiAPI();