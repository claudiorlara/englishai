// EnglishAI - Sistema de Voz (Speech API)

class SpeechSystem {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.onResult = null;
        this.onEnd = null;
        this.initRecognition();
    }

    initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.log('Speech Recognition não suportado');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-US';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 3;

        this.recognition.onresult = (event) => {
            const result = event.results[0][0].transcript;
            if (this.onResult) this.onResult(result);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onEnd) this.onEnd();
        };

        this.recognition.onerror = (event) => {
            console.log('Speech error:', event.error);
            this.isListening = false;
            if (this.onEnd) this.onEnd();
        };
    }

    speak(text, callback) {
        if (!this.synthesis) {
            if (callback) callback();
            return;
        }

        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        utterance.onend = () => {
            if (callback) callback();
        };

        this.synthesis.speak(utterance);
    }

    speakSlow(text, callback) {
        if (!this.synthesis) {
            if (callback) callback();
            return;
        }

        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.5;
        utterance.pitch = 1;
        
        utterance.onend = () => {
            if (callback) callback();
        };

        this.synthesis.speak(utterance);
    }

    startListening(callback) {
        if (!this.recognition) {
            alert('Seu navegador não suporta reconhecimento de voz. Tente Chrome.');
            return;
        }

        this.onResult = callback;
        this.isListening = true;
        this.recognition.start();
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    isSupported() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }

    isSpeakingSupported() {
        return !!window.speechSynthesis;
    }
}

const speech = new SpeechSystem();
