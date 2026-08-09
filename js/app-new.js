// EnglishAI - Lógica Principal do App

let userData = null;
let currentLesson = null;
let currentExercise = 0;
let lessonHearts = 5;
let selectedAnswer = null;
let isAnswerChecked = false;

// Inicializar app
function initApp() {
    userData = loadUserData();
    if (userData) {
        showScreen('screen-home');
        renderLessonPath();
        updateUI();
    } else {
        showScreen('screen-login');
    }
}

function loadUserData() {
    const data = localStorage.getItem('englishai_data');
    return data ? JSON.parse(data) : null;
}

function saveUserData() {
    localStorage.setItem('englishai_data', JSON.stringify(userData));
}

function startApp() {
    const name = document.getElementById('login-name').value.trim();
    if (!name) {
        alert('Digite seu nome!');
        return;
    }
    
    userData = {
        name: name,
        xp: 0,
        hearts: 5,
        streak: 0,
        completedLessons: [],
        learnedWords: [],
        lastDate: new Date().toDateString()
    };
    
    saveUserData();
    showScreen('screen-home');
    renderLessonPath();
    updateUI();
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function updateUI() {
    if (!userData) return;
    
    document.getElementById('xp').textContent = userData.xp;
    document.getElementById('hearts').textContent = userData.hearts;
    document.getElementById('streak').textContent = userData.streak;
    document.getElementById('lesson-hearts').textContent = userData.hearts;
    document.getElementById('profile-name').textContent = userData.name;
    document.getElementById('stat-xp').textContent = userData.xp;
    document.getElementById('stat-words').textContent = userData.learnedWords.length;
    document.getElementById('stat-lessons').textContent = userData.completedLessons.length;
    document.getElementById('stat-streak').textContent = userData.streak;
    
    // Determinar nível
    let level = 'A1';
    for (const l of LEVELS) {
        if (userData.xp >= l.xpRequired) level = l.level;
    }
    document.getElementById('profile-level').textContent = level;
}

function renderLessonPath() {
    const container = document.getElementById('lesson-path');
    container.innerHTML = '';
    
    LESSONS.forEach((lesson, index) => {
        const isCompleted = userData.completedLessons.includes(lesson.id);
        const isAvailable = index === 0 || userData.completedLessons.includes(LESSONS[index - 1].id);
        const isLocked = !isAvailable && !isCompleted;
        
        if (index > 0) {
            const connector = document.createElement('div');
            connector.className = 'lesson-connector' + (isCompleted ? ' completed' : '');
            container.appendChild(connector);
        }
        
        const node = document.createElement('div');
        node.className = 'lesson-node' + 
            (isCompleted ? ' completed' : '') + 
            (isAvailable && !isCompleted ? ' available current' : '') +
            (isLocked ? ' locked' : '');
        
        node.innerHTML = isCompleted ? '✓' : lesson.icon;
        
        if (!isLocked) {
            node.onclick = () => startLesson(lesson);
        }
        
        container.appendChild(node);
    });
}

function startLesson(lesson) {
    currentLesson = lesson;
    currentExercise = 0;
    lessonHearts = userData.hearts;
    selectedAnswer = null;
    isAnswerChecked = false;
    
    document.getElementById('lesson-hearts').textContent = lessonHearts;
    showScreen('screen-lesson');
    renderExercise();
}

function renderExercise() {
    const exercise = currentLesson.exercises[currentExercise];
    const container = document.getElementById('lesson-content');
    const btnCheck = document.getElementById('btn-check');
    
    selectedAnswer = null;
    isAnswerChecked = false;
    btnCheck.classList.remove('active');
    btnCheck.textContent = 'Verificar';
    
    // Atualizar barra de progresso
    const progress = (currentExercise / currentLesson.exercises.length) * 100;
    document.getElementById('lesson-progress').style.width = progress + '%';
    
    switch(exercise.type) {
        case 'listen-choose':
            container.innerHTML = `
                <div class="exercise-container">
                    <div class="exercise-prompt">Ouça e escolha a tradução</div>
                    <button onclick="speakWord('${exercise.word}')" class="btn-listen">🔊</button>
                    <div class="exercise-options">
                        ${exercise.options.map(opt => `
                            <button onclick="selectOption(this, '${opt}')" class="exercise-option">${opt}</button>
                        `).join('')}
                    </div>
                </div>
            `;
            setTimeout(() => speakWord(exercise.word), 500);
            break;
            
        case 'speak':
            container.innerHTML = `
                <div class="exercise-container">
                    <div class="exercise-prompt">Fale em inglês</div>
                    <div class="exercise-word">${exercise.translation}</div>
                    <div class="exercise-translation">${exercise.word}</div>
                    <button onclick="startSpeaking('${exercise.word}')" class="btn-speak" id="btn-speak">🎤</button>
                    <p style="margin-top: 15px; color: #8b9ca8; font-size: 14px;">Toque e fale: <strong>${exercise.word}</strong></p>
                </div>
            `;
            break;
            
        case 'type':
            container.innerHTML = `
                <div class="exercise-container">
                    <div class="exercise-prompt">Escreva em inglês</div>
                    <div class="exercise-translation">${getTranslation(exercise.word)}</div>
                    <button onclick="speakWord('${exercise.word}')" class="btn-listen" style="margin-bottom: 20px;">🔊</button>
                    <input type="text" id="type-input" class="exercise-input" placeholder="${exercise.hint}" autocomplete="off" autocapitalize="off">
                    <p style="margin-top: 10px; color: #58cc02; font-size: 13px;">${exercise.hint}</p>
                </div>
            `;
            document.getElementById('type-input').addEventListener('input', (e) => {
                if (e.target.value.trim()) {
                    btnCheck.classList.add('active');
                } else {
                    btnCheck.classList.remove('active');
                }
            });
            break;
            
        case 'choose':
            container.innerHTML = `
                <div class="exercise-container">
                    <div class="exercise-prompt">${exercise.question}</div>
                    <div class="exercise-options">
                        ${exercise.options.map(opt => `
                            <button onclick="selectOption(this, '${opt}')" class="exercise-option">${opt}</button>
                        `).join('')}
                    </div>
                </div>
            `;
            break;
    }
}

function speakWord(word) {
    speech.speak(word);
}

function getTranslation(word) {
    const vocab = VOCABULARY.find(v => v.english === word);
    return vocab ? vocab.portuguese : word;
}

function selectOption(element, value) {
    if (isAnswerChecked) return;
    
    document.querySelectorAll('.exercise-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedAnswer = value;
    
    document.getElementById('btn-check').classList.add('active');
}

function startSpeaking(word) {
    const btn = document.getElementById('btn-speak');
    
    if (speech.isListening) {
        speech.stopListening();
        btn.classList.remove('listening');
        btn.textContent = '🎤';
        return;
    }
    
    btn.classList.add('listening');
    btn.textContent = '⏹️';
    
    speech.startListening((result) => {
        btn.classList.remove('listening');
        btn.textContent = '🎤';
        
        const similarity = calculateSimilarity(result.toLowerCase(), word.toLowerCase());
        
        if (similarity > 0.6) {
            showFeedback(true, `Perfeito! Você disse: "${result}"`);
            addXP(5);
        } else if (similarity > 0.3) {
            showFeedback(true, `Bom! Você disse: "${result}". Correto: "${word}"`);
            addXP(3);
        } else {
            showFeedback(false, `Você disse: "${result}". Correto: "${word}"`);
            removeHeart();
        }
        
        setTimeout(() => nextExercise(), 2000);
    });
    
    speech.onEnd = () => {
        btn.classList.remove('listening');
        btn.textContent = '🎤';
    };
}

function calculateSimilarity(str1, str2) {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    let matches = 0;
    
    words1.forEach(w1 => {
        if (words2.some(w2 => w1.includes(w2) || w2.includes(w1))) {
            matches++;
        }
    });
    
    return matches / Math.max(words1.length, words2.length);
}

function checkAnswer() {
    if (isAnswerChecked) {
        nextExercise();
        return;
    }
    
    const exercise = currentLesson.exercises[currentExercise];
    let isCorrect = false;
    
    switch(exercise.type) {
        case 'listen-choose':
        case 'choose':
            isCorrect = selectedAnswer === exercise.answer;
            break;
            
        case 'type':
            const input = document.getElementById('type-input');
            isCorrect = input.value.trim().toLowerCase() === exercise.word.toLowerCase();
            break;
            
        case 'speak':
            nextExercise();
            return;
    }
    
    isAnswerChecked = true;
    const btnCheck = document.getElementById('btn-check');
    btnCheck.textContent = 'Continuar';
    
    if (isCorrect) {
        showFeedback(true, 'Correto! 🎉');
        addXP(10);
        markAnswer(true);
    } else {
        showFeedback(false, `Resposta: ${exercise.answer || exercise.word}`);
        removeHeart();
        markAnswer(false);
    }
}

function markAnswer(isCorrect) {
    document.querySelectorAll('.exercise-option').forEach(opt => {
        if (opt.classList.contains('selected')) {
            opt.classList.add(isCorrect ? 'correct' : 'wrong');
        }
    });
}

function nextExercise() {
    currentExercise++;
    
    if (currentExercise >= currentLesson.exercises.length) {
        completeLesson();
        return;
    }
    
    if (lessonHearts <= 0) {
        failLesson();
        return;
    }
    
    renderExercise();
}

function completeLesson() {
    if (!userData.completedLessons.includes(currentLesson.id)) {
        userData.completedLessons.push(currentLesson.id);
        userData.hearts = Math.min(5, userData.hearts + 1);
        saveUserData();
    }
    
    document.getElementById('result-icon').textContent = '🎉';
    document.getElementById('result-title').textContent = 'Lição Completa!';
    document.getElementById('result-xp').textContent = '+' + currentLesson.xp;
    document.getElementById('result-accuracy').textContent = Math.round((lessonHearts / 5) * 100) + '%';
    
    showScreen('screen-result');
}

function failLesson() {
    document.getElementById('result-icon').textContent = '💔';
    document.getElementById('result-title').textContent = 'Tente Novamente!';
    document.getElementById('result-xp').textContent = '+0';
    document.getElementById('result-accuracy').textContent = '0%';
    
    showScreen('screen-result');
}

function continueAfterResult() {
    userData.hearts = 5;
    saveUserData();
    updateUI();
    renderLessonPath();
    showScreen('screen-home');
}

function exitLesson() {
    userData.hearts = 5;
    saveUserData();
    showScreen('screen-home');
}

function showFeedback(isCorrect, message) {
    const existing = document.querySelector('.feedback');
    if (existing) existing.remove();
    
    const feedback = document.createElement('div');
    feedback.className = `feedback ${isCorrect ? 'correct' : 'wrong'} show`;
    feedback.innerHTML = `
        <span class="feedback-icon">${isCorrect ? '✓' : '✗'}</span>
        <span class="feedback-text">${message}</span>
    `;
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 2000);
}

function addXP(amount) {
    userData.xp += amount;
    saveUserData();
    updateUI();
}

function removeHeart() {
    lessonHearts--;
    userData.hearts = Math.max(0, userData.hearts - 1);
    document.getElementById('lesson-hearts').textContent = lessonHearts;
    saveUserData();
    updateUI();
}

function showTab(tab) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    switch(tab) {
        case 'home':
            showScreen('screen-home');
            renderLessonPath();
            break;
        case 'practice':
            showScreen('screen-practice');
            break;
        case 'vocabulary':
            showScreen('screen-vocabulary');
            renderVocabulary();
            break;
        case 'profile':
            showScreen('screen-profile');
            updateUI();
            break;
    }
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
}

function renderVocabulary() {
    const container = document.getElementById('vocab-list');
    container.innerHTML = '';
    
    const learnedIds = userData.learnedWords || [];
    
    VOCABULARY.forEach(vocab => {
        const isLearned = learnedIds.includes(vocab.id);
        const item = document.createElement('div');
        item.className = 'vocab-item';
        item.innerHTML = `
            <span class="vocab-icon">${vocab.icon}</span>
            <div class="vocab-info">
                <div class="vocab-english">${vocab.english}</div>
                <div class="vocab-portuguese">${vocab.portuguese}</div>
            </div>
            <span class="vocab-mastery">${isLearned ? '✓ Aprendido' : vocab.level}</span>
        `;
        item.onclick = () => speech.speak(vocab.english);
        container.appendChild(item);
    });
}

function resetProgress() {
    if (confirm('Tem certeza? Isso vai apagar todo seu progresso.')) {
        localStorage.removeItem('englishai_data');
        userData = null;
        showScreen('screen-login');
    }
}

// Prática com IA (versão simples sem API)
function sendPracticeMessage() {
    const input = document.getElementById('practice-input');
    const message = input.value.trim();
    if (!message) return;
    
    addChatMessage(message, 'user');
    input.value = '';
    
    // Resposta simples baseada na mensagem
    setTimeout(() => {
        const response = generateSimpleResponse(message);
        addChatMessage(response, 'ai');
        speech.speak(response);
    }, 500);
}

function generateSimpleResponse(message) {
    const lower = message.toLowerCase();
    
    const responses = {
        'hello': 'Hi there! How are you? (Olá! Como você está?)',
        'hi': 'Hello! What is your name? (Olá! Qual é o seu nome?)',
        'how are you': 'I am fine, thank you! And you? (Estou bem, obrigado! E você?)',
        'my name is': 'Nice to meet you! (Prazer em conhecê-lo!)',
        'good morning': 'Good morning! Have a great day! (Bom dia! Tenha um ótimo dia!)',
        'thank you': 'You\'re welcome! (De nada!)',
        'yes': 'Great! (Ótimo!)',
        'no': 'Okay, no problem! (Ok, sem problema!)'
    };
    
    for (const [key, value] of Object.entries(responses)) {
        if (lower.includes(key)) return value;
    }
    
    return 'Good job! Keep practicing! (Bom trabalho! Continue praticando!)';
}

function addChatMessage(text, type) {
    const chat = document.getElementById('practice-chat');
    const div = document.createElement('div');
    div.className = `chat-message ${type}`;
    div.innerHTML = `
        <div class="message-avatar">${type === 'ai' ? '🤖' : '👤'}</div>
        <div class="message-text">${text}</div>
    `;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function toggleVoiceInput() {
    const btn = document.getElementById('btn-mic');
    
    if (speech.isListening) {
        speech.stopListening();
        btn.classList.remove('active');
        return;
    }
    
    btn.classList.add('active');
    speech.startListening((result) => {
        btn.classList.remove('active');
        document.getElementById('practice-input').value = result;
        sendPracticeMessage();
    });
}

// Inicializar
document.addEventListener('DOMContentLoaded', initApp);
