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
    }

    setSystemPrompt(prompt) {
        this.systemPrompt = prompt;
    }

    clearHistory() {
        this.conversationHistory = [];
    }

    async sendMessage(userMessage, level) {
        if (!this.apiKey) {
            throw new Error('Chave de API não configurada.');
        }

        // Intervalo entre requests
        const now = Date.now();
        const elapsed = now - this.lastRequestTime;
        if (elapsed < 2000) {
            await new Promise(r => setTimeout(r, 2000 - elapsed));
        }
        this.lastRequestTime = Date.now();

        // Adicionar mensagem ao histórico
        this.conversationHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        // Limitar histórico
        if (this.conversationHistory.length > 8) {
            this.conversationHistory = this.conversationHistory.slice(-8);
        }

        // Montar contents
        const contents = [];

        // Primeira mensagem: incluir prompt do sistema
        if (this.conversationHistory.length === 1) {
            const userName = getCurrentUser()?.name || 'student';
            const systemMsg = this.systemPrompt + `\n\nStudent: ${userName}\nLevel: ${level}\n\nGreet the student in English (2-3 sentences max). Suggest a topic.`;
            
            contents.push({ role: 'user', parts: [{ text: systemMsg }] });
            contents.push({ role: 'model', parts: [{ text: "Hi! I'm your English tutor. Let's practice! 😊" }] });
        }

        contents.push(...this.conversationHistory);

        // Fazer request
        const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 512,
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            let errMsg = 'Erro na API';
            try {
                const errData = JSON.parse(errText);
                errMsg = errData.error?.message || errMsg;
            } catch(e) {
                errMsg = errText || errMsg;
            }
            throw new Error(`API ${response.status}: ${errMsg}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            this.conversationHistory.push({ role: 'model', parts: [{ text: aiResponse }] });
            return aiResponse;
        }

        throw new Error('Resposta vazia da API');
    }
}

let geminiChat = null;

function initGeminiChat() {
    const user = getCurrentUser();
    if (user && user.apiKey) {
        geminiChat = new GeminiChat(user.apiKey);
        geminiChat.setSystemPrompt(getSystemPrompt(user.level));
        return true;
    }
    return false;
}

function getGeminiChat() {
    return geminiChat;
}
