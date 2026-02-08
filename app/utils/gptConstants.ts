export const GPT_CONSTANTS = {
  FOOTER: {
    TITLE: 'Model v6 Pro is here!',
    DESCRIPTION: 'Pushing boundaries to the world\'s best AI music model'
  },
  SVG: {
    SM: { width: 16, height: 16 },
    MD: { width: 20, height: 20 },
    LG: { width: 24, height: 24 }
  },
  CREATE_PAGE: {
    HEADING: 'Turn any idea into sound',
    RECENT_GENERATIONS: 'Recent Generations'
  },
  PROFILE: {
    CREDIT_BALANCE: 'Your credit balance : 0',
    TOP_UP: 'Top Up'
  },
  ERROR_CONSTANTS: {
    SERVER_BUSY: {
      TITLE: 'Oops! Server busy.',
      DESCRIPTION: '4.9K users in the queue.',
      RETRY: 'Retry'
    },
    INVALID_PROMPT: {
      TITLE: 'Invalid Prompt',
      DESCRIPTION: 'Your prompt does not seem to be valid. Please provide a prompt related to song.'
    },
    INSUFFICIENT_CREDITS: 'Insufficient credits'
  }
} as const
