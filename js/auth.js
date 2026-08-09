/* ============================================
   EnglishAI - Sistema de Autenticação
   ============================================ */

const DEFAULT_USER = {
    name: '',
    email: '',
    apiKey: '',
    level: 'A1',
    xp: 0,
    streak: 0,
    lastStudyDate: null,
    totalConversations: 0,
    weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
    levelProgress: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 },
    achievements: [],
    createdAt: null
};

function checkAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    updateStreak(user);
    return user;
}

function getCurrentUser() {
    const userData = localStorage.getItem('englishai_user');
    return userData ? JSON.parse(userData) : null;
}

function saveUser(user) {
    localStorage.setItem('englishai_user', JSON.stringify(user));
}

function register() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const apiKey = document.getElementById('reg-apikey').value.trim();

    if (!name) {
        showToast('Por favor, digite seu nome');
        return;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
        showToast('Por favor, digite um email válido');
        return;
    }
    if (!apiKey || apiKey.length < 10) {
        showToast('Chave de API inválida');
        return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('englishai_users') || '[]');
    if (existingUsers.find(u => u.email === email)) {
        showToast('Este email já está cadastrado');
        return;
    }

    const newUser = {
        ...DEFAULT_USER,
        name,
        email,
        apiKey,
        createdAt: new Date().toISOString()
    };

    existingUsers.push(newUser);
    localStorage.setItem('englishai_users', JSON.stringify(existingUsers));
    localStorage.setItem('englishai_user', JSON.stringify(newUser));

    showToast('Conta criada com sucesso!');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function login() {
    const email = document.getElementById('login-email').value.trim();

    if (!email) {
        showToast('Por favor, digite seu email');
        return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('englishai_users') || '[]');
    const user = existingUsers.find(u => u.email === email);

    if (!user) {
        showToast('Usuário não encontrado');
        return;
    }

    localStorage.setItem('englishai_user', JSON.stringify(user));
    showToast('Login realizado!');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

function logout() {
    const user = getCurrentUser();
    if (user) {
        saveUser(user);
    }
    localStorage.removeItem('englishai_user');
    window.location.href = 'index.html';
}

function showLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function openSettings() {
    const user = getCurrentUser();
    if (user) {
        document.getElementById('settings-apikey').value = user.apiKey || '';
    }
    document.getElementById('settings-modal').style.display = 'flex';
}

function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
}

function saveSettings() {
    const apiKey = document.getElementById('settings-apikey').value.trim();
    const user = getCurrentUser();

    if (user) {
        user.apiKey = apiKey;
        saveUser(user);

        const existingUsers = JSON.parse(localStorage.getItem('englishai_users') || '[]');
        const idx = existingUsers.findIndex(u => u.email === user.email);
        if (idx !== -1) {
            existingUsers[idx].apiKey = apiKey;
            localStorage.setItem('englishai_users', JSON.stringify(existingUsers));
        }
    }

    closeSettings();
    showToast('Configurações salvas!');
}

function updateStreak(user) {
    if (!user) return;

    const today = new Date().toDateString();
    const lastStudy = user.lastStudyDate;

    if (!lastStudy) {
        user.streak = 1;
        user.lastStudyDate = today;
        saveUser(user);
        return;
    }

    const lastDate = new Date(lastStudy);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return;
    } else if (diffDays === 1) {
        user.streak += 1;
        user.lastStudyDate = today;
    } else if (diffDays > 1) {
        user.streak = 1;
        user.lastStudyDate = today;
    }

    saveUser(user);
}

function recordStudyActivity(user) {
    if (!user) return;

    const today = new Date();
    const dayOfWeek = (today.getDay() + 6) % 7;

    user.weeklyActivity[dayOfWeek] += 1;
    user.lastStudyDate = today.toDateString();

    updateStreak(user);
    saveUser(user);
}

function addXP(user, amount) {
    if (!user) return;

    user.xp += amount;

    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const xpThresholds = [0, 100, 300, 600, 1000, 1500];
    const currentLevelIdx = levels.indexOf(user.level);

    if (currentLevelIdx < levels.length - 1) {
        const nextLevelXP = xpThresholds[currentLevelIdx + 1];
        if (user.xp >= nextLevelXP) {
            user.level = levels[currentLevelIdx + 1];
            showToast(`Parabéns! Você subiu para o nível ${user.level}! 🎉`);
        }
    }

    saveUser(user);
}

function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function hasAPIKey() {
    const user = getCurrentUser();
    return user && user.apiKey && user.apiKey.length > 0;
}

// Inicializar na página index.html
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const isIndex = path.endsWith('index.html') || path.endsWith('/') || path === '' || path.endsWith('englishai/');
    
    if (isIndex) {
        const user = getCurrentUser();
        
        if (user) {
            document.getElementById('auth-screen').style.display = 'none';
            document.getElementById('home-screen').style.display = 'block';
            document.getElementById('apikey-section').style.display = 'block';
            
            document.getElementById('user-greeting').textContent = user.name;
            document.getElementById('welcome-name').textContent = user.name;
            document.getElementById('current-level').textContent = user.level;
            document.getElementById('total-xp').textContent = user.xp;
            document.getElementById('streak').textContent = user.streak + ' dias';
            
            const tips = [
                'Pratique por pelo menos 15 minutos todos os dias!',
                'Tente pensar em inglês durante o dia.',
                'Assista filmes em inglês com legendas em inglês.',
                'Leia textos simples em inglês.',
                'Não tenha medo de errar!',
                'Pratique a pronúncia ouvindo e repetindo.',
                'Aprenda expressões idiomáticas.'
            ];
            const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            document.getElementById('daily-tip').textContent = tips[dayOfYear % tips.length];
        } else {
            document.getElementById('auth-screen').style.display = 'flex';
            document.getElementById('home-screen').style.display = 'none';
        }
    }
});
