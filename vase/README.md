# THE VASE - Cold War Experiment

A real-time voting experiment where users can toggle between red and blue teams to control "the vase" until 4pm deadline.

## Features

- **Real-time voting**: Multiple users can vote simultaneously using WebSocket connections
- **Color themes**: Toggle between default (grey), red, and blue themes
- **15-second timer**: Full-screen animated timer when switching colors
- **4pm lockout**: System locks at 4pm and declares winner
- **Winner messages**: 
  - Red wins: "Where's the BEEF"
  - Blue wins: "Give 'em the BIRD"
  - No winner: "NO WINNER"

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser to `http://localhost:3000`

## Development

For development with auto-restart:
```bash
npm run dev
```

## How It Works

1. **Default State**: Grey theme, no team in control
2. **Voting**: Click RED or BLUE button to vote for that team
3. **Switching**: 15-second full-screen timer with color flashing
4. **Theme Change**: After timer, entire site changes to winning color
5. **Toggle**: Clicking active color returns to default (grey)
6. **Lockout**: At 4pm, voting stops and winner is declared

## Technical Details

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Backend**: Node.js with Express and Socket.IO
- **Real-time**: WebSocket connections for instant updates across all users
- **Fallback**: Works offline with local-only functionality

## File Structure

- `index.html` - Main HTML structure
- `styles.css` - CSS with theme variables and animations
- `script.js` - Client-side JavaScript with socket handling
- `server.js` - Node.js server with Socket.IO
- `package.json` - Dependencies and scripts
