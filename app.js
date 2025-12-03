import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const resp = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: "你是誰？",
});

console.log(resp.text);
