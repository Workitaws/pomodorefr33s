// Variables globales
let workTime = 25 * 60; // 25 minutos en segundos
let breakTime = 5 * 60; // 5 minutos en segundos
let timeLeft = workTime;
let timerId = null;
let isRunning = false;
let isWorkMode = true;
let pomodoros = 0;
let totalWorkTime = 0; // en minutos
let isDarkMode = false;
let totalTime = workTime;
let progressCircle = document.getElementById('progressCircle');
let circumference = 2 * Math.PI * 90; // radio del círculo

// Elementos DOM
const timerDisplay = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const workModeBtn = document.getElementById('workModeBtn');
const breakModeBtn = document.getElementById('breakModeBtn');
const pomodoroCount = document.getElementById('pomodoroCount');
const totalWorkTimeDisplay = document.getElementById('totalWorkTime');
const workTimeInput = document.getElementById('workTime');
const breakTimeInput = document.getElementById('breakTime');
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Inicializar progress circle
progressCircle.style.strokeDasharray = circumference;
progressCircle.style.strokeDashoffset = circumference;

// Función para actualizar el display del temporizador
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Actualizar progreso del círculo
    const progress = ((totalTime - timeLeft) / totalTime) * circumference;
    progressCircle.style.strokeDashoffset = circumference - progress;
    
    // Cambiar color según modo
    progressCircle.style.stroke = isWorkMode ? '#f44336' : '#4CAF50';
}

// Función para iniciar el temporizador
function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerId);
            playAlarm();
            
            if (isWorkMode) {
                pomodoros++;
                totalWorkTime += parseInt(workTimeInput.value);
                pomodoroCount.textContent = pomodoros;
                totalWorkTimeDisplay.textContent = totalWorkTime;
                
                showNotification('¡Tiempo de trabajo completado!', 'Toma un descanso.', isWorkMode);
                switchMode('break');
            } else {
                showNotification('¡Descanso terminado!', 'Volvamos al trabajo.', isWorkMode);
                switchMode('work');
            }
            
            resetTimer();
            startTimer();
        }
    }, 1000);
}

// Función para pausar el temporizador
function pauseTimer() {
    clearInterval(timerId);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Función para reiniciar el temporizador
function resetTimer() {
    pauseTimer();
    timeLeft = isWorkMode ? workTime : breakTime;
    totalTime = timeLeft;
    updateDisplay();
}

// Función para cambiar entre modos
function switchMode(mode) {
    isWorkMode = mode === 'work';
    
    // Actualizar botones de modo
    workModeBtn.classList.toggle('active', isWorkMode);
    workModeBtn.classList.toggle('break-mode', !isWorkMode);
    breakModeBtn.classList.toggle('active', !isWorkMode);
    breakModeBtn.classList.toggle('break-mode', !isWorkMode);
    
    // Actualizar tiempos
    workTime = parseInt(workTimeInput.value) * 60;
    breakTime = parseInt(breakTimeInput.value) * 60;
    timeLeft = isWorkMode ? workTime : breakTime;
    totalTime = timeLeft;
    updateDisplay();
}

// Función para reproducir sonido de alarma
function playAlarm() {
    // Crear sonido usando el Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
}

// Función para mostrar notificación
function showNotification(title, message, isWork) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
            body: message,
            icon: isWork ? 'https://cdn-icons-png.flaticon.com/512/808/808439.png' : 'https://cdn-icons-png.flaticon.com/512/3079/3079165.png'
        });
    } else {
        // Notificación de respaldo si no hay permisos
        alert(`${title}\n${message}`);
    }
}

// Función para cambiar tema claro/oscuro
function toggleTheme() {
    isDarkMode = !isDarkMode;
    body.classList.toggle('dark-mode', isDarkMode);
    
    // Actualizar icono del botón
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon', !isDarkMode);
    icon.classList.toggle('fa-sun', isDarkMode);
    
    // Guardar preferencia en localStorage
    localStorage.setItem('pomodoroDarkMode', isDarkMode);
}

// Solicitar permisos para notificaciones
function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
}

// Cargar datos guardados
function loadSavedData() {
    // Cargar tema
    const savedTheme = localStorage.getItem('pomodoroDarkMode');
    if (savedTheme === 'true') {
        toggleTheme();
    }
    
    // Cargar contadores
    const savedPomodoros = localStorage.getItem('pomodoroCount');
    const savedWorkTime = localStorage.getItem('totalWorkTime');
    
    if (savedPomodoros) {
        pomodoros = parseInt(savedPomodoros);
        pomodoroCount.textContent = pomodoros;
    }
    
    if (savedWorkTime) {
        totalWorkTime = parseInt(savedWorkTime);
        totalWorkTimeDisplay.textContent = totalWorkTime;
    }
}

// Guardar datos
function saveData() {
    localStorage.setItem('pomodoroCount', pomodoros);
    localStorage.setItem('totalWorkTime', totalWorkTime);
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

workModeBtn.addEventListener('click', () => {
    if (!isRunning) switchMode('work');
});

breakModeBtn.addEventListener('click', () => {
    if (!isRunning) switchMode('break');
});

workTimeInput.addEventListener('change', () => {
    const value = parseInt(workTimeInput.value);
    if (value < 1) workTimeInput.value = 1;
    if (value > 60) workTimeInput.value = 60;
    
    if (isWorkMode && !isRunning) {
        workTime = parseInt(workTimeInput.value) * 60;
        timeLeft = workTime;
        totalTime = timeLeft;
        updateDisplay();
    }
});

breakTimeInput.addEventListener('change', () => {
    const value = parseInt(breakTimeInput.value);
    if (value < 1) breakTimeInput.value = 1;
    if (value > 30) breakTimeInput.value = 30;
    
    if (!isWorkMode && !isRunning) {
        breakTime = parseInt(breakTimeInput.value) * 60;
        timeLeft = breakTime;
        totalTime = timeLeft;
        updateDisplay();
    }
});

themeToggle.addEventListener('click', toggleTheme);

// Inicializar la aplicación
function initApp() {
    updateDisplay();
    requestNotificationPermission();
    loadSavedData();
    
    // Guardar datos cuando se cierre la página
    window.addEventListener('beforeunload', saveData);
    
    // También guardar cada minuto por si acaso
    setInterval(saveData, 60000);
}

// Iniciar la aplicación cuando se cargue la página
window.addEventListener('DOMContentLoaded', initApp);