import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  getAuth: vi.fn(),
}));

describe('Login Component', () => {
  it('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Log in to CollabMaxx/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
  });
});
