// EnglishAI - Dados do aplicativo

const VOCABULARY = [
    { id: 1, english: "Hello", portuguese: "Olá", icon: "👋", level: "A1" },
    { id: 2, english: "Goodbye", portuguese: "Adeus", icon: "👋", level: "A1" },
    { id: 3, english: "Thank you", portuguese: "Obrigado", icon: "🙏", level: "A1" },
    { id: 4, english: "Please", portuguese: "Por favor", icon: "🙏", level: "A1" },
    { id: 5, english: "Yes", portuguese: "Sim", icon: "✅", level: "A1" },
    { id: 6, english: "No", portuguese: "Não", icon: "❌", level: "A1" },
    { id: 7, english: "Water", portuguese: "Água", icon: "💧", level: "A1" },
    { id: 8, english: "Food", portuguese: "Comida", icon: "🍕", level: "A1" },
    { id: 9, english: "House", portuguese: "Casa", icon: "🏠", level: "A1" },
    { id: 10, english: "Friend", portuguese: "Amigo", icon: "👫", level: "A1" },
    { id: 11, english: "Family", portuguese: "Família", icon: "👨‍👩‍👧‍👦", level: "A1" },
    { id: 12, english: "Good morning", portuguese: "Bom dia", icon: "🌅", level: "A1" },
    { id: 13, english: "Good night", portuguese: "Boa noite", icon: "🌙", level: "A1" },
    { id: 14, english: "I am", portuguese: "Eu sou", icon: "👤", level: "A1" },
    { id: 15, english: "I have", portuguese: "Eu tenho", icon: "✋", level: "A1" },
    { id: 16, english: "I like", portuguese: "Eu gosto", icon: "❤️", level: "A1" },
    { id: 17, english: "Big", portuguese: "Grande", icon: "📏", level: "A1" },
    { id: 18, english: "Small", portuguese: "Pequeno", icon: "📏", level: "A1" },
    { id: 19, english: "Good", portuguese: "Bom", icon: "👍", level: "A1" },
    { id: 20, english: "Bad", portuguese: "Mau", icon: "👎", level: "A1" },
    { id: 21, english: "Cat", portuguese: "Gato", icon: "🐱", level: "A1" },
    { id: 22, english: "Dog", portuguese: "Cachorro", icon: "🐶", level: "A1" },
    { id: 23, english: "Book", portuguese: "Livro", icon: "📖", level: "A1" },
    { id: 24, english: "Car", portuguese: "Carro", icon: "🚗", level: "A1" },
    { id: 25, english: "House", portuguese: "Casa", icon: "🏠", level: "A1" },
    { id: 26, english: "Where", portuguese: "Onde", icon: "❓", level: "A2" },
    { id: 27, english: "When", portuguese: "Quando", icon: "⏰", level: "A2" },
    { id: 28, english: "How", portuguese: "Como", icon: "❓", level: "A2" },
    { id: 29, english: "Work", portuguese: "Trabalho", icon: "💼", level: "A2" },
    { id: 30, english: "School", portuguese: "Escola", icon: "🏫", level: "A2" },
    { id: 31, english: "Doctor", portuguese: "Médico", icon: "👨‍⚕️", level: "A2" },
    { id: 32, english: "Restaurant", portuguese: "Restaurante", icon: "🍽️", level: "A2" },
    { id: 33, english: "Money", portuguese: "Dinheiro", icon: "💰", level: "A2" },
    { id: 34, english: "Time", portuguese: "Tempo", icon: "⏰", level: "A2" },
    { id: 35, english: "Day", portuguese: "Dia", icon: "📅", level: "A2" },
    { id: 36, english: "Night", portuguese: "Noite", icon: "🌙", level: "A2" },
    { id: 37, english: "Rain", portuguese: "Chuva", icon: "🌧️", level: "A2" },
    { id: 38, english: "Sun", portuguese: "Sol", icon: "☀️", level: "A2" },
    { id: 39, english: "Moon", portuguese: "Lua", icon: "🌙", level: "A2" },
    { id: 40, english: "Star", portuguese: "Estrela", icon: "⭐", level: "A2" }
];

const LESSONS = [
    {
        id: 1,
        title: "Apresentações",
        icon: "👋",
        level: "A1",
        xp: 10,
        exercises: [
            { type: "listen-choose", word: "Hello", options: ["Olá", "Adeus", "Obrigado"], answer: "Olá" },
            { type: "speak", word: "Hello", translation: "Olá" },
            { type: "type", word: "Hello", hint: "H _ _ _ _" },
            { type: "choose", question: "Como se diz 'obrigado' em inglês?", options: ["Please", "Thank you", "Hello"], answer: "Thank you" },
            { type: "listen-choose", word: "Goodbye", options: ["Olá", "Adeus", "Por favor"], answer: "Adeus" }
        ]
    },
    {
        id: 2,
        title: "Números",
        icon: "🔢",
        level: "A1",
        xp: 10,
        exercises: [
            { type: "choose", question: "One = ?", options: ["Um", "Dois", "Três"], answer: "Um" },
            { type: "listen-choose", word: "Two", options: ["Um", "Dois", "Três"], answer: "Dois" },
            { type: "speak", word: "Three", translation: "Três" },
            { type: "type", word: "Four", hint: "F _ _ _" },
            { type: "choose", question: "Five = ?", options: ["Quatro", "Cinco", "Seis"], answer: "Cinco" }
        ]
    },
    {
        id: 3,
        title: "Cores",
        icon: "🎨",
        level: "A1",
        xp: 10,
        exercises: [
            { type: "listen-choose", word: "Red", options: ["Azul", "Vermelho", "Verde"], answer: "Vermelho" },
            { type: "speak", word: "Blue", translation: "Azul" },
            { type: "choose", question: "Green = ?", options: ["Amarelo", "Verde", "Roxo"], answer: "Verde" },
            { type: "type", word: "Yellow", hint: "Y _ _ _ _ _" },
            { type: "listen-choose", word: "Black", options: ["Branco", "Preto", "Cinza"], answer: "Preto" }
        ]
    },
    {
        id: 4,
        title: "Família",
        icon: "👨‍👩‍👧‍👦",
        level: "A1",
        xp: 10,
        exercises: [
            { type: "choose", question: "Mother = ?", options: ["Mãe", "Pai", "Irmã"], answer: "Mãe" },
            { type: "listen-choose", word: "Father", options: ["Mãe", "Pai", "Irmão"], answer: "Pai" },
            { type: "speak", word: "Sister", translation: "Irmã" },
            { type: "type", word: "Brother", hint: "B _ _ _ _ _ _" },
            { type: "listen-choose", word: "Family", options: ["Família", "Amigos", "Escola"], answer: "Família" }
        ]
    },
    {
        id: 5,
        title: "Comida",
        icon: "🍕",
        level: "A1",
        xp: 15,
        exercises: [
            { type: "listen-choose", word: "Water", options: ["Água", "Comida", "Leite"], answer: "Água" },
            { type: "choose", question: "Food = ?", options: ["Bebida", "Comida", "Doce"], answer: "Comida" },
            { type: "speak", word: "Bread", translation: "Pão" },
            { type: "type", word: "Milk", hint: "M _ _ k" },
            { type: "listen-choose", word: "Apple", options: ["Banana", "Maçã", "Laranja"], answer: "Maçã" }
        ]
    },
    {
        id: 6,
        title: "Frases Básicas",
        icon: "💬",
        level: "A1",
        xp: 15,
        exercises: [
            { type: "choose", question: "'I am' significa:", options: ["Eu tenho", "Eu sou", "Eu vou"], answer: "Eu sou" },
            { type: "speak", word: "I like", translation: "Eu gosto" },
            { type: "type", word: "I have", hint: "I _ _ _ _" },
            { type: "listen-choose", word: "I am fine", options: ["Eu estou bem", "Eu estou mal", "Eu sou bom"], answer: "Eu estou bem" },
            { type: "choose", question: "Como dizer 'eu quero'?", options: ["I have", "I want", "I am"], answer: "I want" }
        ]
    },
    {
        id: 7,
        title: "Animais",
        icon: "🐾",
        level: "A1",
        xp: 15,
        exercises: [
            { type: "listen-choose", word: "Cat", options: ["Cachorro", "Gato", "Pássaro"], answer: "Gato" },
            { type: "choose", question: "Dog = ?", options: ["Gato", "Cachorro", "Peixe"], answer: "Cachorro" },
            { type: "speak", word: "Bird", translation: "Pássaro" },
            { type: "type", word: "Fish", hint: "F _ _ h" },
            { type: "listen-choose", word: "Horse", options: ["Cavalo", "Vaca", "Porco"], answer: "Cavalo" }
        ]
    },
    {
        id: 8,
        title: "Casa",
        icon: "🏠",
        level: "A1",
        xp: 20,
        exercises: [
            { type: "choose", question: "House = ?", options: ["Casa", "Carro", "Escola"], answer: "Casa" },
            { type: "listen-choose", word: "Door", options: ["Janela", "Porta", "Parede"], answer: "Porta" },
            { type: "speak", word: "Window", translation: "Janela" },
            { type: "type", word: "Table", hint: "T _ _ _ _" },
            { type: "listen-choose", word: "Bed", options: ["Cama", "Mesa", "Cadeira"], answer: "Cama" }
        ]
    }
];

const PRACTICE_TOPICS = [
    { id: 1, name: "Apresentações", icon: "👋", prompt: "Practice introducing yourself. Say your name, age, and where you are from." },
    { id: 2, name: "Compras", icon: "🛒", prompt: "Practice shopping. Ask for prices and sizes." },
    { id: 3, name: "Restaurante", icon: "🍽️", prompt: "Practice ordering food at a restaurant." },
    { id: 4, name: "Família", icon: "👨‍👩‍👧", prompt: "Practice talking about your family." },
    { id: 5, name: "Clima", icon: "🌤️", prompt: "Practice talking about the weather." }
];

// Sistema de XP e níveis
const LEVELS = [
    { level: "A1", xpRequired: 0, name: "Iniciante" },
    { level: "A2", xpRequired: 100, name: "Básico" },
    { level: "B1", xpRequired: 300, name: "Intermediário" },
    { level: "B2", xpRequired: 600, name: "Intermediário Superior" },
    { level: "C1", xpRequired: 1000, name: "Avançado" },
    { level: "C2", xpRequired: 1500, name: "Fluente" }
];
