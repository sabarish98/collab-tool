import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
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
}

const BoardContext = createContext<BoardContextType | null>(null);

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) throw new Error('useBoard must be used within BoardProvider');
  return context;
};

export const BoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Board
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'boards'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const boardData = snapshot.docs[0].data();
        setBoard({ id: snapshot.docs[0].id, ...boardData } as Board);
      }
    });
    return unsubscribe;
  }, [user]);

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
    // Firestore 'in' query supports max 10 elements. Assuming < 10 lists for V1.
    if (listIds.length > 10) listIds.length = 10;
    
    const q = query(collection(db, 'cards'), where('listId', 'in', listIds));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Sorting cards client-side based on a custom order or createdAt
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
    await addDoc(collection(db, 'cards'), {
      title,
      listId,
      createdAt: Date.now()
    });
  };

  const updateCard = async (cardId: string, data: Partial<Card>) => {
    const cardRef = doc(db, 'cards', cardId);
    await updateDoc(cardRef, data);
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

  const moveCard = async (cardId: string, sourceListId: string, destinationListId: string, newOrder?: number) => {
    // For V1, we just update the listId and rely on createdAt for sorting within the list
    // A robust system would update the order field for cards as well.
    const cardRef = doc(db, 'cards', cardId);
    
    // Optimistic UI Update
    setCards(prevCards => prevCards.map(c => 
      c.id === cardId ? { ...c, listId: destinationListId } : c
    ));

    await updateDoc(cardRef, { listId: destinationListId });
  };

  return (
    <BoardContext.Provider value={{ board, lists, cards, loading, addList, addCard, updateCard, reorderLists, moveCard }}>
      {children}
    </BoardContext.Provider>
  );
};
