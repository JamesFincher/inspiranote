import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TileData, TileCategory, TileContent, TileStyleHints, TileLifecycle, DebugLogEntryType, GeminiRequestInput } from '../types';
import { API_KEY, GEMINI_MODEL_TEXT, DEFAULT_TILE_DURATION, IS_GEMINI_API_KEY_PLACEHOLDER } from '../constants';

let ai: GoogleGenAI | null = null;

const initializeGeminiClient = () => {
  if (IS_GEMINI_API_KEY_PLACEHOLDER) {
    console.error("CRITICAL: Google Gemini API Key is a placeholder. Please replace 'YOUR_GOOGLE_GEMINI_API_KEY_HERE' in constants.ts with your actual key.");
    return null;
  }
  if (!API_KEY) {
    console.error("CRITICAL: Google Gemini API Key is missing. Please set it in constants.ts or as an environment variable.");
    return null;
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: API_KEY as string });
  }
  return ai;
};


export const generateId = (): string => Math.random().toString(36).substring(2, 11);

interface GeminiTileResponse {
  category: TileCategory;
  title: string;
  text: string;
  links?: string[];
  palette: "primary" | "secondary" | "accent" | "neutral" | "warning";
  priority: number; // 1-10
}

const createPrompt = (input: GeminiRequestInput): string => {
  const { transcript, summary, topics } = input;

  const escapedTranscript = transcript.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  const escapedSummary = summary?.replace(/`/g, '\\`').replace(/\$\{/g, '\\${}');

  let contextBlock = `User's full spoken utterance (transcript):\n"${escapedTranscript}"\n`;
  if (escapedSummary) {
    contextBlock += `\nAI-generated summary of the utterance (use this for conciseness if appropriate):\n"${escapedSummary}"\n`;
  }
  if (topics && topics.length > 0) {
    contextBlock += `\nAI-detected topics in the utterance (use these for thematic hints):\n- ${topics.join("\n- ")}\n`;
  }

  return `
    You are an AI assistant helping a user brainstorm by transforming their spoken ideas into structured "idea tiles".
    Analyze the provided user utterance data:
    ${contextBlock}

    Respond with a single, valid JSON object strictly matching this schema:
    {
      "category": "fact-check" | "resource" | "creative" | "summary" | "action-item" | "question" | "observation",
      "title": "string", // Max 10 words, concise, engaging, and directly reflecting the core idea. Use topics/summary for hints.
      "text": "string", // Max 30 words, brief explanation or action. Use summary if available, otherwise keep it tight.
      "links": ["string"?, "string"?], // Optional, max 2 relevant URLs. Omit or use [] if none.
      "palette": "primary" | "secondary" | "accent" | "neutral" | "warning",
      "priority": "integer" // 1 (lowest) to 10 (highest)
    }

    Key Guidelines for Generating Tile Content:

    1.  **Core Idea Extraction**:
        *   Prioritize the provided \`summary\` (if available) for the \`title\` and \`text\` to ensure conciseness and capture the main point.
        *   Use \`topics\` (if available) to refine the theme for \`title\` and \`category\`.
        *   Refer to the full \`transcript\` for nuances, specific keywords, or if the summary/topics are too generic.
        *   "title": Must be highly relevant. Make it catchy and action-oriented if appropriate.
        *   "text": Briefly elaborate or suggest a clear next step. Avoid generic phrases.

    2.  **Categorization Logic (Leverage Topics/Summary)**:
        *   "fact-check": User wants to verify information, check data, or get a factual answer. Often phrased as a question about data/facts.
        *   "resource": User suggests looking up information, finding a guide, tool, article.
        *   "creative": New ideas, brainstorming, "what if" scenarios, suggestions for change.
        *   "summary": User makes a concluding remark, asks for a recap, states a key takeaway. If Deepgram provided a summary, this category is a good candidate if no other intent is clear.
        *   "action-item": User states a clear task or something that needs to be done. (e.g., "We need to schedule a meeting", "Send the report to John").
        *   "question": User poses an open-ended question, seeks opinions, or clarification beyond simple facts. (e.g., "What do you all think about this approach?", "How can we improve X?").
        *   "observation": User makes a statement about something they noticed or a current state. (e.g., "The UI looks a bit cluttered.", "It's raining outside.").

    3.  **Handling Vague Inputs (Even with Summary/Topics)**:
        *   If the overall input (transcript, summary, topics) is still vague or lacks clear actionable intent (e.g., "hmm," "okay so...", "interesting"), create a tile that reflects this.
        *   Use "creative" or "observation". Title: "Fleeting Thought", "User Musings", "Noted Observation". Text: "User expressed [brief summary/topic] without a clear next step." or "User said: [short snippet]".
        *   Example for vague input "Hmm, that pattern...":
            Input: { transcript: "Hmm, that pattern...", summary: "User observed a pattern.", topics: ["pattern analysis"] }
            Output: {"category": "observation", "title": "Pattern Observed", "text": "User noted 'Hmm, that pattern...'. Consider its significance.", "links": [], "palette": "neutral", "priority": 3}

    4.  **Link Generation**: Only if EXPLICITLY mentioned or extremely obvious (e.g., "check Wikipedia for X"). Default to [].

    5.  **Palette & Priority**:
        *   'primary': Core tasks, facts. 'secondary': Resources, less critical info. 'accent': Creative, new ideas. 'neutral': Summaries, observations. 'warning': Potential issues or urgent flags.
        *   Priority: Higher for clear tasks/questions (6-9). Lower for general observations (1-4). Standard ideas (5-7).

    6.  **AVOID (CRITICAL!):**
        *   Generic tiles. Make them specific to the user's words (especially the summary/topics).
        *   Inventing complex ideas if the input is simple. Faithfully represent the user's intent.
        *   Putting "Prio" or "Priority" in "title" or "text".

    Examples of GOOD Transformations (using potential Deepgram input):

    Input: { transcript: "Can we find out what our competitors did for their last product launch? That's important.", summary: "Research competitor product launch strategies.", topics: ["competitor analysis", "product launch"] }
    JSON Output:
    {
      "category": "action-item",
      "title": "Analyze Competitor Launch",
      "text": "Research competitor strategies from recent product launches. (Summary: Research competitor product launch strategies)",
      "links": [],
      "palette": "primary",
      "priority": 8
    }

    Input: { transcript: "So, the key takeaway is ensuring alignment on the Q4 roadmap goals. Let's make that a priority.", summary: "Ensure Q4 roadmap goal alignment.", topics: ["roadmap", "q4 goals", "team alignment"] }
    JSON Output:
    {
      "category": "summary",
      "title": "Align on Q4 Roadmap",
      "text": "Key takeaway: Ensure team alignment on Q4 roadmap goals.",
      "links": [],
      "palette": "primary",
      "priority": 9
    }
    
    Input: { transcript: "Application testing is currently underway, everything seems stable so far.", summary: "Application testing is ongoing and stable.", topics: ["application testing", "software stability"] }
    JSON Output:
    {
        "category": "observation",
        "title": "App Testing Update",
        "text": "Status: Application testing is in progress and appears stable.",
        "links": [],
        "palette": "neutral",
        "priority": 5
    }

    Now, analyze the provided user utterance data and generate the JSON object:
  `;
};

const createErrorTile = (title: string, text: string, x: number, y: number, palette: TileStyleHints["palette"] = "warning"): TileData => {
    return {
      id: generateId(),
      category: TileCategory.Observation,
      content: { title, text },
      styleHints: { palette, priority: 1 },
      lifecycle: { durationMs: DEFAULT_TILE_DURATION, pauseOnHover: true, allowPin: true },
      x, y, rotation: 0, zIndex: Math.floor(Date.now() / 1000), isPinned: false,
    };
};

export const generateTileIdea = async (
    input: GeminiRequestInput,
    x: number, 
    y: number,
    addDebugLogEntry: (type: DebugLogEntryType, title: string, data: any) => void
): Promise<TileData> => {
  const logTitleSuffix = `(for "${input.transcript.substring(0, 30)}${input.transcript.length > 30 ? "..." : ""}")`;
  
  const geminiClient = initializeGeminiClient();
  if (!geminiClient) {
    const errorMsg = "Gemini API Key is not configured. Please set it in constants.ts.";
    addDebugLogEntry(DebugLogEntryType.GEMINI_ERROR, `Gemini Initialization Failed ${logTitleSuffix}`, { message: errorMsg, originalInput: input });
    return createErrorTile("Gemini Config Error", errorMsg, x, y, "warning");
  }

  const prompt = createPrompt(input);
  addDebugLogEntry(DebugLogEntryType.GEMINI_PROMPT, `Gemini Prompt ${logTitleSuffix}`, { prompt, originalInput: input });

  try {
    const response: GenerateContentResponse = await geminiClient.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4, 
        topP: 0.9,
        topK: 40
      }
    });

    addDebugLogEntry(DebugLogEntryType.GEMINI_RAW_RESPONSE, `Gemini Raw Response ${logTitleSuffix}`, response.text);

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr) as GeminiTileResponse;
    addDebugLogEntry(DebugLogEntryType.GEMINI_PARSED_RESPONSE, `Gemini Parsed Data ${logTitleSuffix}`, parsedData);

    let finalCategory = parsedData.category;
    if (!Object.values(TileCategory).includes(parsedData.category)) {
        console.warn(`Invalid category from Gemini: ${parsedData.category}. Defaulting to 'observation'. Snippet: "${input.transcript}"`);
        addDebugLogEntry(DebugLogEntryType.GEMINI_ERROR, `Invalid Category from Gemini ${logTitleSuffix}`, `Received: ${parsedData.category}, Defaulted to 'observation'.`);
        finalCategory = TileCategory.Observation;
    }
    
    const content: TileContent = {
      title: parsedData.title || "Idea Processing Error",
      text: parsedData.text || "Could not generate details for this idea.",
      links: parsedData.links && parsedData.links.length > 0 ? parsedData.links.filter(link => typeof link === 'string' && (link.startsWith('http://') || link.startsWith('https://'))) : undefined,
    };

    const styleHints: TileStyleHints = {
      palette: parsedData.palette || "neutral",
      priority: Math.max(1, Math.min(10, parseInt(String(parsedData.priority), 10) || 3)),
    };

    const lifecycle: TileLifecycle = {
      durationMs: DEFAULT_TILE_DURATION,
      pauseOnHover: true,
      allowPin: true,
    };

    const finalTileData: TileData = {
      id: generateId(),
      category: finalCategory,
      content,
      styleHints,
      lifecycle,
      x: x, 
      y: y,
      rotation: Math.random() * 6 - 3,
      zIndex: Math.floor(Date.now() / 1000), 
      isPinned: false,
    };
    
    addDebugLogEntry(DebugLogEntryType.GEMINI_FINAL_TILE, `Final Tile Created ${logTitleSuffix}`, finalTileData);
    return finalTileData;

  } catch (error) {
    console.error('Error generating tile idea with Gemini. Input:', input, 'Error:', error);
    const err = error as Error;
    addDebugLogEntry(DebugLogEntryType.GEMINI_ERROR, `Gemini Error ${logTitleSuffix}`, { 
        message: err.message, 
        stack: err.stack, 
        originalInput: input 
    });

    let errorTitle = "Idea Capture Failed";
    let errorText = `Could not process: "${input.transcript.substring(0,40)}...". Try rephrasing.`;
    let errorCategory = TileCategory.Observation;
    let errorPalette: TileStyleHints["palette"] = "warning";

    if (err.message.toLowerCase().includes("json.parse") || err.message.toLowerCase().includes("unexpected token")) {
        errorTitle = "AI Formatting Error";
        errorText = "AI response was not valid JSON. Please try again. Logged.";
        errorCategory = TileCategory.Creative; 
    } else if (err.message.toLowerCase().includes("model response was blocked") || err.message.toLowerCase().includes("safety")) {
        errorTitle = "Content Flagged";
        errorText = "Input or AI response flagged for safety. Please rephrase.";
        errorCategory = TileCategory.Creative;
    } else if (err.message.toLowerCase().includes("api key not valid") || err.message.toLowerCase().includes("api_key_invalid")) {
        errorTitle = "Gemini API Key Invalid";
        errorText = "The Google Gemini API key is invalid or not configured correctly in constants.ts.";
        errorPalette = "warning";
    }

    const errorTileData = createErrorTile(errorTitle, errorText, x, y, errorPalette);
    addDebugLogEntry(DebugLogEntryType.GEMINI_FINAL_TILE, `Error Tile Created (Gemini Error) ${logTitleSuffix}`, errorTileData);
    return errorTileData;
  }
};