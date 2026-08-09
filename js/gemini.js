/* ============================================
   EnglishAI - Integração com Google Gemini API
   ============================================ */

// URL base da API do Gemini
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Classe para gerenciar comunicação com a IA
class GeminiChat {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.conversationHistory = [];
        this.systemPrompt = '';
    }

    // Definir prompt do sistema
    setSystemPrompt(prompt) {
        this.systemPrompt = prompt;
    }

    // Limpar histórico de conversa
    clearHistory() {
        this.conversationHistory = [];
    }

    // Enviar mensagem e receber resposta
    async sendMessage(userMessage, level) {
        if (!this.apiKey) {
            throw new Error('Chave de API não configurada. Vá em Configurações para adicionar sua chave.');
        }

        // Adicionar mensagem do usuário ao histórico
        this.conversationHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        // Montar o conteúdo completo
        const contents = [];

        // Adicionar contexto de sistema como primeira mensagem do usuário
        if (this.conversationHistory.length === 1) {
            // Primeira interação: incluir prompt do sistema
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

        // Adicionar histórico de conversa
        contents.push(...this.conversationHistory);

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
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
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: 'HARM_CATEGORY_HARASSMENT',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                        },
                        {
                            category: 'HARM_CATEGORY_HATE_SPEECH',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                        },
                        {
                            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                        },
                        {
                            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro da API:', errorData);
                
                if (response.status === 400) {
                    throw new Error('Chave de API inválida. Verifique suas configurações.');
                } else if (response.status === 403) {
                    throw new Error('Chave de API sem permissão. Verifique se está correta.');
                } else if (response.status === 429) {
                    throw new Error('Muitas requisições. Aguarde um momento e tente novamente.');
                } else {
                    throw new Error(`Erro na API: ${errorData.error?.message || 'Erro desconhecido'}`);
                }
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const aiResponse = data.candidates[0].content.parts[0].text;
                
                // Adicionar resposta da IA ao histórico
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

    // Obter prompt inicial baseado no nível
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

Start the conversation now by greeting the student and suggesting a topic to practice.`;
    }

    // Gerar exercício baseado no contexto
    async generateExercise(level, topic) {
        const prompt = `Based on the ${level} level and topic "${topic}", create a quick English exercise.

Format your response EXACTLY like this:
EXERCISE_TYPE: [fill_blank/multiple_choice/translate]
QUESTION: [the question]
OPTIONS: [option1, option2, option3, option4] (only for multiple_choice)
ANSWER: [the correct answer]
EXPLANATION_PT: [brief explanation in Portuguese]

Make it appropriate for ${level} level. Keep it simple and practical.`;

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
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
                        maxOutputTokens: 512,
                    }
                })
            });

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

    // Corrigir texto do usuário
    async correctText(userText, level) {
        const prompt = `Correct this English text from a ${level} level student.

Student wrote: "${userText}"

Respond in this EXACT format:
CORRECTED: [corrected version, or "No corrections needed" if perfect]
ERRORS: [list errors in Portuguese, or "none" if perfect]
TIP: [one helpful tip in Portuguese]
SCORE: [1-10 rating]

Be gentle and encouraging. Focus on the most important corrections.`;

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
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
                        temperature: 0.3,
                        maxOutputTokens: 256,
                    }
                })
            });

            const data = await response.json();
            
            if (data.candidates && data.candidates[0]) {
                return data.candidates[0].content.parts[0].text;
            }
            return null;
        } catch (error) {
            console.error('Erro ao corrigir texto:', error);
            return null;
        }
    }
}

// Função global para enviar mensagem
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
