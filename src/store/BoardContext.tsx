import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db } from '../lib/firebase';
import {
  collection, query, where, onSnapshot, orderBy, doc,
  updateDoc, addDoc, writeBatch, increment, getDocs
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { Board, List, Card, Comment } from '../types';

interface BoardContextType {
  board: Board | null;
  lists: List[];
  cards: Card[];
  loading: boolean;
  reorderLists: (startIndex: number, endIndex: number) => Promise<void>;
  moveCard: (cardId: string, sourceListId: string, destinationListId: string, newOrder?: number) => Promise<void>;
  addList: (title: string) => Promise<void>;
  addCard: (listId: string, title: string) => Promise<void>;
  updateCard: (cardId: string, data: Partial<Card>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  addComment: (cardId: string, content: string) => Promise<void>;
  getComments: (cardId: string) => Comment[];
  subscribeToComments: (cardId: string) => () => void;
  activeComments: Comment[];
}

const BoardContext = createContext<BoardContextType | null>(null);

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) throw new Error('useBoard must be used within BoardProvider');
  return context;
};

interface BoardProviderProps {
  boardId: string;
  children: React.ReactNode;
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ boardId, children }) => {
  const { user } = useAuth();
  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeComments, setActiveComments] = useState<Comment[]>([]);

  // Fetch Board by ID
  useEffect(() => {
    if (!boardId) {
      setLoading(false);
      return;
    }

    const boardRef = doc(db, 'boards', boardId);
    const unsubscribe = onSnapshot(boardRef, (snapshot) => {
      if (snapshot.exists()) {
        setBoard({ id: snapshot.id, ...snapshot.data() } as Board);
      } else {
        setBoard(null);
      }
    });

    return unsubscribe;
  }, [boardId]);

  // Fetch Lists
  useEffect(() => {
    if (!board) return;
    const q = query(collection(db, 'lists'), where('boardId', '==', board.id), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLists = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as List));
      setLists(fetchedLists);
    });
    return unsubscribe;
  }, [board]);

  // Fetch Cards
  useEffect(() => {
    if (!board || lists.length === 0) {
      setLoading(false);
      return;
    }
    const listIds = lists.map(l => l.id);
    if (listIds.length > 30) listIds.length = 30;

    const q = query(collection(db, 'cards'), where('listId', 'in', listIds));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let fetchedCards = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Card));
      fetchedCards.sort((a, b) => a.createdAt - b.createdAt);
      setCards(fetchedCards);
      setLoading(false);
    });
    return unsubscribe;
  }, [board, lists.length]);

  const addList = async (title: string) => {
    if (!board) return;
    await addDoc(collection(db, 'lists'), {
      title,
      boardId: board.id,
      order: lists.length,
      createdAt: Date.now()
    });
  };

  const addCard = async (listId: string, title: string) => {
    if (!user) return;
    await addDoc(collection(db, 'cards'), {
      title,
      listId,
      status: 'open',
      priority: 'medium',
      assignedTo: [],
      labels: [],
      startDate: null,
      dueDate: null,
      createdBy: user.email || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      commentCount: 0,
    });
  };

  const updateCard = async (cardId: string, data: Partial<Card>) => {
    const cardRef = doc(db, 'cards', cardId);
    await updateDoc(cardRef, { ...data, updatedAt: Date.now() });
  };

  const deleteCard = async (cardId: string) => {
    // Delete comments for this card
    const commentsSnapshot = await getDocs(
      query(collection(db, 'comments'), where('cardId', '==', cardId))
    );
    const batch = writeBatch(db);
    commentsSnapshot.docs.forEach(d => batch.delete(d.ref));
    batch.delete(doc(db, 'cards', cardId));
    await batch.commit();
  };

  const addComment = useCallback(async (cardId: string, content: string) => {
    if (!user || !content.trim()) return;
    await addDoc(collection(db, 'comments'), {
      cardId,
      authorId: user.uid,
      authorEmail: user.email || '',
      content: content.trim(),
      createdAt: Date.now(),
    });
    // Increment comment count on card
    const cardRef = doc(db, 'cards', cardId);
    await updateDoc(cardRef, { commentCount: increment(1), updatedAt: Date.now() });
  }, [user]);

  const subscribeToComments = useCallback((cardId: string) => {
    const q = query(
      collection(db, 'comments'),
      where('cardId', '==', cardId),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
      setActiveComments(comments);
    });
    return unsubscribe;
  }, []);

  const getComments = useCallback((_cardId: string): Comment[] => {
    return activeComments;
  }, [activeComments]);

  const reorderLists = async (startIndex: number, endIndex: number) => {
    const result = Array.from(lists);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setLists(result.map((l, index) => ({ ...l, order: index })));
    const batch = writeBatch(db);
    result.forEach((list, index) => {
      const listRef = doc(db, 'lists', list.id);
      batch.update(listRef, { order: index });
    });
    await batch.commit();
  };

  const moveCard = async (cardId: string, _sourceListId: string, destinationListId: string, _newOrder?: number) => {
    const cardRef = doc(db, 'cards', cardId);
    setCards(prevCards => prevCards.map(c =>
      c.id === cardId ? { ...c, listId: destinationListId } : c
    ));
    await updateDoc(cardRef, { listId: destinationListId, updatedAt: Date.now() });
  };

  return (
    <BoardContext.Provider value={{
      board, lists, cards, loading,
      addList, addCard, updateCard, deleteCard,
      reorderLists, moveCard,
      addComment, getComments, subscribeToComments, activeComments
    }}>
      {children}
    </BoardContext.Provider>
  );
};
