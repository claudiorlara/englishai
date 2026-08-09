/* ============================================
   EnglishAI - Sistema de Exercícios
   ============================================ */

// Estado dos exercícios
let currentExercise = null;
let exerciseScore = 0;
let exerciseTotal = 0;

// Gerar exercício com IA
async function generateExercise() {
    const chat = getGeminiChat();
    if (!chat) {
        showToast('Chat não inicializado');
        return;
    }

    const level = getCurrentLevel();
    const topics = getCurrentTopics();
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    showLoading('Gerando exercício...');

    try {
        const response = await chat.generateExercise(level, randomTopic);
        hideLoading();

        if (response) {
            parseAndShowExercise(response);
        } else {
            showToast('Erro ao gerar exercício');
        }
    } catch (error) {
        hideLoading();
        showToast('Erro: ' + error.message);
    }
}

// Parse da resposta da IA e mostrar exercício
function parseAndShowExercise(response) {
    const lines = response.split('\n');
    const exercise = {
        type: 'multiple_choice',
        question: '',
        options: [],
        answer: '',
        explanation: ''
    };

    lines.forEach(line => {
        if (line.startsWith('EXERCISE_TYPE:')) {
            exercise.type = line.replace('EXERCISE_TYPE:', '').trim();
        } else if (line.startsWith('QUESTION:')) {
            exercise.question = line.replace('QUESTION:', '').trim();
        } else if (line.startsWith('OPTIONS:')) {
            exercise.options = line.replace('OPTIONS:', '').split(',').map(o => o.trim());
        } else if (line.startsWith('ANSWER:')) {
            exercise.answer = line.replace('ANSWER:', '').trim();
        } else if (line.startsWith('EXPLANATION_PT:')) {
            exercise.explanation = line.replace('EXPLANATION_PT:', '').trim();
        }
    });

    currentExercise = exercise;
    displayExercise(exercise);
}

// Mostrar exercício na tela
function displayExercise(exercise) {
    const container = document.getElementById('exercise-container') || createExerciseContainer();

    let html = `
        <div class="exercise-card slide-up">
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm text-gray-500">📝 Exercício</span>
                <span class="text-sm text-gray-500">${exerciseScore}/${exerciseTotal}</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-4">${exercise.question}</h3>
    `;

    if (exercise.type === 'multiple_choice' && exercise.options.length > 0) {
        html += `<div class="space-y-3">`;
        exercise.options.forEach((option, index) => {
            html += `
                <button onclick="checkAnswer('${option.replace(/'/g, "\\'")}')" 
                    class="exercise-option w-full text-left">
                    ${String.fromCharCode(65 + index)}) ${option}
                </button>
            `;
        });
        html += `</div>`;
    } else if (exercise.type === 'fill_blank') {
        html += `
            <input type="text" id="exercise-answer" placeholder="Sua resposta..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-3">
            <button onclick="checkFillAnswer()" 
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition">
                Verificar
            </button>
        `;
    } else if (exercise.type === 'translate') {
        html += `
            <textarea id="exercise-answer" placeholder="Traduza para inglês..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-3 h-24 resize-none"></textarea>
            <button onclick="checkTranslateAnswer()" 
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition">
                Verificar
            </button>
        `;
    }

    html += `
            <div id="exercise-feedback" class="mt-4 hidden"></div>
            <button onclick="generateExercise()" class="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                Próximo exercício →
            </button>
        </div>
    `;

    container.innerHTML = html;
}

// Criar container de exercícios
function createExerciseContainer() {
    const container = document.createElement('div');
    container.id = 'exercise-container';
    container.className = 'max-w-2xl mx-auto px-4 py-6';
    
    // Inserir após o header no app.html ou na página principal
    const main = document.querySelector('main') || document.body;
    main.appendChild(container);
    
    return container;
}

// Verificar resposta de múltipla escolha
function checkAnswer(selected) {
    if (!currentExercise) return;

    exerciseTotal++;
    const isCorrect = selected.toLowerCase().trim() === currentExercise.answer.toLowerCase().trim();
    
    if (isCorrect) {
        exerciseScore++;
        showFeedback(true, 'Correto! 🎉');
        earnXP(10);
    } else {
        showFeedback(false, `Incorreto. A resposta é: ${currentExercise.answer}`);
    }

    if (currentExercise.explanation) {
        addExplanation(currentExercise.explanation);
    }

    // Desabilitar botões
    document.querySelectorAll('.exercise-option').forEach(btn => {
        btn.disabled = true;
        btn.classList.add('cursor-not-allowed');
    });
}

// Verificar resposta de preencher lacuna
function checkFillAnswer() {
    if (!currentExercise) return;

    const input = document.getElementById('exercise-answer');
    const answer = input.value.trim();

    if (!answer) {
        showToast('Digite sua resposta');
        return;
    }

    exerciseTotal++;
    const isCorrect = answer.toLowerCase() === currentExercise.answer.toLowerCase();
    
    if (isCorrect) {
        exerciseScore++;
        showFeedback(true, 'Correto! 🎉');
        earnXP(10);
    } else {
        showFeedback(false, `Incorreto. A resposta é: ${currentExercise.answer}`);
    }

    if (currentExercise.explanation) {
        addExplanation(currentExercise.explanation);
    }

    input.disabled = true;
}

// Verificar resposta de tradução
function checkTranslateAnswer() {
    if (!currentExercise) return;

    const textarea = document.getElementById('exercise-answer');
    const answer = textarea.value.trim();

    if (!answer) {
        showToast('Digite sua resposta');
        return;
    }

    exerciseTotal++;
    // Para tradução, verificação mais flexível
    const normalize = (str) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const isCorrect = normalize(answer) === normalize(currentExercise.answer);
    
    if (isCorrect) {
        exerciseScore++;
        showFeedback(true, 'Excelente tradução! 🎉');
        earnXP(15);
    } else {
        showFeedback(false, `Sua tradução: "${answer}"<br>Resposta esperada: "${currentExercise.answer}"`);
    }

    if (currentExercise.explanation) {
        addExplanation(currentExercise.explanation);
    }

    textarea.disabled = true;
}

// Mostrar feedback
function showFeedback(isCorrect, message) {
    const feedback = document.getElementById('exercise-feedback');
    if (!feedback) return;

    feedback.className = `p-4 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
    feedback.innerHTML = `<p class="font-medium">${isCorrect ? '✅' : '❌'} ${message}</p>`;
    feedback.classList.remove('hidden');
}

// Adicionar explicação
function addExplanation(text) {
    const feedback = document.getElementById('exercise-feedback');
    if (!feedback) return;

    feedback.innerHTML += `<p class="mt-2 text-sm opacity-80">💡 ${text}</p>`;
}

// Mostrar loading
function showLoading(message) {
    const loading = document.createElement('div');
    loading.id = 'loading-overlay';
    loading.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    loading.innerHTML = `
        <div class="bg-white rounded-xl p-6 text-center">
            <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p class="text-gray-700">${message}</p>
        </div>
    `;
    document.body.appendChild(loading);
}

// Esconder loading
function hideLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.remove();
    }
}

// Flashcards
let flashcards = [];
let currentFlashcard = 0;

function loadFlashcards() {
    const level = getCurrentLevel();
    
    // Flashcards básicos por nível
    const flashcardData = {
        A1: [
            { front: 'Olá', back: 'Hello' },
            { front: 'Bom dia', back: 'Good morning' },
            { front: 'Obrigado', back: 'Thank you' },
            { front: 'Por favor', back: 'Please' },
            { front: 'Sim', back: 'Yes' },
            { front: 'Não', back: 'No' },
            { front: 'Água', back: 'Water' },
            { front: 'Comida', back: 'Food' },
            { front: 'Casa', back: 'House' },
            { front: 'Amigo', back: 'Friend' }
        ],
        A2: [
            { front: 'Eu gostaria de...', back: 'I would like...' },
            { front: 'Onde fica...?', back: 'Where is...?' },
            { front: 'Quanto custa?', back: 'How much does it cost?' },
            { front: 'Eu não entendo', back: 'I don\'t understand' },
            { front: 'Pode me ajudar?', back: 'Can you help me?' },
            { front: 'Que horas são?', back: 'What time is it?' },
            { front: 'Eu preciso de...', back: 'I need...' },
            { front: 'Está chovendo', back: 'It\'s raining' },
            { front: 'Eu moro em...', back: 'I live in...' },
            { front: 'Meu trabalho é...', back: 'My job is...' }
        ],
        B1: [
            { front: 'Na minha opinião', back: 'In my opinion' },
            { front: 'Por um lado... por outro', back: 'On one hand... on the other' },
            { front: 'Apesar de', back: 'Despite / In spite of' },
            { front: 'Isso depende', back: 'It depends' },
            { front: 'Eu concordo', back: 'I agree' },
            { front: 'Eu discordo', back: 'I disagree' },
            { front: 'É provável que', back: 'It\'s likely that' },
            { front: 'Quando se trata de', back: 'When it comes to' },
            { front: 'É importante', back: 'It\'s important' },
            { front: 'Considerando que', back: 'Given that' }
        ]
    };

    flashcards = flashcardData[level] || flashcardData.A1;
    currentFlashcard = 0;
}

function showNextFlashcard() {
    currentFlashcard = (currentFlashcard + 1) % flashcards.length;
    updateFlashcardDisplay();
}

function showPrevFlashcard() {
    currentFlashcard = (currentFlashcard - 1 + flashcards.length) % flashcards.length;
    updateFlashcardDisplay();
}

function updateFlashcardDisplay() {
    const front = document.getElementById('flashcard-front');
    const back = document.getElementById('flashcard-back');
    const counter = document.getElementById('flashcard-counter');

    if (front && back && flashcards.length > 0) {
        front.textContent = flashcards[currentFlashcard].front;
        back.textContent = flashcards[currentFlashcard].back;
        if (counter) {
            counter.textContent = `${currentFlashcard + 1}/${flashcards.length}`;
        }
    }
}

function flipFlashcard() {
    const card = document.querySelector('.flashcard');
    if (card) {
        card.classList.toggle('flipped');
    }
}
