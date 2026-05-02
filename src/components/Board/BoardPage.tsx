import React from 'react';
import { useParams } from 'react-router-dom';
import { BoardProvider, useBoard } from '../../store/BoardContext';
import { useTeam } from '../../store/TeamContext';
import Board from './Board';
import Header from '../Layout/Header';

const BoardPageInner: React.FC = () => {
  const { board } = useBoard();
  const { currentTeam } = useTeam();

  return (
    <>
      <Header teamName={currentTeam?.name} boardName={board?.title} />
      <Board />
    </>
  );
};

const BoardPage: React.FC = () => {
  const { boardId, teamId } = useParams<{ teamId: string; boardId: string }>();
  const { teams, selectTeam, currentTeam } = useTeam();

  // Ensure team is selected from URL
  React.useEffect(() => {
    if (teamId && (!currentTeam || currentTeam.id !== teamId)) {
      const found = teams.find(t => t.id === teamId);
      if (found) selectTeam(found);
    }
  }, [teamId, teams, currentTeam, selectTeam]);

  if (!boardId) {
    return <div style={{ padding: '2rem', color: 'white' }}>No board specified.</div>;
  }

  return (
    <BoardProvider boardId={boardId}>
      <BoardPageInner />
    </BoardProvider>
  );
};

export default BoardPage;
