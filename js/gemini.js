/* ============================================
   EnglishAI - Integração com Google Gemini API
   ============================================ */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';

class GeminiChat {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.conversationHistory = [];
        this.systemPrompt = '';
        this.lastRequestTime = 0;
        this.minRequestInterval = 3000; // 3 segundos entre requests
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

    async retryFetch(url, options, maxRetries = 3) {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await fetch(url, options);
                
                if (response.status === 429) {
                    const waitTime = Math.pow(2, attempt) * 2000; // 2s, 4s, 8s
                    console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
                    await this.wait(waitTime);
                    continue;
                }
                
                return response;
            } catch (error) {
                if (attempt === maxRetries - 1) throw error;
                await this.wait(1000 * (attempt + 1));
            }
        }
        throw new Error('Muitas requisições. Aguarde um momento e tente novamente.');
    }

    async sendMessage(userMessage, level) {
        if (!this.apiKey) {
            throw new Error('Chave de API não configurada.');
        }

        // Respeitar intervalo mínimo entre requests
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

        // Manter histórico limitado (últimas 10 mensagens)
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

        try {
            const response = await this.retryFetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: contents,
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 512,
                    },
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Erro da API:', response.status, errorData);
                
                if (response.status === 400) {
                    throw new Error('Chave de API inválida.');
                } else if (response.status === 403) {
                    throw new Error('Chave de API sem permissão.');
                } else if (response.status === 429) {
                    throw new Error('Limite de requisições atingido. Aguarde 30 segundos e tente novamente.');
                } else {
                    throw new Error(`Erro na API: ${errorData.error?.message || 'Erro desconhecido'}`);
                }
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const aiResponse = data.candidates[0].content.parts[0].text;
                
                this.conversationHistory.push({
                    role: 'model',
                    parts: [{ text: aiResponse }]
                });

                return aiResponse;
            } else {
                throw new Error('Resposta inválida da API');
            }

        } catch (error) {
            console.error('Erro ao comunicar com Gemini:', error);
            throw error;
        }
    }

    getInitialPrompt(level) {
        const userName = getCurrentUser()?.name || 'student';
        
        return `${this.systemPrompt}

IMPORTANT CONTEXT:
- The student's name is ${userName}
- Current level: ${level}
- This is the beginning of a new conversation
- Start with a warm greeting in English
- Suggest a conversation topic appropriate for their level
- Remember to be encouraging and patient
- Keep your response SHORT (2-3 sentences max)

Start the conversation now by greeting the student and suggesting a topic to practice.`;
    }

    async generateExercise(level, topic) {
        const now = Date.now();
        if (now - this.lastRequestTime < this.minRequestInterval) {
            await this.wait(this.minRequestInterval - (now - this.lastRequestTime));
        }
        this.lastRequestTime = Date.now();

        const prompt = `Create a simple English exercise for ${level} level about "${topic}".

Format:
TYPE: [fill_blank/multiple_choice]
QUESTION: [question]
OPTIONS: [A, B, C, D] (for multiple_choice)
ANSWER: [correct answer]
EXPLANATION: [brief explanation in Portuguese]`;

        try {
            const response = await this.retryFetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 256,
                    }
                })
            });

            if (!response.ok) return null;

            const data = await response.json();
            
            if (data.candidates && data.candidates[0]) {
                return data.candidates[0].content.parts[0].text;
            }
            return null;
        } catch (error) {
            console.error('Erro ao gerar exercício:', error);
            return null;
        }
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
