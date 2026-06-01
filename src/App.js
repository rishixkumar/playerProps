import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { TopNav } from './components/TopNav';
import { HomePage } from './pages/HomePage';
import { NewsPage } from './pages/NewsPage';
import { PlayerPage } from './pages/PlayerPage';
import { PropsPage } from './pages/props/PropsPage';

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <TopNav />
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/player/:id" element={<PlayerPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/props" element={<PropsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
