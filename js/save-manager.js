const SaveManager = {
  // Save game state to server
  async save(saveData) {
    try {
      const response = await fetch(`${GameConfig.backendUrl}/api/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerId: GameConfig.playerId,
          saveData: saveData
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('Game saved:', result.saveId);
        return { success: true, saveId: result.saveId, timestamp: result.timestamp };
      } else {
        console.error('Save failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Save error:', error);
      return { success: false, error: 'Failed to connect to server' };
    }
  },

  // Load game state from server
  async load() {
    try {
      const response = await fetch(`${GameConfig.backendUrl}/api/load?playerId=${GameConfig.playerId}`);

      const result = await response.json();

      if (result.success) {
        if (result.saveData) {
          console.log('Game loaded:', result.saveId);
          return { success: true, saveData: result.saveData, timestamp: result.timestamp };
        } else {
          // No save found
          return { success: true, saveData: null, timestamp: null };
        }
      } else {
        console.error('Load failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Load error:', error);
      return { success: false, error: 'Failed to connect to server' };
    }
  },

  // Auto-save handler
  autoSaveTimer: null,

  enableAutoSave(game) {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(() => {
      if (game && game.getState) {
        this.save(game.getState());
      }
    }, GameConfig.autoSaveInterval);
  },

  disableAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
};
