/* ============================================
   EnglishAI - Sistema de Progresso
   ============================================ */

// Conquistas disponíveis
const ACHIEVEMENTS = [
    { id: 'first_chat', name: 'Primeira Conversa', icon: '💬', description: 'Complete sua primeira conversa com a IA', condition: (user) => user.totalConversations >= 1 },
    { id: 'five_chats', name: 'Conversador', icon: '🗣️', description: 'Complete 5 conversas', condition: (user) => user.totalConversations >= 5 },
    { id: 'ten_chats', name: 'Sociável', icon: '🤝', description: 'Complete 10 conversas', condition: (user) => user.totalConversations >= 10 },
    { id: 'streak_3', name: 'Dedicado', icon: '🔥', description: 'Mantenha sequência de 3 dias', condition: (user) => user.streak >= 3 },
    { id: 'streak_7', name: 'Comprometido', icon: '💪', description: 'Mantenha sequência de 7 dias', condition: (user) => user.streak >= 7 },
    { id: 'streak_30', name: 'Disciplinado', icon: '🏆', description: 'Mantenha sequência de 30 dias', condition: (user) => user.streak >= 30 },
    { id: 'xp_100', name: 'Primeiro Nível', icon: '⭐', description: 'Ganhe 100 XP', condition: (user) => user.xp >= 100 },
    { id: 'xp_500', name: 'Estudante', icon: '📚', description: 'Ganhe 500 XP', condition: (user) => user.xp >= 500 },
    { id: 'xp_1000', name: 'Dedicado', icon: '🎯', description: 'Ganhe 1000 XP', condition: (user) => user.xp >= 1000 },
    { id: 'level_a2', name: 'Progresso', icon: '📈', description: 'Alcance o nível A2', condition: (user) => ['A2', 'B1', 'B2', 'C1', 'C2'].includes(user.level) },
    { id: 'level_b1', name: 'Intermediário', icon: '🌟', description: 'Alcance o nível B1', condition: (user) => ['B1', 'B2', 'C1', 'C2'].includes(user.level) },
    { id: 'level_b2', name: 'Avançado', icon: '🚀', description: 'Alcance o nível B2', condition: (user) => ['B2', 'C1', 'C2'].includes(user.level) },
    { id: 'level_c1', name: 'Expert', icon: '🎓', description: 'Alcance o nível C1', condition: (user) => ['C1', 'C2'].includes(user.level) },
    { id: 'level_c2', name: 'Mestre', icon: '👑', description: 'Alcance o nível C2 (fluência)', condition: (user) => user.level === 'C2' },
    { id: 'night_owl', name: 'Coruja', icon: '🦉', description: 'Estude depois das 22h', condition: (user) => new Date().getHours() >= 22 },
    { id: 'early_bird', name: 'Madrugador', icon: '🐦', description: 'Estude antes das 7h', condition: (user) => new Date().getHours() < 7 }
];

// Verificar conquistas desbloqueadas
function checkAchievements(user) {
    if (!user) return [];

    const newAchievements = [];

    ACHIEVEMENTS.forEach(achievement => {
        if (!user.achievements.includes(achievement.id) && achievement.condition(user)) {
            user.achievements.push(achievement.id);
            newAchievements.push(achievement);
        }
    });

    if (newAchievements.length > 0) {
        saveUser(user);
    }

    return newAchievements;
}

// Renderizar dashboard de progresso (para progress.html)
function renderProgress() {
    const user = getCurrentUser();
    if (!user) return;

    // Atualizar estatísticas
    document.getElementById('stat-level').textContent = user.level;
    document.getElementById('stat-xp').textContent = user.xp;
    document.getElementById('stat-streak').textContent = user.streak;
    document.getElementById('stat-conversations').textContent = user.totalConversations;

    // Renderizar gráfico semanal
    renderWeeklyChart(user.weeklyActivity);

    // Renderizar progresso por nível
    renderLevelProgressList(user);

    // Renderizar conquistas
    renderAchievements(user);
}

// Renderizar gráfico de atividade semanal
function renderWeeklyChart(activity) {
    const container = document.getElementById('weekly-chart');
    if (!container) return;

    const maxActivity = Math.max(...activity, 1);

    container.innerHTML = activity.map((count, index) => {
        const height = (count / maxActivity) * 100;
        const isToday = index === (new Date().getDay() + 6) % 7;
        return `
            <div class="flex flex-col items-center flex-1">
                <span class="text-xs text-gray-500 mb-1">${count}</span>
                <div class="w-full max-w-[40px] rounded-t-lg transition-all duration-500 ${isToday ? 'bg-blue-500' : 'bg-blue-200'}" 
                     style="height: ${Math.max(height, 4)}%"></div>
            </div>
        `;
    }).join('');
}

// Renderizar lista de progresso por nível
function renderLevelProgressList(user) {
    const container = document.getElementById('level-progress-list');
    if (!container) return;

    container.innerHTML = Object.entries(LEVELS).map(([level, data]) => {
        const progress = user.levelProgress[level] || 0;
        const isCurrent = level === user.level;

        return `
            <div class="flex items-center space-x-4">
                <span class="text-2xl">${data.icon}</span>
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-medium text-gray-700">${level} - ${data.name}</span>
                        <span class="text-sm text-gray-500">${progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill bg-${data.color}-500" style="width: ${progress}%"></div>
                    </div>
                </div>
                ${isCurrent ? '<span class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Atual</span>' : ''}
            </div>
        `;
    }).join('');
}

// Renderizar conquistas
function renderAchievements(user) {
    const container = document.getElementById('achievements');
    if (!container) return;

    container.innerHTML = ACHIEVEMENTS.map(achievement => {
        const unlocked = user.achievements.includes(achievement.id);
        return `
            <div class="achievement ${unlocked ? 'unlocked' : ''}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;
    }).join('');
}

// Adicionar XP e verificar conquistas
function earnXP(amount) {
    const user = getCurrentUser();
    if (!user) return;

    addXP(user, amount);
    recordStudyActivity(user);

    // Verificar novas conquistas
    const newAchievements = checkAchievements(user);

    // Mostrar notificação de conquista
    if (newAchievements.length > 0) {
        newAchievements.forEach(achievement => {
            showToast(`🏆 Conquista desbloqueada: ${achievement.name}!`);
        });
    }

    return { xpEarned: amount, newAchievements };
}
