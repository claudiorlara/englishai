/* ============================================
   EnglishAI - Sistema de Níveis
   ============================================ */

// Definição dos níveis
const LEVELS = {
    A1: {
        name: 'Básico',
        description: 'Saudações, números, frases simples do dia a dia',
        color: 'green',
        icon: '🌱',
        topics: [
            'Saudações e apresentações',
            'Números e quantidades',
            'Família e pessoas',
            'Cores e objetos',
            'Comida e bebida',
            'Rotina diária'
        ],
        xpRequired: 0,
        objectives: [
            'Se apresentar em inglês',
            'Contar de 1 a 100',
            'Descrever pessoas e objetos simples',
            'Fazer pedidos básicos'
        ]
    },
    A2: {
        name: 'Elementar',
        description: 'Vida cotidiana, present simple, passado simples',
        color: 'blue',
        icon: '📘',
        topics: [
            'No restaurante',
            'Fazendo compras',
            'Transporte e direções',
            'Clima e estacoes',
            'Trabalho e profissões',
            'Passado simples'
        ],
        xpRequired: 100,
        objectives: [
            'Descrever rotinas e hábitos',
            'Falar sobre o passado',
            'Entender instruções simples',
            'Conversar em situações cotidianas'
        ]
    },
    B1: {
        name: 'Intermediário',
        description: 'Opiniões, contação de histórias, conectores',
        color: 'purple',
        icon: '📖',
        topics: [
            'Expressar opiniões',
            'Viagens e férias',
            'Saúde e bem-estar',
            'Educação e trabalho',
            'Contar histórias',
            'Conectores e sequência'
        ],
        xpRequired: 300,
        objectives: [
            'Expressar opiniões e sentimentos',
            'Narrar eventos passados',
            'Entender textos mais longos',
            'Participar de discussões simples'
        ]
    },
    B2: {
        name: 'Intermediário Superior',
        description: 'Expressões idiomáticas, textos complexos',
        color: 'orange',
        icon: '📙',
        topics: [
            'Expressões idiomáticas',
            'Notícias e atualidades',
            'Cinema e entretenimento',
            'Tecnologia e internet',
            'Argumentação e persuasão',
            'Voz passiva e condicionais'
        ],
        xpRequired: 600,
        objectives: [
            'Usar expressões idiomáticas',
            'Entender notícias e artigos',
            'Argumentar com propriedade',
            'Escrever textos estruturados'
        ]
    },
    C1: {
        name: 'Avançado',
        description: 'Debates, nuance cultural, linguagem sofisticada',
        color: 'red',
        icon: '📕',
        topics: [
            'Debates e discussões',
            'Cultura e sociedade',
            'Negócios e finanças',
            'Ciência e descobertas',
            'Humor e ironia',
            'Subjuntivo e nuances'
        ],
        xpRequired: 1000,
        objectives: [
            'Participar de debates complexos',
            'Entender nuances culturais',
            'Usar linguagem sofisticada',
            'Escrever textos formais e informais'
        ]
    },
    C2: {
        name: 'Proficiente',
        description: 'Fluência natural, gírias, formal e informal',
        color: 'gray',
        icon: '🎓',
        topics: [
            'Gírias e expressões coloquiais',
            'Inglês britânico vs americano',
            'Jargões profissionais',
            'Humor e sarcasmo',
            'Formal vs informal',
            'Variedades de inglês'
        ],
        xpRequired: 1500,
        objectives: [
            'Comunicar-se naturalmente em qualquer situação',
            'Entender diferentes sotaques e variedades',
            'Usar gírias e expressões com propriedade',
            'Adaptar o registro linguístico ao contexto'
        ]
    }
};

// Obter nível atual do usuário
function getCurrentLevel() {
    const user = getCurrentUser();
    return user ? user.level : 'A1';
}

// Verificar se um nível está desbloqueado
function isLevelUnlocked(level) {
    const user = getCurrentUser();
    if (!user) return level === 'A1';

    const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIdx = levelOrder.indexOf(user.level);
    const targetIdx = levelOrder.indexOf(level);

    return targetIdx <= currentIdx;
}

// Obter progresso de um nível
function getLevelProgress(level) {
    const user = getCurrentUser();
    if (!user) return 0;
    return user.levelProgress[level] || 0;
}

// Atualizar progresso de um nível
function updateLevelProgress(level, progress) {
    const user = getCurrentUser();
    if (!user) return;

    user.levelProgress[level] = Math.min(100, Math.max(0, progress));
    saveUser(user);
}

// Renderizar lista de níveis (para levels.html)
function renderLevels() {
    const container = document.getElementById('levels-list');
    if (!container) return;

    const user = getCurrentUser();
    const currentLevel = user ? user.level : 'A1';

    // Atualizar display do nível atual
    const displayLevel = document.getElementById('display-level');
    const levelName = document.getElementById('level-name');
    const levelProgress = document.getElementById('level-progress');
    const levelBar = document.getElementById('level-bar');

    if (displayLevel) {
        displayLevel.textContent = currentLevel;
        levelName.textContent = LEVELS[currentLevel].name;

        const progress = getLevelProgress(currentLevel);
        levelProgress.textContent = `${progress}% concluído`;
        levelBar.style.width = `${progress}%`;
    }

    // Renderizar cards de nível
    container.innerHTML = '';

    Object.entries(LEVELS).forEach(([level, data]) => {
        const unlocked = isLevelUnlocked(level);
        const progress = getLevelProgress(level);
        const isCurrent = level === currentLevel;

        const card = document.createElement('div');
        card.className = `level-card ${unlocked ? '' : 'locked'} ${isCurrent ? 'current' : ''}`;
        card.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <span class="text-2xl">${data.icon}</span>
                    <div>
                        <div class="flex items-center space-x-2">
                            <span class="font-bold text-gray-800">${level}</span>
                            <span class="text-sm text-gray-500">${data.name}</span>
                            ${isCurrent ? '<span class="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Atual</span>' : ''}
                        </div>
                        <p class="text-sm text-gray-500 mt-1">${data.description}</p>
                    </div>
                </div>
                <div class="text-right">
                    ${unlocked ? `
                        <div class="progress-bar w-24">
                            <div class="progress-fill bg-${data.color}-500" style="width: ${progress}%"></div>
                        </div>
                        <span class="text-xs text-gray-400 mt-1">${progress}%</span>
                    ` : `
                        <span class="text-gray-400 text-sm">🔒 ${data.xpRequired} XP</span>
                    `}
                </div>
            </div>
            ${unlocked ? `
                <div class="mt-3 flex flex-wrap gap-1">
                    ${data.topics.slice(0, 3).map(topic => `
                        <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">${topic}</span>
                    `).join('')}
                    ${data.topics.length > 3 ? `<span class="text-xs text-gray-400">+${data.topics.length - 3}</span>` : ''}
                </div>
            ` : ''}
        `;

        if (unlocked && !isCurrent) {
            card.onclick = () => {
                // Permitir mudar para nível desbloqueado
                user.level = level;
                saveUser(user);
                renderLevels();
                showToast(`Nível alterado para ${level}`);
            };
        }

        container.appendChild(card);
    });
}

// Obter tópicos do nível atual
function getCurrentTopics() {
    const level = getCurrentLevel();
    return LEVELS[level].topics;
}

// Obter prompt do sistema para o nível
function getSystemPrompt(level) {
    const prompts = {
        A1: `You are a friendly English tutor for a complete beginner (A1 level). 
Rules:
- Speak ONLY in simple English with very basic vocabulary
- Keep sentences very short (3-5 words max)
- Use present simple tense only
- Always provide the Portuguese translation in parentheses after your English sentences
- When the student makes a mistake, gently correct them and explain in Portuguese
- Use lots of encouragement and positive feedback
- Start conversations with simple greetings or questions
- Use emojis to make it fun 😊
- If the student writes in Portuguese, translate it to simple English for them
- Suggest topics like: numbers, colors, family, food, greetings`,

        A2: `You are a helpful English tutor for an elementary student (A2 level).
Rules:
- Use simple English with basic vocabulary
- Keep sentences short (5-8 words)
- Use present simple, past simple, and basic future
- Occasionally provide Portuguese translations for new words
- Gently correct mistakes and explain briefly in Portuguese
- Talk about daily routines, shopping, directions, weather
- Encourage the student to form complete sentences
- Use real-life situations: restaurant, store, doctor
- Be patient and supportive`,

        B1: `You are an encouraging English tutor for an intermediate student (B1 level).
Rules:
- Use moderate English vocabulary
- Mix tenses: present, past, future, present perfect
- Give brief Portuguese explanations only for complex grammar
- Correct mistakes naturally in the conversation
- Discuss opinions, experiences, travel, work
- Ask open-ended questions to encourage longer responses
- Introduce connecting words: however, although, therefore
- Share interesting facts and stories
- Be motivating and constructive`,

        B2: `You are an engaging English tutor for an upper-intermediate student (B2 level).
Rules:
- Use varied vocabulary and some idiomatic expressions
- Use all tenses including conditionals and passive voice
- Rarely use Portuguese - only for very complex explanations
- Challenge the student with thought-provoking topics
- Discuss news, culture, technology, society
- Introduce phrasal verbs and idioms naturally
- Correct errors without stopping the conversation flow
- Encourage the student to express nuanced opinions
- Be intellectually stimulating`,

        C1: `You are a sophisticated English tutor for an advanced student (C1 level).
Rules:
- Use rich, varied vocabulary and complex sentence structures
- Discuss abstract topics: philosophy, politics, ethics, art
- Use subtle language: irony, understatement, emphasis
- Almost never use Portuguese
- Challenge with debates and critical thinking
- Introduce cultural references and nuances
- Accept minor errors and focus on fluency
- Encourage the student to develop and defend arguments
- Be intellectually engaging and thought-provoking`,

        C2: `You are a native-level conversation partner for a proficient student (C2 level).
Rules:
- Use natural, colloquial English with slang and idioms
- Discuss any topic at any level of complexity
- Use humor, sarcasm, and cultural references freely
- Never use Portuguese unless specifically asked
- Treat the student as a near-native speaker
- Challenge with wordplay, double meanings, and subtleties
- Discuss regional variations: British, American, Australian English
- Share interesting cultural insights
- Be a genuine conversation partner, not just a tutor`
    };

    return prompts[level] || prompts.A1;
}

// Obter cenários de conversa para o nível
function getConversationScenarios(level) {
    const scenarios = {
        A1: [
            { emoji: '👋', name: 'Apresentações', topic: 'Introduce yourself. Say your name, age, and where you are from.' },
            { emoji: '🛒', name: 'Supermercado', topic: 'You are at the supermarket. Ask for fruits and vegetables.' },
            { emoji: '☕', name: 'Café', topic: 'You are at a café. Order a coffee and a cake.' },
            { emoji: '👨‍👩‍👧', name: 'Família', topic: 'Talk about your family members.' },
            { emoji: '🎨', name: 'Cores', topic: 'Describe objects and their colors around you.' }
        ],
        A2: [
            { emoji: '🍽️', name: 'Restaurante', topic: 'You are at a restaurant. Order food and ask about the menu.' },
            { emoji: '🏥', name: 'Médico', topic: 'You are at the doctor. Describe your symptoms.' },
            { emoji: '✈️', name: 'Aeroporto', topic: 'You are at the airport. Ask about your flight.' },
            { emoji: '🏠', name: 'Aluguel', topic: 'You are looking for an apartment to rent.' },
            { emoji: '📱', name: 'Celular', topic: 'You bought a new phone and need help setting it up.' }
        ],
        B1: [
            { emoji: '💼', name: 'Entrevista', topic: 'You are in a job interview. Talk about your experience.' },
            { emoji: '🌍', name: 'Viagem', topic: 'Plan a trip with a friend. Discuss destinations.' },
            { emoji: '📰', name: 'Notícias', topic: 'Discuss a recent news article.' },
            { emoji: '🎬', name: 'Cinema', topic: 'Recommend a movie to a friend.' },
            { emoji: '🎓', name: 'Estudos', topic: 'Talk about your learning goals.' }
        ],
        B2: [
            { emoji: '🤖', name: 'Tecnologia', topic: 'Discuss the impact of AI on society.' },
            { emoji: '🌍', name: 'Meio Ambiente', topic: 'Debate climate change solutions.' },
            { emoji: '💼', name: 'Negócios', topic: 'Pitch a business idea to investors.' },
            { emoji: '🎭', name: 'Cultura', topic: 'Compare cultural differences between countries.' },
            { emoji: '📊', name: 'Estatísticas', topic: 'Interpret and discuss data trends.' }
        ],
        C1: [
            { emoji: '⚖️', name: 'Ética', topic: 'Debate ethical dilemmas in technology.' },
            { emoji: '🏛️', name: 'Política', topic: 'Discuss political systems and their effectiveness.' },
            { emoji: '🎨', name: 'Arte', topic: 'Analyze the meaning behind a piece of art.' },
            { emoji: '🧠', name: 'Filosofia', topic: 'Explore philosophical questions about consciousness.' },
            { emoji: '📈', name: 'Economia', topic: 'Analyze economic trends and their implications.' }
        ],
        C2: [
            { emoji: '🎤', name: 'Sarcasmo', topic: 'Use sarcasm and humor naturally in conversation.' },
            { emoji: '📖', name: 'Literatura', topic: 'Discuss the deeper meaning of a literary work.' },
            { emoji: '🔬', name: 'Ciência', topic: 'Explain complex scientific concepts simply.' },
            { emoji: '🎭', name: 'Variedades', topic: 'Compare British, American, and Australian English.' },
            { emoji: '💡', name: 'Gírias', topic: 'Use and explain modern slang and idioms.' }
        ]
    };

    return scenarios[level] || scenarios.A1;
}
