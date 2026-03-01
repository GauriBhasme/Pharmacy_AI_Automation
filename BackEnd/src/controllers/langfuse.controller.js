import { langfuse } from "../lib/langfuse.js";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const chatWithAgent = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  const trace = langfuse.trace({
    name: "chat-request",
    userId: userId,
  });

  const generation = trace.generation({
    name: "openai-call",
    model: "gpt-4o-mini",
    input: message,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    const output = response.choices[0].message.content;

    generation.end({
      output: output,
    });

    trace.end();

    res.json({ reply: output });

  } catch (error) {
    trace.event({
      name: "error",
      level: "ERROR",
      message: error.message,
    });

    trace.end();
    res.status(500).json({ error: "Something went wrong" });
  }
};