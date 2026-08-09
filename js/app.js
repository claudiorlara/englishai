/* ============================================
   EnglishAI - Lógica Principal do Chat
   ============================================ */

// Estado da aplicação
let currentTopic = null;
let conversationStarted = false;
let isTyping = false;

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação
    const user = checkAuth();
    if (!user) return;

    // Verificar API key
    if (!user.apiKey) {
        showToast('⚠️ Configure sua chave de API em Configurações');
        setTimeout(() => {
            if (confirm('Você precisa de uma chave de API do Google Gemini para usar o chat.\n\nDeseja ir para as configurações?')) {
                window.location.href = 'index.html';
            }
        }, 1000);
        return;
    }

    // Inicializar chat com Gemini
    if (!initGeminiChat()) {
        showToast('Erro ao inicializar IA');
        return;
    }

    // Atualizar display do nível
    document.getElementById('chat-level').textContent = user.level;

    // Configurar tópicos
    setupTopics();

    // Iniciar conversa
    startConversation();
});

// Configurar menu de tópicos
function setupTopics() {
    const topics = getConversationScenarios(getCurrentLevel());
    const container = document.getElementById('topic-buttons');
    
    container.innerHTML = topics.map(scenario => `
        <button onclick="changeTopic('${scenario.topic}')" class="topic-btn">
            ${scenario.emoji} ${scenario.name}
        </button>
    `).join('');
}

// Alternar menu de tópicos
function toggleTopicMenu() {
    const menu = document.getElementById('topic-menu');
    menu.classList.toggle('hidden');
}

// Mudar tópico da conversa
function changeTopic(topic) {
    currentTopic = topic;
    document.getElementById('topic-menu').classList.add('hidden');
    
    // Limpar conversa e recomeçar com novo tópico
    clearChat();
    geminiChat.clearHistory();
    
    addSystemMessage(`Novo tópico: ${topic}`);
    startConversation();
}

// Iniciar conversa
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
        showToast('Erro ao iniciar conversa: ' + error.message);
        console.error(error);
    }
}

// Enviar mensagem do usuário
async function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message || isTyping) return;
    
    // Limpar input
    input.value = '';
    input.focus();
    
    // Adicionar mensagem do usuário ao chat
    addUserMessage(message);
    
    // Mostrar indicador de digitação
    isTyping = true;
    showTypingIndicator();
    
    try {
        const chat = getGeminiChat();
        const response = await chat.sendMessage(message, getCurrentLevel());
        
        hideTypingIndicator();
        isTyping = false;
        
        // Processar resposta da IA
        processAIResponse(response);
        
    } catch (error) {
        hideTypingIndicator();
        isTyping = false;
        
        if (error.message.includes('Chave de API')) {
            addSystemMessage('⚠️ Erro de API. Verifique sua chave de API nas configurações.');
        } else {
            addSystemMessage('⚠️ Erro ao obter resposta. Tente novamente.');
        }
        console.error(error);
    }
}

// Processar resposta da IA
function processAIResponse(response) {
    // Verificar se tem correção na resposta
    const correctionMatch = response.match(/\*\*Correção:?\*\*\s*(.+)/i);
    
    if (correctionMatch) {
        // Tem correção, mostrar separado
        const mainResponse = response.replace(/\*\*Correção:?\*\*\s*.+/i, '').trim();
        const correction = correctionMatch[1].trim();
        
        if (mainResponse) {
            addAIMessage(mainResponse);
        }
        addCorrectionMessage(correction);
    } else {
        // Sem correção, mostrar resposta normal
        addAIMessage(response);
    }
    
    // Adicionar XP por participar da conversa
    const result = earnXP(5);
    if (result && result.newAchievements && result.newAchievements.length > 0) {
        // Conquistas já são mostradas pelo earnXP
    }
    
    // Atualizar conversas totais
    const user = getCurrentUser();
    if (user) {
        user.totalConversations = (user.totalConversations || 0) + 0.5; // Meia conversa por troca
        saveUser(user);
    }
}

// Adicionar mensagem da IA ao chat
function addAIMessage(text) {
    const container = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message message-ai message-animate mb-4';
    
    // Processar formatação básica
    let formattedText = text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = `
        <div class="flex items-start space-x-2">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-white text-sm">🤖</span>
            </div>
            <div class="flex-1">
                <p class="text-sm text-gray-500 mb-1">Tutor IA</p>
                <div class="text-gray-800">${formattedText}</div>
            </div>
        </div>
    `;
    
    container.appendChild(messageDiv);
    scrollToBottom();
}

// Adicionar mensagem do usuário ao chat
function addUserMessage(text) {
    const container = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message message-user message-animate mb-4 ml-auto';
    
    messageDiv.innerHTML = `
        <div class="flex items-start space-x-2 flex-row-reverse">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-white text-sm">👤</span>
            </div>
            <div class="flex-1 text-right">
                <p class="text-sm text-blue-200 mb-1">Você</p>
                <div class="text-white">${text}</div>
            </div>
        </div>
    `;
    
    container.appendChild(messageDiv);
    scrollToBottom();
}

// Adicionar mensagem de correção
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

// Adicionar mensagem do sistema
function addSystemMessage(text) {
    const container = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'text-center text-gray-500 text-sm my-4';
    
    messageDiv.innerHTML = `<span class="bg-gray-100 px-3 py-1 rounded-full">${text}</span>`;
    
    container.appendChild(messageDiv);
    scrollToBottom();
}

// Mostrar indicador de digitação
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

// Esconder indicador de digitação
function hideTypingIndicator() {
    const typing = document.getElementById('typing-indicator');
    if (typing) {
        typing.remove();
    }
}

// Limpar chat
function clearChat() {
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';
    conversationStarted = false;
}

// Rolar para baixo
function scrollToBottom() {
    const container = document.getElementById('chat-messages');
    container.scrollTop = container.scrollHeight;
}

// Atalho de teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
