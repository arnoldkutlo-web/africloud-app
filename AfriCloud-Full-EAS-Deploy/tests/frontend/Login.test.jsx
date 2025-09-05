
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../../frontend/src/components/Login';

test('renders login and toggles', () => {
  const onAuth = jest.fn();
  render(<Login onAuth={onAuth} />);
  expect(screen.getByText(/AfriCloud/i)).toBeInTheDocument();
  const toggle = screen.getByText(/Toggle/i);
  fireEvent.click(toggle);
  // still present
  expect(screen.getByText(/AfriCloud/i)).toBeInTheDocument();
});
