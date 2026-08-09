/* ============================================
   EnglishAI - Integração com Google Gemini API
   ============================================ */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent';

class GeminiChat {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.conversationHistory = [];
        this.systemPrompt = '';
        this.lastRequestTime = 0;
        this.minRequestInterval = 3000;
    }

    setSystemPrompt(prompt) {
        this.systemPrompt = prompt;
    }

    clearHistory() {
        this.conversationHistory = [];
    }

    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async sendMessage(userMessage, level) {
        if (!this.apiKey) {
            throw new Error('Chave de API não configurada.');
        }

        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            await this.wait(this.minRequestInterval - timeSinceLastRequest);
        }
        this.lastRequestTime = Date.now();

        this.conversationHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(-10);
        }

        const contents = [];

        if (this.conversationHistory.length === 1) {
            const systemMessage = this.getInitialPrompt(level);
            contents.push({
                role: 'user',
                parts: [{ text: systemMessage }]
            });
            contents.push({
                role: 'model',
                parts: [{ text: 'I understand! I\'m ready to help you learn English. Let\'s start! 😊' }]
            });
        }

        contents.push(...this.conversationHistory);

        const requestBody = {
            contents: contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 512,
            }
        };

        console.log('Request URL:', GEMINI_API_URL);
        console.log('API Key starts with:', this.apiKey.substring(0, 8));
        console.log('Request body:', JSON.stringify(requestBody).substring(0, 200));

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            
            const responseText = await response.text();
            console.log('Response body:', responseText.substring(0, 500));

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch(e) {
                    errorData = { error: { message: responseText } };
                }
                
                const errorMsg = errorData.error?.message || JSON.stringify(errorData);
                throw new Error(`API ${response.status}: ${errorMsg}`);
            }

            const data = JSON.parse(responseText);
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const aiResponse = data.candidates[0].content.parts[0].text;
                
                this.conversationHistory.push({
                    role: 'model',
                    parts: [{ text: aiResponse }]
                });

                return aiResponse;
            } else {
                throw new Error('Resposta vazia da API: ' + JSON.stringify(data).substring(0, 200));
            }

        } catch (error) {
            console.error('Erro completo:', error);
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Erro de rede/CORS: ' + error.message);
            }
            
            throw error;
        }
    }

    getInitialPrompt(level) {
        const userName = getCurrentUser()?.name || 'student';
        
        return `${this.systemPrompt}

Student name: ${userName}
Level: ${level}

Start with a short greeting in English (2-3 sentences max). Suggest a topic.`;
    }
}

let geminiChat = null;

function initGeminiChat() {
    const user = getCurrentUser();
    if (user && user.apiKey) {
        geminiChat = new GeminiChat(user.apiKey);
        const level = user.level;
        geminiChat.setSystemPrompt(getSystemPrompt(level));
        return true;
    }
    return false;
}

function getGeminiChat() {
    return geminiChat;
}
