// Configuration for the game
const GameConfig = {
  // Backend API URL - change this to your server address
  backendUrl: localStorage.getItem('backendUrl') || 'http://localhost:3000',

  // Player ID - generated and stored in localStorage
  playerId: localStorage.getItem('playerId') || generatePlayerId(),

  // Game settings
  playerName: localStorage.getItem('playerName') || '未命名',

  // LLM settings
  llmModel: 'gpt-3.5-turbo',
  maxHistoryLength: 20,

  // UI settings
  typingSpeed: 10, // ms per character
  scrollSpeed: 300, // ms

  // Save settings
  autoSave: true,
  autoSaveInterval: 60000 // ms (1 minute)
};

function generatePlayerId() {
  const id = 'player-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('playerId', id);
  return id;
}

function updateConfig(key, value) {
  GameConfig[key] = value;
  if (key === 'playerId' || key === 'playerName' || key === 'backendUrl') {
    localStorage.setItem(key, value);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GameConfig, generatePlayerId, updateConfig };
}
