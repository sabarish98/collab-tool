import { vi } from 'vitest';

export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
};

export const mockFirebase = {
  auth: {
    currentUser: mockUser,
    onAuthStateChanged: vi.fn((auth, callback) => {
      callback(mockUser);
      return vi.fn();
    }),
  },
  db: {},
};

vi.mock('../lib/firebase', () => ({
  auth: mockFirebase.auth,
  db: mockFirebase.db,
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockFirebase.auth),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: mockUser })),
  onAuthStateChanged: mockFirebase.auth.onAuthStateChanged,
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()),
  addDoc: vi.fn(() => Promise.resolve({ id: 'new-doc-id' })),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ empty: true, docs: [] })),
  writeBatch: vi.fn(() => ({
    update: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn(),
  })),
  increment: vi.fn(),
}));
