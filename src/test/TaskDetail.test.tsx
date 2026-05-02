import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CardModal from '../components/Modals/CardModal';
import { BoardProvider } from '../store/BoardContext';
import { AuthProvider } from '../store/AuthContext';
import { updateDoc, addDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { Card } from '../types';
import './setup';

const mockCard: Card = {
  id: 'card-1',
  title: 'Original Title',
  description: 'Original Description',
  listId: 'list-1',
  status: 'open',
  priority: 'medium',
  assignedTo: [],
  labels: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  commentCount: 0
};

const mockLists = [{ id: 'list-1', title: 'To Do', order: 0, boardId: 'board-1' }];

describe('Card Modal (Task Details)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup onSnapshot for comments
    vi.mocked(onSnapshot).mockImplementation((_query, callback) => {
      const cb = callback as any;
      cb({ docs: [] });
      return vi.fn();
    });
  });

  const renderModal = (card = mockCard) => {
    const onClose = vi.fn();
    render(
      <AuthProvider>
        <BoardProvider boardId="board-1">
          <CardModal card={card} onClose={onClose} />
        </BoardProvider>
      </AuthProvider>
    );
    return { onClose };
  };

  it('renders card details correctly', () => {
    renderModal();
    expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument();
    expect(screen.getByText('Original Description')).toBeInTheDocument();
  });

  it('allows updating the card title', async () => {
    renderModal();
    const titleInput = screen.getByDisplayValue('Original Title');
    
    fireEvent.change(titleInput, { target: { value: 'New Awesome Title' } });
    fireEvent.blur(titleInput);

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        title: 'New Awesome Title'
      }));
    });
  });

  it('allows changing card priority', async () => {
    renderModal();
    
    const priorityButton = screen.getByText(/Medium/i);
    fireEvent.click(priorityButton);
    
    const highPriorityOption = screen.getByText(/High/i);
    fireEvent.click(highPriorityOption);

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        priority: 'high'
      }));
    });
  });

  it('allows adding a comment', async () => {
    renderModal();
    
    const commentInput = screen.getByPlaceholderText(/Write a comment.../i);
    fireEvent.change(commentInput, { target: { value: 'This is a test comment' } });
    
    const sendButton = screen.getByRole('button', { name: '' }); // The icon button
    // Find the button with the Send icon (might be easier to find by tag or class)
    const buttons = screen.getAllByRole('button');
    const sendBtn = buttons.find(b => b.querySelector('svg'));
    
    if (sendBtn) fireEvent.click(sendBtn);
    else fireEvent.submit(commentInput); // Fallback

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        content: 'This is a test comment',
        cardId: 'card-1'
      }));
    });
  });

  it('handles card deletion with confirmation', async () => {
    const { onClose } = renderModal();
    
    fireEvent.click(screen.getByText(/Delete Card/i));
    
    // Check for confirmation text
    expect(screen.getByText(/Delete this card\?/i)).toBeInTheDocument();
    
    const confirmDeleteBtn = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      // In BoardContext.tsx, deleteCard deletes comments then the card
      // Our mock for updateDoc/deleteDoc is generic
      expect(onClose).toHaveBeenCalled();
    });
  });
});
