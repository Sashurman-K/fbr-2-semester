import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Находим элемент и подсказываем TypeScript, что он точно существует
// с помощью оператора '!' или проверки на null.
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}