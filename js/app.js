/* ============================================
   EnglishAI - Lógica Principal do Chat
   ============================================ */

let conversationStarted = false;
let isTyping = false;

document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return;

    if (!user.apiKey) {
        document.getElementById('chat-messages').innerHTML = `
            <div class="flex items-center justify-center h-full p-6">
                <div class="text-center">
                    <div class="text-6xl mb-4">🔑</div>
                    <h2 class="text-xl font-bold text-gray-800 mb-2">Chave de API necessária</h2>
                    <p class="text-gray-500 mb-4">Configure sua chave de API do Google Gemini.</p>
                    <a href="index.html" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">Configurar</a>
                </div>
            </div>`;
        return;
    }

    if (!initGeminiChat()) {
        document.getElementById('chat-messages').innerHTML = `
            <div class="flex items-center justify-center h-full p-6">
                <div class="text-center">
                    <div class="text-6xl mb-4">❌</div>
                    <h2 class="text-xl font-bold text-gray-800 mb-2">Erro ao inicializar</h2>
                    <a href="index.html" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">Voltar</a>
                </div>
            </div>`;
        return;
    }

    document.getElementById('chat-level').textContent = user.level;
    setupTopics();
    startConversation();
});

function setupTopics() {
    try {
        const topics = getConversationScenarios(getCurrentLevel());
        const container = document.getElementById('topic-buttons');
        if (!container) return;
        container.innerHTML = topics.map(s => 
            `<button onclick="changeTopic('${s.topic.replace(/'/g, "\\'")}')" class="topic-btn">${s.emoji} ${s.name}</button>`
        ).join('');
    } catch(e) {}
}

function toggleTopicMenu() {
    document.getElementById('topic-menu').classList.toggle('hidden');
}

function changeTopic(topic) {
    document.getElementById('topic-menu').classList.add('hidden');
    document.getElementById('chat-messages').innerHTML = '';
    conversationStarted = false;
    getGeminiChat().clearHistory();
    addSystemMessage('Novo tópico: ' + topic);
    startConversation();
}

async function startConversation() {
    if (conversationStarted) return;
    conversationStarted = true;
    showTyping();
    
    try {
        const greeting = await getGeminiChat().sendMessage('Hello!', getCurrentLevel());
        hideTyping();
        addMessage(greeting, 'ai');
    } catch (error) {
        hideTyping();
        showError(error);
    }
}

async function sendMessage() {
    const input = document.getElementById('message-input');
    const msg = input.value.trim();
    if (!msg || isTyping) return;
    
    input.value = '';
    input.focus();
    addMessage(msg, 'user');
    
    isTyping = true;
    showTyping();
    
    try {
        const response = await getGeminiChat().sendMessage(msg, getCurrentLevel());
        hideTyping();
        isTyping = false;
        addMessage(response, 'ai');
        
        // XP
        try {
            const user = getCurrentUser();
            if (user) { user.xp = (user.xp || 0) + 5; saveUser(user); }
        } catch(e) {}
    } catch (error) {
        hideTyping();
        isTyping = false;
        showError(error);
    }
}

function showError(error) {
    const container = document.getElementById('chat-messages');
    container.innerHTML = `
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
            <p class="text-red-800 font-bold mb-2">❌ Erro</p>
            <p class="text-red-600 text-sm">${error.message || 'Erro desconhecido'}</p>
        </div>
        <div class="text-center mt-4">
            <button onclick="retryConversation()" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
                🔄 Tentar Novamente
            </button>
            <br><br>
            <a href="index.html" class="text-blue-600 text-sm underline">⚙️ Configurações</a>
        </div>`;
}

async function retryConversation() {
    conversationStarted = false;
    document.getElementById('chat-messages').innerHTML = '';
    addSystemMessage('Aguarde 3 segundos...');
    await new Promise(r => setTimeout(r, 3000));
    document.getElementById('chat-messages').innerHTML = '';
    startConversation();
}

function addMessage(text, type) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'message message-' + type + ' message-animate mb-4';
    
    const icon = type === 'ai' ? '🤖' : '👤';
    const label = type === 'ai' ? 'Tutor IA' : 'Você';
    const colors = type === 'ai' 
        ? 'bg-green-500' 
        : 'bg-blue-500';
    const textColors = type === 'ai' 
        ? 'text-gray-800' 
        : 'text-white';
    
    let formatted = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    
    div.innerHTML = `
        <div class="flex items-start space-x-2 ${type === 'user' ? 'justify-end' : ''}">
            ${type === 'user' ? '' : `<div class="w-8 h-8 ${colors} rounded-full flex items-center justify-center flex-shrink-0"><span class="text-white text-sm">${icon}</span></div>`}
            <div class="flex-1 min-w-0 ${type === 'user' ? 'text-right' : ''}">
                <p class="text-sm ${type === 'ai' ? 'text-gray-500' : 'text-blue-200'} mb-1">${label}</p>
                <div class="${textColors} break-words">${formatted}</div>
            </div>
            ${type === 'user' ? `<div class="w-8 h-8 ${colors} rounded-full flex items-center justify-center flex-shrink-0"><span class="text-white text-sm">${icon}</span></div>` : ''}
        </div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function addSystemMessage(text) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'text-center text-gray-500 text-sm my-4 px-4';
    div.innerHTML = `<span class="bg-gray-100 px-3 py-1 rounded-full inline-block">${text}</span>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function showTyping() {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.id = 'typing-indicator';
    div.className = 'message message-ai mb-4';
    div.innerHTML = `<div class="flex items-start space-x-2"><div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"><span class="text-white text-sm">🤖</span></div><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function hideTyping() {
    const t = document.getElementById('typing-indicator');
    if (t) t.remove();
}
