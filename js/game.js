const Game = {
  state: {
    playerName: GameConfig.playerName,
    location: 'unknown',
    gameTime: 'Day 1, Morning',
    inventory: [],
    gameState: {
      started: false,
      currentScene: null
    },
    llmHistory: []
  },

  // Initialize game
  async init() {
    // Try to load existing save
    const loadResult = await SaveManager.load();
    if (loadResult.success && loadResult.saveData) {
      this.state = loadResult.saveData;
      LLM.history = this.state.llmHistory || [];
      console.log('Loaded save from:', loadResult.timestamp);
      UI.updateAll();
      UI.showMessage('系统', `欢迎回来，${this.state.playerName}！游戏已加载。`);
    } else {
      console.log('No save found, starting new game');
    }

    // Enable auto-save
    if (GameConfig.autoSave) {
      SaveManager.enableAutoSave(this);
    }
  },

  // Start new game
  async start() {
    this.state.gameState.started = true;
    this.state.location = 'unknown';
    this.state.gameTime = 'Day 1, Morning';

    // Reset LLM conversation
    LLM.reset();

    // Send initial prompt
    await this.processInput('开始游戏');

    UI.updateAll();
  },

  // Process player input
  async processInput(input) {
    if (!input.trim()) return;

    // Show player's input
    UI.addMessage(this.state.playerName, input);

    // Send to LLM
    const result = await LLM.send(input);

    if (result.success) {
      // Show AI response
      UI.addMessage('游戏主持人', result.content);

      // Parse response for game state updates (simple parsing)
      this.parseGameStateUpdate(result.content);

      // Update UI
      UI.updateAll();

      // Save state
      this.state.llmHistory = LLM.getHistory();
    } else {
      UI.addMessage('系统', `错误: ${result.error}`);
    }
  },

  // Parse LLM response for game state updates
  parseGameStateUpdate(content) {
    // Simple keyword-based parsing
    // In a real game, you might use structured JSON responses from LLM

    const lowerContent = content.toLowerCase();

    // Location updates
    if (content.includes('位置：') || content.includes('当前位置：')) {
      const match = content.match(/位置[：:]\s*(.+)/);
      if (match) {
        this.state.location = match[1].trim();
      }
    }

    // Inventory additions
    if (content.includes('获得') || content.includes('得到')) {
      const match = content.match(/(?:获得|得到)\s*(.+?)(?:[，。、])/);
      if (match) {
        const item = match[1].trim();
        this.addToInventory(item);
      }
    }

    // Time updates
    if (content.includes('时间：') || content.includes('现在是')) {
      const match = content.match(/(?:时间|现在是)[：:]\s*(.+)/);
      if (match) {
        this.state.gameTime = match[1].trim();
      }
    }
  },

  // Add item to inventory
  addToInventory(item) {
    const existing = this.state.inventory.find(i => i.name === item);
    if (existing) {
      existing.quantity++;
    } else {
      this.state.inventory.push({ name: item, quantity: 1 });
    }
  },

  // Remove item from inventory
  removeFromInventory(item) {
    const index = this.state.inventory.findIndex(i => i.name === item);
    if (index !== -1) {
      if (this.state.inventory[index].quantity > 1) {
        this.state.inventory[index].quantity--;
      } else {
        this.state.inventory.splice(index, 1);
      }
    }
  },

  // Get current game state
  getState() {
    return { ...this.state };
  },

  // Set game state
  setState(newState) {
    this.state = { ...newState };
    LLM.history = this.state.llmHistory || [];
    UI.updateAll();
  },

  // Save game
  async saveGame() {
    this.state.llmHistory = LLM.getHistory();
    const result = await SaveManager.save(this.state);
    return result;
  },

  // Load game
  async loadGame() {
    const result = await SaveManager.load();
    if (result.success && result.saveData) {
      this.setState(result.saveData);
      return { success: true, timestamp: result.timestamp };
    }
    return result;
  }
};

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
