import './AppShell.css';

export function AppShell({ children }) {
  return (
    <div className="app-shell">
      <main className="app-shell__main">{children}</main>
    </div>
  );
}
