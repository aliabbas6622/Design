import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Submission, AiProvider } from '../types';

// --- Gemini Implementation ---

const getGeminiClient = (apiKey: string) => {
  if (!apiKey) throw new Error("Gemini API key is missing.");
  return new GoogleGenAI({ apiKey });
};

const generateWordWithGemini = async (apiKey: string): Promise<string> => {
  const ai = getGeminiClient(apiKey);
  const response = await ai.models.generateContent({
    // Using gemini-2.5-flash for basic text tasks as recommended.
    model: 'gemini-2.5-flash',
    contents: 'Generate one single, unique, and fictional but pronounceable word that has no real-world meaning. The word should be between 6 and 12 letters long. Return only the word itself, with no explanation, punctuation, or formatting.',
  });
  return response.text.trim().replace(/[^a-zA-Z]/g, '');
};

const generateImageWithGemini = async (apiKey: string, prompt: string): Promise<string> => {
  const ai = getGeminiClient(apiKey);
  const fullPrompt = `A dreamy, ethereal, abstract digital painting representing the concept of '${prompt}'. Soft pastel color palette, gentle gradients, sense of light and wonder, beautiful.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: fullPrompt }] },
    config: { responseModalities: [Modality.IMAGE] },
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return part.inlineData.data;
  }
  throw new Error("No image data found in Gemini response");
};

const summarizeWithGemini = async (apiKey: string, word: string, submissions: Submission[]): Promise<string[]> => {
  const ai = getGeminiClient(apiKey);
  const prompt = `You are an AI that analyzes creative definitions for a made-up word. The word is "${word}". Below is a list of user-submitted definitions, some with upvote counts. Your task is to identify the top 3 most compelling, creative, or commonly recurring themes. Consider submissions with more "likes" as potentially more popular. Synthesize these into three concise, distinct definitions.
Submissions:\n${submissions.map(s => `- "${s.text}" (Likes: ${s.likes})`).join('\n')}`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { top_definitions: { type: Type.ARRAY, items: { type: Type.STRING } } }
      },
    },
  });
  const result = JSON.parse(response.text.trim());
  return result.top_definitions || [];
};

// --- OpenAI Implementation ---

const getOpenAiHeaders = (apiKey: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`
});

const generateWordWithOpenAI = async (apiKey: string): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: getOpenAiHeaders(apiKey),
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Generate one single, unique, and fictional but pronounceable word that has no real-world meaning. 6-12 letters. Return only the word itself, no explanation or punctuation.' }],
      max_tokens: 10,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "OpenAI word generation failed");
  return data.choices[0].message.content.trim().replace(/[^a-zA-Z]/g, '');
};

const generateImageWithOpenAI = async (apiKey: string, prompt: string): Promise<string> => {
  const fullPrompt = `A dreamy, ethereal, abstract digital painting representing the concept of '${prompt}'. Soft pastel color palette, gentle gradients, sense of light and wonder, beautiful.`;
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: getOpenAiHeaders(apiKey),
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: fullPrompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "OpenAI image generation failed");
  return data.data[0].b64_json;
};

const summarizeWithOpenAI = async (apiKey: string, word: string, submissions: Submission[]): Promise<string[]> => {
  const prompt = `You are an AI analyzing definitions for a made-up word: "${word}". From the following submissions (with like counts), identify the top 3 most compelling themes. Return a JSON object with a single key "top_definitions" which is an array of 3 strings.\nSubmissions:\n${submissions.map(s => `- "${s.text}" (Likes: ${s.likes})`).join('\n')}`;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: getOpenAiHeaders(apiKey),
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "OpenAI summarization failed");
  const result = JSON.parse(data.choices[0].message.content);
  return result.top_definitions || [];
};

// --- Service Wrappers ---

const handleApiError = (error: unknown, fallback: any) => {
  console.error("AI Service Error:", error);
  if (error instanceof Error) {
    alert(`AI Service Error: ${error.message}`);
  } else {
    alert("An unknown AI service error occurred.");
  }
  return fallback;
};

export const generateNonsenseWord = async (provider: AiProvider, apiKey: string): Promise<string> => {
  try {
    if (provider === 'openai') return await generateWordWithOpenAI(apiKey);
    return await generateWordWithGemini(apiKey);
  } catch (error) {
    return handleApiError(error, "Glimmerfang");
  }
};

export const generateAbstractImage = async (provider: AiProvider, apiKey: string, prompt: string): Promise<string> => {
  try {
    if (provider === 'openai') return await generateImageWithOpenAI(apiKey, prompt);
    return await generateImageWithGemini(apiKey, prompt);
  } catch (error) {
    return handleApiError(error, "");
  }
};

export const summarizeDefinitions = async (provider: AiProvider, apiKey: string, word: string, submissions: Submission[]): Promise<string[]> => {
  if (submissions.length === 0) return ["No definitions were submitted."];
  try {
    if (provider === 'openai') return await summarizeWithOpenAI(apiKey, word, submissions);
    return await summarizeWithGemini(apiKey, word, submissions);
  } catch (error) {
    return handleApiError(error, ["AI summarization failed. Please try again later."]);
  }
};