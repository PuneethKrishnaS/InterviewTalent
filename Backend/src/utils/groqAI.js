import Groq from "groq-sdk";
import { appError } from "./appError.js";

export const groqHamdlerAI = async ({ messages = [] }) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const AI_Response = await groq.chat.completions.create({
      messages,
      model: "openai/gpt-oss-120b",
      reasoning_effort: "medium",
      response_format: { type: "json_object" },
    });

    return JSON.parse(AI_Response.choices[0]?.message?.content);
  } catch (error) {
    throw new appError(401, error);
  }
};
