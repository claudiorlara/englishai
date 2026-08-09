/* ============================================
   EnglishAI - Lógica Principal do Chat
   ============================================ */

let currentTopic = null;
let conversationStarted = false;
let isTyping = false;

document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return;

    if (!user.apiKey) {
        document.getElementById('chat-messages').innerHTML = `
            <div class="flex items-center justify-center h-full">
                <div class="text-center p-6">
                    <div class="text-6xl mb-4">🔑</div>
                    <h2 class="text-xl font-bold text-gray-800 mb-2">Chave de API necessária</h2>
                    <p class="text-gray-500 mb-4">Você precisa de uma chave de API do Google Gemini para usar o chat.</p>
                    <a href="index.html" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                        Configurar API Key
                    </a>
                </div>
            </div>
        `;
        return;
    }

    if (!initGeminiChat()) {
        document.getElementById('chat-messages').innerHTML = `
            <div class="flex items-center justify-center h-full">
                <div class="text-center p-6">
                    <div class="text-6xl mb-4">❌</div>
                    <h2 class="text-xl font-bold text-gray-800 mb-2">Erro ao inicializar</h2>
                    <p class="text-gray-500 mb-4">Não foi possível conectar com a IA.</p>
                    <a href="index.html" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                        Voltar
                    </a>
                </div>
            </div>
        `;
        return;
    }

    document.getElementById('chat-level').textContent = user.level;
    setupTopics();
    startConversation();
});

function setupTopics() {
    const topics = getConversationScenarios(getCurrentLevel());
    const container = document.getElementById('topic-buttons');
    
    if (!container) return;
    
    container.innerHTML = topics.map(scenario => `
        <button onclick="changeTopic('${scenario.topic.replace(/'/g, "\\'")}')" class="topic-btn">
            ${scenario.emoji} ${scenario.name}
        </button>
    `).join('');
}

function toggleTopicMenu() {
    const menu = document.getElementById('topic-menu');
    menu.classList.toggle('hidden');
}

function changeTopic(topic) {
    currentTopic = topic;
    document.getElementById('topic-menu').classList.add('hidden');
    
    clearChat();
    geminiChat.clearHistory();
    
    addSystemMessage(`Novo tópico: ${topic}`);
    startConversation();
}

async function startConversation() {
    if (conversationStarted) return;
    
    conversationStarted = true;
    showTypingIndicator();
    
    try {
        const chat = getGeminiChat();
        const greeting = await chat.sendMessage('Hello! Let\'s start practicing.', getCurrentLevel());
        
        hideTypingIndicator();
        addAIMessage(greeting);
    } catch (error) {
        hideTypingIndicator();
        console.error('Erro ao iniciar conversa:', error);
        
        let errorMsg = 'Erro ao conectar com a IA.';
        if (error.message.includes('API key')) {
            errorMsg = 'Chave de API inválida. Verifique suas configurações.';
        } else if (error.message.includes('fetch')) {
            errorMsg = 'Erro de conexão. Verifique sua internet.';
        }
        
        addSystemMessage('⚠️ ' + errorMsg);
    }
}

async function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message || isTyping) return;
    
    input.value = '';
    input.focus();
    
    addUserMessage(message);
    
    isTyping = true;
    showTypingIndicator();
    
    try {
        const chat = getGeminiChat();
        const response = await chat.sendMessage(message, getCurrentLevel());
        
        hideTypingIndicator();
        isTyping = false;
        
        processAIResponse(response);
        
    } catch (error) {
        hideTypingIndicator();
        isTyping = false;
        
        console.error('Erro ao enviar mensagem:', error);
        
        let errorMsg = 'Erro ao obter resposta. Tente novamente.';
        if (error.message.includes('API key')) {
            errorMsg = 'Chave de API inválida.';
        } else if (error.message.includes('fetch')) {
            errorMsg = 'Erro de conexão. Verifique sua internet.';
        }
        
        addSystemMessage('⚠️ ' + errorMsg);
    }
}

function processAIResponse(response) {
    const correctionMatch = response.match(/\*\*Correção:?\*\*\s*(.+)/i);
    
    if (correctionMatch) {
        const mainResponse = response.replace(/\*\*Correção:?\*\*\s*.+/i, '').trim();
        const correction = correctionMatch[1].trim();
        
        if (mainResponse) {
            addAIMessage(mainResponse);
        }
        addCorrectionMessage(correction);
    } else {
        addAIMessage(response);
    }
    
    earnXP(5);
    
    const user = getCurrentUser();
    if (user) {
        user.totalConversations = (user.totalConversations || 0) + 0.5;
        saveUser(user);
    }
}

function addAIMessage(text) {
    const container = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message message-ai message-animate mb-4';
    
    let formattedText = text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = `
        <div class="flex items-start space-x-2">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-white text-sm">🤖</span>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-500 mb-1">Tutor IA</p>
                <div class="text-gray-800 break-words">${formattedText}</div>
            </div>
        </div>
    `;
    
    container.appendChild(messageDiv);
    scrollToBottom();
}

function addUserMessage(text) {
    const container = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message message-user message-animate mb-4';
    
    messageDiv.innerHTML = `
        <div class="flex items-start space-x-2 justify-end">
            <div class="flex-1 min-w-0 text-right">
                <p class="text-sm text-blue-200 mb-1">Você</p>
                <div class="text-white break-words">${text}</div>
            </div>
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-white text-sm">👤</span>
            </div>
        </div>
    `;
    
    container.appendChild(messageDiv);
    scrollToBottom();
}

function addCorrectionMessage(correction) {
    const container = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'correction message-animate mb-4';
    
    messageDiv.innerHTML = `
        <p class="correction-title">💡 Correção:</p>
        <p class="correction-text">${correction}</p>
    `;
    
    container.appendChild(messageDiv);
    scrollToBottom();
}

function addSystemMessage(text) {
    const container = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'text-center text-gray-500 text-sm my-4 px-4';
    
    messageDiv.innerHTML = `<span class="bg-gray-100 px-3 py-1 rounded-full inline-block">${text}</span>`;
    
    container.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const container = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'message message-ai mb-4';
    
    typingDiv.innerHTML = `
        <div class="flex items-start space-x-2">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-white text-sm">🤖</span>
            </div>
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    container.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    const typing = document.getElementById('typing-indicator');
    if (typing) {
        typing.remove();
    }
}

function clearChat() {
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';
    conversationStarted = false;
}

function scrollToBottom() {
    const container = document.getElementById('chat-messages');
    container.scrollTop = container.scrollHeight;
}
