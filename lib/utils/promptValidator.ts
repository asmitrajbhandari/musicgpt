export const isValidPrompt = (prompt: string): boolean => {
  // Check if prompt contains the word "song" (case-insensitive)
  return prompt.toLowerCase().includes('song');
};

export const getInvalidPromptMessage = (): string => {
  return 'Your prompt does not seem to be valid. Please provide a prompt related to song.';
};
