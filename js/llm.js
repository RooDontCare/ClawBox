const LLM = {
  // Conversation history
  history: [],

  // Initialize conversation with system prompt
  init() {
    this.history = [
      {
        role: 'system',
        content: `你是一个文字冒险游戏的游戏主持人（Game Master）。请引导玩家进行游戏。
游戏设定：这是一个神秘的世界，玩家需要通过探索、对话和决策来推进故事。
你的职责：
1. 描述场景和事件
2. 回应玩家的行动
3. 提供选项供玩家选择
4. 记录游戏状态的变化

请用简短、生动的中文回复，保持故事流畅。每次回复控制在 200 字以内。`
      }
    ];
  },

  // Send message to LLM
  async send(prompt, options = {}) {
    try {
      const response = await fetch(`${GameConfig.backendUrl}/api/llm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          history: this.history.slice(-GameConfig.maxHistoryLength),
          model: options.model || GameConfig.llmModel
        })
      });

      const result = await response.json();

      if (result.content) {
        // Add to history
        this.history.push({ role: 'user', content: prompt });
        this.history.push({ role: 'assistant', content: result.content });

        return { success: true, content: result.content, finishReason: result.finishReason };
      } else if (result.error) {
        console.error('LLM error:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('LLM connection error:', error);
      return { success: false, error: 'Failed to connect to server' };
    }
  },

  // Add system message to history (for game state updates)
  addSystemMessage(content) {
    this.history.push({ role: 'system', content: content });
  },

  // Reset conversation
  reset() {
    this.init();
  },

  // Get conversation history
  getHistory() {
    return this.history;
  }
};

// Initialize on load
LLM.init();
