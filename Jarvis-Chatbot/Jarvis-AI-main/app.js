const btn = document.querySelector('.talk');
const content = document.querySelector('.content');

// تحميل الأصوات المتاحة
function loadVoices() {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        console.log('Available voices loaded:', voices.length);
        voices.forEach(voice => {
            console.log(`Voice: ${voice.name}, Lang: ${voice.lang}, Gender: ${voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') ? 'Female' : 'Unknown'}`);
        });
    } else {
        console.log('No voices available yet, retrying...');
        setTimeout(loadVoices, 100);
    }
}

// تحميل الأصوات عند تحميل الصفحة
window.addEventListener('load', loadVoices);
window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

// متغيرات للتحكم في الصوت
let currentUtterance = null;
let isSpeaking = false;
const stopPhrases = ['stop', 'توقف', 'توقفي', 'اسكت', 'اسكتي', 'كفى', 'خلاص', 'silence', 'quiet', 'shut up'];

function speak(text) {
    // إيقاف أي كلام سابق
    stopSpeaking();

    const text_speak = new SpeechSynthesisUtterance(text);

    // تحسينات جودة الصوت
    text_speak.rate = 0.85; // سرعة أبطأ قليلاً للوضوح
    text_speak.volume = 0.9; // صوت أعلى قليلاً
    text_speak.pitch = 1.15; // نبرة أنثوية محسنة

    // البحث عن صوت أنثى
    const voices = window.speechSynthesis.getVoices();
    let femaleVoice = null;

    // البحث عن صوت أنثى إنجليزي
    femaleVoice = voices.find(voice =>
        voice.lang.includes('en') &&
        (voice.name.toLowerCase().includes('female') ||
         voice.name.toLowerCase().includes('woman') ||
         voice.name.toLowerCase().includes('zira') ||
         voice.name.toLowerCase().includes('hazel') ||
         voice.name.toLowerCase().includes('susan') ||
         voice.name.toLowerCase().includes('samantha') ||
         voice.name.toLowerCase().includes('karen') ||
         voice.name.toLowerCase().includes('moira') ||
         voice.name.toLowerCase().includes('tessa') ||
         voice.name.toLowerCase().includes('veena') ||
         voice.name.toLowerCase().includes('fiona'))
    );

    // إذا لم نجد صوت أنثى، نبحث عن أي صوت إنجليزي
    if (!femaleVoice) {
        femaleVoice = voices.find(voice => voice.lang.includes('en'));
    }

    // تطبيق الصوت المختار
    if (femaleVoice) {
        text_speak.voice = femaleVoice;
        console.log('Using female voice:', femaleVoice.name);
    } else {
        console.log('No female voice found, using default voice');
    }

    // إضافة معالجات الأحداث
    text_speak.onstart = () => {
        isSpeaking = true;
        currentUtterance = text_speak;
        console.log('Jarvis started speaking');
    };

    text_speak.onend = () => {
        isSpeaking = false;
        currentUtterance = null;
        console.log('Jarvis finished speaking');
    };

    text_speak.onerror = (error) => {
        isSpeaking = false;
        currentUtterance = null;
        console.error('Speech synthesis error:', error);
    };

    window.speechSynthesis.speak(text_speak);
}

// دالة لإيقاف الكلام
function stopSpeaking() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        currentUtterance = null;
        console.log('Speech stopped');
    }
}

// دالة للتحقق من أوامر الإيقاف
function isStopCommand(text) {
    return stopPhrases.some(phrase => text.toLowerCase().includes(phrase.toLowerCase()));
}

function wishMe() {
    var day = new Date();
    var hour = day.getHours();

    if (hour >= 0 && hour < 12) {
        speak("Good Morning Boss...");
    } else if (hour >= 12 && hour < 17) {
        speak("Good Afternoon Master...");
    } else {
        speak("Good Evening Sir...");
    }
}

window.addEventListener('load', () => {
    speak("Initializing JARVIS...");
    wishMe();
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
    const currentIndex = event.resultIndex;
    const transcript = event.results[currentIndex][0].transcript;
    content.textContent = transcript;
    takeCommand(transcript.toLowerCase());
};

btn.addEventListener('click', () => {
    content.textContent = "Listening...";
    recognition.start();
});

function takeCommand(message) {
    // التحقق من أوامر الإيقاف أولاً
    if (isStopCommand(message)) {
        console.log('Stop command detected:', message);
        stopSpeaking();
        speak("Stopped");
        return;
    }

    if (message.includes('hey') || message.includes('hello')) {
        speak("Hello Sir, How May I Help You?");
    } else if (message.includes("open google")) {
        window.open("https://google.com", "_blank");
        speak("Opening Google...");
    } else if (message.includes("open youtube")) {
        window.open("https://youtube.com", "_blank");
        speak("Opening Youtube...");
    } else if (message.includes("open facebook")) {
        window.open("https://facebook.com", "_blank");
        speak("Opening Facebook...");
    } else if (message.includes('what is') || message.includes('who is') || message.includes('what are')) {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        const finalText = "This is what I found on the internet regarding " + message;
        speak(finalText);
    } else if (message.includes('wikipedia')) {
        window.open(`https://en.wikipedia.org/wiki/${message.replace("wikipedia", "").trim()}`, "_blank");
        const finalText = "This is what I found on Wikipedia regarding " + message;
        speak(finalText);
    } else if (message.includes('time')) {
        const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
        const finalText = "The current time is " + time;
        speak(finalText);
    } else if (message.includes('date')) {
        const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric" });
        const finalText = "Today's date is " + date;
        speak(finalText);
    } else if (message.includes('calculator')) {
        window.open('Calculator:///');
        const finalText = "Opening Calculator";
        speak(finalText);
    } else {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        const finalText = "I found some information for " + message + " on Google";
        speak(finalText);
    }
}