const Game = {
  state: {
    playerName: GameConfig.playerName,
    location: 'unknown',
    tick: 0, // Game tick (unsigned int, in seconds)
    inventory: [],
    gameState: {
      started: false,
      currentScene: null
    },
    llmHistory: []
  },

  // Tick timer
  tickTimer: null,

  // Initialize game
  async init() {
    // Try to load existing save
    const loadResult = await SaveManager.load();
    if (loadResult.success && loadResult.saveData) {
      this.state = loadResult.saveData;
      LLM.history = this.state.llmHistory || [];
      console.log('Loaded save from:', loadResult.timestamp);
      UI.updateAll();
      UI.showMessage('系统', \`欢迎回来，\${this.state.playerName}！游戏已加载。\`);
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
    this.state.tick = 0; // Initialize tick to 0

    // Reset LLM conversation
    LLM.reset();

    // Start tick timer
    this.startTickTimer();

    // Send initial prompt
    await this.processInput('开始游戏');

    UI.updateAll();
  },

  // Start tick timer
  startTickTimer() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
    }
    this.tickTimer = setInterval(() => {
      this.state.tick++;
      UI.updateStatus();
    }, GameConfig.tickInterval);
  },

  // Stop tick timer
  stopTickTimer() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
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
      UI.addMessage('系统', \`错误: \${result.error}\`);
    }
  },

  // Parse LLM response for game state updates
  parseGameStateUpdate(content) {
    // Simple keyword-based parsing
    // In a real game, you might use structured JSON responses from LLM

    const lowerContent = content.toLowerCase();

    // Location updates
    if (content.includes('位置：') || content.includes('当前位置：')) {
      const match = content.match(/位置[：:]\\s*(.+)/);
      if (match) {
        this.state.location = match[1].trim();
      }
    }

    // Inventory additions
    if (content.includes('获得') || content.includes('得到')) {
      const match = content.match(/(?:获得|得到)\\s*(.+?)(?:[，。、])/);
      if (match) {
        const item = match[1].trim();
        this.addToInventory(item);
      }
    }

    // Note: Time updates are now handled automatically by tick timer
    // No need to parse time from LLM response
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
    this.stopTickTimer(); // Stop existing timer
    this.state = { ...newState };
    LLM.history = this.state.llmHistory || [];
    // Restart tick timer if game is started
    if (this.state.gameState.started) {
      this.startTickTimer();
    }
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
