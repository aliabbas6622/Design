// Temporary test configuration
// WARNING: Never commit actual API keys to source control

export const TEST_CONFIG = {
  apiKey: 'YOUR_TEST_API_KEY', // Replace with your actual key when testing locally
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2000
};

// Add this to .gitignore to prevent accidental commits
// test-api-config.ts