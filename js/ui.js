const UI = {
  // DOM elements
  elements: {},

  // Initialize UI
  init() {
    // Cache DOM elements
    this.elements = {
      playerName: document.getElementById('playerName'),
      dialogArea: document.getElementById('dialogArea'),
      playerInput: document.getElementById('playerInput'),
      sendBtn: document.getElementById('sendBtn'),
      actionButtons: document.getElementById('actionButtons'),
      location: document.getElementById('location'),
      gameTime: document.getElementById('gameTime'),
      inventory: document.getElementById('inventory'),
      saveBtn: document.getElementById('saveBtn'),
      loadBtn: document.getElementById('loadBtn'),
      saveStatus: document.getElementById('saveStatus'),
      settingsBtn: document.getElementById('settingsBtn'),
      settingsModal: document.getElementById('settingsModal'),
      closeSettings: document.getElementById('closeSettings'),
      saveSettings: document.getElementById('saveSettings'),
      cancelSettings: document.getElementById('cancelSettings'),
      backendUrl: document.getElementById('backendUrl'),
      playerId: document.getElementById('playerId'),
      loadingOverlay: document.getElementById('loadingOverlay'),
      loadingText: document.getElementById('loadingText')
    };

    // Setup event listeners
    this.setupEventListeners();

    // Initial update
    this.updatePlayerInfo();
  },

  // Setup event listeners
  setupEventListeners() {
    const { playerInput, sendBtn, actionButtons, saveBtn, loadBtn,
            settingsBtn, closeSettings, saveSettings, cancelSettings } = this.elements;

    // Send button
    sendBtn.addEventListener('click', () => this.handleSend());

    // Enter key in input
    playerInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSend();
      }
    });

    // Action buttons
    actionButtons.addEventListener('click', (e) => {
      if (e.target.classList.contains('action-btn')) {
        const action = e.target.dataset.action;
        this.handleAction(action);
      }
    });

    // Save/Load buttons
    saveBtn.addEventListener('click', () => this.handleSave());
    loadBtn.addEventListener('click', () => this.handleLoad());

    // Settings modal
    settingsBtn.addEventListener('click', () => this.openSettings());
    closeSettings.addEventListener('click', () => this.closeSettings());
    saveSettings.addEventListener('click', () => this.saveSettings());
    cancelSettings.addEventListener('click', () => this.closeSettings());

    // Close modal on background click
    this.elements.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.elements.settingsModal) {
        this.closeSettings();
      }
    });
  },

  // Handle send button
  async handleSend() {
    const { playerInput } = this.elements;
    const input = playerInput.value.trim();

    if (!input) return;

    playerInput.value = '';
    playerInput.disabled = true;
    this.elements.sendBtn.disabled = true;

    await Game.processInput(input);

    playerInput.disabled = false;
    this.elements.sendBtn.disabled = false;
    playerInput.focus();
  },

  // Handle action button
  async handleAction(action) {
    switch (action) {
      case 'start':
        await Game.start();
        break;
      case 'help':
        this.showHelp();
        break;
    }
  },

  // Handle save
  async handleSave() {
    this.showLoading('保存中...');

    const result = await Game.saveGame();

    this.hideLoading();

    if (result.success) {
      this.showSaveStatus('保存成功！', 'success');
    } else {
      this.showSaveStatus(`保存失败: ${result.error}`, 'error');
    }
  },

  // Handle load
  async handleLoad() {
    this.showLoading('加载中...');

    const result = await Game.loadGame();

    this.hideLoading();

    if (result.success) {
      this.showSaveStatus('加载成功！', 'success');
      this.addMessage('系统', `欢迎回来，${Game.state.playerName}！游戏已加载。`);
    } else {
      this.showSaveStatus(`加载失败: ${result.error}`, 'error');
    }
  },

  // Settings modal
  openSettings() {
    const { backendUrl, playerId, settingsModal } = this.elements;
    backendUrl.value = GameConfig.backendUrl;
    playerId.value = GameConfig.playerId;
    settingsModal.classList.add('active');
  },

  closeSettings() {
    this.elements.settingsModal.classList.remove('active');
  },

  saveSettings() {
    const { backendUrl, playerId } = this.elements;

    if (backendUrl.value.trim()) {
      updateConfig('backendUrl', backendUrl.value.trim());
    }

    if (playerId.value.trim()) {
      updateConfig('playerId', playerId.value.trim());
    }

    this.closeSettings();
    this.addMessage('系统', '设置已保存');
  },

  // Add message to dialog area
  addMessage(speaker, content) {
    const { dialogArea } = this.elements;

    // Remove placeholder if exists
    const placeholder = dialogArea.querySelector('.dialog-placeholder');
    if (placeholder) {
      placeholder.remove();
    }

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `dialog-message ${speaker === Game.state.playerName ? 'user' : 'ai'}`;

    const speakerDiv = document.createElement('div');
    speakerDiv.className = 'speaker';
    speakerDiv.textContent = speaker;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    contentDiv.textContent = content;

    messageDiv.appendChild(speakerDiv);
    messageDiv.appendChild(contentDiv);

    dialogArea.appendChild(messageDiv);

    // Scroll to bottom
    this.scrollToBottom();
  },

  // Update all UI elements
  updateAll() {
    this.updatePlayerInfo();
    this.updateStatus();
    this.updateInventory();
  },

  // Update player info
  updatePlayerInfo() {
    this.elements.playerName.textContent = Game.state.playerName;
  },

  // Update status
  updateStatus() {
    this.elements.location.textContent = Game.state.location;
    this.elements.gameTime.textContent = Game.state.tick + " 秒";
  },

  // Update inventory
  updateInventory() {
    const { inventory } = this.elements;

    if (Game.state.inventory.length === 0) {
      inventory.innerHTML = '<div class="empty-inventory">空</div>';
      return;
    }

    inventory.innerHTML = Game.state.inventory.map(item => `
      <div class="inventory-item">
        <span class="inventory-icon">📦</span>
        <span class="inventory-name">${item.name}</span>
        <span class="inventory-quantity">×${item.quantity}</span>
      </div>
    `).join('');
  },

  // Show save status
  showSaveStatus(message, type) {
    const { saveStatus } = this.elements;
    saveStatus.textContent = message;
    saveStatus.className = `save-status ${type}`;

    // Clear after 3 seconds
    setTimeout(() => {
      saveStatus.textContent = '';
      saveStatus.className = 'save-status';
    }, 3000);
  },

  // Show help
  showHelp() {
    const helpText = `=== 游戏帮助 ===

1. 在输入框中输入你的行动，然后点击发送或按回车键
2. 与游戏主持人对话来推进故事
3. 探索、收集物品、做出选择
4. 使用保存按钮保存游戏进度
5. 使用设置按钮配置后端地址

祝你游戏愉快！`;
    this.addMessage('系统', helpText);
  },

  // Show loading overlay
  showLoading(text = '加载中...') {
    const { loadingOverlay, loadingText } = this.elements;
    loadingText.textContent = text;
    loadingOverlay.classList.add('active');
  },

  // Hide loading overlay
  hideLoading() {
    this.elements.loadingOverlay.classList.remove('active');
  },

  // Scroll dialog area to bottom
  scrollToBottom() {
    const { dialogArea } = this.elements;
    setTimeout(() => {
      dialogArea.scrollTop = dialogArea.scrollHeight;
    }, GameConfig.scrollSpeed);
  },

  // Show message (alias for addMessage)
  showMessage(speaker, content) {
    this.addMessage(speaker, content);
  }
};

// Initialize UI when page loads
document.addEventListener('DOMContentLoaded', () => {
  UI.init();
});
