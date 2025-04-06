# HR Candidate Management

A modern web application for human resources teams to manage job candidates with natural language search capabilities.

## Features

- **Candidate Dashboard**: View, filter, and sort candidate profiles
- **Natural Language Search**: Query candidates using everyday language (e.g., "Show me active candidates from Istanbul with salary above 35000")
- **Intelligent Filtering System**: Filter candidates by status, location, education, salary range, and more
- **Modern UI**: Clean and responsive interface built with React, TypeScript, and Tailwind CSS

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- ShadCN UI components
- GraphQL with GraphQL Request for data fetching
- Context API for state management

### Backend
- Node.js with Express
- OpenAI API integration for natural language processing
- CORS and environment variable management

## Project Structure

```
/
├── backend/                  # Node.js Express backend server
│   ├── server.js             # Express server and API endpoints
│   └── package.json          # Backend dependencies
│
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components organized by feature
│   │   ├── context/          # Context providers for state management
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions and helpers
│   │   ├── services/         # API services and external integrations
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Utility functions
│   │
│   ├── public/               # Static files
│   ├── index.html            # HTML entry point
│   ├── package.json          # Frontend dependencies
│   └── tailwind.config.js    # Tailwind CSS configuration
│
└── README.md                 # Project documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn
- OpenAI API key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with your OpenAI API key:
   ```
   PORT=5000
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the backend server:
   ```bash
   node server.js
   ```
   The server will run on http://localhost:5000

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:5173

## Deployment

### Backend Deployment
The backend can be deployed to platforms like:
- Heroku
- Railway
- Render
- DigitalOcean App Platform

Make sure to set the `OPENAI_API_KEY` environment variable on your hosting platform.

### Frontend Deployment
The frontend can be deployed to static hosting platforms like:
- Vercel
- Netlify
- GitHub Pages

When deploying the frontend, update the API endpoint in `src/services/aiService.ts` to point to your deployed backend URL.

## Development Approach

### Natural Language Processing
The application leverages OpenAI's GPT model to interpret natural language queries and convert them into structured filters. This is done through a proxy API on the backend to secure the API key.

### UI Design Philosophy
The interface follows a clean, minimal design that focuses on usability and efficiency for HR professionals. The command bar (accessible via Ctrl+K) enables quick natural language searches without navigating complex filter interfaces.

### State Management
The application uses React's Context API for state management, with custom hooks for specific functionalities like debouncing input and toast notifications.

## Future Improvements
- Add authentication system
- Implement candidate profile editing
- Add data visualization for candidate metrics
- Integrate with calendar for interview scheduling
- Add export functionality (CSV, PDF)
- Implement unit and integration tests

## License
MIT

---

Created by a Computer Engineering student passionate about Full Stack Web Development.