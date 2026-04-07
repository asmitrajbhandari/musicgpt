export const isValidPrompt = (prompt: string, source?: 'create-song' | 'random' | 'manual'): boolean => {
  // If prompt comes from Random button, always reject
  if (source === 'random') {
    return false;
  }
  
  // Allow Create Song dropdown and Manual input
  return true;
};

export const getInvalidPromptMessage = (): string => {
  return 'Your prompt does not seem to be valid. Please provide a prompt related to song.';
};
