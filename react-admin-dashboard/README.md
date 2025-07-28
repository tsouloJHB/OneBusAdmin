# React Admin Dashboard

A comprehensive React-based admin dashboard for managing bus transportation systems.

## Features

- **Route Management**: Add, edit, and delete bus routes
- **Bus Fleet Management**: Manage bus information and assignments
- **Active Bus Monitoring**: Real-time monitoring of active buses
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Authentication**: Secure login system with role-based access

## Tech Stack

- **React 18+** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **React Hook Form** for form management
- **Axios** for API communication
- **Yup** for form validation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your API configuration

### Development

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

### Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Project Structure

```
src/
├── components/          # React components
│   ├── features/       # Feature-specific components
│   ├── layout/         # Layout components
│   ├── pages/          # Page components
│   └── ui/             # Reusable UI components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── services/           # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── config/             # Application configuration
```

## Environment Variables

- `REACT_APP_API_BASE_URL`: Backend API base URL
- `REACT_APP_APP_NAME`: Application name
- `REACT_APP_VERSION`: Application version

## Contributing

1. Follow the existing code structure and patterns
2. Write tests for new features
3. Ensure TypeScript types are properly defined
4. Follow accessibility best practices