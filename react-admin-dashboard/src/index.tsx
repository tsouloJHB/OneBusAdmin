import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

console.log('index.tsx: Starting application...');

const rootElement = document.getElementById('root');
console.log('index.tsx: Root element found:', rootElement);

if (!rootElement) {
  console.error('index.tsx: Root element not found!');
} else {
  const root = ReactDOM.createRoot(rootElement as HTMLElement);
  console.log('index.tsx: ReactDOM root created, rendering App...');
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('index.tsx: App rendered successfully');
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
