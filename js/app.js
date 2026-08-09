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
                    <p class="text-gray-500 mb-4">Você precisa de uma chave de API do Google Gemini.</p>
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
    document.getElementById('topic-menu').classList.toggle('hidden');
}

function changeTopic(topic) {
    currentTopic = topic;
    document.getElementById('topic-menu').classList.add('hidden');
    clearChat();
    geminiChat.clearHistory();
    addSystemMessage('Novo tópico: ' + topic);
    startConversation();
}

async function startConversation() {
    if (conversationStarted) return;
    conversationStarted = true;
    showTypingIndicator();
    
    try {
        const chat = getGeminiChat();
        const greeting = await chat.sendMessage('Hello!', getCurrentLevel());
        hideTypingIndicator();
        addAIMessage(greeting);
    } catch (error) {
        hideTypingIndicator();
        showError(error);
    }
}

function showError(error) {
    const container = document.getElementById('chat-messages');
    
    let errorHTML = '<div class="bg-red-50 border border-red-200 rounded-lg p-4 m-4">';
    errorHTML += '<p class="text-red-800 font-bold mb-2">❌ Erro ao conectar com a IA</p>';
    errorHTML += '<p class="text-red-600 text-sm mb-3">' + (error.message || 'Erro desconhecido') + '</p>';
    
    if (error.message && error.message.includes('403')) {
        errorHTML += '<p class="text-red-600 text-sm">Sua chave de API pode estar com problema. Crie uma nova em:<br>';
        errorHTML += '<a href="https://aistudio.google.com/apikey" target="_blank" class="text-blue-600 underline">aistudio.google.com/apikey</a></p>';
    }
    
    errorHTML += '</div>';
    
    container.innerHTML = errorHTML + `
        <div class="text-center mt-4">
            <button onclick="retryConversation()" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition">
                🔄 Tentar Novamente
            </button>
            <br><br>
            <a href="index.html" class="text-blue-600 text-sm underline">⚙️ Verificar Configurações</a>
        </div>
    `;
}

async function retryConversation() {
    conversationStarted = false;
    clearChat();
    addSystemMessage('Aguarde 5 segundos...');
    await new Promise(r => setTimeout(r, 5000));
    startConversation();
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
        addAIMessage(response);
        
        earnXP(5);
        const user = getCurrentUser();
        if (user) {
            user.totalConversations = (user.totalConversations || 0) + 0.5;
            saveUser(user);
        }
    } catch (error) {
        hideTypingIndicator();
        isTyping = false;
        showError(error);
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

function addSystemMessage(text) {
    const container = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'text-center text-gray-500 text-sm my-4 px-4';
    messageDiv.innerHTML = '<span class="bg-gray-100 px-3 py-1 rounded-full inline-block">' + text + '</span>';
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
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    container.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
}

function clearChat() {
    document.getElementById('chat-messages').innerHTML = '';
    conversationStarted = false;
}

function scrollToBottom() {
    const container = document.getElementById('chat-messages');
    container.scrollTop = container.scrollHeight;
}
