import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db } from '../lib/firebase';
import {
  collection, query, where, onSnapshot, doc, addDoc, updateDoc,
  deleteDoc, getDocs, writeBatch
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { Team, TeamMember, Board } from '../types';

interface TeamContextType {
  teams: Team[];
  currentTeam: Team | null;
  teamMembers: TeamMember[];
  teamBoards: Board[];
  loading: boolean;
  selectTeam: (team: Team | null) => void;
  createTeam: (name: string, description?: string) => Promise<string | null>;
  deleteTeam: (teamId: string) => Promise<void>;
  addMember: (teamId: string, email: string) => Promise<{ success: boolean; error?: string }>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, newRole: 'manager' | 'member') => Promise<void>;
  createBoard: (title: string) => Promise<string | null>;
  deleteBoard: (boardId: string) => Promise<void>;
  isManager: () => boolean;
  currentMembership: TeamMember | null;
}

const TeamContext = createContext<TeamContextType | null>(null);

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used within TeamProvider');
  return context;
};

const MAX_TEAMS = 5;

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamBoards, setTeamBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all teams the user belongs to
  useEffect(() => {
    if (!user) {
      setTeams([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'team_members'),
      where('userEmail', '==', user.email?.toLowerCase())
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const memberships = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TeamMember));

      if (memberships.length === 0) {
        setTeams([]);
        setLoading(false);
        return;
      }

      const teamIds = memberships.map(m => m.teamId);

      // Firestore 'in' supports max 30 elements — safe for max 5 teams
      const teamsQuery = query(
        collection(db, 'teams'),
        where('__name__', 'in', teamIds)
      );

      const teamsSnapshot = await getDocs(teamsQuery);
      const fetchedTeams = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Team));

      setTeams(fetchedTeams);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Sync userId for memberships that only have email (invited users)
  useEffect(() => {
    if (!user || !user.email) return;

    const syncUserIds = async () => {
      const q = query(
        collection(db, 'team_members'),
        where('userEmail', '==', user.email?.toLowerCase()),
        where('userId', '==', '')
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach(d => {
          batch.update(d.ref, { userId: user.uid });
        });
        await batch.commit();
      }
    };

    syncUserIds();
  }, [user]);

  // Fetch members for current team
  useEffect(() => {
    if (!currentTeam) {
      setTeamMembers([]);
      return;
    }

    const q = query(
      collection(db, 'team_members'),
      where('teamId', '==', currentTeam.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TeamMember));
      setTeamMembers(members);
    });

    return unsubscribe;
  }, [currentTeam]);

  // Fetch boards for current team
  useEffect(() => {
    if (!currentTeam) {
      setTeamBoards([]);
      return;
    }

    const q = query(
      collection(db, 'boards'),
      where('teamId', '==', currentTeam.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const boards = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Board));
      setTeamBoards(boards);
    });

    return unsubscribe;
  }, [currentTeam]);

  const currentMembership = teamMembers.find(m => m.userId === user?.uid) || null;

  const isManager = useCallback(() => {
    return currentMembership?.role === 'manager';
  }, [currentMembership]);

  const selectTeam = useCallback((team: Team | null) => {
    setCurrentTeam(team);
  }, []);

  const createTeam = useCallback(async (name: string, description?: string): Promise<string | null> => {
    if (!user) return null;

    // Enforce max 5 teams
    if (teams.length >= MAX_TEAMS) {
      return null;
    }

    const teamRef = await addDoc(collection(db, 'teams'), {
      name,
      description: description || '',
      createdBy: user.uid,
      createdAt: Date.now()
    });

    // Add creator as manager
    await addDoc(collection(db, 'team_members'), {
      teamId: teamRef.id,
      userId: user.uid,
      userEmail: user.email || '',
      role: 'manager',
      joinedAt: Date.now()
    });

    return teamRef.id;
  }, [user, teams.length]);

  const deleteTeam = useCallback(async (teamId: string) => {
    if (!user) return;

    const batch = writeBatch(db);

    // Delete all team members
    const membersSnapshot = await getDocs(
      query(collection(db, 'team_members'), where('teamId', '==', teamId))
    );
    membersSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // Delete all boards and their lists/cards
    const boardsSnapshot = await getDocs(
      query(collection(db, 'boards'), where('teamId', '==', teamId))
    );

    for (const boardDoc of boardsSnapshot.docs) {
      const listsSnapshot = await getDocs(
        query(collection(db, 'lists'), where('boardId', '==', boardDoc.id))
      );
      for (const listDoc of listsSnapshot.docs) {
        const cardsSnapshot = await getDocs(
          query(collection(db, 'cards'), where('listId', '==', listDoc.id))
        );
        cardsSnapshot.docs.forEach(cardDoc => batch.delete(cardDoc.ref));
        batch.delete(listDoc.ref);
      }
      batch.delete(boardDoc.ref);
    }

    // Delete the team itself
    batch.delete(doc(db, 'teams', teamId));

    await batch.commit();

    if (currentTeam?.id === teamId) {
      setCurrentTeam(null);
    }
  }, [user, currentTeam]);

  const addMember = useCallback(async (teamId: string, email: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    // Check if user is already a member
    const existingQuery = query(
      collection(db, 'team_members'),
      where('teamId', '==', teamId),
      where('userEmail', '==', email.toLowerCase())
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      return { success: false, error: 'User is already a member of this team' };
    }

    // Add the member — we store email, userId will be resolved when they have an account
    // For now we assume the email matches a Firebase Auth user
    await addDoc(collection(db, 'team_members'), {
      teamId,
      userId: '', // Will be filled when we can resolve the email
      userEmail: email.toLowerCase(),
      role: 'member',
      joinedAt: Date.now()
    });

    return { success: true };
  }, [user]);

  const removeMember = useCallback(async (memberId: string) => {
    await deleteDoc(doc(db, 'team_members', memberId));
  }, []);

  const updateMemberRole = useCallback(async (memberId: string, newRole: 'manager' | 'member') => {
    await updateDoc(doc(db, 'team_members', memberId), { role: newRole });
  }, []);

  const createBoard = useCallback(async (title: string): Promise<string | null> => {
    if (!user || !currentTeam) return null;

    const boardRef = await addDoc(collection(db, 'boards'), {
      title,
      teamId: currentTeam.id,
      createdBy: user.uid,
      createdAt: Date.now()
    });

    // Create default lists
    const defaultLists = ['To Do', 'Doing', 'Done'];
    for (let i = 0; i < defaultLists.length; i++) {
      await addDoc(collection(db, 'lists'), {
        title: defaultLists[i],
        boardId: boardRef.id,
        order: i,
        createdAt: Date.now()
      });
    }

    return boardRef.id;
  }, [user, currentTeam]);

  const deleteBoard = useCallback(async (boardId: string) => {
    const batch = writeBatch(db);

    // Delete lists and cards
    const listsSnapshot = await getDocs(
      query(collection(db, 'lists'), where('boardId', '==', boardId))
    );
    for (const listDoc of listsSnapshot.docs) {
      const cardsSnapshot = await getDocs(
        query(collection(db, 'cards'), where('listId', '==', listDoc.id))
      );
      cardsSnapshot.docs.forEach(cardDoc => batch.delete(cardDoc.ref));
      batch.delete(listDoc.ref);
    }

    batch.delete(doc(db, 'boards', boardId));
    await batch.commit();
  }, []);

  return (
    <TeamContext.Provider value={{
      teams,
      currentTeam,
      teamMembers,
      teamBoards,
      loading,
      selectTeam,
      createTeam,
      deleteTeam,
      addMember,
      removeMember,
      updateMemberRole,
      createBoard,
      deleteBoard,
      isManager,
      currentMembership
    }}>
      {children}
    </TeamContext.Provider>
  );
};
