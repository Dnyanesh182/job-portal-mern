import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Job, Application, User } from '../types';

interface Store {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Auth
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Auth actions
  setCurrentUser: (user: User | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;

  // Jobs state
  jobs: Job[];
  setJobs: (jobs: Job[]) => void;

  // Applications state
  applications: Application[];
  setApplications: (applications: Application[]) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      // Theme
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      // Auth initial state
      currentUser: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Auth actions
      setCurrentUser: (user) => set({ currentUser: user }),

      login: (user, token) => {
        localStorage.setItem('token', token);
        set({
          currentUser: user,
          token,
          isAuthenticated: true
        });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          currentUser: null,
          token: null,
          isAuthenticated: false,
          applications: []
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      // Jobs
      jobs: [],
      setJobs: (jobs) => set({ jobs }),

      // Applications
      applications: [],
      setApplications: (applications) => set({ applications }),
    }),
    {
      name: 'job-portal-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        currentUser: state.currentUser,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);