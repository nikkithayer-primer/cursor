// Simple Socket.IO server for The Vase experiment
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Game state
let gameState = {
    currentColor: 'default', // 'default', 'red', 'blue'
    isLocked: false,
    winner: null,
    lastUpdate: Date.now()
};

// Check if system should be locked (past 6pm)
function checkLockStatus() {
    const now = new Date();
    const today6pm = new Date();
    today6pm.setHours(18, 0, 0, 0);
    
    if (now >= today6pm && !gameState.isLocked) {
        gameState.isLocked = true;
        gameState.winner = gameState.currentColor === 'default' ? null : gameState.currentColor;
        
        // Broadcast lock status to all clients
        io.emit('lockStatus', {
            locked: true,
            winner: gameState.winner
        });
        
        console.log(`System locked at 6pm. Winner: ${gameState.winner || 'None'}`);
    }
}

// Check lock status every minute
setInterval(checkLockStatus, 60000);
checkLockStatus(); // Check immediately on startup

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Send current state to new connection
    socket.emit('stateUpdate', { state: gameState.currentColor });
    socket.emit('lockStatus', { 
        locked: gameState.isLocked, 
        winner: gameState.winner 
    });

    // Handle color toggle requests
    socket.on('toggleColor', (data) => {
        if (gameState.isLocked) {
            socket.emit('error', { message: 'System is locked' });
            return;
        }

        console.log(`Color toggle requested: ${data.color} by ${socket.id}`);
        
        // Broadcast switching started to all clients
        io.emit('switchingStarted', {
            targetColor: data.color,
            duration: 15
        });

        // After 15 seconds, update the state
        setTimeout(() => {
            gameState.currentColor = data.color;
            gameState.lastUpdate = Date.now();
            
            // Broadcast new state to all clients
            io.emit('stateUpdate', { state: gameState.currentColor });
            
            console.log(`State changed to: ${gameState.currentColor}`);
        }, 15000);
    });

    // Handle state change confirmations
    socket.on('stateChanged', (data) => {
        // This is just for logging/confirmation
        console.log(`State change confirmed by ${socket.id}: ${data.state}`);
    });

    // Handle system lock (manual trigger if needed)
    socket.on('systemLocked', (data) => {
        console.log(`System lock reported by ${socket.id}, winner: ${data.winner}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Basic route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to get current state
app.get('/api/state', (req, res) => {
    res.json(gameState);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`The Vase server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the experiment`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
