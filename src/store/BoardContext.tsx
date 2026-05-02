import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import {
  collection, query, where, onSnapshot, orderBy, doc,
  updateDoc, addDoc, writeBatch, deleteDoc
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { Board, List, Card } from '../types';

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
      const fetchedLists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as List));
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
    // Firestore 'in' query supports max 30 elements.
    if (listIds.length > 30) listIds.length = 30;
    
    const q = query(collection(db, 'cards'), where('listId', 'in', listIds));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let fetchedCards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Card));
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
      createdBy: user.uid,
      createdAt: Date.now()
    });
  };

  const updateCard = async (cardId: string, data: Partial<Card>) => {
    const cardRef = doc(db, 'cards', cardId);
    await updateDoc(cardRef, data);
  };

  const deleteCard = async (cardId: string) => {
    const cardRef = doc(db, 'cards', cardId);
    await deleteDoc(cardRef);
  };

  const reorderLists = async (startIndex: number, endIndex: number) => {
    const result = Array.from(lists);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Optimistic update
    setLists(result.map((l, index) => ({ ...l, order: index })));

    // Batch update to Firestore
    const batch = writeBatch(db);
    result.forEach((list, index) => {
      const listRef = doc(db, 'lists', list.id);
      batch.update(listRef, { order: index });
    });
    await batch.commit();
  };

  const moveCard = async (cardId: string, _sourceListId: string, destinationListId: string, _newOrder?: number) => {
    const cardRef = doc(db, 'cards', cardId);
    
    // Optimistic UI Update
    setCards(prevCards => prevCards.map(c => 
      c.id === cardId ? { ...c, listId: destinationListId } : c
    ));

    await updateDoc(cardRef, { listId: destinationListId });
  };

  return (
    <BoardContext.Provider value={{ board, lists, cards, loading, addList, addCard, updateCard, deleteCard, reorderLists, moveCard }}>
      {children}
    </BoardContext.Provider>
  );
};
