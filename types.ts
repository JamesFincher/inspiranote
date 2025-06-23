export enum TileCategory {
  FactCheck = "fact-check",
  Resource = "resource",
  Creative = "creative",
  Summary = "summary",
  ActionItem = "action-item", // New category
  Question = "question", // New category
  Observation = "observation", // New category
}

export interface TileContent {
  title: string;
  text: string;
  links?: string[];
  metadata?: Record<string, string>; 
}

export interface TileStyleHints {
  palette: "primary" | "secondary" | "accent" | "neutral" | "warning"; // Added warning
  priority: number; 
}

export interface TileLifecycle {
  durationMs: number; 
  pauseOnHover: boolean;
  allowPin: boolean;
}

export interface TileData {
  id: string;
  category: TileCategory;
  content: TileContent;
  styleHints: TileStyleHints;
  lifecycle: TileLifecycle;
  x: number; 
  y: number; 
  rotation: number; 
  zIndex: number;
  isPinned?: boolean;
}

// --- Debug Log Types ---
export enum DebugLogEntryType {
  TRANSCRIPT = "transcript", // Used for final transcripts from Deepgram
  GEMINI_PROMPT = "gemini_prompt",
  GEMINI_RAW_RESPONSE = "gemini_raw_response",
  GEMINI_PARSED_RESPONSE = "gemini_parsed_response",
  GEMINI_FINAL_TILE = "gemini_final_tile",
  GEMINI_ERROR = "gemini_error",
  INFO = "info",
  DEEPGRAM_EVENT = "deepgram_event",
  DEEPGRAM_TRANSCRIPT = "deepgram_transcript", // For interim/raw transcript events
  DEEPGRAM_METADATA = "deepgram_metadata", // For summaries, topics
  DEEPGRAM_ERROR = "deepgram_error"
}

export interface DebugLogEntry {
  id: string;
  timestamp: string;
  type: DebugLogEntryType;
  title: string;
  data: any;
}

// --- Deepgram Specific Types ---
export interface DeepgramTranscriptionAlternative {
  transcript: string;
  confidence: number;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
    punctuated_word?: string;
  }>;
}

export interface DeepgramChannel {
  alternatives: DeepgramTranscriptionAlternative[];
}

export interface DeepgramUtteranceEnd {
    type: "UtteranceEnd";
    channel_index: [number, number];
    last_word_end: number;
}

export interface DeepgramTranscriptionResponse {
  type: string; // "Results" for transcript, "Metadata" for intelligence
  channel_index: [number, number];
  duration: number;
  start: number;
  is_final: boolean;
  speech_final: boolean;
  channel: DeepgramChannel;
  metadata?: DeepgramMetadata; // For intelligence features
  utterance_end?: DeepgramUtteranceEnd;
}

export interface DeepgramSummary {
  summary: string;
  start_word: number;
  end_word: number;
}

export interface DeepgramTopic {
  topic: string;
  confidence: number;
  start_word: number;
  end_word: number;
}
export interface DeepgramDetectedLanguage {
    language: string;
    confidence: number;
}


export interface DeepgramMetadata {
  request_id: string;
  created: string;
  duration: number;
  channels: number;
  models: string[];
  model_info: Record<string, { name: string; version: string; arch: string }>;
  summary?: DeepgramSummary; // From summarize:v2
  topics?: DeepgramTopic[]; // From detect_topics:v2
  detected_language?: DeepgramDetectedLanguage;
}

export enum DeepgramConnectionState {
    IDLE = "IDLE",
    CONNECTING = "CONNECTING",
    OPEN = "OPEN",
    CLOSING = "CLOSING",
    CLOSED = "CLOSED",
    ERROR = "ERROR"
}

// --- Enhanced Input for Gemini ---
export interface GeminiRequestInput {
  transcript: string;
  summary?: string;
  topics?: string[];
  // We can add more fields here later, like detected_intents or sentiment
}
