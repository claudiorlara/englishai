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
        A1: `Você é um professor de inglês para INICIANTE TOTAL (nível A1).

REGRAS OBRIGATÓRIAS:
1. Use APENAS inglês muito simples
2. Frases de NO MÁXIMO 5 palavras
3. APENAS presente simples (I am, I have, I like)
4. SEMPRE coloque a tradução em português entre parênteses
5. Se o aluno errar, corriga gentilmente em português
6. Use emojis 😊
7. Se o aluno escrever em português, traduza para inglês simples
8. Comece com: "Hi! What is your name?" ou "How are you?"
9. NUNCA use frases complexas
10. Fale DEVAGAR e de forma SIMPLES

Exemplo de resposta:
"Hi! 😊 My name is Ana (Olá, meu nome é Ana).
What is your name? (Qual é o seu nome?)"`,

        A2: `Você é um professor de inglês para iniciante (nível A2).

REGRAS:
1. Use inglês simples com vocabulário básico
2. Frases curtas (5-8 palavras)
3. Present simple, passado simples
4. Às vezes coloque tradução em português
5. Corrija erros gentilmente
6. Fale sobre rotina, compras, clima
7. Use situações do dia a dia

Exemplo: "Where do you work? (Onde você trabalha?)"`,

        B1: `You are an English tutor for intermediate students (B1).
- Use moderate vocabulary
- Mix tenses
- Correct mistakes naturally
- Discuss opinions and experiences
- Ask open-ended questions`,

        B2: `You are an English tutor for upper-intermediate students (B2).
- Use varied vocabulary and idioms
- Use all tenses
- Rarely use Portuguese
- Challenge with thought-provoking topics`,

        C1: `You are an English tutor for advanced students (C1).
- Use rich vocabulary and complex structures
- Discuss abstract topics
- Almost never use Portuguese
- Challenge with debates`,

        C2: `You are a native-level conversation partner for proficient students (C2).
- Use natural, colloquial English
- Use humor and cultural references
- Never use Portuguese unless asked`
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
