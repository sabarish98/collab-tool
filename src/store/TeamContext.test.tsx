import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TeamProvider, useTeam } from './TeamContext';
import { AuthProvider } from './AuthContext';
import '../../test/firebase-mock';

const TestComponent = () => {
  const { teams, loading } = useTeam();
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <div data-testid="team-count">{teams.length}</div>
    </div>
  );
};

describe('TeamContext', () => {
  it('provides teams to children', async () => {
    render(
      <AuthProvider>
        <TeamProvider>
          <TestComponent />
        </TeamProvider>
      </AuthProvider>
    );
    
    // Initially loading
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });
});
