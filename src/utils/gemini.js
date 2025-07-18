const {GoogleGenAI} = require('@google/genai')
require('dotenv').config()

const ai = new GoogleGenAI({
  apiKey: process.env.GEMENI_API_KEY,
});

const  generateCodenameGemini= async ()=>{
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "Suggest a unique codename for a secret agent gadget, like Nightfall or Phantom Blade. Just return the codename.",
            },
          ],
        },
      ],
    });

    const codename = response.candidates[0].content.parts[0].text.trim();
    return codename;
  } catch (err) {
    console.error("Gemini error:", err);
    return "failed";
  }
}

module.exports = {generateCodenameGemini}
