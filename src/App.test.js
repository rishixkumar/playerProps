import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app shell and home intro', () => {
  render(<App />);
  expect(screen.getByText(/Playerprops/i)).toBeInTheDocument();
  expect(screen.getByText(/NFL player stats/i)).toBeInTheDocument();
});
