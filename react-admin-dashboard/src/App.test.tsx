import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// Basic smoke test to ensure App component renders without crashing
test('renders App component without crashing', () => {
  // This test will verify that the App component can be rendered
  // The routing and authentication logic will be tested in integration tests
  const { container } = render(<App />);
  expect(container).toBeInTheDocument();
});
