// --- GOOGLE GEMINI API KEY ---
// WARNING: YOU MUST REPLACE "YOUR_GOOGLE_GEMINI_API_KEY_HERE" WITH YOUR ACTUAL GOOGLE GEMINI API KEY.
// The direct inclusion of an API key or placeholder below is a fallback for development convenience
// in environments where setting process.env.API_KEY is challenging for client-side access.
// For any production or shared deployment, YOU MUST configure API_KEY as a secure environment variable.
// Do NOT commit your actual key to public repositories if you use this file for development.
const PLACEHOLDER_GEMINI_API_KEY = "AIzaSyBu6dCYz1z-aQ8l5vLd1r55GHxc9-toecc";
export const API_KEY = process.env.API_KEY || PLACEHOLDER_GEMINI_API_KEY;
// --- END GOOGLE GEMINI API KEY ---


// --- DEEPGRAM API KEY ---
// WARNING: The direct inclusion of an API key below is a fallback for development convenience
// in environments where setting process.env.DEEPGRAM_API_KEY is challenging (e.g., some simple web IDEs).
// For any production or shared deployment, YOU MUST configure DEEPGRAM_API_KEY as a secure environment variable.
// Do NOT commit this key to public repositories if you are using the hardcoded fallback.
const USER_PROVIDED_DEEPGRAM_KEY_FOR_DEV_ONLY = "cd3a2d9da2d265be653cf2c8e31bca477b7c5c7a"; // Key provided by user
export const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || USER_PROVIDED_DEEPGRAM_KEY_FOR_DEV_ONLY;
// --- END DEEPGRAM API KEY ---


export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_MODEL_IMAGE = 'imagen-3.0-generate-002';

export const DEEPGRAM_MODEL = 'nova-2-general'; // Example Deepgram model

export const DEFAULT_TILE_WIDTH = 280; // pixels
export const DEFAULT_TILE_HEIGHT = 180; // pixels
export const DEFAULT_TILE_DURATION = 45000; // 45 seconds, increased a bit

export const MIN_TILE_SEPARATION_X = DEFAULT_TILE_WIDTH / 2;
export const MIN_TILE_SEPARATION_Y = DEFAULT_TILE_HEIGHT / 2;

export const DEEPGRAM_INTERIM_RESULT_TIMEOUT = 1800; // ms to wait for final Deepgram result after interim

export const IS_GEMINI_API_KEY_PLACEHOLDER = API_KEY === PLACEHOLDER_GEMINI_API_KEY;
export const IS_DEEPGRAM_API_KEY_MISSING = !DEEPGRAM_API_KEY;