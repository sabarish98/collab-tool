import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import './setup';

// Mock useNavigate
const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

describe('Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /Sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should show error message on login failure', async () => {
      vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(new Error('Invalid credentials'));

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'wrong@example.com' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('Registration Flow', () => {
    it('should successfully register a new user', async () => {
      render(
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'new@example.com' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
      
      const submitButton = screen.getByRole('button', { name: /Create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'new@example.com', 'password123');
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should show error on registration failure', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce(new Error('Email already in use'));

      render(
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'existing@example.com' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/Email already in use/i)).toBeInTheDocument();
      });
    });
  });
});
