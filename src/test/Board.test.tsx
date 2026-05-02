import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Board from '../components/Board/Board';
import { BoardProvider } from '../store/BoardContext';
import { AuthProvider } from '../store/AuthContext';
import { addDoc, onSnapshot } from 'firebase/firestore';
import './setup';

// Mock board data
const mockBoard = { id: 'board-1', title: 'Test Board' };
const mockLists = [{ id: 'list-1', title: 'To Do', order: 0, boardId: 'board-1' }];
const mockCards = [{ id: 'card-1', title: 'Task 1', listId: 'list-1', status: 'open', priority: 'medium', createdAt: Date.now() }];

describe('Board Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup onSnapshot to return our mock data
    // This is a bit tricky because onSnapshot is called multiple times (board, lists, cards)
    vi.mocked(onSnapshot).mockImplementation((queryOrRef, callback) => {
      // Very crude way to differentiate based on the query/ref
      // In a real app we might use a more robust mock
      const cb = callback as any;
      if (queryOrRef.path?.includes('boards')) {
        cb({ exists: () => true, id: 'board-1', data: () => mockBoard });
      } else {
        // Assume lists or cards
        cb({ docs: [] }); // Start empty
      }
      return vi.fn();
    });
  });

  const renderBoard = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <BoardProvider boardId="board-1">
            <Board />
          </BoardProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('renders the board title and lists', async () => {
    // Override onSnapshot for this test to provide data
    vi.mocked(onSnapshot).mockImplementation((queryOrRef, callback) => {
      const cb = callback as any;
      if (queryOrRef.path?.includes('boards')) {
        cb({ exists: () => true, id: 'board-1', data: () => ({ title: 'Test Board' }) });
      } else if (queryOrRef._query?.path?.segments?.includes('lists')) {
        cb({ docs: [{ id: 'list-1', data: () => ({ title: 'To Do', order: 0, boardId: 'board-1' }) }] });
      } else {
        cb({ docs: [] });
      }
      return vi.fn();
    });

    renderBoard();

    await waitFor(() => {
      expect(screen.getByText('Test Board')).toBeInTheDocument();
      expect(screen.getByText('To Do')).toBeInTheDocument();
    });
  });

  it('allows adding a new list', async () => {
    renderBoard();

    await waitFor(() => expect(screen.getByText('Add another list')).toBeInTheDocument());
    
    fireEvent.click(screen.getByText('Add another list'));
    
    const input = screen.getByPlaceholderText(/Enter list title.../i);
    fireEvent.change(input, { target: { value: 'In Progress' } });
    
    fireEvent.click(screen.getByText('Add list'));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        title: 'In Progress',
        boardId: 'board-1'
      }));
    });
  });

  it('shows "No board found" if board does not exist', async () => {
    vi.mocked(onSnapshot).mockImplementation((_ref, callback) => {
      const cb = callback as any;
      cb({ exists: () => false });
      return vi.fn();
    });

    renderBoard();

    await waitFor(() => {
      expect(screen.getByText(/No board found/i)).toBeInTheDocument();
    });
  });
});
