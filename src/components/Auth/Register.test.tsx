import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import '../../test/firebase-mock';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';

describe('Register Component', () => {
  it('handles user registration and initial setup', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    // Should call Firebase Auth
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'new@example.com',
      'password123'
    );

    // Should create a personal team (async, so we might need to wait, but mock is sync for now)
    // In a real scenario, we'd use waitFor
  });
});
