# GitLog

A powerful GitHub repository analysis tool that provides insights and visualizations for your repositories.

## Features

- 🔐 GitHub OAuth authentication
- 📊 Repository analysis and statistics
- 📈 Commit history visualization
- 🌿 Branch analysis
- 👥 Contributor insights
- 🎨 Modern, responsive UI

## Project Structure

```
gitlog/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # Styled-components and themes
│   │   ├── context/       # React context providers
│   │   ├── App.jsx        # Main app component
│   │   └── index.js       # Entry point
│   ├── .env               # Client environment variables
│   ├── .gitignore
│   └── package.json
│
├── server/                # Express.js backend
│   ├── controllers/       # Route controllers
│   ├── routes/           # API routes
│   ├── config/           # Configuration files
│   ├── middleware/       # Custom middleware
│   ├── .env              # Server environment variables
│   ├── .gitignore
│   ├── server.js         # Main server file
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- GitHub OAuth App

### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App with:
   - Application name: GitLog
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/callback`
3. Copy the Client ID and Client Secret

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gitlog
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Configure environment variables:

**Server (.env):**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
SESSION_SECRET=your-session-secret-key-here
JWT_SECRET=your-jwt-secret-key-here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:3000/callback
```

**Client (.env):**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id_here
```

### Running the Application

1. Start the server:
```bash
cd server
npm run dev
```

2. Start the client (in a new terminal):
```bash
cd client
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `GET /api/auth/github` - Initiate GitHub OAuth
- `POST /api/auth/callback` - Handle OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Health Check
- `GET /api/health` - Server health status

## Technologies Used

### Frontend
- React 18
- React Router DOM
- Styled Components
- Context API

### Backend
- Node.js
- Express.js
- Axios
- JWT
- Express Session
- CORS

## Development

### Available Scripts

**Client:**
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests

**Server:**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.