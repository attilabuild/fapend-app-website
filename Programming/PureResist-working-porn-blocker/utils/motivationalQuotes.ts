// Evening motivational quotes that display at 9 PM daily
export const EVENING_QUOTES = [
  "Keep pushing forward, every step counts.",
  "Focus on what matters most tonight.",
  "This feeling will pass. Your progress remains.",
  "You’ve come too far to give up now.",
  "Real strength happens when no one’s watching.",
  "You don’t rise by giving in. You rise by holding on.",
  "The person you want to become is watching you.",
  "Your future is waiting — keep moving.",
  "Your mission is bigger than momentary feelings.",
  "Rest well, tomorrow brings new strength.",
  "Small wins lead to big victories.",
  "Every night is a new chance.",
  "Stay calm, stay focused.",
  "You’ve resisted before. You can resist again.",
  "This is the fork in the road. Which future do you choose?",
  "Discipline grows in quiet moments.",
  "Let the night restore your mind and will.",
  "Strength is built one choice at a time.",
  "Keep your eyes on the prize, even when it’s dark.",
  "Growth happens outside comfort zones.",
  "Tonight’s calm builds tomorrow’s power.",
  "Every decision shapes your tomorrow.",
  "Stand tall in the face of challenge.",
  "Your mindset is your strongest asset.",
  "Challenges are the seeds of progress.",
  "The darkest hour often leads to the brightest day.",
  "You have what it takes. Believe it.",
  "Let go of distractions. Embrace your goals.",
  "Inner strength is silent but unstoppable.",
  "The journey continues, one night at a time.",
  "Focus on progress, not perfection.",
  "Your will is a muscle, train it daily.",
  "Calm mind, strong heart, steady progress.",
  "Remember why you started.",
  "Tomorrow’s success starts with tonight’s choices.",
  "The greatest battles are fought within.",
  "You’re rewriting your story, one step at a time.",
  "Quiet victories matter the most.",
  "One day, you’ll look back and be proud.",
  "Keep the faith. You’re getting stronger."
];

// Helper function to get a random quote
export const getRandomQuote = (): string => {
  const randomIndex = Math.floor(Math.random() * EVENING_QUOTES.length);
  return EVENING_QUOTES[randomIndex];
}; 