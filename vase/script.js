// The Vase - Cold War Experiment
// Real-time voting system with WebSocket connection

// Initialize Socket.IO connection
let socket;
let isConnected = false;
let currentState = 'default'; // 'default', 'red', 'blue'
let isLocked = false;
let switchingTimer = null;

// DOM Elements
const redButton = document.getElementById('redButton');
const blueButton = document.getElementById('blueButton');
const statusIndicator = document.getElementById('statusIndicator');
const countdownDisplay = document.getElementById('countdownDisplay');
const connectionStatus = document.getElementById('connectionStatus');
const toggleSection = document.getElementById('toggleSection');
const switchContainer = document.getElementById('switchContainer');
const timerContainer = document.getElementById('timerContainer');
const timerDisplay = document.getElementById('timerDisplay');
const missionEnd = document.getElementById('missionEnd');
const endMessage = document.getElementById('endMessage');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeSocket();
    setupEventListeners();
    startCountdown();
    checkLockStatus();
});

// Initialize Socket.IO connection
function initializeSocket() {
    // Check if Socket.IO is available
    if (typeof io === 'undefined') {
        console.log('Socket.IO not available, running in offline mode');
        isConnected = false;
        updateConnectionStatus();
        return;
    }

    // For development, you might want to use a local server
    // For production, replace with your actual socket server URL
    socket = io('ws://localhost:3000', {
        transports: ['websocket'],
        upgrade: false
    });

    socket.on('connect', () => {
        isConnected = true;
        updateConnectionStatus();
        console.log('Connected to server');
    });

    socket.on('disconnect', () => {
        isConnected = false;
        updateConnectionStatus();
        console.log('Disconnected from server');
    });

    socket.on('connect_error', (error) => {
        console.log('Connection error:', error);
        isConnected = false;
        updateConnectionStatus();
    });

    socket.on('stateUpdate', (data) => {
        updateUIState(data.state);
    });

    socket.on('switchingStarted', (data) => {
        startSwitchingTimer(data.targetColor, data.duration);
    });

    socket.on('lockStatus', (data) => {
        isLocked = data.locked;
        updateButtonStates();
        if (data.locked && data.winner) {
            showWinnerMessage(data.winner);
        }
    });

    // Fallback for offline mode
    setTimeout(() => {
        if (!isConnected) {
            console.log('Running in offline mode');
            updateConnectionStatus();
        }
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    redButton.addEventListener('click', () => handleButtonClick('red'));
    blueButton.addEventListener('click', () => handleButtonClick('blue'));
}

// Handle button clicks
function handleButtonClick(color) {
    if (isLocked || switchingTimer) {
        return;
    }

    // If clicking the currently active color, do nothing
    if (currentState === color) {
        return;
    }

    // Switch to the clicked color
    const targetColor = color;
    
    if (isConnected) {
        socket.emit('toggleColor', { color: targetColor });
    } else {
        // Offline mode - just update locally
        startSwitchingTimer(targetColor, 15);
    }
}

// Start the switching timer with full-screen overlay
function startSwitchingTimer(targetColor, duration = 15) {
    if (switchingTimer) return;

    // Disable buttons during switching
    updateButtonStates();

    // Show timer container and hide switch container
    switchContainer.style.display = 'none';
    timerContainer.style.display = 'flex';
    
    // Add full-screen switching mode
    toggleSection.classList.add('switching');
    if (targetColor !== 'default') {
        toggleSection.classList.add(`switching-to-${targetColor}`);
    }

    let timeLeft = duration;
    timerDisplay.textContent = timeLeft;

    switchingTimer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            completeSwitching(targetColor);
        }
    }, 1000);
}

// Complete the switching process
function completeSwitching(targetColor) {
    if (switchingTimer) {
        clearInterval(switchingTimer);
        switchingTimer = null;
    }

    // Update the current state
    currentState = targetColor;
    
    // Remove switching classes
    toggleSection.classList.remove('switching', 'switching-to-red', 'switching-to-blue');
    
    // Update UI
    updateUIState(targetColor);
    
    // Show switch container and hide timer
    timerContainer.style.display = 'none';
    switchContainer.style.display = 'flex';

    // Emit state change if connected
    if (isConnected) {
        socket.emit('stateChanged', { state: targetColor });
    }
}

// Update UI state based on current color
function updateUIState(state) {
    currentState = state;
    
    // Update body theme
    document.body.className = '';
    if (state === 'red') {
        document.body.classList.add('red-theme');
    } else if (state === 'blue') {
        document.body.classList.add('blue-theme');
    }

    // Update button states
    redButton.classList.toggle('active', state === 'red');
    blueButton.classList.toggle('active', state === 'blue');

    // Update status indicator
    switch (state) {
        case 'red':
            statusIndicator.textContent = 'RED TEAM';
            statusIndicator.style.color = 'var(--red-primary)';
            break;
        case 'blue':
            statusIndicator.textContent = 'BLUE TEAM';
            statusIndicator.style.color = 'var(--switch-blue)';
            break;
        default:
            statusIndicator.textContent = 'NONE';
            statusIndicator.style.color = 'var(--accent-color)';
    }

    updateButtonStates();
}

// Update button enabled/disabled states
function updateButtonStates() {
    const shouldDisable = isLocked || switchingTimer !== null;
    redButton.disabled = shouldDisable;
    blueButton.disabled = shouldDisable;
}

// Update connection status indicator
function updateConnectionStatus() {
    if (isConnected) {
        connectionStatus.textContent = 'ONLINE';
        connectionStatus.classList.remove('disconnected');
        connectionStatus.classList.add('connected');
    } else {
        connectionStatus.textContent = 'OFFLINE';
        connectionStatus.classList.remove('connected');
        connectionStatus.classList.add('disconnected');
    }
}

// Start countdown to 4pm
function startCountdown() {
    function updateCountdown() {
        const now = new Date();
        const today4pm = new Date();
        today4pm.setHours(16, 0, 0, 0); // 4:00 PM

        // If it's past 4pm today, set for tomorrow
        if (now > today4pm) {
            today4pm.setDate(today4pm.getDate() + 1);
        }

        const timeDiff = today4pm - now;
        
        if (timeDiff <= 0) {
            // It's 4pm or past - lock the system
            lockSystem();
            return;
        }

        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        countdownDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Check if system should be locked (past 4pm)
function checkLockStatus() {
    const now = new Date();
    const today4pm = new Date();
    today4pm.setHours(16, 0, 0, 0);

    if (now >= today4pm) {
        lockSystem();
    }
}

// Lock the system at 4pm
function lockSystem() {
    isLocked = true;
    updateButtonStates();
    
    // Determine winner and show message
    const winner = currentState === 'default' ? null : currentState;
    showWinnerMessage(winner);

    // Emit lock status if connected
    if (isConnected) {
        socket.emit('systemLocked', { winner });
    }
}

// Show winner message
function showWinnerMessage(winner) {
    let message = '';
    
    if (winner === 'red') {
        message = "Where's the BEEF";
    } else if (winner === 'blue') {
        message = "Give 'em the BIRD";
    } else {
        message = "NO WINNER";
    }

    endMessage.textContent = message;
    missionEnd.style.display = 'block';
    
    // Hide other sections
    toggleSection.style.display = 'none';
    document.querySelector('.status-section').style.display = 'none';
    document.querySelector('.mission-brief').style.display = 'none';
}

// Error handling for socket connection
function handleSocketError() {
    console.log('Socket connection failed, running in offline mode');
    isConnected = false;
    updateConnectionStatus();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (switchingTimer) {
        clearInterval(switchingTimer);
    }
    if (socket) {
        socket.disconnect();
    }
});
