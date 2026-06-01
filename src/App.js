import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { TopNav } from './components/TopNav';
import { PlayerPage } from './pages/PlayerPage';

function HomePage() {
  return (
    <div className="player-page__panel" style={{ maxWidth: 560, margin: '48px auto' }}>
      <h1
        className="player-page__panel-title"
        style={{ fontSize: 18, textTransform: 'none', letterSpacing: '-0.02em' }}
      >
        NFL player stats
      </h1>
      <p style={{ margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
        Search for a player in the header or open the demo profile to explore the layout.
      </p>
      <p style={{ marginTop: 16, marginBottom: 0 }}>
        <Link to="/player/demo-qb">View demo player →</Link>
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TopNav />
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/player/:id" element={<PlayerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
