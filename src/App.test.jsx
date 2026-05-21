import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the game shell', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', { name: /monotris/i })
  ).toBeInTheDocument();
  expect(screen.getByText(/score:/i)).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /new game/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /github/i })
  ).toHaveAttribute('href', 'https://github.com/cthulahoops/monotris/');
});
