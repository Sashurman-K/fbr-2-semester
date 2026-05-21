import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';

// Компонент загружается только тогда, когда пользователь переходит на маршрут "/about"
const About = lazy(() => import('./pages/About'));

function App() {
  return (
    <Router>
      <div>
        <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
          <Link to="/" style={{ marginRight: '15px' }}>Главная</Link>
          <Link to="/about">О нас</Link>
        </nav>

        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/about"
              element={
                <Suspense fallback={<div>Загрузка страницы «О нас»...</div>}>
                  <About />
                </Suspense>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;