import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import '../../test/setup';

describe('Register Component', () => {
  it('handles user registration and initial setup', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    const form = screen.getByTestId('register-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
    });
  });
});
