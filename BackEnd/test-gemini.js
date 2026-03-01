import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function test() {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // you must pick a model that exists for the v1beta API
    // run `ai.models.list()` or look at the error message to see available names
    // the previous name "gemini-1.5-flash-latest" is not supported and triggered
    // a 404.  switching to a valid model such as the 2.5 flash release works:
    const result = await ai.models.generateContent({
      model: "models/gemini-2.5-flash",
      contents: "Say hello"
    });

    console.log("SUCCESS:");
    console.log(result.text);

  } catch (error) {
    console.error("REAL ERROR:");
    console.error(error);
  }
}

test();