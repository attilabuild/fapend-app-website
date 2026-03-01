// List of nouns for username generation
const NOUNS = [
  "warrior", "monk", "sage", "phoenix", "dragon", "tiger", "falcon", "eagle",
  "lion", "wolf", "bear", "panther", "guardian", "knight", "champion",
  "master", "hero", "legend", "seeker", "hunter", "ninja", "samurai",
  "mystic", "wizard", "spirit", "soul", "heart", "mind", "light", "shadow"
];

// List of adjectives for more variety
const ADJECTIVES = [
  "noble", "brave", "wise", "pure", "strong", "silent", "swift", "mighty",
  "fierce", "calm", "steady", "focused", "peaceful", "mindful", "determined",
  "resolute", "free", "rising", "soaring", "growing"
];

/**
 * Generates a random username in the format: adjective_noun_number
 * Example: noble_warrior_123
 */
export const generateUsername = (): string => {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(100 + Math.random() * 900); // 100-999
  return `${adjective}_${noun}_${number}`;
};

/**
 * Generates a username based on a given name plus random number
 * Example: john_123
 */
export const generateUsernameFromName = (name: string): string => {
  const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const number = Math.floor(100 + Math.random() * 900); // 100-999
  return `${sanitizedName}_${number}`;
}; 