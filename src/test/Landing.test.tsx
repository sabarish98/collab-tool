import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../components/Landing/LandingPage';
import './setup';

describe('Landing Page', () => {
  it('renders branding and main CTA', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Check for logo and name
    expect(screen.getAllByText(/CollabMaxx/i)[0]).toBeInTheDocument();
    
    // Check for Hero title
    expect(screen.getByText(/Your team's work/i)).toBeInTheDocument();
    
    // Check for primary CTA
    expect(screen.getByText(/Start for free/i)).toBeInTheDocument();
  });

  it('renders features section', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Everything your team needs/i)).toBeInTheDocument();
    expect(screen.getByText(/Visual Kanban Boards/i)).toBeInTheDocument();
    expect(screen.getByText(/Real-Time Team Collaboration/i)).toBeInTheDocument();
  });

  it('renders testimonials', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Loved by teams everywhere/i)).toBeInTheDocument();
    expect(screen.getByText(/Priya Mehra/i)).toBeInTheDocument();
  });

  it('has working navigation links', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    const loginLinks = screen.getAllByRole('link', { name: /Log in/i });
    expect(loginLinks.length).toBeGreaterThan(0);
    expect(loginLinks[0]).toHaveAttribute('href', '/login');
  });
});
